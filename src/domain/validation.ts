import { ImportPackage, KioskConfig } from './types';

export interface ValidationError {
  field: string;
  message: string;
  rowId?: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Validates IANA timezone string
 */
export function isValidIanaTimezone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates ISO 8601 timestamp with explicit timezone offset or Z
 */
export function isValidIsoTimestamp(isoString: string): boolean {
  if (!isoString || typeof isoString !== 'string') return false;
  // Must have T and either Z or timezone offset (+/-HH:MM)
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
  if (!isoRegex.test(isoString)) return false;
  
  const date = new Date(isoString);
  return !isNaN(date.getTime());
}

/**
 * Checks whether a timestamp is in the future
 */
export function isFutureTimestamp(isoString: string, allowedClockDriftMs = 60000): boolean {
  const date = new Date(isoString);
  return date.getTime() > Date.now() + allowedClockDriftMs;
}

/**
 * Determines whether stock data is considered stale based on configuration
 */
export function isStockStale(
  sourceAt: string | null | undefined,
  staleAfterHours: number | null | undefined,
  nowMs = Date.now()
): boolean {
  if (!sourceAt || staleAfterHours === null || staleAfterHours === undefined || staleAfterHours <= 0) {
    return false;
  }
  const sourceDate = new Date(sourceAt);
  if (isNaN(sourceDate.getTime())) return true;
  
  const elapsedMs = nowMs - sourceDate.getTime();
  const maxAgeMs = staleAfterHours * 3600 * 1000;
  return elapsedMs > maxAgeMs;
}

/**
 * Validates an entire ImportPackage according to DATA-01, DATA-02, DATA-03 rules
 */
export function validateImportPackage(pkg: ImportPackage, activePackage?: ImportPackage | null): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Basic package headers
  if (!pkg.schemaVersion) {
    errors.push({ field: 'schemaVersion', code: 'REQUIRED', message: 'schemaVersion wajib diisi' });
  }
  if (typeof pkg.datasetVersion !== 'number' || pkg.datasetVersion <= 0) {
    errors.push({ field: 'datasetVersion', code: 'INVALID', message: 'datasetVersion wajib berupa angka positif' });
  }
  if (!pkg.sourceName) {
    errors.push({ field: 'sourceName', code: 'REQUIRED', message: 'sourceName wajib diisi' });
  }
  if (!pkg.sourceAt || !isValidIsoTimestamp(pkg.sourceAt)) {
    errors.push({ field: 'sourceAt', code: 'INVALID_TIMESTAMP', message: 'sourceAt harus berupa format ISO 8601 dengan zona waktu' });
  } else if (isFutureTimestamp(pkg.sourceAt)) {
    errors.push({ field: 'sourceAt', code: 'FUTURE_TIMESTAMP', message: 'sourceAt tidak boleh berada di masa depan' });
  }

  // File list path traversal protection
  if (pkg.fileList && Array.isArray(pkg.fileList)) {
    for (let i = 0; i < pkg.fileList.length; i++) {
      const file = pkg.fileList[i];
      if (file.path.includes('..') || file.path.startsWith('/') || file.path.startsWith('\\')) {
        errors.push({
          field: `fileList[${i}].path`,
          code: 'PATH_TRAVERSAL',
          message: `Path tidak diizinkan: ${file.path}`,
        });
      }
    }
  }

  // DATA-01: Category validation
  const categoryIds = new Set<string>();
  if (Array.isArray(pkg.categories)) {
    for (let i = 0; i < pkg.categories.length; i++) {
      const cat = pkg.categories[i];
      if (!cat.id) {
        errors.push({ field: `categories[${i}].id`, code: 'REQUIRED', message: 'Category ID wajib diisi' });
        continue;
      }
      if (categoryIds.has(cat.id)) {
        errors.push({
          field: `categories[${i}].id`,
          code: 'DUPLICATE_CATEGORY',
          rowId: cat.id,
          message: `ID Kategori duplikat: "${cat.id}"`,
        });
      }
      categoryIds.add(cat.id);
    }
  }

