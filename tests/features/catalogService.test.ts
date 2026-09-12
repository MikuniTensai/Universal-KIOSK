import { describe, it, expect } from 'vitest';
import { CatalogService } from '../../src/features/catalog/catalogService';
import { samplePlnPackage, defaultKioskConfig } from '../../src/data/mockPlnPackage';

describe('CatalogService Tests', () => {
  it('searches materials by name accurately', () => {
    const result = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      query: 'Transformator',
    });
    expect(result.total).toBe(1);
    expect(result.items[0].name).toContain('Transformator Distribusi');
    expect(result.items[0].code).toBe('000123'); // zero-padded code intact
  });

  it('searches materials by zero-padded code', () => {
    const result = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      query: '000123',
    });
    expect(result.total).toBe(1);
    expect(result.items[0].code).toBe('000123');
  });

  it('filters materials by categoryId', () => {
    const result = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      categoryId: 'cat-mdu',
    });
    expect(result.total).toBe(1);
    expect(result.items[0].categoryId).toBe('cat-mdu');
  });

  it('resolves scan from barcode alias to Material', () => {
    const scanResult = CatalogService.resolveScan('PLN-TRF-100KVA-2026', samplePlnPackage, defaultKioskConfig);
    expect(scanResult.status).toBe('found');
    expect(scanResult.targetType).toBe('material');
    expect(scanResult.material?.name).toContain('Transformator');
    expect(scanResult.material?.totalQuantity).toBe(4);
    expect(scanResult.material?.locations[0].stock.quantity).toBe(4);
  });

  it('resolves scan from asset serial number to Asset and Material', () => {
    const scanResult = CatalogService.resolveScan('TRF-TRAFOINDO-2026-081', samplePlnPackage, defaultKioskConfig);
    expect(scanResult.status).toBe('found');
    expect(scanResult.targetType).toBe('asset');
    expect(scanResult.asset?.serialNumber).toBe('TRF-TRAFOINDO-2026-081');
    expect(scanResult.material?.name).toContain('Transformator');
  });

  it('returns not_found status for unrecognized barcode', () => {
    const scanResult = CatalogService.resolveScan('BARCODE-TIDAK-DIKENAL-999', samplePlnPackage, defaultKioskConfig);
    expect(scanResult.status).toBe('not_found');
    expect(scanResult.errorMessage).toContain('tidak ditemukan');
  });

  it('distinguishes zero quantity from null', () => {
    // mat-006 has quantity = 0
    const scanResult = CatalogService.resolveScan('001678', samplePlnPackage, defaultKioskConfig);
    expect(scanResult.status).toBe('found');
    expect(scanResult.material?.totalQuantity).toBe(0);
    expect(scanResult.material?.totalQuantity === null).toBe(false);
  });
});
