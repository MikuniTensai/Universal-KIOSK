import { ImportPackage, KioskConfig, DiagnosticLog, Category, Material, Location, StockSnapshot, BarcodeAlias } from '../../domain/types';
import { defaultKioskConfig, samplePlnPackage, plnUp3MalangFullPackage } from '../../data/mockPlnPackage';
import { StockConsistencyService } from '../../features/admin/stockConsistencyService';

const STORAGE_KEYS = {
  ACTIVE_PACKAGE: 'kiosk_active_package_v1',
  PACKAGE_BARU: 'kiosk_package_baru_v2',
  PACKAGE_RETURN: 'kiosk_package_return_v2',
  PACKAGE_HISTORY: 'kiosk_package_history_v1',
  CONFIG: 'kiosk_config_v1',
  LOGS: 'kiosk_diagnostic_logs_v1',
  ADMIN_PIN: 'kiosk_admin_pin_hash_v1',
};

const getDefaultInitialPackage = (): ImportPackage => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test') {
    return samplePlnPackage;
  }
  return plnUp3MalangFullPackage;
};

export function splitPackageByCondition(pkg: ImportPackage): { baruPkg: ImportPackage; returnPkg: ImportPackage } {
  const returnMaterials = pkg.materials.filter(m => m.condition === 'RETURN');
  const returnMatIds = new Set(returnMaterials.map(m => m.id));
  const returnSnapshots = pkg.stockSnapshots.filter(s => returnMatIds.has(s.materialId));
  const returnAliases = pkg.barcodeAliases.filter(
    a => a.targetType === 'material' && returnMatIds.has(a.targetId)
  );
  const returnLocIds = new Set(returnSnapshots.map(s => s.locationId));
  const returnLocations = pkg.locations.filter(l => returnLocIds.has(l.id));

  const baruMaterials = pkg.materials.filter(m => (m.condition || 'BARU') !== 'RETURN');
  const baruMatIds = new Set(baruMaterials.map(m => m.id));
  const baruSnapshots = pkg.stockSnapshots.filter(s => baruMatIds.has(s.materialId));
  const baruAliases = pkg.barcodeAliases.filter(
    a => a.targetType === 'material' && baruMatIds.has(a.targetId)
  );
  const baruLocIds = new Set(baruSnapshots.map(s => s.locationId));
  const baruLocations = pkg.locations.filter(l => baruLocIds.has(l.id) || returnLocations.length === 0);

  const baruPkg: ImportPackage = {
    ...pkg,
    sourceName: 'PLN ERP SAP Logistik UP3 Malang - Database Baru',
    materials: baruMaterials,
    stockSnapshots: baruSnapshots,
    barcodeAliases: baruAliases,
    locations: baruLocations.length > 0 ? baruLocations : pkg.locations,
  };

  const returnPkg: ImportPackage = {
    ...pkg,
    sourceName: 'PLN ERP SAP Logistik UP3 Malang - Database Return',
    materials: returnMaterials,
    stockSnapshots: returnSnapshots,
    barcodeAliases: returnAliases,
    locations: returnLocations.length > 0 ? returnLocations : pkg.locations,
  };

  return { baruPkg, returnPkg };
}

export function mergePackages(baruPkg: ImportPackage, returnPkg: ImportPackage): ImportPackage {
  const locationsMap = new Map<string, Location>();
  baruPkg.locations.forEach(l => locationsMap.set(l.id, l));
  returnPkg.locations.forEach(l => locationsMap.set(l.id, l));

  return {
    ...baruPkg,
    sourceName: 'PLN ERP SAP Logistik UP3 Malang (Dual Database)',
    datasetVersion: Math.max(baruPkg.datasetVersion, returnPkg.datasetVersion),
    importedAt: new Date().toISOString(),
    materials: [...baruPkg.materials, ...returnPkg.materials],
    stockSnapshots: [...baruPkg.stockSnapshots, ...returnPkg.stockSnapshots],
    barcodeAliases: [...baruPkg.barcodeAliases, ...returnPkg.barcodeAliases],
    locations: Array.from(locationsMap.values()),
    packageHash: `dual-${Date.now().toString(36)}`,
  };
}

export class KioskStorage {
  private packageBaru: ImportPackage | null = null;
  private packageReturn: ImportPackage | null = null;
  private activePackage: ImportPackage | null = null;
  private activePackageDirectReference: ImportPackage | null = null;
  private packageHistory: ImportPackage[] = [];
  private config: KioskConfig = defaultKioskConfig;
  private logs: DiagnosticLog[] = [];

  constructor() {
    this.loadInitialState();
  }

