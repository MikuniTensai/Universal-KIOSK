import { describe, it, expect } from 'vitest';
import { CsvImportService } from '../../src/features/admin/csvImportService';
import { plnUp3MalangFullPackage } from '../../src/data/mockPlnPackage';

describe('CsvImportService (Import & Replace / Merge SAP Excel CSV)', () => {
  const sampleCsvContent = `No,Nama Material,Kode Normalisasi,Satuan,Stok,BLOK,RAK,
1,BOX 105 KVA - BOX;APPMCCB160A+STRIP;AL2MM;1205X420X250,4120470,SET,4,C,-,
2,BOX 147 KVA - BOX;APP 3P 147 KVA (TARIF KELUARGA),4120472,BH,0,C,-,
11,CABLE PWR ACC;CABLE SHOE AL-CU 1H 150mm2,3120159,BH,1000,B,H,H12
12,CABLE PWR ACC;CABLE SHOE AL-CU 1H 35mm2,3120154,BH,25,B,H,H12
13,CABLE PWR ACC;CABLE SHOE AL-CU 1H 70mm2,3120156,BH,0,B,H,H13
`;

  it('parses CSV rows correctly extracting BLOK, RAK, and SUB RAK from empty 8th column', () => {
    const { rows, warnings } = CsvImportService.parseCsv(sampleCsvContent);
    expect(warnings.length).toBe(0);
    expect(rows.length).toBe(5);

    // Row 1 (Item 1)
    expect(rows[0].no).toBe(1);
    expect(rows[0].name).toContain('BOX 105 KVA');
    expect(rows[0].code).toBe('4120470');
    expect(rows[0].unit).toBe('SET');
    expect(rows[0].stock).toBe(4);
    expect(rows[0].blok).toBe('C');
    expect(rows[0].rak).toBe('-');
    expect(rows[0].subRak).toBe('-');

    // Row 3 (Item 11)
    expect(rows[2].no).toBe(11);
    expect(rows[2].name).toContain('CABLE PWR ACC');
    expect(rows[2].code).toBe('3120159');
    expect(rows[2].unit).toBe('BH');
    expect(rows[2].stock).toBe(1000);
    expect(rows[2].blok).toBe('B');
    expect(rows[2].rak).toBe('H');
    expect(rows[2].subRak).toBe('H12');
  });

  it('creates an ImportPackage in REPLACE mode with scope ALL replacing all materials and stock', async () => {
    // Dengan scope 'all', seluruh data lama digantikan murni 100% oleh CSV
    const { pkg, stats } = await CsvImportService.createPackageFromCsv(sampleCsvContent, 'replace', plnUp3MalangFullPackage, 'all');
    
    expect(stats.totalRows).toBe(5);
    expect(stats.materialsCount).toBe(5);
    expect(stats.totalQuantity).toBe(1029); // 4 + 0 + 1000 + 25 + 0
    expect(pkg.materials.length).toBe(5);
    expect(pkg.materials[0].name).toContain('BOX 105 KVA');
    expect(pkg.datasetVersion).toBeGreaterThan(plnUp3MalangFullPackage.datasetVersion);
    expect(pkg.packageHash).toBeTruthy();

    // Check location hierarchy for Item 11
    const mat11 = pkg.materials.find(m => m.code === '3120159');
    expect(mat11).toBeDefined();
    const snapshot11 = pkg.stockSnapshots.find(s => s.materialId === mat11?.id);
    expect(snapshot11?.quantity).toBe(1000);
    const loc11 = pkg.locations.find(l => l.id === snapshot11?.locationId);
    expect(loc11?.zone).toBe('Blok B');
    expect(loc11?.rack).toBe('H');
    expect(loc11?.bin).toBe('H12');
  });

  it('creates an ImportPackage in MERGE mode updating existing materials and preserving others', async () => {
    const { pkg, stats } = await CsvImportService.createPackageFromCsv(sampleCsvContent, 'merge', plnUp3MalangFullPackage);
    
    expect(stats.mode).toBe('merge');
    // Total materials should be at least all 151 materials from master package
    expect(pkg.materials.length).toBeGreaterThanOrEqual(151);
    expect(pkg.datasetVersion).toBeGreaterThan(plnUp3MalangFullPackage.datasetVersion);
  });

  it('guarantees that existing custom photos (photoPath) and specifications are NOT deleted/overwritten on CSV import by kode normalisasi', async () => {
    // Simulate an existing package where material with code 3120159 has a custom uploaded photo
    const customPhotoUrl = 'data:image/jpeg;base64,custom-photo-base64-data';
    const customSpec = 'Spesifikasi Khusus PLN UP3 Malang Kabel Sepatu 150mm2';
    
    const basePkgWithCustomPhoto = {
      ...plnUp3MalangFullPackage,
      materials: plnUp3MalangFullPackage.materials.map(m => {
        if (m.code === '3120159') {
          return {
            ...m,
            photoPath: customPhotoUrl,
            specification: customSpec,
          };
        }
        return m;
      }),
    };

    // Run CSV import (both in replace and merge mode)
    const { pkg: replacedPkg } = await CsvImportService.createPackageFromCsv(sampleCsvContent, 'replace', basePkgWithCustomPhoto);
    const matReplaced = replacedPkg.materials.find(m => m.code === '3120159');
    
    // Pastikan foto kustom dan spesifikasi TIDAK terhapus/terganti
    expect(matReplaced?.photoPath).toBe(customPhotoUrl);
    expect(matReplaced?.specification).toBe(customSpec);

    // Test in merge mode as well
    const { pkg: mergedPkg } = await CsvImportService.createPackageFromCsv(sampleCsvContent, 'merge', basePkgWithCustomPhoto);
    const matMerged = mergedPkg.materials.find(m => m.code === '3120159');
    expect(matMerged?.photoPath).toBe(customPhotoUrl);
    expect(matMerged?.specification).toBe(customSpec);
  });

  it('guarantees two-way protection: importing BARU materials does NOT erase existing RETURN materials in REPLACE mode', async () => {
    // Siapkan base package yang sudah memiliki material Return dan Baru
    const baseWithReturn = {
      ...plnUp3MalangFullPackage,
      materials: [
        ...plnUp3MalangFullPackage.materials,
        {
          id: 'mat-ret-test-01',
          code: '4120470',
          sapCode: '4120470',
          name: 'BOX 105 KVA RETURN TEST',
          categoryId: 'cat-kwh',
          unit: 'SET',
          specification: 'Spesifikasi Return',
          photoPath: 'https://images.unsplash.com/photo-test',
          condition: 'RETURN' as const,
          status: 'GARANSI',
        },
        {
          id: 'mat-ret-test-02',
          code: '9999999',
          sapCode: '9999999',
          name: 'TRAFO 100KVA RETURN TEST',
          categoryId: 'cat-mdu',
          unit: 'UNIT',
          specification: 'Spesifikasi Trafo Return',
          photoPath: 'https://images.unsplash.com/photo-test-trafo',
          condition: 'RETURN' as const,
          status: 'STANDBY',
        },
      ],
      stockSnapshots: [
        ...plnUp3MalangFullPackage.stockSnapshots,
        {
          materialId: 'mat-ret-test-01',
          locationId: 'loc-c-rack-bin',
          quantity: 4,
          reserved: 0,
          available: 4,
          sourceAt: '2026-09-12T00:00:00Z',
        },
        {
          materialId: 'mat-ret-test-02',
          locationId: 'loc-c-rack-bin',
          quantity: 1,
          reserved: 0,
          available: 1,
          sourceAt: '2026-09-12T00:00:00Z',
        },
      ],
      barcodeAliases: [
        ...plnUp3MalangFullPackage.barcodeAliases,
        {
          value: '4120470',
          targetType: 'material' as const,
          targetId: 'mat-ret-test-01',
        },
      ],
    };

    // Impor CSV baru (sampleCsvContent adalah material Baru tanpa kolom status)
    const { pkg, stats } = await CsvImportService.createPackageFromCsv(sampleCsvContent, 'replace', baseWithReturn);

    // Verifikasi:
    expect(stats.effectiveScope).toBe('baru-only');
    expect(stats.detectedCondition).toBe('BARU');
    expect(stats.preservedCount).toBe(7); // 5 material Return bawaan + 2 material Return dummy diamankan

    // 5 material baru dari CSV + 7 material return yang diawetkan = 12 material total
    expect(pkg.materials.length).toBe(12);

    const returnMaterials = pkg.materials.filter(m => m.condition === 'RETURN');
    expect(returnMaterials.length).toBe(7);
    expect(returnMaterials.find(m => m.id === 'mat-ret-test-01')?.status).toBe('GARANSI');
    expect(returnMaterials.find(m => m.id === 'mat-ret-test-02')?.status).toBe('STANDBY');

    // Pastikan stockSnapshot material return juga tidak hilang
    const snap1 = pkg.stockSnapshots.find(s => s.materialId === 'mat-ret-test-01');
    expect(snap1?.quantity).toBe(4);
    const snap2 = pkg.stockSnapshots.find(s => s.materialId === 'mat-ret-test-02');
    expect(snap2?.quantity).toBe(1);
  });

  it('guarantees two-way protection: importing RETURN materials does NOT erase existing BARU materials in REPLACE mode', async () => {
    // CSV khusus Return dengan kolom STATUS
    const returnCsvContent = `No,Nama Material,Kode Normalisasi,Satuan,Stok,BLOK,RAK,SUB RAK,STATUS
1,BOX 105 KVA RETUR GARANSI,4120470,SET,4,C,-,,GARANSI
2,BOX 147 KVA RETUR PERBAIKAN,4120472,BH,2,C,-,,PERBAIKAN
`;

    // plnUp3MalangFullPackage berisi material Baru (sekitar 151 item)
    const initialBaruCount = plnUp3MalangFullPackage.materials.filter(m => m.condition !== 'RETURN').length;
    expect(initialBaruCount).toBeGreaterThan(0);

    const { pkg, stats } = await CsvImportService.createPackageFromCsv(returnCsvContent, 'replace', plnUp3MalangFullPackage);

    // Verifikasi:
    expect(stats.effectiveScope).toBe('return-only');
    expect(stats.detectedCondition).toBe('RETURN');
    expect(stats.preservedCount).toBe(initialBaruCount); // Seluruh material baru diamankan

    // Seluruh material Baru lama tetap ada di pkg
    const baruMaterials = pkg.materials.filter(m => m.condition !== 'RETURN');
    expect(baruMaterials.length).toBe(initialBaruCount);

    // Material return terimpor
    const returnMaterials = pkg.materials.filter(m => m.condition === 'RETURN');
    expect(returnMaterials.length).toBe(2);
    expect(returnMaterials[0].status).toBe('GARANSI');
    expect(returnMaterials[1].status).toBe('PERBAIKAN');

    // Total material = initialBaruCount + 2
    expect(pkg.materials.length).toBe(initialBaruCount + 2);
  });
});
