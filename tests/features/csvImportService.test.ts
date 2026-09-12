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

  it('creates an ImportPackage in REPLACE mode replacing all materials and stock', async () => {
    const { pkg, stats } = await CsvImportService.createPackageFromCsv(sampleCsvContent, 'replace', plnUp3MalangFullPackage);
    
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
});
