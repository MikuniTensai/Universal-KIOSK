import { describe, it, expect, beforeEach } from 'vitest';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';
import { scannerAdapter } from '../../src/features/scanner/scannerWedgeAdapter';

describe('Stock & Category Management Integration Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('adds a new category successfully and persists to active package', () => {
    const newCat = kioskStorage.addCategory('Kabel Bawah Tanah 20kV');
    expect(newCat.id).toBeDefined();
    expect(newCat.name).toBe('Kabel Bawah Tanah 20kV');

    const activePkg = kioskStorage.getActivePackage();
    expect(activePkg?.categories.some(c => c.name === 'Kabel Bawah Tanah 20kV')).toBe(true);
  });

  it('rejects adding empty category name', () => {
    expect(() => kioskStorage.addCategory('   ')).toThrow('Nama kategori tidak boleh kosong.');
  });

  it('adds a new material with barcode alias, location, and initial stock', async () => {
    const pkg = kioskStorage.getActivePackage();
    const catId = pkg?.categories[0]?.id || 'cat-mdu';

    const newMat = kioskStorage.addMaterialWithBarcode({
      code: '009876',
      name: 'Fuse Cut Out Polymer 24kV 200A',
      categoryId: catId,
      sapCode: '100099123',
      unit: 'Set',
      specification: 'SPLN D3.002-1:2007',
      barcode: 'PLN-FCO-200A-2026',
      zone: 'Zona C',
      rack: 'Rak 05',
      bin: 'Bin 12',
      initialQuantity: 45,
    });

    expect(newMat.id).toBeDefined();
    expect(newMat.name).toBe('Fuse Cut Out Polymer 24kV 200A');

    // Verify barcode alias registered
    const active = kioskStorage.getActivePackage();
    const alias = active?.barcodeAliases.find(a => a.value === 'PLN-FCO-200A-2026');
    expect(alias).toBeDefined();
    expect(alias?.targetId).toBe(newMat.id);

    // Verify stock registered
    const stock = active?.stockSnapshots.find(s => s.materialId === newMat.id);
    expect(stock).toBeDefined();
    expect(stock?.quantity).toBe(45);
    expect(stock?.available).toBe(45);

    // Verify scanner resolves the custom barcode immediately
    const scanResult = await scannerAdapter.processScan('PLN-FCO-200A-2026');
    expect(scanResult.status).toBe('found');
    expect(scanResult.material?.name).toBe('Fuse Cut Out Polymer 24kV 200A');
    expect(scanResult.material?.totalQuantity).toBe(45);
  });

  it('rejects adding material with duplicate code', () => {
    const pkg = kioskStorage.getActivePackage();
    const existingCode = pkg?.materials[0]?.code || '000123';

    expect(() => {
      kioskStorage.addMaterialWithBarcode({
        code: existingCode,
        name: 'Duplikat Material',
        categoryId: 'cat-mdu',
        unit: 'Unit',
        barcode: 'DUPLIKAT-BARCODE',
      });
    }).toThrow(`Material dengan kode "${existingCode}" sudah ada.`);
  });

  it('adjusts existing material stock by delta and exact value', () => {
    const pkg = kioskStorage.getActivePackage();
    const material = pkg?.materials[0]!;

    // Initial stock
    const initialStocks = pkg?.stockSnapshots.filter(s => s.materialId === material.id) || [];
    const initialTotal = initialStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);

    // Add +15 units
    kioskStorage.addOrAdjustStock({
      materialId: material.id,
      quantityDelta: 15,
      setExact: false,
    });

    let updatedPkg = kioskStorage.getActivePackage();
    let updatedStocks = updatedPkg?.stockSnapshots.filter(s => s.materialId === material.id) || [];
    let updatedTotal = updatedStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    expect(updatedTotal).toBe(initialTotal + 15);

    // Set exact value 100 units
    kioskStorage.addOrAdjustStock({
      materialId: material.id,
      quantityDelta: 100,
      setExact: true,
    });

    updatedPkg = kioskStorage.getActivePackage();
    const exactStock = updatedPkg?.stockSnapshots.find(s => s.materialId === material.id);
    expect(exactStock?.quantity).toBe(100);
  });
});