  // DATA-01 & Material reference validation
  const materialIds = new Set<string>();
  const materialCodes = new Set<string>();
  if (Array.isArray(pkg.materials)) {
    for (let i = 0; i < pkg.materials.length; i++) {
      const mat = pkg.materials[i];
      if (!mat.id) {
        errors.push({ field: `materials[${i}].id`, code: 'REQUIRED', message: 'Material ID wajib diisi' });
        continue;
      }
      if (materialIds.has(mat.id)) {
        errors.push({
          field: `materials[${i}].id`,
          code: 'DUPLICATE_MATERIAL_ID',
          rowId: mat.id,
          message: `ID Material duplikat: "${mat.id}"`,
        });
      }
      materialIds.add(mat.id);

      if (!mat.code) {
        errors.push({ field: `materials[${i}].code`, rowId: mat.id, code: 'REQUIRED', message: 'Kode material wajib diisi' });
      } else {
        materialCodes.add(mat.code);
      }

      if (!mat.name) {
        errors.push({ field: `materials[${i}].name`, rowId: mat.id, code: 'REQUIRED', message: 'Nama material wajib diisi' });
      }

      // Check categoryId exists
      if (mat.categoryId && !categoryIds.has(mat.categoryId)) {
        errors.push({
          field: `materials[${i}].categoryId`,
          rowId: mat.id,
          code: 'FOREIGN_KEY_VIOLATION',
          message: `Material "${mat.name || mat.id}" merujuk ke Category ID yang tidak ada: "${mat.categoryId}"`,
        });
      }
    }
  }

  // Location validation
  const locationIds = new Set<string>();
  if (Array.isArray(pkg.locations)) {
    for (let i = 0; i < pkg.locations.length; i++) {
      const loc = pkg.locations[i];
      if (!loc.id) {
        errors.push({ field: `locations[${i}].id`, code: 'REQUIRED', message: 'Location ID wajib diisi' });
        continue;
      }
      locationIds.add(loc.id);
    }
  }

  // Asset validation
  const assetIds = new Set<string>();
  if (Array.isArray(pkg.assets)) {
    for (let i = 0; i < pkg.assets.length; i++) {
      const asset = pkg.assets[i];
      if (!asset.id) {
        errors.push({ field: `assets[${i}].id`, code: 'REQUIRED', message: 'Asset ID wajib diisi' });
        continue;
      }
      assetIds.add(asset.id);

      if (!materialIds.has(asset.materialId)) {
        errors.push({
          field: `assets[${i}].materialId`,
          rowId: asset.id,
          code: 'FOREIGN_KEY_VIOLATION',
          message: `Asset "${asset.serialNumber}" merujuk ke Material ID yang tidak ada: "${asset.materialId}"`,
        });
      }
      if (asset.locationId && !locationIds.has(asset.locationId)) {
        errors.push({
          field: `assets[${i}].locationId`,
          rowId: asset.id,
          code: 'FOREIGN_KEY_VIOLATION',
          message: `Asset "${asset.serialNumber}" merujuk ke Location ID yang tidak ada: "${asset.locationId}"`,
        });
      }
    }
  }

  // Barcode Alias uniqueness & integrity
  const barcodeMap = new Map<string, { targetType: string; targetId: string }>();
  if (Array.isArray(pkg.barcodeAliases)) {
    for (let i = 0; i < pkg.barcodeAliases.length; i++) {
      const alias = pkg.barcodeAliases[i];
      if (!alias.value) {
        errors.push({ field: `barcodeAliases[${i}].value`, code: 'REQUIRED', message: 'Nilai barcode alias wajib diisi' });
        continue;
      }
      
      const existing = barcodeMap.get(alias.value);
      if (existing) {
        if (existing.targetType !== alias.targetType || existing.targetId !== alias.targetId) {
          errors.push({
            field: `barcodeAliases[${i}].value`,
            code: 'DUPLICATE_BARCODE_ALIAS',
            rowId: alias.value,
            message: `Barcode "${alias.value}" terdaftar ganda untuk tujuan berbeda (${existing.targetType}:${existing.targetId} vs ${alias.targetType}:${alias.targetId})`,
          });
        }
      } else {
        barcodeMap.set(alias.value, { targetType: alias.targetType, targetId: alias.targetId });
      }

      // Check target exists
      if (alias.targetType === 'material') {
        if (!materialIds.has(alias.targetId)) {
          errors.push({
            field: `barcodeAliases[${i}].targetId`,
            code: 'FOREIGN_KEY_VIOLATION',
            message: `Barcode alias "${alias.value}" merujuk ke Material ID yang tidak ada: "${alias.targetId}"`,
          });
        }
      } else if (alias.targetType === 'asset') {
        if (!assetIds.has(alias.targetId)) {
          errors.push({
            field: `barcodeAliases[${i}].targetId`,
            code: 'FOREIGN_KEY_VIOLATION',
            message: `Barcode alias "${alias.value}" merujuk ke Asset ID yang tidak ada: "${alias.targetId}"`,
          });
        }
      }
    }
  }

