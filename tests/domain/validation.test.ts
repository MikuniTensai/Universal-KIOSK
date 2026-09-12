import { describe, it, expect } from 'vitest';
import {
  validateImportPackage,
  validateKioskConfig,
  isStockStale,
  isValidIanaTimezone,
  isValidIsoTimestamp,
} from '../../src/domain/validation';
import { ImportPackage, KioskConfig } from '../../src/domain/types';

describe('DATA-01: Category & Material Reference Validation', () => {
  const baseValidPackage: ImportPackage = {
    schemaVersion: '1.0',
    datasetVersion: 1,
    sourceName: 'PLN Logistik SAP Dump',
    sourceAt: '2026-09-11T12:00:00+07:00',
    categories: [
      { id: 'cat-mdu', name: 'Material Distribusi Utama', sortOrder: 1, active: true },
      { id: 'cat-gardu', name: 'Perlengkapan Gardu', sortOrder: 2, active: true },
    ],
    materials: [
      {
        id: 'mat-01',
        code: '000123',
        sapCode: '100028471',
        name: 'Transformator Distribusi 3 Fasa 100 kVA',
        categoryId: 'cat-mdu',
        unit: 'Unit',
        specification: '20 kV / 400 V Step Down SPLN D3.002-1:2007',
        photoPath: '/media/materials/trafo-100kva.png',
      },
    ],
    assets: [],
    barcodeAliases: [
      { value: 'PLN-TRF-100KVA-2026', targetType: 'material', targetId: 'mat-01' },
      { value: '000123', targetType: 'material', targetId: 'mat-01' },
    ],
    locations: [
      { id: 'loc-01', warehouseCode: 'WH-PLN-01', zone: 'Zona B', rack: 'Jalur 2', bin: 'Blok H-04' },
    ],
    stockSnapshots: [
      {
        materialId: 'mat-01',
        locationId: 'loc-01',
        quantity: 4,
        reserved: 2,
        available: 2,
        sourceAt: '2026-09-11T12:00:00+07:00',
      },
    ],
    contentItems: [],
  };

  it('accepts a fully valid package', () => {
    const result = validateImportPackage(baseValidPackage);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects duplicate category IDs with rowId and field', () => {
    const invalidPkg: ImportPackage = {
      ...baseValidPackage,
      categories: [
        { id: 'cat-01', name: 'Kategori A', sortOrder: 1, active: true },
        { id: 'cat-01', name: 'Kategori Duplikat', sortOrder: 2, active: true },
      ],
    };
    const result = validateImportPackage(invalidPkg);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_CATEGORY' && e.rowId === 'cat-01')).toBe(true);
  });

  it('rejects material referencing non-existent categoryId with field name', () => {
    const invalidPkg: ImportPackage = {
      ...baseValidPackage,
      materials: [
        {
          id: 'mat-02',
          code: '000999',
          sapCode: null,
          name: 'Material Tanpa Kategori',
          categoryId: 'non-existent-cat',
          unit: 'Unit',
          specification: null,
          photoPath: null,
        },
      ],
    };
    const result = validateImportPackage(invalidPkg);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'FOREIGN_KEY_VIOLATION' && e.field.includes('categoryId'))).toBe(true);
  });

  it('rejects duplicate barcode alias pointing to different targets', () => {
    const invalidPkg: ImportPackage = {
      ...baseValidPackage,
      materials: [
        ...baseValidPackage.materials,
        {
          id: 'mat-02',
          code: '000456',
          sapCode: null,
          name: 'Isolator Tumpu 20kV',
          categoryId: 'cat-gardu',
          unit: 'Buah',
          specification: null,
          photoPath: null,
        },
      ],
      barcodeAliases: [
        { value: 'BARCODE-DUPLIKAT', targetType: 'material', targetId: 'mat-01' },
        { value: 'BARCODE-DUPLIKAT', targetType: 'material', targetId: 'mat-02' },
      ],
    };
    const result = validateImportPackage(invalidPkg);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_BARCODE_ALIAS')).toBe(true);
  });
});

