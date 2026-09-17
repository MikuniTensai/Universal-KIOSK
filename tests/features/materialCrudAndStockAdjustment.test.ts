import { beforeEach, describe, expect, it } from 'vitest';
import { KioskStorage } from '../../src/adapters/storage/kioskStorage';
import { samplePlnPackage } from '../../src/data/mockPlnPackage';

describe('Material CRUD & Stock Adjustment (IN / OUT / Opname 1:1 SAP)', () => {
  let storage: KioskStorage;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    storage = new KioskStorage();
    storage.setActivePackageDirectly(samplePlnPackage);
  });

  describe('Stock Mutation (IN, OUT, Opname)', () => {
    it('successfully performs IN mutation (tambah stok masuk) on existing material', () => {
      const pkg = storage.getPackageBaru();
      const targetMat = pkg.materials[0];
      const initialSnapshot = pkg.stockSnapshots.find(s => s.materialId === targetMat.id);
      const initialQty = initialSnapshot?.quantity || 0;

      // Inbound: Masuk +25 unit
      const updated = storage.addOrAdjustStock({
        materialId: targetMat.id,
        quantityDelta: 25,
        setExact: false,
      });

      expect(updated.quantity).toBe(initialQty + 25);
      expect(updated.reserved).toBe(0);
      expect(updated.available).toBe(initialQty + 25);

      // Pastikan data tersimpan di storage packageBaru
      const refreshedPkg = storage.getPackageBaru();
      const currentSnapshots = refreshedPkg.stockSnapshots.filter(s => s.materialId === targetMat.id);
      const totalQty = currentSnapshots.reduce((sum, s) => sum + (s.quantity || 0), 0);
      expect(totalQty).toBe(initialQty + 25);
    });

    it('successfully performs OUT mutation (pengeluaran stok) without going negative', () => {
      const pkg = storage.getPackageBaru();
      const targetMat = pkg.materials[0];

      // Set initial stock to 30 first
      storage.addOrAdjustStock({
        materialId: targetMat.id,
        quantityDelta: 30,
        setExact: true,
      });

      // Outbound: Keluar -12 unit
      const out1 = storage.addOrAdjustStock({
        materialId: targetMat.id,
        quantityDelta: -12,
        setExact: false,
      });
      expect(out1.quantity).toBe(18);
      expect(out1.available).toBe(18);

      // Outbound berlebih: Keluar -50 unit (harus dibatasi di 0, anti-stok negatif)
      const out2 = storage.addOrAdjustStock({
        materialId: targetMat.id,
        quantityDelta: -50,
        setExact: false,
      });
      expect(out2.quantity).toBe(0);
      expect(out2.available).toBe(0);
    });

    it('successfully performs exact stock adjustment (Stock Opname) and eliminates duplicate snapshots', () => {
      const pkg = storage.getPackageBaru();
      const targetMat = pkg.materials[0];

      // Set exact quantity to 77
      const updated = storage.addOrAdjustStock({
        materialId: targetMat.id,
        quantityDelta: 77,
        setExact: true,
      });
      expect(updated.quantity).toBe(77);

      const refreshed = storage.getPackageBaru();
      const snapshots = refreshed.stockSnapshots.filter(s => s.materialId === targetMat.id);
      const total = snapshots.reduce((sum, s) => sum + (s.quantity || 0), 0);
      expect(total).toBe(77);
      // Memastikan hanya 1 snapshot bersih (tidak ada snapshot hantu)
      expect(snapshots.length).toBe(1);
    });

    it('updates warehouse location (Blok, Rak, Sub-rak) cleanly without orphan snapshots', () => {
      const pkg = storage.getPackageBaru();
      const targetMat = pkg.materials[0];

      storage.addOrAdjustStock({
        materialId: targetMat.id,
        zone: 'Blok C',
        rack: 'Rak 05',
        bin: 'C.5.1',
        quantityDelta: 40,
        setExact: true,
      });

      const refreshed = storage.getPackageBaru();
      const snap = refreshed.stockSnapshots.find(s => s.materialId === targetMat.id);
      expect(snap).toBeDefined();
      expect(snap?.quantity).toBe(40);

      const loc = refreshed.locations.find(l => l.id === snap?.locationId);
      expect(loc).toBeDefined();
      expect(loc?.zone).toBe('Blok C');
      expect(loc?.rack).toBe('Rak 05');
      expect(loc?.bin).toBe('C.5.1');
    });
  });

  describe('Full Material CRUD (updateMaterial)', () => {
    it('updates material name, code, sapCode, unit, category, and specification', () => {
      const pkg = storage.getPackageBaru();
      const targetMat = pkg.materials[0];

      const res = storage.updateMaterial({
        materialId: targetMat.id,
        name: 'TRAFO DISTRIBUSI 160 KVA TERBARU 2026',
        code: '009988',
        sapCode: 'SAP-TRF-160KVA',
        unit: 'Set',
        specification: 'Trafo step-down 20kV ke 400V hermetically sealed',
        quantityDelta: 8,
        setExactQuantity: true,
      });

      expect(res.material.name).toBe('TRAFO DISTRIBUSI 160 KVA TERBARU 2026');
      expect(res.material.code).toBe('009988');
      expect(res.material.sapCode).toBe('SAP-TRF-160KVA');
      expect(res.material.unit).toBe('Set');
      expect(res.material.specification).toBe('Trafo step-down 20kV ke 400V hermetically sealed');
      expect(res.snapshot.quantity).toBe(8);

      // Verifikasi di getPackageBaru()
      const refreshedPkg = storage.getPackageBaru();
      const updatedInDb = refreshedPkg.materials.find(m => m.id === targetMat.id);
      expect(updatedInDb?.name).toBe('TRAFO DISTRIBUSI 160 KVA TERBARU 2026');
      expect(updatedInDb?.unit).toBe('Set');
    });

    it('migrates material from BARU to RETURN database when condition changes', () => {
      const pkgBaru = storage.getPackageBaru();
      const targetMat = pkgBaru.materials[0];
      const matId = targetMat.id;

      // Ubah dari BARU ke RETURN dengan status PERBAIKAN
      storage.updateMaterial({
        materialId: matId,
        condition: 'RETURN',
        status: 'PERBAIKAN',
      });

      // Material harus hilang dari Database Baru
      const updatedBaru = storage.getPackageBaru();
      expect(updatedBaru.materials.some(m => m.id === matId)).toBe(false);
      expect(updatedBaru.stockSnapshots.some(s => s.materialId === matId)).toBe(false);

      // Material harus muncul di Database Return
      const updatedReturn = storage.getPackageReturn();
      const matInReturn = updatedReturn.materials.find(m => m.id === matId);
      expect(matInReturn).toBeDefined();
      expect(matInReturn?.condition).toBe('RETURN');
      expect(matInReturn?.status).toBe('PERBAIKAN');
      expect(updatedReturn.stockSnapshots.some(s => s.materialId === matId)).toBe(true);
    });
  });
});