  // Stock snapshot validation
  if (Array.isArray(pkg.stockSnapshots)) {
    for (let i = 0; i < pkg.stockSnapshots.length; i++) {
      const stock = pkg.stockSnapshots[i];
      if (!materialIds.has(stock.materialId)) {
        errors.push({
          field: `stockSnapshots[${i}].materialId`,
          code: 'FOREIGN_KEY_VIOLATION',
          message: `StockSnapshot merujuk ke Material ID yang tidak ada: "${stock.materialId}"`,
        });
      }
      if (stock.locationId && !locationIds.has(stock.locationId)) {
        errors.push({
          field: `stockSnapshots[${i}].locationId`,
          code: 'FOREIGN_KEY_VIOLATION',
          message: `StockSnapshot merujuk ke Location ID yang tidak ada: "${stock.locationId}"`,
        });
      }
      if (!isValidIsoTimestamp(stock.sourceAt)) {
        errors.push({
          field: `stockSnapshots[${i}].sourceAt`,
          code: 'INVALID_TIMESTAMP',
          message: `StockSnapshot sourceAt tidak valid: "${stock.sourceAt}"`,
        });
      }
    }
  }

  // DATA-03: Comparison with active package (if any)
  if (activePackage) {
    if (pkg.datasetVersion < activePackage.datasetVersion) {
      errors.push({
        field: 'datasetVersion',
        code: 'VERSION_OLDER',
        message: `Paket versi ${pkg.datasetVersion} lebih lama dari versi aktif (${activePackage.datasetVersion}). Gunakan fitur Restore jika sengaja ingin memulihkan versi lama.`,
      });
    } else if (pkg.datasetVersion === activePackage.datasetVersion) {
      if (pkg.packageHash && activePackage.packageHash && pkg.packageHash !== activePackage.packageHash) {
        errors.push({
          field: 'packageHash',
          code: 'VERSION_HASH_CONFLICT',
          message: `Konflik versi: Versi dataset sama (${pkg.datasetVersion}) namun isi paket / hash berbeda.`,
        });
      } else {
        warnings.push(`Paket versi ${pkg.datasetVersion} memiliki hash identik dengan paket aktif. Tidak ada perubahan data.`);
      }
    }

    if (new Date(pkg.sourceAt).getTime() < new Date(activePackage.sourceAt).getTime()) {
      warnings.push(`Waktu sumber data (${pkg.sourceAt}) lebih tua dari paket aktif (${activePackage.sourceAt}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates Kiosk configuration
 */
export function validateKioskConfig(config: KioskConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!config.organizationName?.trim()) {
    errors.push({ field: 'organizationName', code: 'REQUIRED', message: 'Nama organisasi wajib diisi' });
  }
  if (!config.warehouseCode?.trim()) {
    errors.push({ field: 'warehouseCode', code: 'REQUIRED', message: 'Kode gudang wajib diisi' });
  }
  if (!isValidIanaTimezone(config.timezone)) {
    errors.push({ field: 'timezone', code: 'INVALID_TIMEZONE', message: `Zona waktu tidak valid: "${config.timezone}"` });
  }
  if (typeof config.idleSeconds !== 'number' || config.idleSeconds < 10) {
    errors.push({ field: 'idleSeconds', code: 'INVALID_NUMBER', message: 'Timeout idle minimal 10 detik' });
  }
  if (typeof config.warningSeconds !== 'number' || config.warningSeconds < 3 || config.warningSeconds >= config.idleSeconds) {
    errors.push({ field: 'warningSeconds', code: 'INVALID_NUMBER', message: 'Warning timeout harus lebih kecil dari idle timeout' });
  }
  if (config.staleAfterHours !== null && (typeof config.staleAfterHours !== 'number' || config.staleAfterHours <= 0)) {
    errors.push({ field: 'staleAfterHours', code: 'INVALID_NUMBER', message: 'Batas umur stok harus angka positif atau null' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
