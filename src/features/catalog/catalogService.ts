import {
  ImportPackage,
  Material,
  MaterialWithStock,
  ScanResolveResult,
  KioskConfig,
  Category,
  Location,
  StockSnapshot,
  Asset,
  BarcodeAlias,
} from '../../domain/types';
import { isStockStale } from '../../domain/validation';

interface CatalogRelations {
  categories: Map<string, Category>;
  locations: Map<string, Location>;
  stocks: Map<string, StockSnapshot[]>;
  assets: Map<string, Map<string | null, Asset[]>>;
  aliases: Map<string, BarcodeAlias[]>;
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const itemKey = key(item);
    const group = groups.get(itemKey);
    if (group) group.push(item);
    else groups.set(itemKey, [item]);
  }
  return groups;
}

function firstById<T extends { id: string }>(items: T[]): Map<string, T> {
  const index = new Map<string, T>();
  for (const item of items) {
    if (!index.has(item.id)) index.set(item.id, item);
  }
  return index;
}

function indexRelations(pkg: ImportPackage): CatalogRelations {
  const assets = new Map<string, Map<string | null, Asset[]>>();
  for (const [materialId, materialAssets] of groupBy(pkg.assets, asset => asset.materialId)) {
    assets.set(materialId, groupBy(materialAssets, asset => asset.locationId));
  }

  // Storage replaces stock entries in place, so indexes last only for this operation.
  return {
    categories: firstById(pkg.categories),
    locations: firstById(pkg.locations),
    stocks: groupBy(pkg.stockSnapshots, stock => stock.materialId),
    assets,
    aliases: groupBy(pkg.barcodeAliases, alias => alias.targetId),
  };
}

export class CatalogService {
  /**
   * Enriches a basic Material into a comprehensive MaterialWithStock
   */
  public static enrichMaterial(
    material: Material,
    pkg: ImportPackage,
    config: KioskConfig
  ): MaterialWithStock {
    return this.enrichWithRelations(material, pkg, config, indexRelations(pkg));
  }

  private static enrichWithRelations(
    material: Material,
    pkg: ImportPackage,
    config: KioskConfig,
    relations: CatalogRelations
  ): MaterialWithStock {
    const category = relations.categories.get(material.categoryId);
    const categoryName = category ? category.name : 'Umum';

    const materialStocks = relations.stocks.get(material.id) || [];
    const materialAssets = relations.assets.get(material.id);

    const locations = materialStocks.map(stock => {
      const location = relations.locations.get(stock.locationId) || {
        id: stock.locationId,
        warehouseCode: config.warehouseCode,
        zone: 'Gudang Utama',
        rack: '-',
        bin: '-',
      };

      const locAssets = materialAssets?.get(stock.locationId) || [];

      return {
        location,
        stock,
        assets: locAssets,
      };
    });

    let hasNonNullQuantity = false;
    let totalQty = 0;
    let totalRes = 0;
    let totalAvail = 0;
    let latestSourceAt: string | null = null;

    for (const stock of materialStocks) {
      if (stock.quantity !== null) {
        hasNonNullQuantity = true;
        totalQty += stock.quantity;
      }
      if (stock.reserved !== null) {
        totalRes += stock.reserved;
      }
      if (stock.available !== null) {
        totalAvail += stock.available;
      }
      if (stock.sourceAt) {
        if (!latestSourceAt || new Date(stock.sourceAt).getTime() > new Date(latestSourceAt).getTime()) {
          latestSourceAt = stock.sourceAt;
        }
      }
    }

    if (!latestSourceAt && pkg.sourceAt) {
      latestSourceAt = pkg.sourceAt;
    }

    const isStale = isStockStale(latestSourceAt, config.staleAfterHours);
    const condition = material.condition || 'BARU';
    const status = material.status || (condition === 'RETURN' ? 'STANDBY' : 'Baru');

    return {
      ...material,
      categoryName,
      locations,
      totalQuantity: hasNonNullQuantity ? totalQty : null,
      totalReserved: hasNonNullQuantity ? totalRes : null,
      totalAvailable: hasNonNullQuantity ? totalAvail : null,
      latestSourceAt,
      isStale,
      condition,
      status,
    };
  }