  private loadInitialState(): void {
    const defaultPkg = getDefaultInitialPackage();
    const { baruPkg: defaultBaru, returnPkg: defaultReturn } = splitPackageByCondition(defaultPkg);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // 1. Load Database Baru
        const rawBaru = localStorage.getItem(STORAGE_KEYS.PACKAGE_BARU);
        if (rawBaru) {
          this.packageBaru = JSON.parse(rawBaru);
        } else {
          this.packageBaru = defaultBaru;
          localStorage.setItem(STORAGE_KEYS.PACKAGE_BARU, JSON.stringify(this.packageBaru));
        }

        // 2. Load Database Return
        const rawReturn = localStorage.getItem(STORAGE_KEYS.PACKAGE_RETURN);
        if (rawReturn) {
          this.packageReturn = JSON.parse(rawReturn);
        } else {
          this.packageReturn = defaultReturn;
          localStorage.setItem(STORAGE_KEYS.PACKAGE_RETURN, JSON.stringify(this.packageReturn));
        }

        // 3. Gabungkan ke activePackage
        this.syncActivePackage();

        const rawHistory = localStorage.getItem(STORAGE_KEYS.PACKAGE_HISTORY);
        if (rawHistory) {
          this.packageHistory = JSON.parse(rawHistory);
        }

        const rawConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (rawConfig) {
          const parsedConfig = JSON.parse(rawConfig);
          if (
            parsedConfig.organizationName &&
            (parsedConfig.organizationName.includes('Aris Munandar') ||
              parsedConfig.organizationName.includes('Warehouse'))
          ) {
            parsedConfig.organizationName = 'PT PLN (Persero) UP3 Malang';
            parsedConfig.warehouseCode = 'UP3 MALANG';
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(parsedConfig));
          }
          this.config = parsedConfig;
        } else {
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(defaultKioskConfig));
        }

        const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
        if (rawLogs) {
          this.logs = JSON.parse(rawLogs);
        }
      } catch (e) {
        console.error('Failed to load storage, falling back to in-memory default:', e);
        this.packageBaru = defaultBaru;
        this.packageReturn = defaultReturn;
        this.syncActivePackage();
      }
    } else {
      this.packageBaru = defaultBaru;
      this.packageReturn = defaultReturn;
      this.syncActivePackage();
    }
  }

  private syncActivePackage(): void {
    const defaultPkg = getDefaultInitialPackage();
    const baru = this.packageBaru || splitPackageByCondition(defaultPkg).baruPkg;
    const ret = this.packageReturn || splitPackageByCondition(defaultPkg).returnPkg;
    this.activePackage = mergePackages(baru, ret);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PACKAGE, JSON.stringify(this.activePackage));
    }
  }

  public getPackageBaru(): ImportPackage {
    if (!this.packageBaru) {
      const defaultPkg = getDefaultInitialPackage();
      this.packageBaru = splitPackageByCondition(defaultPkg).baruPkg;
    }
    return JSON.parse(JSON.stringify(this.packageBaru));
  }

  public getPackageReturn(): ImportPackage {
    if (!this.packageReturn) {
      const defaultPkg = getDefaultInitialPackage();
      this.packageReturn = splitPackageByCondition(defaultPkg).returnPkg;
    }
    return JSON.parse(JSON.stringify(this.packageReturn));
  }

  public savePackageBaru(pkg: ImportPackage): void {
    this.packageBaru = {
      ...pkg,
      importedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.PACKAGE_BARU, JSON.stringify(this.packageBaru));
    }
    this.syncActivePackage();
    this.addLog('info', 'Storage', `Database Material Baru diperbarui: ${this.packageBaru.materials.length} material.`);
  }

  public savePackageReturn(pkg: ImportPackage): void {
    this.packageReturn = {
      ...pkg,
      importedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.PACKAGE_RETURN, JSON.stringify(this.packageReturn));
    }
    this.syncActivePackage();
    this.addLog('info', 'Storage', `Database Material Return diperbarui: ${this.packageReturn.materials.length} material.`);
  }

  public getActivePackage(scope: 'all' | 'baru' | 'return' = 'all'): ImportPackage | null {
    if (scope === 'baru') {
      return this.getPackageBaru();
    }
    if (scope === 'return') {
      return this.getPackageReturn();
    }
    if (!this.activePackage) {
      this.syncActivePackage();
    }
    return this.activePackage;
  }

  public getPackageHistory(): ImportPackage[] {
    return [...this.packageHistory];
  }

  public getConfig(): KioskConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: KioskConfig): void {
    this.config = { ...newConfig };
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
    }
  }

  public setActivePackageDirectly(pkg: ImportPackage): void {
    this.activePackage = pkg;
    this.activePackageDirectReference = pkg;
    const { baruPkg, returnPkg } = splitPackageByCondition(pkg);
    this.packageBaru = baruPkg;
    this.packageReturn = returnPkg;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PACKAGE, JSON.stringify(this.activePackage));
      localStorage.setItem(STORAGE_KEYS.PACKAGE_BARU, JSON.stringify(this.packageBaru));
      localStorage.setItem(STORAGE_KEYS.PACKAGE_RETURN, JSON.stringify(this.packageReturn));
    }
  }

  /**
   * Rekonsiliasi Keselarasan Stok:
   * Menyelaraskan seluruh data stok pada packageBaru dan packageReturn sehingga
   * reserved = 0 dan available = quantity (1:1 dengan master SAP fisik).
   */
  public reconcileAllPackages(): { repairedCount: number } {
    let totalRepaired = 0;
    if (this.packageBaru) {
      const { healedPkg, repairedCount } = StockConsistencyService.reconcilePackage(this.packageBaru);
      if (repairedCount > 0) {
        this.packageBaru = healedPkg;
        totalRepaired += repairedCount;
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_KEYS.PACKAGE_BARU, JSON.stringify(this.packageBaru));
        }
      }
    }

    if (this.packageReturn) {
      const { healedPkg, repairedCount } = StockConsistencyService.reconcilePackage(this.packageReturn);
      if (repairedCount > 0) {
        this.packageReturn = healedPkg;
        totalRepaired += repairedCount;
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_KEYS.PACKAGE_RETURN, JSON.stringify(this.packageReturn));
        }
      }
    }

    if (totalRepaired > 0) {
      this.syncActivePackage();
      this.addLog('info', 'Reconciliation', `Rekonsiliasi stok berhasil: ${totalRepaired} item diselaraskan 1:1.`);
    }

    return { repairedCount: totalRepaired };
  }

  /**
   * Mengaktivasi paket dengan isolasi 2 database:
   * - scope 'baru': HANYA memodifikasi Database Baru (Database Return 100% aman).
   * - scope 'return': HANYA memodifikasi Database Return (Database Baru 100% aman).
   * - scope 'all': membagi dan mengaktivasi kedua database.
   */
  public activatePackage(pkg: ImportPackage, scope: 'baru' | 'return' | 'all' = 'all'): void {
    this.activePackageDirectReference = null;
    const previous = this.activePackage;
    const nowIso = new Date().toISOString();

    if (scope === 'baru') {
      // Pastikan hanya material non-return
      const baruOnlyMaterials = pkg.materials.filter(m => (m.condition || 'BARU') !== 'RETURN');
      const baruIds = new Set(baruOnlyMaterials.map(m => m.id));
      const baruSnapshots = pkg.stockSnapshots.filter(s => baruIds.has(s.materialId));
      const baruAliases = pkg.barcodeAliases.filter(a => a.targetType === 'material' && baruIds.has(a.targetId));

      const updatedBaruPkg: ImportPackage = {
        ...pkg,
        materials: baruOnlyMaterials,
        stockSnapshots: baruSnapshots,
        barcodeAliases: baruAliases,
        importedAt: nowIso,
      };
      this.savePackageBaru(updatedBaruPkg);
    } else if (scope === 'return') {
      // Pastikan hanya material return
      const returnOnlyMaterials = pkg.materials.map(m => ({
        ...m,
        condition: 'RETURN' as const,
        status: m.status && m.status !== 'Baru' ? m.status : 'STANDBY',
      }));
      const returnIds = new Set(returnOnlyMaterials.map(m => m.id));
      const returnSnapshots = pkg.stockSnapshots.filter(s => returnIds.has(s.materialId));
      const returnAliases = pkg.barcodeAliases.filter(a => a.targetType === 'material' && returnIds.has(a.targetId));

      const updatedReturnPkg: ImportPackage = {
        ...pkg,
        materials: returnOnlyMaterials,
        stockSnapshots: returnSnapshots,
        barcodeAliases: returnAliases,
        importedAt: nowIso,
      };
      this.savePackageReturn(updatedReturnPkg);
    } else {
      const { baruPkg, returnPkg } = splitPackageByCondition(pkg);
      this.packageBaru = baruPkg;
      this.packageReturn = returnPkg;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_BARU, JSON.stringify(this.packageBaru));
        localStorage.setItem(STORAGE_KEYS.PACKAGE_RETURN, JSON.stringify(this.packageReturn));
      }
      this.syncActivePackage();
      if (this.activePackage) {
        this.activePackage.datasetVersion = pkg.datasetVersion;
        this.activePackage.sourceAt = pkg.sourceAt;
        if (pkg.restoredAt) {
          this.activePackage.restoredAt = pkg.restoredAt;
        }
      }
    }

    if (previous && this.activePackage && previous.datasetVersion !== this.activePackage.datasetVersion) {
      this.packageHistory = [previous, ...this.packageHistory.slice(0, 9)];
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_HISTORY, JSON.stringify(this.packageHistory));
      }
    }

    this.addLog('info', 'Storage', `Paket versi ${pkg.datasetVersion} (scope: ${scope}) berhasil diaktivasi ke database.`);
  }

  /**
   * Restores a previously active snapshot from history
   */
  public restoreSnapshot(datasetVersion: number): boolean {
    const found = this.packageHistory.find(p => p.datasetVersion === datasetVersion);
    if (!found) return false;

    const restoredPkg: ImportPackage = {
      ...found,
      restoredAt: new Date().toISOString(),
    };

    this.activatePackage(restoredPkg, 'all');
    if (this.activePackage) {
      this.activePackage.restoredAt = restoredPkg.restoredAt;
    }
    this.addLog('warn', 'Storage', `Pemulihan (Restore) versi ${datasetVersion} berhasil dieksekusi.`);
    return true;
  }

  public addLog(level: 'info' | 'warn' | 'error', component: string, message: string, details?: Record<string, unknown>): void {
    const sanitizedDetails = details ? { ...details } : undefined;
    if (sanitizedDetails) {
      delete sanitizedDetails.rawCode;
      delete sanitizedDetails.pin;
      delete sanitizedDetails.password;
    }

    const logEntry: DiagnosticLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      details: sanitizedDetails,
    };

    this.logs = [logEntry, ...this.logs.slice(0, 99)];

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
    }
  }

  private persistActivePackage(): void {
    if (this.packageBaru) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_BARU, JSON.stringify(this.packageBaru));
      }
    }
    if (this.packageReturn) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_RETURN, JSON.stringify(this.packageReturn));
      }
    }
    this.syncActivePackage();
  }

  /**
   * Menambahkan kategori baru ke database lokal aktif
   */
  public addCategory(name: string, sortOrder?: number): Category {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Nama kategori tidak boleh kosong.');
    }

    const categories = this.activePackage?.categories || [];
    const nextOrder = sortOrder ?? (categories.length + 1);
    const newCategory: Category = {
      id: 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      name: trimmedName,
      sortOrder: nextOrder,
      active: true,
    };

    if (this.packageBaru) {
      this.packageBaru.categories = [...this.packageBaru.categories, newCategory];
    }
    if (this.packageReturn) {
      this.packageReturn.categories = [...this.packageReturn.categories, newCategory];
    }

    this.persistActivePackage();
    this.addLog('info', 'Storage', `Kategori baru ditambahkan: "${newCategory.name}"`);
    return newCategory;
  }

  /**
   * Menambah atau menyesuaikan kuantitas stok material di lokasi tertentu (menarget database yang tepat)
   */
  public addOrAdjustStock(params: {
    materialId: string;
    locationId?: string;
    zone?: string;
    rack?: string;
    bin?: string;
    quantityDelta: number;
    setExact?: boolean;
    categoryId?: string;
    photoPath?: string;
  }): StockSnapshot {
    // Cari di packageBaru terlebih dahulu, lalu di packageReturn
    let targetPkg = this.packageBaru?.materials.some(m => m.id === params.materialId)
      ? this.packageBaru
      : this.packageReturn;

    if (!targetPkg) {
      targetPkg = this.packageBaru;
    }

    if (!targetPkg) {
      throw new Error('Tidak ada paket data aktif.');
    }

    const material = targetPkg.materials.find(m => m.id === params.materialId);
    if (!material) {
      throw new Error(`Material dengan ID ${params.materialId} tidak ditemukan.`);
    }

    if (params.categoryId && params.categoryId.trim()) {
      material.categoryId = params.categoryId.trim();
    }

    if (params.photoPath !== undefined) {
      material.photoPath = params.photoPath.trim() || null;
    }

    let targetLocationId = params.locationId;

    if (!targetLocationId && (params.zone || params.rack || params.bin)) {
      const z = params.zone?.trim() || 'Zona A';
      const r = params.rack?.trim() || 'Rak 01';
      const b = params.bin?.trim() || 'Bin 01';

      // Cari apakah sudah ada lokasi dengan koordinat zone, rack, bin yang sama persis
      const existingLoc = targetPkg.locations.find(
        l => (l.zone || '').trim().toLowerCase() === z.toLowerCase() &&
             (l.rack || '').trim().toLowerCase() === r.toLowerCase() &&
             (l.bin || '').trim().toLowerCase() === b.toLowerCase()
      );

      if (existingLoc) {
        targetLocationId = existingLoc.id;
      } else {
        const newLoc: Location = {
          id: 'loc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
          warehouseCode: this.config.warehouseCode,
          zone: z,
          rack: r,
          bin: b,
        };
        targetPkg.locations = [...targetPkg.locations, newLoc];
        targetLocationId = newLoc.id;
      }
    }

    const materialSnapshots = targetPkg.stockSnapshots.filter(s => s.materialId === params.materialId);

    if (!targetLocationId) {
      if (materialSnapshots.length > 0 && materialSnapshots[0].locationId) {
        targetLocationId = materialSnapshots[0].locationId;
      } else if (targetPkg.locations.length > 0) {
        targetLocationId = targetPkg.locations[0].id;
      } else {
        const defaultLoc: Location = {
          id: 'loc-default',
          warehouseCode: this.config.warehouseCode,
          zone: 'Zona Utama',
          rack: 'Rak 01',
          bin: 'Bin 01',
        };
        targetPkg.locations = [defaultLoc];
        targetLocationId = defaultLoc.id;
      }
    }

    const nowIso = new Date().toISOString();
    const existingIndex = targetPkg.stockSnapshots.findIndex(
      s => s.materialId === params.materialId && s.locationId === targetLocationId
    );

    let updatedSnapshot: StockSnapshot;

    if (existingIndex >= 0) {
      const existing = targetPkg.stockSnapshots[existingIndex];
      const newQty = params.setExact
        ? Math.max(0, params.quantityDelta)
        : Math.max(0, (existing.quantity || 0) + params.quantityDelta);

      updatedSnapshot = {
        ...existing,
        quantity: newQty,
        reserved: 0,
        available: newQty,
        sourceAt: nowIso,
      };

      targetPkg.stockSnapshots[existingIndex] = updatedSnapshot;

      // Jika setExact diminta tanpa locationId spesifik dan material memiliki snapshot duplikat lama di lokasi lain, bersihkan snapshot duplikat tersebut
      if (params.setExact && !params.locationId && materialSnapshots.length > 1) {
        targetPkg.stockSnapshots = targetPkg.stockSnapshots.filter(
          s => s.materialId !== params.materialId || s.locationId === targetLocationId
        );
      }
    } else {
      // Jika snapshot pada targetLocationId belum ada:
      if (params.setExact && !params.locationId && materialSnapshots.length > 0) {
        // Mode setExact tanpa lokasi spesifik: pindahkan/perbarui snapshot yang sudah ada ke targetLocationId dengan kuantitas pasti
        const newQty = Math.max(0, params.quantityDelta);
        updatedSnapshot = {
          materialId: params.materialId,
          locationId: targetLocationId,
          quantity: newQty,
          reserved: 0,
          available: newQty,
          sourceAt: nowIso,
        };
        targetPkg.stockSnapshots = targetPkg.stockSnapshots.filter(s => s.materialId !== params.materialId);
        targetPkg.stockSnapshots.push(updatedSnapshot);
      } else {
        // Mode incremental atau targetLocationId spesifik:
        const newQty = Math.max(0, params.quantityDelta);
        updatedSnapshot = {
          materialId: params.materialId,
          locationId: targetLocationId,
          quantity: newQty,
          reserved: 0,
          available: newQty,
          sourceAt: nowIso,
        };
        targetPkg.stockSnapshots.push(updatedSnapshot);
      }
    }

    // Sinkronkan snapshot dan lokasi ke activePackage
    if (this.activePackage && this.activePackage !== targetPkg) {
      if (params.setExact && !params.locationId) {
        this.activePackage.stockSnapshots = this.activePackage.stockSnapshots.filter(s => s.materialId !== params.materialId);
        this.activePackage.stockSnapshots.push(updatedSnapshot);
      } else {
        const apIndex = this.activePackage.stockSnapshots.findIndex(
          s => s.materialId === params.materialId && s.locationId === targetLocationId
        );
        if (apIndex >= 0) {
          this.activePackage.stockSnapshots[apIndex] = updatedSnapshot;
        } else {
          this.activePackage.stockSnapshots.push(updatedSnapshot);
        }
      }

      const loc = targetPkg.locations.find(l => l.id === targetLocationId);
      if (loc && !this.activePackage.locations.some(l => l.id === targetLocationId)) {
        this.activePackage.locations.push(loc);
      }
    }

    // Sinkronkan ke activePackageDirectReference (untuk cache in-place)
    if (this.activePackageDirectReference) {
      if (params.setExact && !params.locationId) {
        this.activePackageDirectReference.stockSnapshots = this.activePackageDirectReference.stockSnapshots.filter(s => s.materialId !== params.materialId);
        this.activePackageDirectReference.stockSnapshots.push(updatedSnapshot);
      } else {
        const dirIndex = this.activePackageDirectReference.stockSnapshots.findIndex(
          s => s.materialId === params.materialId && s.locationId === targetLocationId
        );
        if (dirIndex >= 0) {
          this.activePackageDirectReference.stockSnapshots[dirIndex] = updatedSnapshot;
        } else {
          this.activePackageDirectReference.stockSnapshots.push(updatedSnapshot);
        }
      }

      const loc = targetPkg.locations.find(l => l.id === targetLocationId);
      if (loc && !this.activePackageDirectReference.locations.some(l => l.id === targetLocationId)) {
        this.activePackageDirectReference.locations.push(loc);
      }
    }

    this.persistActivePackage();
    this.addLog('info', 'Storage', `Stok material "${material.name}" diperbarui: ${updatedSnapshot.quantity} ${material.unit}`);
    return updatedSnapshot;
  }

  /**
   * Memperbarui seluruh field material, kondisi, status retur, barcode, lokasi, dan stok (Full CRUD)
   */
  public updateMaterial(params: {
    materialId: string;
    name?: string;
    code?: string;
    sapCode?: string | null;
    unit?: string;
    specification?: string | null;
    categoryId?: string;
    photoPath?: string | null;
    condition?: 'BARU' | 'RETURN';
    status?: string;
    zone?: string;
    rack?: string;
    bin?: string;
    locationId?: string;
    quantityDelta?: number;
    setExactQuantity?: boolean;
    barcode?: string;
  }): { material: Material; snapshot: StockSnapshot } {
    let sourcePkg = this.packageBaru?.materials.some(m => m.id === params.materialId)
      ? this.packageBaru
      : this.packageReturn;

    if (!sourcePkg) sourcePkg = this.packageBaru;
    if (!sourcePkg) throw new Error('Tidak ada paket data aktif.');

    const matIndex = sourcePkg.materials.findIndex(m => m.id === params.materialId);
    if (matIndex < 0) {
      throw new Error(`Material dengan ID "${params.materialId}" tidak ditemukan.`);
    }

    const material = sourcePkg.materials[matIndex];
    const targetCondition = params.condition || material.condition || 'BARU';
    const isMovingCondition = targetCondition !== (material.condition || 'BARU');

    // 1. Update basic fields
    if (params.name !== undefined && params.name.trim()) {
      material.name = params.name.trim();
    }
    if (params.code !== undefined && params.code.trim()) {
      material.code = params.code.trim();
    }
    if (params.sapCode !== undefined) {
      material.sapCode = params.sapCode?.trim() || null;
    }
    if (params.unit !== undefined && params.unit.trim()) {
      material.unit = params.unit.trim();
    }
    if (params.specification !== undefined) {
      material.specification = params.specification?.trim() || null;
    }
    if (params.categoryId !== undefined && params.categoryId.trim()) {
      material.categoryId = params.categoryId.trim();
    }
    if (params.photoPath !== undefined) {
      material.photoPath = params.photoPath?.trim() || null;
    }
    if (params.status !== undefined) {
      material.status = params.status;
    }
    material.condition = targetCondition;

    // 2. Perpindahan database jika kondisi berubah (BARU <-> RETURN)
    let destPkg = sourcePkg;
    if (isMovingCondition) {
      destPkg = targetCondition === 'RETURN' ? this.packageReturn! : this.packageBaru!;
      if (!destPkg) throw new Error(`Target database untuk kondisi ${targetCondition} tidak tersedia.`);

      // Hapus dari source
      sourcePkg.materials = sourcePkg.materials.filter(m => m.id !== params.materialId);
      const movingSnapshots = sourcePkg.stockSnapshots.filter(s => s.materialId === params.materialId);
      sourcePkg.stockSnapshots = sourcePkg.stockSnapshots.filter(s => s.materialId !== params.materialId);
      const movingAliases = sourcePkg.barcodeAliases.filter(a => a.targetType === 'material' && a.targetId === params.materialId);
      sourcePkg.barcodeAliases = sourcePkg.barcodeAliases.filter(a => !(a.targetType === 'material' && a.targetId === params.materialId));

      // Tambahkan ke dest
      destPkg.materials = [...destPkg.materials, material];
      destPkg.stockSnapshots = [...destPkg.stockSnapshots, ...movingSnapshots];
      destPkg.barcodeAliases = [...destPkg.barcodeAliases, ...movingAliases];
    }

    // 3. Update Barcode Alias
    if (params.barcode && params.barcode.trim()) {
      const bVal = params.barcode.trim();
      const existingAlias = destPkg.barcodeAliases.find(a => a.targetType === 'material' && a.targetId === material.id);
      if (existingAlias) {
        existingAlias.value = bVal;
      } else {
        destPkg.barcodeAliases.push({
          value: bVal,
          targetType: 'material',
          targetId: material.id,
        });
      }
    }

    // 4. Update Stock & Location
    const hasStockDelta = params.quantityDelta !== undefined;
    const hasLocation = params.locationId || params.zone || params.rack || params.bin;

    let snapshot: StockSnapshot;
    if (hasStockDelta || hasLocation) {
      snapshot = this.addOrAdjustStock({
        materialId: material.id,
        locationId: params.locationId,
        zone: params.zone,
        rack: params.rack,
        bin: params.bin,
        quantityDelta: params.quantityDelta !== undefined ? params.quantityDelta : 0,
        setExact: params.setExactQuantity !== undefined ? params.setExactQuantity : true,
        categoryId: material.categoryId,
        photoPath: material.photoPath || undefined,
      });
    } else {
      const s = destPkg.stockSnapshots.find(snap => snap.materialId === material.id);
      if (s) {
        snapshot = s;
      } else {
        snapshot = {
          materialId: material.id,
          locationId: destPkg.locations[0]?.id || 'loc-default',
          quantity: 0,
          reserved: 0,
          available: 0,
          sourceAt: new Date().toISOString(),
        };
        destPkg.stockSnapshots.push(snapshot);
      }
    }

    this.persistActivePackage();
    this.addLog('info', 'Storage', `Data katalog material "${material.name}" (${material.code}) berhasil diperbarui (CRUD).`);
    return { material, snapshot };
  }

  public updateMaterialCategory(materialId: string, categoryId: string): void {
    const targetPkg = this.packageBaru?.materials.some(m => m.id === materialId)
      ? this.packageBaru
      : this.packageReturn;
    if (!targetPkg) throw new Error('Tidak ada paket data aktif.');
    const material = targetPkg.materials.find(m => m.id === materialId);
    if (!material) throw new Error(`Material dengan ID ${materialId} tidak ditemukan.`);
    material.categoryId = categoryId;
    this.persistActivePackage();
    this.addLog('info', 'Storage', `Kategori material "${material.name}" diubah ke "${categoryId}".`);
  }

  public updateMaterialPhoto(materialId: string, photoPath: string): void {
    const targetPkg = this.packageBaru?.materials.some(m => m.id === materialId)
      ? this.packageBaru
      : this.packageReturn;
    if (!targetPkg) throw new Error('Tidak ada paket data aktif.');
    const material = targetPkg.materials.find(m => m.id === materialId);
    if (!material) throw new Error(`Material dengan ID ${materialId} tidak ditemukan.`);
    material.photoPath = photoPath.trim() || null;
    this.persistActivePackage();
    this.addLog('info', 'Storage', `Foto material "${material.name}" berhasil diperbarui.`);
  }

  /**
   * Mendaftarkan material baru langsung ke database yang sesuai (Baru vs Return)
   */
  public addMaterialWithBarcode(params: {
    code?: string;
    name: string;
    categoryId?: string;
    sapCode?: string;
    unit?: string;
    specification?: string;
    photoPath?: string;
    barcode?: string;
    zone?: string;
    rack?: string;
    bin?: string;
    initialQuantity?: number;
    condition?: 'BARU' | 'RETURN';
    status?: string;
  }): Material {
    const condition = params.condition || 'BARU';
    const targetPkg = condition === 'RETURN' ? this.packageReturn : this.packageBaru;
    if (!targetPkg) throw new Error('Tidak ada paket data aktif.');

    const trimmedName = params.name.trim();
    if (!trimmedName) throw new Error('Nama material tidak boleh kosong.');

    let trimmedCode = params.code?.trim() || '';
    if (!trimmedCode) {
      const existingNums = targetPkg.materials
        .map(m => parseInt(m.code, 10))
        .filter(n => !isNaN(n));
      const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
      trimmedCode = String(nextNum).padStart(6, '0');
    }

    const trimmedBarcode = params.barcode?.trim() || trimmedCode;

    const codeExists = targetPkg.materials.some(m => m.code === trimmedCode);
    if (codeExists) {
      throw new Error(`Material dengan kode "${trimmedCode}" sudah ada.`);
    }

    const idPrefix = condition === 'RETURN' ? 'mat-ret' : 'mat';
    const newMaterialId = `${idPrefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const categoryId = params.categoryId || targetPkg.categories[0]?.id || 'cat-umum';
    const unit = params.unit?.trim() || 'Unit';
    const status = params.status || (condition === 'RETURN' ? 'STANDBY' : 'Baru');

    const newMaterial: Material = {
      id: newMaterialId,
      code: trimmedCode,
      sapCode: params.sapCode?.trim() || null,
      name: trimmedName,
      categoryId,
      unit,
      specification: params.specification?.trim() || null,
      photoPath: params.photoPath?.trim() || null,
      condition,
      status,
    };

    const locId = 'loc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);
    const newLocation: Location = {
      id: locId,
      warehouseCode: this.config.warehouseCode,
      zone: params.zone?.trim() || 'Zona A',
      rack: params.rack?.trim() || 'Rak 01',
      bin: params.bin?.trim() || 'Bin 01',
    };

    const newBarcodeAlias: BarcodeAlias = {
      value: trimmedBarcode,
      targetType: 'material',
      targetId: newMaterialId,
    };

    const aliasesToAdd: BarcodeAlias[] = [newBarcodeAlias];
    if (trimmedCode !== trimmedBarcode) {
      aliasesToAdd.push({
        value: trimmedCode,
        targetType: 'material',
        targetId: newMaterialId,
      });
    }

    const qty = params.initialQuantity != null ? Math.max(0, params.initialQuantity) : 0;
    const newStock: StockSnapshot = {
      materialId: newMaterialId,
      locationId: locId,
      quantity: qty,
      reserved: 0,
      available: qty,
      sourceAt: new Date().toISOString(),
    };

    targetPkg.materials = [...targetPkg.materials, newMaterial];
    targetPkg.locations = [...targetPkg.locations, newLocation];
    targetPkg.barcodeAliases = [...targetPkg.barcodeAliases, ...aliasesToAdd];
    targetPkg.stockSnapshots = [...targetPkg.stockSnapshots, newStock];

    if (this.activePackageDirectReference) {
      this.activePackageDirectReference.materials = [...this.activePackageDirectReference.materials, newMaterial];
      this.activePackageDirectReference.locations = [...this.activePackageDirectReference.locations, newLocation];
      this.activePackageDirectReference.barcodeAliases = [...this.activePackageDirectReference.barcodeAliases, ...aliasesToAdd];
      this.activePackageDirectReference.stockSnapshots = [...this.activePackageDirectReference.stockSnapshots, newStock];
    }

    this.persistActivePackage();
    this.addLog('info', 'Storage', `Material baru didaftarkan di Database ${condition}: "${newMaterial.name}" (${newMaterial.code})`);
    return newMaterial;
  }

  /**
   * Menghapus material dari database aktif yang sesuai
   */
  public deleteMaterial(materialId: string): { success: boolean; materialName: string; materialCode: string } {
    const targetPkg = this.packageBaru?.materials.some(m => m.id === materialId)
      ? this.packageBaru
      : this.packageReturn;

    if (!targetPkg) throw new Error('Tidak ada paket data aktif.');

    const materialIndex = targetPkg.materials.findIndex(m => m.id === materialId);
    if (materialIndex < 0) {
      throw new Error(`Material dengan ID "${materialId}" tidak ditemukan.`);
    }

    const targetMaterial = targetPkg.materials[materialIndex];
    const materialName = targetMaterial.name;
    const materialCode = targetMaterial.code;

    targetPkg.materials = targetPkg.materials.filter(m => m.id !== materialId);
    targetPkg.stockSnapshots = targetPkg.stockSnapshots.filter(s => s.materialId !== materialId);
    targetPkg.barcodeAliases = targetPkg.barcodeAliases.filter(
      a => !(a.targetType === 'material' && a.targetId === materialId)
    );

    const assetIds = targetPkg.assets
      .filter(a => a.materialId === materialId)
      .map(a => a.id);

    targetPkg.assets = targetPkg.assets.filter(a => a.materialId !== materialId);
    if (assetIds.length > 0) {
      targetPkg.barcodeAliases = targetPkg.barcodeAliases.filter(
        a => !(a.targetType === 'asset' && assetIds.includes(a.targetId))
      );
    }

    if (this.activePackageDirectReference) {
      this.activePackageDirectReference.materials = this.activePackageDirectReference.materials.filter(m => m.id !== materialId);
      this.activePackageDirectReference.stockSnapshots = this.activePackageDirectReference.stockSnapshots.filter(s => s.materialId !== materialId);
      this.activePackageDirectReference.barcodeAliases = this.activePackageDirectReference.barcodeAliases.filter(
        a => !(a.targetType === 'material' && a.targetId === materialId)
      );
    }

    this.persistActivePackage();
    this.addLog('info', 'Storage', `Material "${materialName}" (${materialCode}) berhasil dihapus dari database.`);
    return { success: true, materialName, materialCode };
  }

  public getLogs(): DiagnosticLog[] {
    return [...this.logs];
  }
}

export const kioskStorage = new KioskStorage();
