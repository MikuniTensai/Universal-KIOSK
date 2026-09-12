import { ImportPackage, Material, Location, StockSnapshot, BarcodeAlias, Category } from '../../domain/types';
import { samplePlnPackage } from '../../data/mockPlnPackage';
import { computePackageHash } from '../../domain/hash';
import wallpaperWarehouseImg from '../../assets/cards/wallpaper_warehouse.webp';

export interface ParsedMaterialRow {
  no: number;
  name: string;
  code: string;
  unit: string;
  stock: number;
  blok: string;
  rak: string;
  subRak: string;
  status?: string;
}

export type CsvImportScope = 'auto' | 'baru-only' | 'return-only' | 'all';

export interface CsvImportStats {
  totalRows: number;
  validRows: number;
  totalQuantity: number;
  materialsCount: number;
  locationsCount: number;
  mode: 'replace' | 'merge';
  scope: CsvImportScope;
  effectiveScope: 'baru-only' | 'return-only' | 'all';
  detectedCondition: 'BARU' | 'RETURN' | 'CAMPURAN';
  preservedCount: number;
  sampleRows: ParsedMaterialRow[];
  warnings: string[];
}

const DEFAULT_PHOTOS = {
  defaultWarehouse: wallpaperWarehouseImg,
  trafo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  isolator: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80',
  meter: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
  kabel: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  fco: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
  k3: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
  box: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
  hardware: wallpaperWarehouseImg,
};

export class CsvImportService {
  /**
   * Parse a single CSV line with quotes and comma escaping
   */
  public static parseCsvLine(line: string): string[] {
    const res: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        res.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    res.push(cur.trim());
    return res;
  }

  /**
   * Parse CSV content into structured rows
   */
  public static parseCsv(csvContent: string): { rows: ParsedMaterialRow[]; warnings: string[] } {
    const warnings: string[] = [];
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return { rows: [], warnings: ['File CSV kosong.'] };
    }

    const header = this.parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Find column indexes
    let idxNo = header.findIndex(h => h === 'no' || h === '#' || h.includes('nomor'));
    let idxName = header.findIndex(h => h.includes('nama') || h.includes('material') || h.includes('deskripsi'));
    let idxCode = header.findIndex(h => h.includes('normalisasi') || h.includes('kode') || h.includes('sap'));
    let idxUnit = header.findIndex(h => h.includes('satuan') || h.includes('unit') || h.includes('uom'));
    let idxStock = header.findIndex(h => h.includes('stok') || h.includes('stock') || h.includes('qty') || h.includes('jumlah'));
    let idxBlok = header.findIndex(h => h === 'blok' || h.includes('block') || h.includes('zona'));
    let idxRak = header.findIndex(h => h === 'rak' || h.includes('rack'));
    let idxSubRak = header.findIndex(h => h.includes('sub') || h.includes('bin') || h.includes('slot'));
    let idxStatus = header.findIndex(h => h === 'status' || h.includes('status') || h.includes('kondisi') || h.includes('keterangan'));

    // Fallback by positional index if headers match SAP Excel layout:
    // [0: No, 1: Nama Material, 2: Kode Normalisasi, 3: Satuan, 4: Stok, 5: BLOK, 6: RAK, 7: (Empty / Sub Rak), 8: STATUS]
    if (idxName === -1 && header.length >= 2) idxName = 1;
    if (idxCode === -1 && header.length >= 3) idxCode = 2;
    if (idxUnit === -1 && header.length >= 4) idxUnit = 3;
    if (idxStock === -1 && header.length >= 5) idxStock = 4;
    if (idxBlok === -1 && header.length >= 6) idxBlok = 5;
    if (idxRak === -1 && header.length >= 7) idxRak = 6;
    if (idxSubRak === -1 && header.length >= 8) idxSubRak = 7;
    if (idxStatus === -1 && header.length >= 9) idxStatus = 8;