  /**
   * Search materials with query, category, condition, and status filter
   */
  public static searchMaterials(
    pkg: ImportPackage,
    config: KioskConfig,
    options: {
      query?: string;
      categoryId?: string;
      blockCode?: string;
      condition?: 'BARU' | 'RETURN';
      status?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): { items: MaterialWithStock[]; total: number; page: number; totalPages: number } {
    const { query = '', categoryId, blockCode, condition, status, page = 1, pageSize = 20 } = options;
    const cleanQuery = query.trim().toLowerCase();
    const relations = indexRelations(pkg);

    let filtered = pkg.materials;

    // Filter by condition (BARU vs RETURN)
    if (condition) {
      filtered = filtered.filter(m => {
        const cond = m.condition || 'BARU';
        return cond === condition;
      });
    }

    // Filter by specific status (e.g. 'GARANSI', 'PERBAIKAN', 'USUL HAPUS', 'STANDBY', 'Baru')
    if (status && status !== 'all') {
      filtered = filtered.filter(m => {
        const matCond = m.condition || 'BARU';
        const matStatus = m.status || (matCond === 'RETURN' ? 'STANDBY' : 'Baru');
        return matStatus.toUpperCase() === status.toUpperCase();
      });
    }

    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter(m => m.categoryId === categoryId);
    }

    if (blockCode && blockCode !== 'all') {
      const targetBlock = blockCode.trim().toUpperCase();
      filtered = filtered.filter(m => {
        return (relations.stocks.get(m.id) || [])
          .some(s => {
            const loc = relations.locations.get(s.locationId);
            if (!loc) return false;
            const fullLoc = `${loc.zone || ''} ${loc.rack || ''} ${loc.bin || ''}`.toUpperCase();
            return (
              fullLoc.includes(`BLOK ${targetBlock}`) ||
              fullLoc.includes(`BLOK-${targetBlock}`) ||
              new RegExp(`\\b${targetBlock}\\.\\d+`).test(fullLoc)
            );
          });
      });
    }

    if (cleanQuery) {
      filtered = filtered.filter(m => {
        const nameMatch = m.name.toLowerCase().includes(cleanQuery);
        const codeMatch = m.code.toLowerCase().includes(cleanQuery);
        const sapMatch = m.sapCode ? m.sapCode.toLowerCase().includes(cleanQuery) : false;
        const specMatch = m.specification ? m.specification.toLowerCase().includes(cleanQuery) : false;
        const unitMatch = m.unit ? m.unit.toLowerCase().includes(cleanQuery) : false;
        const statusMatch = m.status ? m.status.toLowerCase().includes(cleanQuery) : false;

        // Search by location: Blok, Rak, Bin (contoh: 'h12', 'rak h12', 'blok b', 'blok c', 'bululawang')
        const materialStocks = relations.stocks.get(m.id) || [];
        const locationMatch = materialStocks
          .some(s => {
            const loc = relations.locations.get(s.locationId);
            if (!loc) return false;
            const zoneMatch = loc.zone ? loc.zone.toLowerCase().includes(cleanQuery) : false;
            const rackMatch = loc.rack ? loc.rack.toLowerCase().includes(cleanQuery) : false;
            const binMatch = loc.bin ? loc.bin.toLowerCase().includes(cleanQuery) : false;
            return zoneMatch || rackMatch || binMatch;
          });

        // Search by stock amount if user searches "stok 0", "stok habis", or exact quantity
        const stockMatch = materialStocks
          .some(s => {
            if (cleanQuery === 'stok habis' || cleanQuery === 'habis') {
              return s.quantity === 0;
            }
            if (cleanQuery === `stok ${s.quantity}` || cleanQuery === `${s.quantity} ${m.unit.toLowerCase()}`) {
              return true;
            }
            return false;
          });

        // Search in barcode aliases (e.g. '1060798', 'A.3.1', 'C.1.1', 'RAK-A-001')
        const aliasMatch = (relations.aliases.get(m.id) || [])
          .some(a => a.value.toLowerCase().includes(cleanQuery));

        return nameMatch || codeMatch || sapMatch || specMatch || unitMatch || statusMatch || locationMatch || stockMatch || aliasMatch;
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const pagedItems = filtered.slice(startIndex, startIndex + pageSize);

    const items = pagedItems.map(m => this.enrichWithRelations(m, pkg, config, relations));

    return {
      items,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Resolves a scanned barcode or QR code to a Material or Asset
   */
  public static resolveScan(
    rawCode: string,
    pkg: ImportPackage,
    config: KioskConfig
  ): ScanResolveResult {
    const trimmed = rawCode.trim();
    if (!trimmed) {
      return {
        status: 'invalid',
        rawCode,
        errorMessage: 'Kode barcode kosong atau tidak terbaca.',
      };
    }

    // 1. Direct match in barcodeAliases
    const alias = pkg.barcodeAliases.find(a => a.value.toLowerCase() === trimmed.toLowerCase());
    if (alias) {
      if (alias.targetType === 'material') {
        const material = pkg.materials.find(m => m.id === alias.targetId);
        if (material) {
          return {
            status: 'found',
            rawCode: trimmed,
            targetType: 'material',
            material: this.enrichMaterial(material, pkg, config),
          };
        }
      } else if (alias.targetType === 'asset') {
        const asset = pkg.assets.find(a => a.id === alias.targetId);
        if (asset) {
          const material = pkg.materials.find(m => m.id === asset.materialId);
          if (material) {
            return {
              status: 'found',
              rawCode: trimmed,
              targetType: 'asset',
              asset,
              material: this.enrichMaterial(material, pkg, config),
            };
          }
        }
      }
    }

    // 2. Direct match by material code (e.g. "000123")
    const byCode = pkg.materials.find(m => m.code.toLowerCase() === trimmed.toLowerCase());
    if (byCode) {
      return {
        status: 'found',
        rawCode: trimmed,
        targetType: 'material',
        material: this.enrichMaterial(byCode, pkg, config),
      };
    }

    // 3. Direct match by SAP Code
    const bySap = pkg.materials.find(m => m.sapCode && m.sapCode.toLowerCase() === trimmed.toLowerCase());
    if (bySap) {
      return {
        status: 'found',
        rawCode: trimmed,
        targetType: 'material',
        material: this.enrichMaterial(bySap, pkg, config),
      };
    }

    // 4. Direct match by Asset serial number
    const bySerial = pkg.assets.find(a => a.serialNumber.toLowerCase() === trimmed.toLowerCase());
    if (bySerial) {
      const material = pkg.materials.find(m => m.id === bySerial.materialId);
      if (material) {
        return {
          status: 'found',
          rawCode: trimmed,
          targetType: 'asset',
          asset: bySerial,
          material: this.enrichMaterial(material, pkg, config),
        };
      }
    }

    return {
      status: 'not_found',
      rawCode: trimmed,
      errorMessage: `Barcode/QR "${trimmed}" tidak ditemukan di database gudang PLN.`,
    };
  }
}
