import { describe, it, expect } from 'vitest';
import { plnUp3MalangFullPackage, defaultKioskConfig } from '../../src/data/mockPlnPackage';
import { CatalogService } from '../../src/features/catalog/catalogService';
import { WarehouseLayoutService } from '../../src/features/layout/warehouseLayoutService';

describe('Client Materials & Warehouse Location Integration (export_material NEW(1).csv)', () => {
  it('contains all 151 client materials in full package', () => {
    expect(plnUp3MalangFullPackage.materials.length).toBeGreaterThanOrEqual(151);
    expect(plnUp3MalangFullPackage.datasetVersion).toBeGreaterThanOrEqual(3);
  });

  it('verifies all materials have valid variables: Nama Material, Kode Normalisasi, Satuan, Stok, BLOK, RAK', () => {
    for (const mat of plnUp3MalangFullPackage.materials) {
      expect(mat.id).toBeDefined();
      expect(mat.code).toBeTruthy(); // Kode Normalisasi
      expect(mat.name).toBeTruthy(); // Nama Material
      expect(mat.unit).toBeTruthy(); // Satuan
      expect(['cat-mdu', 'cat-gardu', 'cat-kwh', 'cat-k3', 'cat-kabel']).toContain(mat.categoryId);
      expect(['Unit', 'Buah', 'Set', 'Meter', 'Pack', 'BH', 'SET', 'M', 'PACK']).toContain(mat.unit);
    }
  });

  it('verifies material from WhatsApp screenshot (1060798 - TRF ACC;DUDUKAN TRFCANTOL-PIPA KBL-LA-CO)', () => {
    const result = CatalogService.searchMaterials(plnUp3MalangFullPackage, defaultKioskConfig, {
      query: '1060798',
    });
    expect(result.total).toBe(1);
    const item = result.items[0];
    expect(item.name).toBe('TRF ACC;DUDUKAN TRFCANTOL-PIPA KBL-LA-CO');
    expect(item.code).toBe('1060798');
    expect(item.unit).toBe('BH');
    expect(item.totalQuantity).toBe(0);
    expect(item.locations[0].location.zone).toContain('Blok C');
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
    expect(result.items[0].unit).toBe('SET');
  });

  it('searches client materials by specific Rak Code or Sub Rak (e.g. H12, A11)', () => {
    // Search Rak H12 (Cable Shoe)
    const resultH12 = CatalogService.searchMaterials(plnUp3MalangFullPackage, defaultKioskConfig, {
      query: 'H12',
    });
    expect(resultH12.total).toBeGreaterThanOrEqual(1);
    expect(resultH12.items.some(i => i.locations.some(l => l.location.bin?.includes('H12') || l.location.rack?.includes('H12')))).toBe(true);

    // Search Rak A11 (MCB 1P 10A)
    const resultA11 = CatalogService.searchMaterials(plnUp3MalangFullPackage, defaultKioskConfig, {
      query: 'A11',
    });
    expect(resultA11.total).toBeGreaterThanOrEqual(1);
    expect(resultA11.items.some(i => i.name.includes('MCB'))).toBe(true);
  });

  it('searches client materials by Cable Normalisasi 3110542 (NFA2X-T 3x70)', () => {
    const result = CatalogService.searchMaterials(plnUp3MalangFullPackage, defaultKioskConfig, {
      query: '3110542',
    });
    expect(result.total).toBe(1);
    expect(result.items[0].name).toContain('NFA2X-T');
    expect(result.items[0].unit).toBe('BH');
    expect(result.items[0].totalQuantity).toBe(14000);
  });

  it('scans client barcode alias directly using Kode Normalisasi', () => {
    const scanResult = CatalogService.resolveScan('2240029', plnUp3MalangFullPackage, defaultKioskConfig);
    expect(scanResult.status).toBe('found');
    expect(scanResult.material?.name).toContain('FUSE;380/220V;125A');
    expect(scanResult.material?.totalQuantity).toBe(590);
    expect(scanResult.material?.locations[0].location.bin).toContain('I13');
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
