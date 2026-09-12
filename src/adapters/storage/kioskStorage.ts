import { ImportPackage, KioskConfig, DiagnosticLog, Category, Material, Location, StockSnapshot, BarcodeAlias } from '../../domain/types';
import { defaultKioskConfig, samplePlnPackage, plnUp3MalangFullPackage } from '../../data/mockPlnPackage';

const STORAGE_KEYS = {
  ACTIVE_PACKAGE: 'kiosk_active_package_v1',
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

export class KioskStorage {
  private activePackage: ImportPackage | null = null;
  private packageHistory: ImportPackage[] = [];
  private config: KioskConfig = defaultKioskConfig;
  private logs: DiagnosticLog[] = [];

  constructor() {
    this.loadInitialState();
  }

  private loadInitialState(): void {
    const defaultPkg = getDefaultInitialPackage();

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const rawPkg = localStorage.getItem(STORAGE_KEYS.ACTIVE_PACKAGE);
        if (rawPkg) {
          const parsed = JSON.parse(rawPkg);
          // In dev/prod, auto-upgrade to version 2 with client materials if version 1 is in storage
          const isTest = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test';
          if (!isTest && parsed && (!parsed.datasetVersion || parsed.datasetVersion < plnUp3MalangFullPackage.datasetVersion)) {
            this.activePackage = plnUp3MalangFullPackage;
            localStorage.setItem(STORAGE_KEYS.ACTIVE_PACKAGE, JSON.stringify(plnUp3MalangFullPackage));
          } else {
            this.activePackage = parsed;
          }
        } else {
          // Initialize with default package
          this.activePackage = defaultPkg;
          localStorage.setItem(STORAGE_KEYS.ACTIVE_PACKAGE, JSON.stringify(defaultPkg));
        }

        const rawHistory = localStorage.getItem(STORAGE_KEYS.PACKAGE_HISTORY);
        if (rawHistory) {
          this.packageHistory = JSON.parse(rawHistory);
        }

        const rawConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (rawConfig) {
          this.config = JSON.parse(rawConfig);
        } else {
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(defaultKioskConfig));
        }

        const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
        if (rawLogs) {
          this.logs = JSON.parse(rawLogs);
        }
      } catch (e) {
        console.error('Failed to load storage, falling back to in-memory default:', e);
        this.activePackage = samplePlnPackage;
      }
    } else {
      this.activePackage = samplePlnPackage;
    }
  }

  public getActivePackage(): ImportPackage | null {
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

  /**
   * Atomically activates a validated package and moves previous package to history
   */
  public activatePackage(pkg: ImportPackage): void {
    const previous = this.activePackage;
    const nowIso = new Date().toISOString();
    
    const activated: ImportPackage = {
      ...pkg,
      importedAt: nowIso,
    };

    if (previous && previous.datasetVersion !== activated.datasetVersion) {
      this.packageHistory = [previous, ...this.packageHistory.slice(0, 9)]; // retain last 10 snapshots
    }

    this.activePackage = activated;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PACKAGE, JSON.stringify(this.activePackage));
      localStorage.setItem(STORAGE_KEYS.PACKAGE_HISTORY, JSON.stringify(this.packageHistory));
    }

    this.addLog('info', 'Storage', `Paket versi ${activated.datasetVersion} berhasil diaktivasi secara atomik.`);
  }

  /**
   * Restores a previously active snapshot from history, maintaining original sourceAt & importedAt
   */
  public restoreSnapshot(datasetVersion: number): boolean {
    const found = this.packageHistory.find(p => p.datasetVersion === datasetVersion);
    if (!found) return false;

    const current = this.activePackage;
    const nowIso = new Date().toISOString();

    const restored: ImportPackage = {
      ...found,
      restoredAt: nowIso,
    };

    if (current) {
      this.packageHistory = [current, ...this.packageHistory.filter(p => p.datasetVersion !== datasetVersion)].slice(0, 10);
    }

    this.activePackage = restored;

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PACKAGE, JSON.stringify(this.activePackage));
      localStorage.setItem(STORAGE_KEYS.PACKAGE_HISTORY, JSON.stringify(this.packageHistory));
    }

    this.addLog('warn', 'Storage', `Pemulihan (Restore) versi ${restored.datasetVersion} berhasil dieksekusi.`);
    return true;
  }

  public addLog(level: 'info' | 'warn' | 'error', component: string, message: string, details?: Record<string, unknown>): void {
    // Sanitasi details: hilangkan rahasia atau raw barcode values jika ada
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

    this.logs = [logEntry, ...this.logs.slice(0, 99)]; // retain last 100 logs

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs));
    }
  }

  private persistActivePackage(): void {
    if (this.activePackage) {
      this.activePackage.packageHash = 'pkg-loc-' + Date.now().toString(36);
      this.activePackage.importedAt = new Date().toISOString();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PACKAGE, JSON.stringify(this.activePackage));
      }
    }
  }

  /**
   * Menambahkan kategori baru ke database lokal aktif
   */
  public addCategory(name: string, sortOrder?: number): Category {
    if (!this.activePackage) {
      throw new Error('Tidak ada paket data aktif.');
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Nama kategori tidak boleh kosong.');
    }

    const nextOrder = sortOrder ?? (this.activePackage.categories.length + 1);
    const newCategory: Category = {
      id: 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      name: trimmedName,
      sortOrder: nextOrder,
      active: true,
    };

    this.activePackage.categories = [...this.activePackage.categories, newCategory];
    this.persistActivePackage();
    this.addLog('info', 'Storage', `Kategori baru ditambahkan: "${newCategory.name}"`);
    return newCategory;
  }

  /**
   * Menambah atau menyesuaikan kuantitas stok material di lokasi tertentu
   */
  public addOrAdjustStock(params: {
    materialId: string;
    locationId?: string;
    zone?: string;
    rack?: string;
    bin?: string;
    quantityDelta: number;
    setExact?: boolean;
  }): StockSnapshot {
    if (!this.activePackage) {
      throw new Error('Tidak ada paket data aktif.');
    }

    const material = this.activePackage.materials.find(m => m.id === params.materialId);
    if (!material) {
      throw new Error(`Material dengan ID ${params.materialId} tidak ditemukan.`);
    }

    let targetLocationId = params.locationId;

    // Jika belum ada lokasi tapi ada zone/rack/bin, buat lokasi baru
    if (!targetLocationId && (params.zone || params.rack || params.bin)) {
      const newLoc: Location = {
        id: 'loc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
        warehouseCode: this.config.warehouseCode,
        zone: params.zone?.trim() || 'Zona A',
        rack: params.rack?.trim() || 'Rak 01',
        bin: params.bin?.trim() || 'Bin 01',
      };
      this.activePackage.locations = [...this.activePackage.locations, newLoc];
      targetLocationId = newLoc.id;
    }

    // Jika masih belum ada lokasi, gunakan lokasi pertama yang ada atau buat default
    if (!targetLocationId) {
      if (this.activePackage.locations.length > 0) {
        targetLocationId = this.activePackage.locations[0].id;
      } else {
        const defaultLoc: Location = {
          id: 'loc-default',
          warehouseCode: this.config.warehouseCode,
          zone: 'Zona Utama',
          rack: 'Rak 01',
          bin: 'Bin 01',
        };
        this.activePackage.locations = [defaultLoc];
        targetLocationId = defaultLoc.id;
      }
    }

    const nowIso = new Date().toISOString();
    const existingIndex = this.activePackage.stockSnapshots.findIndex(
      s => s.materialId === params.materialId && s.locationId === targetLocationId
    );

    let updatedSnapshot: StockSnapshot;

    if (existingIndex >= 0) {
      const existing = this.activePackage.stockSnapshots[existingIndex];
      const newQty = params.setExact
        ? Math.max(0, params.quantityDelta)
        : Math.max(0, (existing.quantity || 0) + params.quantityDelta);
      const reserved = existing.reserved || 0;
      const newAvailable = Math.max(0, newQty - reserved);

      updatedSnapshot = {
        ...existing,
        quantity: newQty,
        available: newAvailable,
        sourceAt: nowIso,
      };

      this.activePackage.stockSnapshots[existingIndex] = updatedSnapshot;
    } else {
      const newQty = Math.max(0, params.quantityDelta);
      updatedSnapshot = {
        materialId: params.materialId,
        locationId: targetLocationId,
        quantity: newQty,
        reserved: 0,
        available: newQty,
        sourceAt: nowIso,
      };
      this.activePackage.stockSnapshots.push(updatedSnapshot);
    }

    this.persistActivePackage();
    this.addLog('info', 'Storage', `Stok material "${material.name}" diperbarui: ${updatedSnapshot.quantity} ${material.unit}`);
    return updatedSnapshot;
  }

  /**
   * Mendaftarkan material baru lengkap beserta barcode alias, lokasi rak, dan stok awal
   */
  public addMaterialWithBarcode(params: {
    code: string;
    name: string;
    categoryId: string;
    sapCode?: string;
    unit: string;
    specification?: string;
    photoPath?: string;
    barcode: string;
    zone?: string;
    rack?: string;
    bin?: string;
    initialQuantity?: number;
  }): Material {
    if (!this.activePackage) {
      throw new Error('Tidak ada paket data aktif.');
    }

    const trimmedCode = params.code.trim();
    const trimmedName = params.name.trim();
    const trimmedBarcode = params.barcode.trim();

    if (!trimmedCode) throw new Error('Kode material tidak boleh kosong.');
    if (!trimmedName) throw new Error('Nama material tidak boleh kosong.');
    if (!trimmedBarcode) throw new Error('Nilai barcode tidak boleh kosong.');

    // Cek duplikasi kode material
    const codeExists = this.activePackage.materials.some(m => m.code === trimmedCode);
    if (codeExists) {
      throw new Error(`Material dengan kode "${trimmedCode}" sudah ada.`);
    }

    const newMaterialId = 'mat-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);
    const newMaterial: Material = {
      id: newMaterialId,
      code: trimmedCode,
      sapCode: params.sapCode?.trim() || null,
      name: trimmedName,
      categoryId: params.categoryId,
      unit: params.unit.trim() || 'Unit',
      specification: params.specification?.trim() || null,
      photoPath: params.photoPath?.trim() || null,
    };

    // Buat lokasi
    const locId = 'loc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);
    const newLocation: Location = {
      id: locId,
      warehouseCode: this.config.warehouseCode,
      zone: params.zone?.trim() || 'Zona A',
      rack: params.rack?.trim() || 'Rak 01',
      bin: params.bin?.trim() || 'Bin 01',
    };

    // Buat alias barcode
    const newBarcodeAlias: BarcodeAlias = {
      value: trimmedBarcode,
      targetType: 'material',
      targetId: newMaterialId,
    };

    // Jika kode material berbeda dengan barcode, daftarkan juga kode material sebagai alias
    const aliasesToAdd: BarcodeAlias[] = [newBarcodeAlias];
    if (trimmedCode !== trimmedBarcode) {
      aliasesToAdd.push({
        value: trimmedCode,
        targetType: 'material',
        targetId: newMaterialId,
      });
    }

    // Buat stok awal
    const qty = params.initialQuantity != null ? Math.max(0, params.initialQuantity) : 0;
    const newStock: StockSnapshot = {
      materialId: newMaterialId,
      locationId: locId,
      quantity: qty,
      reserved: 0,
      available: qty,
      sourceAt: new Date().toISOString(),
    };

    this.activePackage.materials = [...this.activePackage.materials, newMaterial];
    this.activePackage.locations = [...this.activePackage.locations, newLocation];
    this.activePackage.barcodeAliases = [...this.activePackage.barcodeAliases, ...aliasesToAdd];
    this.activePackage.stockSnapshots = [...this.activePackage.stockSnapshots, newStock];

    this.persistActivePackage();
    this.addLog('info', 'Storage', `Material baru berhasil didaftarkan: "${newMaterial.name}" (${newMaterial.code})`);
    return newMaterial;
  }

  /**
   * Menghapus material yang masuk dari database aktif beserta seluruh relasi stok, aset, dan barcode
   */
  public deleteMaterial(materialId: string): { success: boolean; materialName: string; materialCode: string } {
    if (!this.activePackage) {
      throw new Error('Tidak ada paket data aktif.');
    }

    const materialIndex = this.activePackage.materials.findIndex(m => m.id === materialId);
    if (materialIndex < 0) {
      throw new Error(`Material dengan ID "${materialId}" tidak ditemukan.`);
    }

    const targetMaterial = this.activePackage.materials[materialIndex];
    const materialName = targetMaterial.name;
    const materialCode = targetMaterial.code;

    // 1. Hapus dari daftar material
    this.activePackage.materials = this.activePackage.materials.filter(m => m.id !== materialId);

    // 2. Hapus snapshot stok untuk material ini
    this.activePackage.stockSnapshots = this.activePackage.stockSnapshots.filter(s => s.materialId !== materialId);

    // 3. Hapus barcode alias untuk material ini
    this.activePackage.barcodeAliases = this.activePackage.barcodeAliases.filter(
      a => !(a.targetType === 'material' && a.targetId === materialId)
    );

    // 4. Cari dan hapus aset terkait material ini
    const assetIds = this.activePackage.assets
      .filter(a => a.materialId === materialId)
      .map(a => a.id);

    this.activePackage.assets = this.activePackage.assets.filter(a => a.materialId !== materialId);

    // 5. Hapus barcode alias untuk aset yang dihapus
    if (assetIds.length > 0) {
      this.activePackage.barcodeAliases = this.activePackage.barcodeAliases.filter(
        a => !(a.targetType === 'asset' && assetIds.includes(a.targetId))
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
