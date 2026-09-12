import { describe, it, expect, beforeEach } from 'vitest';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';
import { CsvImportService } from '../../src/features/admin/csvImportService';
import { plnUp3MalangFullPackage } from '../../src/data/mockPlnPackage';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Dual Database Isolation (Database Baru vs Database Return)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Inisialisasi awal dengan package mock
    kioskStorage.activatePackage(plnUp3MalangFullPackage, 'all');
  });

  it('keeps Database Baru intact when activating a Return-only package', async () => {
    const pkgBaruBefore = kioskStorage.getPackageBaru();
    const pkgReturnBefore = kioskStorage.getPackageReturn();

    expect(pkgBaruBefore.materials.length).toBeGreaterThan(0);
    const initialBaruIds = pkgBaruBefore.materials.map(m => m.id);

    // Baca file CSV Return riil permintaan client
    const csvPath = resolve(__dirname, '../../permintaan-client/export_material NEW RETUR.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');

    // Parse CSV menggunakan CsvImportService dengan target scope 'return-only'
    const result = await CsvImportService.createPackageFromCsv(
      csvContent,
      'replace',
      pkgReturnBefore,
      'return-only'
    );

    expect(result.pkg.materials.length).toBeGreaterThan(0);
    // Pastikan semua berstatus RETURN
    expect(result.pkg.materials.every(m => m.condition === 'RETURN')).toBe(true);

    // Simpan/Aktifkan HANYA ke Database Return
    kioskStorage.activatePackage(result.pkg, 'return');

    // VERIFIKASI UTAMA:
    // 1. Database Baru 100% UTUH dan TIDAK ADA SATUPUN yang hilang atau berubah
    const pkgBaruAfter = kioskStorage.getPackageBaru();
    expect(pkgBaruAfter.materials.length).toBe(pkgBaruBefore.materials.length);
    expect(pkgBaruAfter.materials.map(m => m.id)).toEqual(initialBaruIds);

    // 2. Database Return terisi material baru dari CSV
    const pkgReturnAfter = kioskStorage.getPackageReturn();
    expect(pkgReturnAfter.materials.length).toBe(result.pkg.materials.length);
    expect(pkgReturnAfter.materials.some(m => m.name.includes('BOX 105 KVA'))).toBe(true);

    // 3. Database Gabungan (activePackage) memiliki gabungan keduanya
    const activePkg = kioskStorage.getActivePackage();
    expect(activePkg?.materials.length).toBe(pkgBaruAfter.materials.length + pkgReturnAfter.materials.length);
  });

  it('keeps Database Return intact when activating a Baru-only package', () => {
    // Siapkan data return terlebih dahulu
    const sampleReturn = {
      ...kioskStorage.getPackageReturn(),
      materials: [
        {
          id: 'ret-custom-1',
          code: 'RET-50KVA',
          sapCode: null,
          name: 'TRANSFORMATOR BEKAS 50KVA',
          categoryId: 'cat-trafo',
          specification: null,
          photoPath: null,
          condition: 'RETURN' as const,
          status: 'BEKAS',
          unit: 'UNIT',
        }
      ]
    };
    kioskStorage.savePackageReturn(sampleReturn);

    const pkgReturnBefore = kioskStorage.getPackageReturn();
    expect(pkgReturnBefore.materials.length).toBe(1);

    // Buat package baru untuk Database Baru
    const newBaruPackage = {
      ...kioskStorage.getPackageBaru(),
      materials: [
        {
          id: 'baru-custom-1',
          code: 'TIC-70',
          sapCode: null,
          name: 'KABEL TIC 3X70 BARU',
          categoryId: 'cat-kabel',
          specification: null,
          photoPath: null,
          condition: 'BARU' as const,
          status: 'Baru',
          unit: 'MTR',
        }
      ]
    };

    // Aktifkan HANYA ke database Baru
    kioskStorage.activatePackage(newBaruPackage, 'baru');

    // VERIFIKASI UTAMA:
    // Database Return TETAP UTUH dan aman
    const pkgReturnAfter = kioskStorage.getPackageReturn();
    expect(pkgReturnAfter.materials.length).toBe(1);
    expect(pkgReturnAfter.materials[0].id).toBe('ret-custom-1');

    // Database Baru diperbarui
    const pkgBaruAfter = kioskStorage.getPackageBaru();
    expect(pkgBaruAfter.materials.length).toBe(1);
    expect(pkgBaruAfter.materials[0].id).toBe('baru-custom-1');
  });

  it('modifies stock in the target database without bleeding into the other database', () => {
    // Siapkan 1 material di return database
    const sampleReturn = {
      ...kioskStorage.getPackageReturn(),
      materials: [
        {
          id: 'ret-stock-test-1',
          code: 'RET-BOX-1',
          sapCode: null,
          name: 'BOX APP RETUR STANDBY',
          categoryId: 'cat-box',
          specification: null,
          photoPath: null,
          condition: 'RETURN' as const,
          status: 'STANDBY',
          unit: 'SET',
        }
      ],
      stockSnapshots: [
        {
          materialId: 'ret-stock-test-1',
          locationId: 'loc-test-1',
          quantity: 10,
          reserved: 0,
          available: 10,
          sourceAt: new Date().toISOString()
        }
      ]
    };
    kioskStorage.savePackageReturn(sampleReturn);

    kioskStorage.addOrAdjustStock({
      materialId: 'ret-stock-test-1',
      quantityDelta: 5,
      locationId: 'loc-test-1',
    });

    const updatedSnapshot = kioskStorage.getPackageReturn().stockSnapshots.find(s => s.materialId === 'ret-stock-test-1');
    expect(updatedSnapshot?.quantity).toBe(15);

    // Pastikan material di Database Baru tidak tersentuh dan tidak ada ID ini di Database Baru
    const pkgBaru = kioskStorage.getPackageBaru();
    expect(pkgBaru.materials.find(m => m.id === 'ret-stock-test-1')).toBeUndefined();
  });

  it('deletes material from the target database without affecting the other database', () => {
    const pkgBaruInitialCount = kioskStorage.getPackageBaru().materials.length;
    
    // Siapkan material di return
    const sampleReturn = {
      ...kioskStorage.getPackageReturn(),
      materials: [
        {
          id: 'ret-del-test-1',
          code: 'RET-BOX-DEL',
          sapCode: null,
          name: 'BOX APP RETUR UNTUK DIHAPUS',
          categoryId: 'cat-box',
          specification: null,
          photoPath: null,
          condition: 'RETURN' as const,
          status: 'STANDBY',
          unit: 'SET',
        }
      ]
    };
    kioskStorage.savePackageReturn(sampleReturn);
    expect(kioskStorage.getPackageReturn().materials.length).toBe(1);

    kioskStorage.deleteMaterial('ret-del-test-1');

    // Terhapus dari Return
    expect(kioskStorage.getPackageReturn().materials.find(m => m.id === 'ret-del-test-1')).toBeUndefined();
    expect(kioskStorage.getPackageReturn().materials.length).toBe(0);

    // Database Baru tetap utuh tidak berkurang sama sekali
    expect(kioskStorage.getPackageBaru().materials.length).toBe(pkgBaruInitialCount);
  });
});
