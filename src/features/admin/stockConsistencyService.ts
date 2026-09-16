import { ImportPackage, StockSnapshot } from '../../domain/types';

export interface StockDiscrepancyItem {
  materialId: string;
  materialName: string;
  materialCode: string;
  condition: 'BARU' | 'RETURN';
  locationId: string;
  quantity: number;
  reserved: number;
  available: number;
  expectedAvailable: number;
  discrepancyType: 'legacy_reserved' | 'calculation_mismatch';
}

export interface StockAuditReport {
  totalMaterials: number;
  totalSnapshots: number;
  discrepancies: StockDiscrepancyItem[];
  hasDiscrepancy: boolean;
  cleanSnapshotsCount: number;
  discrepantCount: number;
}

export class StockConsistencyService {
  /**
   * Audit seluruh paket data aktif untuk mendeteksi apakah ada material yang
   * jumlah stok fisiknya (quantity) berbeda dengan stok tersedia (available)
   * akibat potongan cadangan fiktif (reserved > 0).
   */
  public static auditPackage(pkg: ImportPackage | null | undefined): StockAuditReport {
    if (!pkg || !pkg.stockSnapshots) {
      return {
        totalMaterials: 0,
        totalSnapshots: 0,
        discrepancies: [],
        hasDiscrepancy: false,
        cleanSnapshotsCount: 0,
        discrepantCount: 0,
      };
    }

    const materialMap = new Map<string, { name: string; code: string; condition: 'BARU' | 'RETURN' }>();
    for (const m of pkg.materials) {
      materialMap.set(m.id, {
        name: m.name,
        code: m.code || m.sapCode || '-',
        condition: m.condition || 'BARU',
      });
    }

    const discrepancies: StockDiscrepancyItem[] = [];

    for (const snap of pkg.stockSnapshots) {
      const reserved = snap.reserved || 0;
      const available: number = (snap.available !== null && snap.available !== undefined) ? snap.available : (snap.quantity || 0);
      const quantity = snap.quantity || 0;

      // Pada operasional Gudang Logistik PLN UP3 Malang, seluruh stok fisik (SAP) adalah 100% siap pakai.
      // Jika reserved > 0 atau available !== quantity, maka terjadi ketidaksinkronan tampilan 1 vs tampilan 2.
      if (reserved > 0 || available !== quantity) {
        const mat = materialMap.get(snap.materialId);
        discrepancies.push({
          materialId: snap.materialId,
          materialName: mat?.name || snap.materialId,
          materialCode: mat?.code || '-',
          condition: mat?.condition || 'BARU',
          locationId: snap.locationId,
          quantity,
          reserved,
          available,
          expectedAvailable: quantity,
          discrepancyType: reserved > 0 ? 'legacy_reserved' : 'calculation_mismatch',
        });
      }
    }

    return {
      totalMaterials: pkg.materials.length,
      totalSnapshots: pkg.stockSnapshots.length,
      discrepancies,
      hasDiscrepancy: discrepancies.length > 0,
      cleanSnapshotsCount: pkg.stockSnapshots.length - discrepancies.length,
      discrepantCount: discrepancies.length,
    };
  }

  /**
   * Pulihkan dan selaraskan (reconcile) snapshot stok:
   * Mengembalikan seluruh stok cadangan fiktif (reserved = 0) dan memastikan
   * stok tersedia (available) sama persis dengan stok fisik master Excel SAP (quantity).
   */
  public static reconcilePackage(pkg: ImportPackage): { healedPkg: ImportPackage; repairedCount: number } {
    let repairedCount = 0;

    const healedSnapshots: StockSnapshot[] = pkg.stockSnapshots.map((snap) => {
      const reserved = snap.reserved || 0;
      const available = snap.available !== null && snap.available !== undefined ? snap.available : snap.quantity;

      if (reserved !== 0 || available !== snap.quantity) {
        repairedCount++;
        return {
          ...snap,
          reserved: 0,
          available: snap.quantity,
        };
      }
      return snap;
    });

    if (repairedCount === 0) {
      return { healedPkg: pkg, repairedCount: 0 };
    }

    const healedPkg: ImportPackage = {
      ...pkg,
      stockSnapshots: healedSnapshots,
      datasetVersion: pkg.datasetVersion + 1,
      importedAt: new Date().toISOString(),
      packageHash: `reconciled-${Date.now().toString(36)}`,
    };

    return { healedPkg, repairedCount };
  }
}
