import { describe, it, expect } from 'vitest';
import { StockConsistencyService } from '../../src/features/admin/stockConsistencyService';
import { CsvImportService } from '../../src/features/admin/csvImportService';
import { ImportPackage, StockSnapshot } from '../../src/domain/types';
import { plnUp3MalangFullPackage } from '../../src/data/mockPlnPackage';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';

describe('Stock Consistency Checker & 1:1 SAP Stock Reconciliation', () => {
  it('detects legacy reserved discrepancies and reconciles them 1:1 with SAP physical quantity', () => {
    const nowIso = new Date().toISOString();
    // 1. Buat paket contoh dengan beberapa snapshot legacy yang memotong 10% cadangan (reserved)
    const mockSnapshots: StockSnapshot[] = [
      {
        materialId: 'mat-test-01',
        locationId: 'loc-1',
        quantity: 1000,
        reserved: 100, // Legacy 10% formula
        available: 900,
        sourceAt: nowIso,
      },
      {
        materialId: 'mat-test-02',
        locationId: 'loc-1',
        quantity: 11,
        reserved: 1, // Legacy 10% formula
        available: 10,
        sourceAt: nowIso,
      },
      {
        materialId: 'mat-test-03',
        locationId: 'loc-2',
        quantity: 5,
        reserved: 0,
        available: 5,
        sourceAt: nowIso,
      },
    ];

    const mockPackage: ImportPackage = {
      ...plnUp3MalangFullPackage,
      stockSnapshots: mockSnapshots,
    };

    // 2. Jalankan audit keselarasan stok
    const auditReport = StockConsistencyService.auditPackage(mockPackage);
    expect(auditReport.hasDiscrepancy).toBe(true);
    expect(auditReport.discrepantCount).toBe(2);
    expect(auditReport.cleanSnapshotsCount).toBe(1);

    // Periksa item pertama yang terdampak
    const disc1 = auditReport.discrepancies.find(d => d.materialId === 'mat-test-01');
    expect(disc1).toBeDefined();
    expect(disc1?.quantity).toBe(1000);
    expect(disc1?.reserved).toBe(100);
    expect(disc1?.available).toBe(900);
    expect(disc1?.expectedAvailable).toBe(1000);

    // 3. Jalankan rekonsiliasi
    const { healedPkg, repairedCount } = StockConsistencyService.reconcilePackage(mockPackage);
    expect(repairedCount).toBe(2);

    // 4. Verifikasi setelah direkonsiliasi
    const postAudit = StockConsistencyService.auditPackage(healedPkg);
    expect(postAudit.hasDiscrepancy).toBe(false);
    expect(postAudit.discrepantCount).toBe(0);
    expect(postAudit.cleanSnapshotsCount).toBe(3);

    // Seluruh snapshot sekarang memiliki reserved = 0 dan available = quantity
    healedPkg.stockSnapshots.forEach(snap => {
      expect(snap.reserved).toBe(0);
      expect(snap.available).toBe(snap.quantity);
    });
  });

  it('CsvImportService now creates 100% available stock with 0 reserved without artificial deduction', async () => {
    const csvContent = `No,Nama Material,Kode Normalisasi,Satuan,Stok,BLOK,RAK,
1,TRANSFORMATOR 100 KVA,5120001,UNIT,100,A,R1,-
2,KABEL TWISTED 3x70+50mm2,3120002,M,1000,B,R2,-
`;
    const { pkg, stats } = await CsvImportService.createPackageFromCsv(csvContent, 'replace', null, 'baru-only');
    expect(stats.totalRows).toBe(2);

    const snap1 = pkg.stockSnapshots.find(s => s.materialId === pkg.materials[0].id);
    expect(snap1?.quantity).toBe(100);
    expect(snap1?.reserved).toBe(0);
    expect(snap1?.available).toBe(100);

    const snap2 = pkg.stockSnapshots.find(s => s.materialId === pkg.materials[1].id);
    expect(snap2?.quantity).toBe(1000);
    expect(snap2?.reserved).toBe(0);
    expect(snap2?.available).toBe(1000);

    // Audit harus menyatakan bersih 100%
    const audit = StockConsistencyService.auditPackage(pkg);
    expect(audit.hasDiscrepancy).toBe(false);
  });

  it('kioskStorage.reconcileAllPackages repairs both baru and return packages', () => {
    const result = kioskStorage.reconcileAllPackages();
    expect(typeof result.repairedCount).toBe('number');

    const activePkg = kioskStorage.getActivePackage();
    const audit = StockConsistencyService.auditPackage(activePkg);
    expect(audit.hasDiscrepancy).toBe(false);
  });
});