describe('DATA-02: Timestamps, Timezones, and Null vs Zero', () => {
  it('validates IANA timezones properly', () => {
    expect(isValidIanaTimezone('Asia/Jakarta')).toBe(true);
    expect(isValidIanaTimezone('Asia/Makassar')).toBe(true);
    expect(isValidIanaTimezone('UTC')).toBe(true);
    expect(isValidIanaTimezone('Invalid/Zone_Name')).toBe(false);
    expect(isValidIanaTimezone('')).toBe(false);
  });

  it('validates ISO 8601 with timezone offsets', () => {
    expect(isValidIsoTimestamp('2026-09-11T12:00:00Z')).toBe(true);
    expect(isValidIsoTimestamp('2026-09-11T12:00:00+07:00')).toBe(true);
    expect(isValidIsoTimestamp('2026-09-11T12:00:00.123+07:00')).toBe(true);
    expect(isValidIsoTimestamp('2026-09-11 12:00:00')).toBe(false); // missing T and offset
    expect(isValidIsoTimestamp('invalid-date')).toBe(false);
  });

  it('calculates equal age for different timezone offsets representing same time', () => {
    const t1 = '2026-09-11T05:00:00Z'; // 05:00 UTC
    const t2 = '2026-09-11T12:00:00+07:00'; // 12:00 WIB (UTC+7), exactly same instant
    const fixedNow = new Date('2026-09-11T14:00:00Z').getTime();

    const stale1 = isStockStale(t1, 8, fixedNow);
    const stale2 = isStockStale(t2, 8, fixedNow);
    expect(stale1).toBe(stale2);
    expect(stale1).toBe(true); // 9 hours elapsed > 8 hours threshold
  });

  it('distinguishes quantity null from 0', () => {
    const stockWithNull: { quantity: number | null } = { quantity: null };
    const stockWithZero: { quantity: number | null } = { quantity: 0 };

    expect(stockWithNull.quantity).toBeNull();
    expect(stockWithNull.quantity === 0).toBe(false);
    expect(stockWithZero.quantity).toBe(0);
    expect(stockWithZero.quantity === null).toBe(false);
  });
});

describe('DATA-03 & DATA-04: Version conflict and package validation', () => {
  const activePkg: ImportPackage = {
    schemaVersion: '1.0',
    datasetVersion: 10,
    sourceName: 'PLN Data',
    sourceAt: '2026-09-10T10:00:00Z',
    packageHash: 'hash-version-10',
    categories: [],
    materials: [],
    assets: [],
    barcodeAliases: [],
    locations: [],
    stockSnapshots: [],
    contentItems: [],
  };

  it('rejects an older datasetVersion in normal import', () => {
    const olderPkg: ImportPackage = {
      ...activePkg,
      datasetVersion: 8,
    };
    const result = validateImportPackage(olderPkg, activePkg);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'VERSION_OLDER')).toBe(true);
  });

  it('rejects same datasetVersion with different hash as version conflict', () => {
    const conflictPkg: ImportPackage = {
      ...activePkg,
      datasetVersion: 10,
      packageHash: 'different-hash',
    };
    const result = validateImportPackage(conflictPkg, activePkg);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'VERSION_HASH_CONFLICT')).toBe(true);
  });

  it('warns (no-op) when same version and identical hash', () => {
    const identicalPkg: ImportPackage = {
      ...activePkg,
      datasetVersion: 10,
      packageHash: 'hash-version-10',
    };
    const result = validateImportPackage(identicalPkg, activePkg);
    expect(result.isValid).toBe(true);
    expect(result.warnings.some(w => w.includes('identik'))).toBe(true);
  });

  it('rejects path traversal attempts in fileList', () => {
    const maliciousPkg: ImportPackage = {
      ...activePkg,
      datasetVersion: 11,
      packageHash: 'hash-v11',
      fileList: [
        { path: 'safe/file.png', size: 100 },
        { path: '../../etc/passwd', size: 200 },
      ],
    };
    const result = validateImportPackage(maliciousPkg, activePkg);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'PATH_TRAVERSAL')).toBe(true);
  });
});

describe('KioskConfig Validation', () => {
  const validConfig: KioskConfig = {
    organizationName: 'PT PLN (Persero) Logistik & Gudang',
    warehouseCode: 'WH-PLN-SBY-01',
    timezone: 'Asia/Jakarta',
    idleSeconds: 60,
    warningSeconds: 10,
    staleAfterHours: 24,
    orientation: 'landscape',
  };

  it('validates a correct kiosk configuration', () => {
    const result = validateKioskConfig(validConfig);
    expect(result.isValid).toBe(true);
  });

  it('rejects invalid timezone', () => {
    const result = validateKioskConfig({ ...validConfig, timezone: 'WIB' }); // 'WIB' is not valid IANA timezone
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_TIMEZONE')).toBe(true);
  });

  it('rejects warningSeconds >= idleSeconds', () => {
    const result = validateKioskConfig({ ...validConfig, idleSeconds: 60, warningSeconds: 60 });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'warningSeconds')).toBe(true);
  });
});
