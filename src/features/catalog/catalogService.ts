import {
  ImportPackage,
  Material,
  MaterialWithStock,
  ScanResolveResult,
  KioskConfig,
} from '../../domain/types';
import { isStockStale } from '../../domain/validation';

export class CatalogService {
  /**
   * Enriches a basic Material into a comprehensive MaterialWithStock
   */
  public static enrichMaterial(
    material: Material,
    pkg: ImportPackage,
    config: KioskConfig
  ): MaterialWithStock {
    const category = pkg.categories.find(c => c.id === material.categoryId);
    const categoryName = category ? category.name : 'Umum';

    const materialStocks = pkg.stockSnapshots.filter(s => s.materialId === material.id);
    const materialAssets = pkg.assets.filter(a => a.materialId === material.id);

    const locations = materialStocks.map(stock => {
      const location = pkg.locations.find(l => l.id === stock.locationId) || {
        id: stock.locationId,
        warehouseCode: config.warehouseCode,
        zone: 'Gudang Utama',
        rack: '-',
        bin: '-',
      };

      const locAssets = materialAssets.filter(a => a.locationId === stock.locationId);

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

    return {
      ...material,
      categoryName,
      locations,
      totalQuantity: hasNonNullQuantity ? totalQty : null,
      totalReserved: hasNonNullQuantity ? totalRes : null,
      totalAvailable: hasNonNullQuantity ? totalAvail : null,
      latestSourceAt,
      isStale,
    };
  }

  /**
   * Search materials with query and category filter
   */
  public static searchMaterials(
    pkg: ImportPackage,
    config: KioskConfig,
    options: {
      query?: string;
      categoryId?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): { items: MaterialWithStock[]; total: number; page: number; totalPages: number } {
    const { query = '', categoryId, page = 1, pageSize = 20 } = options;
    const cleanQuery = query.trim().toLowerCase();

    let filtered = pkg.materials;

    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter(m => m.categoryId === categoryId);
    }

    if (cleanQuery) {
      filtered = filtered.filter(m => {
        const nameMatch = m.name.toLowerCase().includes(cleanQuery);
        const codeMatch = m.code.toLowerCase().includes(cleanQuery);
        const sapMatch = m.sapCode ? m.sapCode.toLowerCase().includes(cleanQuery) : false;
        const specMatch = m.specification ? m.specification.toLowerCase().includes(cleanQuery) : false;

        // Search by location: Blok, Rak, Bin (contoh: 'kwh', 'rak a-001', 'a-001', 'blok c')
        const locationMatch = pkg.stockSnapshots
          .filter(s => s.materialId === m.id)
          .some(s => {
            const loc = pkg.locations.find(l => l.id === s.locationId);
            if (!loc) return false;
            const zoneMatch = loc.zone ? loc.zone.toLowerCase().includes(cleanQuery) : false;
            const rackMatch = loc.rack ? loc.rack.toLowerCase().includes(cleanQuery) : false;
            const binMatch = loc.bin ? loc.bin.toLowerCase().includes(cleanQuery) : false;
            return zoneMatch || rackMatch || binMatch;
          });

        return nameMatch || codeMatch || sapMatch || specMatch || locationMatch;
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const pagedItems = filtered.slice(startIndex, startIndex + pageSize);

    const items = pagedItems.map(m => this.enrichMaterial(m, pkg, config));

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