    const rows: ParsedMaterialRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = this.parseCsvLine(lines[i]);
      if (cols.length < 2 || !cols.some(c => c.length > 0)) continue;

      const no = idxNo !== -1 && cols[idxNo] ? parseInt(cols[idxNo], 10) || i : i;
      const name = idxName !== -1 ? cols[idxName] || '' : '';
      if (!name) continue;

      const code = idxCode !== -1 ? cols[idxCode] || '' : '';
      const unit = idxUnit !== -1 ? cols[idxUnit] || 'BH' : 'BH';
      const stock = idxStock !== -1 ? parseInt(cols[idxStock].replace(/[^0-9-]/g, ''), 10) || 0 : 0;
      const blok = idxBlok !== -1 && cols[idxBlok] ? cols[idxBlok].trim() : 'C';
      const rak = idxRak !== -1 && cols[idxRak] ? cols[idxRak].trim() : '-';
      const subRak = idxSubRak !== -1 && cols[idxSubRak] ? cols[idxSubRak].trim() : '-';
      const status = idxStatus !== -1 && cols[idxStatus] ? cols[idxStatus].trim() : undefined;

      rows.push({
        no,
        name,
        code,
        unit: unit.toUpperCase() || 'BH',
        stock: Math.max(0, stock),
        blok,
        rak: rak || '-',
        subRak: subRak || '-',
        status,
      });
    }

    return { rows, warnings };
  }

  /**
   * Determine category, photo, and spec from material name
   */
  public static categorizeMaterial(name: string): { categoryId: string; photoPath: string; spec: string } {
    const uName = name.toUpperCase();
    let categoryId = 'cat-gardu';
    let photoPath = DEFAULT_PHOTOS.hardware;
    let spec = 'Material logistik distribusi standar PT PLN (Persero) UP3 Malang. Lolos uji spesifikasi SPLN dan standar Puslitbang PLN.';

    if (uName.startsWith('TRF DIS')) {
      categoryId = 'cat-mdu';
      photoPath = DEFAULT_PHOTOS.trafo;
      if (uName.includes('100KVA')) {
        spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 100 kVA, Vektor Grup Yzn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
      } else if (uName.includes('160KVA')) {
        spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 160 kVA, Vektor Grup Yzn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
      } else {
        spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 250 kVA, Vektor Grup Dyn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
      }
    } else if (uName.startsWith('TRF ACC')) {
      categoryId = 'cat-mdu';
      photoPath = DEFAULT_PHOTOS.hardware;
      spec = 'Dudukan dan konstruksi braket transformator distribusi cantol / portal pipa kabel LA-CO galvanis hot-dip.';
    } else if (
      uName.startsWith('CABLE PWR;') ||
      uName.startsWith('CONDUCTOR;') ||
      uName.startsWith('CABLE PWR ACC') ||
      uName.startsWith('COND ACC')
    ) {
      categoryId = 'cat-kabel';
      if (uName.startsWith('CABLE PWR ACC') || uName.startsWith('COND ACC')) {
        photoPath = DEFAULT_PHOTOS.hardware;
        spec = 'Aksesoris kabel / sambungan konduktor tegangan menengah & rendah (sepatu kabel AL-CU, joint sleeve kompresi, side tie).';
      } else {
        photoPath = DEFAULT_PHOTOS.kabel;
        spec = 'Kabel daya dan konduktor distribusi jaringan listrik tegangan menengah 20kV dan tegangan rendah 0.6/1kV standar SPLN.';
      }
    } else if (
      uName.startsWith('MTR;') ||
      uName.startsWith('MTR ACC') ||
      uName.startsWith('CT;') ||
      uName.startsWith('MCB;') ||
      (uName.startsWith('BOX') && uName.includes('KVA'))
    ) {
      categoryId = 'cat-kwh';
      if (uName.startsWith('MTR;') || uName.startsWith('MTR ACC') || uName.startsWith('CT;')) {
        photoPath = DEFAULT_PHOTOS.meter;
        spec = 'Peralatan Alat Pengukur & Pembatas (APP) / Smart Meter AMI, CT Trafo Arus, dan segel putar kalibrasi tera resmi.';
      } else {
        photoPath = DEFAULT_PHOTOS.box;
        spec = 'Box Panel APP Pelanggan Daya Terpasang MCCB / MCB pembatas daya arus listrik standar PLN.';
      }
    } else if (uName.startsWith('TANG') || uName.includes('COVER ARRESTER') || uName.includes('COVER BUSHING') || uName.includes('APD') || uName.includes('HELM')) {
      categoryId = 'cat-k3';
      photoPath = DEFAULT_PHOTOS.k3;
      spec = 'Peralatan Keselamatan & Kesehatan Kerja (K3) dan cover pelindung isolasi satwa.';
    } else if (uName.startsWith('ISOLATOR')) {
      categoryId = 'cat-gardu';
      photoPath = DEFAULT_PHOTOS.isolator;
      spec = 'Isolator Tumpu Pin Post Keramik / Isolator Tarik Suspensi Polimer 24 kV kekuatan mekanis 12.5kN - 70kN.';
    } else if (uName.startsWith('CUT OUT') || uName.startsWith('FUSE') || uName.startsWith('LA;')) {
      categoryId = 'cat-gardu';
      photoPath = DEFAULT_PHOTOS.fco;
      spec = 'Peralatan proteksi gardu distribusi (FCO 20kV, Fuse Link, Lightning Arrester, dan NH Fuse TR).';
    } else if (uName.startsWith('BOX TR') || uName.startsWith('BOX;LV') || uName.startsWith('LVSB;')) {
      categoryId = 'cat-gardu';
      photoPath = DEFAULT_PHOTOS.box;
      spec = 'Panel Hubung Bagi Tegangan Rendah (PHB-TR / LVSB) dan box panel distribusi outdoor.';
    }

    return { categoryId, photoPath, spec };
  }

  /**
   * Convert parsed CSV rows into an ImportPackage with two-way isolation protection:
   * Importing BARU does NOT wipe RETURN data, and importing RETURN does NOT wipe BARU data.
   */
  public static async createPackageFromCsv(
    csvContent: string,
    mode: 'replace' | 'merge' = 'replace',
    basePackage?: ImportPackage | null,
    scope: CsvImportScope = 'auto'
  ): Promise<{ pkg: ImportPackage; stats: CsvImportStats }> {
    const { rows, warnings } = this.parseCsv(csvContent);

    const nowIso = new Date().toISOString();
    const categories: Category[] = basePackage?.categories || samplePlnPackage.categories;
    const locationsMap = new Map<string, Location>();
    const materials: Material[] = [];
    const stockSnapshots: StockSnapshot[] = [];
    const barcodeAliases: BarcodeAlias[] = [];

    // Pre-populate locations map if basePackage exists
    if (basePackage) {
      basePackage.locations.forEach(loc => locationsMap.set(loc.id, loc));
    }

    let totalQuantity = 0;

    rows.forEach((row, idx) => {
      totalQuantity += row.stock;

      const cleanBlok = row.blok.replace(/^Blok\s+/i, '').trim();
      const isBululawang = row.blok.toUpperCase().includes('BULULAWANG');
      const zoneName = isBululawang ? 'Gudang Bululawang' : `Blok ${cleanBlok}`;
      const rackName = row.rak.trim() || '-';
      const binName = row.subRak.trim() || '-';

      const locId = `loc-${cleanBlok.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${rackName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${binName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      if (!locationsMap.has(locId)) {
        locationsMap.set(locId, {
          id: locId,
          warehouseCode: 'GUD-PLN-MLG-AM01',
          zone: zoneName,
          rack: rackName,
          bin: binName,
        });
      }

      const { categoryId: autoCategoryId, photoPath: autoPhotoPath, spec: autoSpec } = this.categorizeMaterial(row.name);
      const normCode = row.code || `PLN-MAT-${String(idx + 1).padStart(4, '0')}`;

      // Determine item condition & status
      const rawStatus = row.status?.trim() || '';
      const isReturnStatus = ['GARANSI', 'PERBAIKAN', 'USUL HAPUS', 'STANDBY'].includes(rawStatus.toUpperCase());
      
      let condition: 'BARU' | 'RETURN';
      if (scope === 'return-only') {
        condition = 'RETURN';
      } else if (scope === 'baru-only') {
        condition = 'BARU';
      } else {
        condition = isReturnStatus || rawStatus.toUpperCase().includes('RETUR') ? 'RETURN' : 'BARU';
      }

      const status = rawStatus ? rawStatus : (condition === 'RETURN' ? 'STANDBY' : 'Baru');

      // Cari apakah material dengan kode normalisasi / kode SAP / nama ini sudah terdaftar sebelumnya di sistem
      // PENTING: Cari pada condition yang cocok agar tidak tumpang tindih antara item Baru vs Return
      const existingMat = basePackage?.materials.find(
        m => {
          const matCond = m.condition || 'BARU';
          return matCond === condition && (
            (normCode && m.code && m.code.toLowerCase() === normCode.toLowerCase()) ||
            (m.sapCode && normCode && m.sapCode.toLowerCase() === normCode.toLowerCase()) ||
            (m.name.toLowerCase() === row.name.toLowerCase())
          );
        }
      );

      // JAMINAN KEAMANAN GAMBAR:
      // Pastikan foto yang sudah diinput/dimiliki material tidak terhapus saat import Excel/CSV!
      const photoPath = (existingMat && existingMat.photoPath && existingMat.photoPath.trim())
        ? existingMat.photoPath
        : autoPhotoPath;

      const categoryId = (existingMat && existingMat.categoryId && categories.some(c => c.id === existingMat.categoryId))
        ? existingMat.categoryId
        : autoCategoryId;

      const spec = (existingMat && existingMat.specification && existingMat.specification.trim())
        ? existingMat.specification
        : autoSpec;

      // Prefix ID yang aman dan unik: mat-ret-csv-* untuk Return, mat-csv-* untuk Baru
      const defaultIdPrefix = condition === 'RETURN' ? 'mat-ret-csv' : 'mat-csv';
      const matId = existingMat?.id || `${defaultIdPrefix}-${String(idx + 1).padStart(3, '0')}`;

      materials.push({
        id: matId,
        code: normCode,
        sapCode: normCode,
        name: row.name,
        categoryId,
        unit: row.unit,
        specification: spec,
        photoPath,
        condition,
        status,
      });

      const reserved = row.stock > 5 ? Math.floor(row.stock * 0.1) : 0;
      const available = row.stock - reserved;

      stockSnapshots.push({
        materialId: matId,
        locationId: locId,
        quantity: row.stock,
        reserved,
        available,
        sourceAt: nowIso,
      });

      barcodeAliases.push({
        value: normCode,
        targetType: 'material',
        targetId: matId,
      });
    });

    // Deteksi Scope Otomatis
    const hasBaru = materials.some(m => m.condition !== 'RETURN');
    const hasReturn = materials.some(m => m.condition === 'RETURN');

    let effectiveScope: 'baru-only' | 'return-only' | 'all';
    if (scope === 'baru-only') {
      effectiveScope = 'baru-only';
    } else if (scope === 'return-only') {
      effectiveScope = 'return-only';
    } else if (scope === 'all') {
      effectiveScope = 'all';
    } else {
      // Auto-detection
      if (hasReturn && !hasBaru) {
        effectiveScope = 'return-only';
      } else if (hasBaru && !hasReturn) {
        effectiveScope = 'baru-only';
      } else {
        effectiveScope = 'all';
      }
    }

    const detectedCondition: 'BARU' | 'RETURN' | 'CAMPURAN' =
      hasBaru && hasReturn ? 'CAMPURAN' : (hasReturn ? 'RETURN' : 'BARU');

    let finalMaterials = materials;
    let finalSnapshots = stockSnapshots;
    let finalAliases = barcodeAliases;
    let preservedCount = 0;

    // PROTEKSI DUA ARAH: Menjamin material sebaliknya tidak lenyap
    if (basePackage) {
      if (effectiveScope === 'baru-only') {
        // SEDANG IMPORT MATERIAL BARU:
        // 1. Amankan seluruh material RETURN eksisting 100%
        const preservedReturnMaterials = basePackage.materials.filter(m => m.condition === 'RETURN');
        const returnMatIds = new Set(preservedReturnMaterials.map(m => m.id));
        const preservedReturnSnapshots = basePackage.stockSnapshots.filter(s => returnMatIds.has(s.materialId));
        const preservedReturnAliases = basePackage.barcodeAliases.filter(
          a => a.targetType === 'material' && returnMatIds.has(a.targetId)
        );

        if (mode === 'replace') {
          // Replace hanya berlaku untuk material BARU. Material RETURN lama tetap utuh!
          finalMaterials = [...materials, ...preservedReturnMaterials];
          finalSnapshots = [...stockSnapshots, ...preservedReturnSnapshots];
          finalAliases = [...barcodeAliases, ...preservedReturnAliases];
          preservedCount = preservedReturnMaterials.length;
        } else {
          // Mode merge: gabungkan material BARU eksisting yang tidak ada di CSV
          const importedCodes = new Set(materials.map(m => m.code.toLowerCase()));
          const importedNames = new Set(materials.map(m => m.name.toLowerCase()));

          const preservedOtherBaru = basePackage.materials.filter(
            m => m.condition !== 'RETURN' &&
                 !importedCodes.has(m.code.toLowerCase()) &&
                 !importedNames.has(m.name.toLowerCase())
          );
          const otherBaruIds = new Set(preservedOtherBaru.map(m => m.id));
          const otherBaruSnapshots = basePackage.stockSnapshots.filter(s => otherBaruIds.has(s.materialId));
          const otherBaruAliases = basePackage.barcodeAliases.filter(
            a => a.targetType === 'material' && otherBaruIds.has(a.targetId)
          );

          finalMaterials = [...materials, ...preservedOtherBaru, ...preservedReturnMaterials];
          finalSnapshots = [...stockSnapshots, ...otherBaruSnapshots, ...preservedReturnSnapshots];
          finalAliases = [...barcodeAliases, ...otherBaruAliases, ...preservedReturnAliases];
          preservedCount = preservedReturnMaterials.length + preservedOtherBaru.length;
        }
      } else if (effectiveScope === 'return-only') {
        // SEDANG IMPORT MATERIAL RETURN:
        // 1. Amankan seluruh material BARU eksisting 100%
        const preservedBaruMaterials = basePackage.materials.filter(m => m.condition !== 'RETURN');
        const baruMatIds = new Set(preservedBaruMaterials.map(m => m.id));
        const preservedBaruSnapshots = basePackage.stockSnapshots.filter(s => baruMatIds.has(s.materialId));
        const preservedBaruAliases = basePackage.barcodeAliases.filter(
          a => a.targetType === 'material' && baruMatIds.has(a.targetId)
        );

        if (mode === 'replace') {
          // Replace hanya berlaku untuk material RETURN. Material BARU lama tetap utuh!
          finalMaterials = [...preservedBaruMaterials, ...materials];
          finalSnapshots = [...preservedBaruSnapshots, ...stockSnapshots];
          finalAliases = [...preservedBaruAliases, ...barcodeAliases];
          preservedCount = preservedBaruMaterials.length;
        } else {
          // Mode merge: gabungkan material RETURN eksisting yang tidak ada di CSV
          const importedCodes = new Set(materials.map(m => m.code.toLowerCase()));
          const importedNames = new Set(materials.map(m => m.name.toLowerCase()));

          const preservedOtherReturn = basePackage.materials.filter(
            m => m.condition === 'RETURN' &&
                 !importedCodes.has(m.code.toLowerCase()) &&
                 !importedNames.has(m.name.toLowerCase())
          );
          const otherReturnIds = new Set(preservedOtherReturn.map(m => m.id));
          const otherReturnSnapshots = basePackage.stockSnapshots.filter(s => otherReturnIds.has(s.materialId));
          const otherReturnAliases = basePackage.barcodeAliases.filter(
            a => a.targetType === 'material' && otherReturnIds.has(a.targetId)
          );

          finalMaterials = [...preservedBaruMaterials, ...materials, ...preservedOtherReturn];
          finalSnapshots = [...preservedBaruSnapshots, ...stockSnapshots, ...otherReturnSnapshots];
          finalAliases = [...preservedBaruAliases, ...barcodeAliases, ...otherReturnAliases];
          preservedCount = preservedBaruMaterials.length + preservedOtherReturn.length;
        }
      } else {
        // Scope 'all' (file campuran atau full master replace)
        if (mode === 'merge') {
          const importedCodes = new Set(materials.map(m => m.code.toLowerCase()));
          const importedNames = new Set(materials.map(m => m.name.toLowerCase()));

          const preservedMaterials = basePackage.materials.filter(
            m => !importedCodes.has(m.code.toLowerCase()) && !importedNames.has(m.name.toLowerCase())
          );
          const preservedMatIds = new Set(preservedMaterials.map(m => m.id));
          const preservedSnapshots = basePackage.stockSnapshots.filter(s => preservedMatIds.has(s.materialId));
          const preservedAliases = basePackage.barcodeAliases.filter(
            a => a.targetType === 'material' && preservedMatIds.has(a.targetId)
          );

          finalMaterials = [...materials, ...preservedMaterials];
          finalSnapshots = [...stockSnapshots, ...preservedSnapshots];
          finalAliases = [...barcodeAliases, ...preservedAliases];
          preservedCount = preservedMaterials.length;
        }
      }

      // Pastikan lokasi dari material yang dipertahankan tetap ada di locationsMap
      const activeLocationIds = new Set(finalSnapshots.map(s => s.locationId));
      basePackage.locations.forEach(loc => {
        if (activeLocationIds.has(loc.id) && !locationsMap.has(loc.id)) {
          locationsMap.set(loc.id, loc);
        }
      });
    }

    const nextVersion = (basePackage?.datasetVersion || 3) + 1;
    const finalLocations = Array.from(locationsMap.values());

    const pkgWithoutHash: Omit<ImportPackage, 'packageHash'> = {
      schemaVersion: '1.0',
      datasetVersion: nextVersion,
      sourceName: `PLN ERP SAP Logistik UP3 Malang (${mode === 'replace' ? 'Import CSV Replace' : 'Import CSV Merge'} - ${effectiveScope})`,
      sourceAt: nowIso,
      categories,
      locations: finalLocations,
      materials: finalMaterials,
      assets: [],
      barcodeAliases: finalAliases,
      stockSnapshots: finalSnapshots,
      contentItems: basePackage?.contentItems || samplePlnPackage.contentItems,
    };

    const packageHash = await computePackageHash(pkgWithoutHash);
    const fullPkg: ImportPackage = {
      ...pkgWithoutHash,
      packageHash,
    };

    const stats: CsvImportStats = {
      totalRows: rows.length,
      validRows: rows.length,
      totalQuantity,
      materialsCount: finalMaterials.length,
      locationsCount: finalLocations.length,
      mode,
      scope,
      effectiveScope,
      detectedCondition,
      preservedCount,
      sampleRows: rows.slice(0, 5),
      warnings,
    };

    return { pkg: fullPkg, stats };
  }
}

