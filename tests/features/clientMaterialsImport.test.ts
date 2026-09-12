import { describe, it, expect } from 'vitest';
import { plnUp3MalangFullPackage, defaultKioskConfig } from '../../src/data/mockPlnPackage';
import { CatalogService } from '../../src/features/catalog/catalogService';
import { WarehouseLayoutService } from '../../src/features/layout/warehouseLayoutService';

describe('Client Materials & Warehouse Location Integration (export_material NEW.csv)', () => {
  it('contains all 151 client materials in full package', () => {
    expect(plnUp3MalangFullPackage.materials.length).toBeGreaterThanOrEqual(151);
    expect(plnUp3MalangFullPackage.datasetVersion).toBe(2);
  });

  it('verifies all materials have valid codes, units, and categories', () => {
    for (const mat of plnUp3MalangFullPackage.materials) {
      expect(mat.id).toBeDefined();
      expect(mat.code).toBeTruthy();
      expect(mat.name).toBeTruthy();
      expect(['cat-mdu', 'cat-gardu', 'cat-kwh', 'cat-k3', 'cat-kabel']).toContain(mat.categoryId);
      expect(['Unit', 'Buah', 'Set', 'Meter', 'Pack']).toContain(mat.unit);
    }
  });

  it('searches client materials by Kode Normalisasi SAP (e.g. 4120470 for BOX 105 KVA)', () => {
    const result = CatalogService.searchMaterials(plnUp3MalangFullPackage, defaultKioskConfig, {
      query: '4120470',
    });
    expect(result.total).toBe(1);
    expect(result.items[0].name).toContain('BOX 105 KVA');
    expect(result.items[0].code).toBe('4120470');
    expect(result.items[0].locations[0].location.zone).toContain('Blok C');
    expect(result.items[0].totalQuantity).toBe(4);
  });

  it('searches client materials by Cable Normalisasi 3110542 (NFA2X-T 3x70)', () => {
    const result = CatalogService.searchMaterials(plnUp3MalangFullPackage, defaultKioskConfig, {
      query: '3110542',
    });
    expect(result.total).toBe(1);
    expect(result.items[0].name).toContain('NFA2X-T');
    expect(result.items[0].unit).toBe('Buah');
    expect(result.items[0].totalQuantity).toBe(14000);
  });

  it('scans client barcode alias directly using Kode Normalisasi', () => {
    const scanResult = CatalogService.resolveScan('2240029', plnUp3MalangFullPackage, defaultKioskConfig);
    expect(scanResult.status).toBe('found');
    expect(scanResult.material?.name).toContain('FUSE;380/220V;125A');
    expect(scanResult.material?.totalQuantity).toBe(590);
  });

  it('synchronizes client materials with warehouse blocks and slots', () => {
    WarehouseLayoutService.resetDefaults();
    WarehouseLayoutService.syncWithPackage(plnUp3MalangFullPackage);
    const blocks = WarehouseLayoutService.getBlocks();
    
    // Check occupied slots in Blok A, B, C
    const blokA = blocks.find(b => b.letter === 'A');
    const blokB = blocks.find(b => b.letter === 'B');
    const blokC = blocks.find(b => b.letter === 'C');

    expect(blokA).toBeDefined();
    expect(blokB).toBeDefined();
    expect(blokC).toBeDefined();

    const occupiedInA = blokA?.subBlocks.flatMap(sb => sb.slots).filter(s => s.status === 'occupied');
    const occupiedInC = blokC?.subBlocks.flatMap(sb => sb.slots).filter(s => s.status === 'occupied');

    expect(occupiedInA?.length).toBeGreaterThanOrEqual(1);
    expect(occupiedInC?.length).toBeGreaterThanOrEqual(1);
  });
});
