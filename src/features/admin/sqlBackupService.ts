/**
 * SQL Backup & Auto-Backup Service (backup.sql)
 * Menghasilkan cadangan database SQLite/SQL standar lengkap (DDL & DML)
 * yang otomatis dijalankan pada awal aplikasi dan sesaat sebelum kiosk dimatikan (shutdown),
 * serta menyediakan tombol unduh dan restore di panel pengaturan.
 */

import { kioskStorage } from '../../adapters/storage/kioskStorage';
import { samplePlnPackage } from '../../data/mockPlnPackage';
import { UserManagementService } from './userManagementService';
import { WarehouseLayoutService } from '../layout/warehouseLayoutService';
import {
  Category,
  Material,
  Location,
  StockSnapshot,
  BarcodeAlias,
  ImportPackage,
  KioskConfig,
} from '../../domain/types';

export interface AutoBackupMeta {
  timestamp: string;
  trigger: 'startup' | 'shutdown' | 'manual';
  sizeBytes: number;
  lineCount: number;
  tableCounts: {
    materials: number;
    categories: number;
    locations: number;
    stockSnapshots: number;
    barcodeAliases: number;
    adminUsers: number;
    warehouseBlocks: number;
  };
}

const STORAGE_KEYS = {
  LATEST_SQL: 'kiosk_sql_backup_latest',
  META_STARTUP: 'kiosk_sql_backup_meta_startup',
  META_SHUTDOWN: 'kiosk_sql_backup_meta_shutdown',
  META_LATEST: 'kiosk_sql_backup_meta_latest',
};

function escapeSql(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : '0';
  if (typeof val === 'boolean') return val ? '1' : '0';
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

export class SqlBackupService {
  /**
   * Menghasilkan script SQL DDL & DML lengkap (backup.sql) dari seluruh state sistem
   */
  public static generateSql(trigger: 'startup' | 'shutdown' | 'manual' = 'manual'): string {
    const pkg: ImportPackage = kioskStorage.getActivePackage() || samplePlnPackage;
    const config: KioskConfig = kioskStorage.getConfig();
    const users = UserManagementService.getUsers();
    const blocks = WarehouseLayoutService.getBlocks();
    const now = new Date().toISOString();

    const lines: string[] = [];

    // 1. Header Metadata
    lines.push('-- ==========================================================');
    lines.push('-- UNIVERSAL-KIOSK ENTERPRISE DATABASE BACKUP (backup.sql)');
    lines.push(`-- Unit Gudang: ${config.warehouseCode || 'GD-MLG-01'}`);
    lines.push(`-- Organisasi: ${config.organizationName || 'PT PLN (Persero)'}`);
    lines.push(`-- Tanggal Backup: ${now}`);
    lines.push(
      `-- Pemicu: ${trigger.toUpperCase()} (${
        trigger === 'startup'
          ? 'Awal Aplikasi Berjalan'
          : trigger === 'shutdown'
          ? 'Sebelum Kiosk Shutdown'
          : 'Manual Panel Pengaturan'
      })`
    );
    lines.push('-- Format Kompatibilitas: SQLite 3 / ANSI SQL-92 DDL & DML');
    lines.push('-- ==========================================================');
    lines.push('');
    lines.push('PRAGMA foreign_keys = OFF;');
    lines.push('BEGIN TRANSACTION;');
    lines.push('');

    // 2. Table: categories
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Tabel: categories');
    lines.push('-- ---------------------------------------------------------');
    lines.push('DROP TABLE IF EXISTS categories;');
    lines.push('CREATE TABLE categories (');
    lines.push('  id TEXT PRIMARY KEY,');
    lines.push('  name TEXT NOT NULL,');
    lines.push('  sort_order INTEGER NOT NULL DEFAULT 0,');
    lines.push('  active INTEGER NOT NULL DEFAULT 1');
    lines.push(');');
    lines.push('');
    if (pkg.categories && pkg.categories.length > 0) {
      pkg.categories.forEach((cat) => {
        lines.push(
          `INSERT INTO categories (id, name, sort_order, active) VALUES (${escapeSql(cat.id)}, ${escapeSql(
            cat.name
          )}, ${cat.sortOrder ?? 0}, ${cat.active !== false ? 1 : 0});`
        );
      });
    }
    lines.push('');

    // 3. Table: locations
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Tabel: locations');
    lines.push('-- ---------------------------------------------------------');
    lines.push('DROP TABLE IF EXISTS locations;');
    lines.push('CREATE TABLE locations (');
    lines.push('  id TEXT PRIMARY KEY,');
    lines.push('  warehouse_code TEXT NOT NULL,');
    lines.push('  zone TEXT,');
    lines.push('  rack TEXT,');
    lines.push('  bin TEXT');
    lines.push(');');
    lines.push('');
    if (pkg.locations && pkg.locations.length > 0) {
      pkg.locations.forEach((loc) => {
        lines.push(
          `INSERT INTO locations (id, warehouse_code, zone, rack, bin) VALUES (${escapeSql(loc.id)}, ${escapeSql(
            loc.warehouseCode || config.warehouseCode
          )}, ${escapeSql(loc.zone)}, ${escapeSql(loc.rack)}, ${escapeSql(loc.bin)});`
        );
      });
    }
    lines.push('');

    // 4. Table: materials
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Tabel: materials (Material Baru & Material Return)');
    lines.push('-- ---------------------------------------------------------');
    lines.push('DROP TABLE IF EXISTS materials;');
    lines.push('CREATE TABLE materials (');
    lines.push('  id TEXT PRIMARY KEY,');
    lines.push('  code TEXT NOT NULL,');
    lines.push('  sap_code TEXT,');
    lines.push('  name TEXT NOT NULL,');
    lines.push('  category_id TEXT NOT NULL,');
    lines.push('  unit TEXT NOT NULL,');
    lines.push('  specification TEXT,');
    lines.push('  photo_path TEXT,');
    lines.push("  condition TEXT DEFAULT 'BARU',");
    lines.push("  status TEXT DEFAULT 'Baru'");
    lines.push(');');
    lines.push('');
    if (pkg.materials && pkg.materials.length > 0) {
      pkg.materials.forEach((mat) => {
        lines.push(
          `INSERT INTO materials (id, code, sap_code, name, category_id, unit, specification, photo_path, condition, status) VALUES (${escapeSql(
            mat.id
          )}, ${escapeSql(mat.code)}, ${escapeSql(mat.sapCode)}, ${escapeSql(mat.name)}, ${escapeSql(
            mat.categoryId
          )}, ${escapeSql(mat.unit)}, ${escapeSql(mat.specification)}, ${escapeSql(mat.photoPath)}, ${escapeSql(
            mat.condition || 'BARU'
          )}, ${escapeSql(mat.status || 'Baru')});`
        );
      });
    }
    lines.push('');

    // 5. Table: stock_snapshots
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Tabel: stock_snapshots (Inventaris Kuantitas Fisik Gudang)');
    lines.push('-- ---------------------------------------------------------');
    lines.push('DROP TABLE IF EXISTS stock_snapshots;');
    lines.push('CREATE TABLE stock_snapshots (');
    lines.push('  material_id TEXT NOT NULL,');
    lines.push('  location_id TEXT NOT NULL,');
    lines.push('  quantity REAL,');
    lines.push('  reserved REAL,');
    lines.push('  available REAL,');
    lines.push('  source_at TEXT NOT NULL,');
    lines.push('  PRIMARY KEY (material_id, location_id)');
    lines.push(');');
    lines.push('');
    if (pkg.stockSnapshots && pkg.stockSnapshots.length > 0) {
      pkg.stockSnapshots.forEach((snap) => {
        const qty = snap.quantity !== null && snap.quantity !== undefined ? snap.quantity : 'NULL';
        const res = snap.reserved !== null && snap.reserved !== undefined ? snap.reserved : 'NULL';
        const avl = snap.available !== null && snap.available !== undefined ? snap.available : 'NULL';
        lines.push(
          `INSERT INTO stock_snapshots (material_id, location_id, quantity, reserved, available, source_at) VALUES (${escapeSql(
            snap.materialId
          )}, ${escapeSql(snap.locationId)}, ${qty}, ${res}, ${avl}, ${escapeSql(snap.sourceAt || now)});`
        );
      });
    }
    lines.push('');

    // 6. Table: barcode_aliases
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Tabel: barcode_aliases (Pemindaian Barcode Alternatif)');
    lines.push('-- ---------------------------------------------------------');
    lines.push('DROP TABLE IF EXISTS barcode_aliases;');
    lines.push('CREATE TABLE barcode_aliases (');
    lines.push('  value TEXT PRIMARY KEY,');
    lines.push('  target_type TEXT NOT NULL,');
    lines.push('  target_id TEXT NOT NULL');
    lines.push(');');
    lines.push('');
    if (pkg.barcodeAliases && pkg.barcodeAliases.length > 0) {
      pkg.barcodeAliases.forEach((alias) => {
        lines.push(
          `INSERT INTO barcode_aliases (value, target_type, target_id) VALUES (${escapeSql(
            alias.value
          )}, ${escapeSql(alias.targetType)}, ${escapeSql(alias.targetId)});`
        );
      });
    }
    lines.push('');

    // 7. Table: admin_users (Spatie Role & Permissions)
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Tabel: admin_users (Pengguna & Hak Akses Spatie)');
    lines.push('-- ---------------------------------------------------------');
    lines.push('DROP TABLE IF EXISTS admin_users;');
    lines.push('CREATE TABLE admin_users (');
    lines.push('  id TEXT PRIMARY KEY,');
    lines.push('  name TEXT NOT NULL,');
    lines.push('  email TEXT NOT NULL UNIQUE,');
    lines.push('  password TEXT NOT NULL,');
    lines.push('  role TEXT NOT NULL,');
    lines.push('  permissions_json TEXT NOT NULL,');
    lines.push('  created_at TEXT NOT NULL');
    lines.push(');');
    lines.push('');
    if (users && users.length > 0) {
      users.forEach((user) => {
        const permsStr = JSON.stringify(user.permissions || ['*']);
        lines.push(
          `INSERT INTO admin_users (id, name, email, password, role, permissions_json, created_at) VALUES (${escapeSql(
            user.id
          )}, ${escapeSql(user.name)}, ${escapeSql(user.email)}, ${escapeSql(user.password)}, ${escapeSql(
            user.role
          )}, ${escapeSql(permsStr)}, ${escapeSql(user.createdAt)});`
        );
      });
    }
    lines.push('');

    // 8. Table: kiosk_config
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Tabel: kiosk_config (Konfigurasi Terminal & Visual)');
    lines.push('-- ---------------------------------------------------------');
    lines.push('DROP TABLE IF EXISTS kiosk_config;');
    lines.push('CREATE TABLE kiosk_config (');
    lines.push('  id TEXT PRIMARY KEY,');
    lines.push('  organization_name TEXT,');
    lines.push('  warehouse_code TEXT,');
    lines.push('  idle_seconds INTEGER,');
    lines.push('  warning_seconds INTEGER,');
    lines.push('  timezone TEXT,');
    lines.push('  orientation TEXT,');
    lines.push('  card_style TEXT,');
    lines.push('  wallpaper_preset TEXT,');
    lines.push('  custom_wallpaper_url TEXT');
    lines.push(');');
    lines.push('');
    lines.push(
      `INSERT INTO kiosk_config (id, organization_name, warehouse_code, idle_seconds, warning_seconds, timezone, orientation, card_style, wallpaper_preset, custom_wallpaper_url) VALUES ('main_config', ${escapeSql(
        config.organizationName
      )}, ${escapeSql(config.warehouseCode)}, ${escapeSql(config.idleSeconds)}, ${escapeSql(
        config.warningSeconds
      )}, ${escapeSql(config.timezone)}, ${escapeSql(config.orientation || 'landscape')}, ${escapeSql(
        config.cardStyle || 'photo'
      )}, ${escapeSql(config.wallpaperPreset || 'warehouse')}, ${escapeSql(config.customWallpaperUrl || null)});`
    );
    lines.push('');

    // 9. Table: warehouse_blocks
    lines.push('-- ---------------------------------------------------------');
    lines.push('-- Tabel: warehouse_blocks (Tata Letak Blok A-Z & Rak)');
    lines.push('-- ---------------------------------------------------------');
    lines.push('DROP TABLE IF EXISTS warehouse_blocks;');
    lines.push('CREATE TABLE warehouse_blocks (');
    lines.push('  id TEXT PRIMARY KEY,');
    lines.push('  code TEXT NOT NULL,');
    lines.push('  name TEXT NOT NULL,');
    lines.push('  sub_blocks_json TEXT NOT NULL');
    lines.push(');');
    lines.push('');
    if (blocks && blocks.length > 0) {
      blocks.forEach((block) => {
        const subJson = JSON.stringify(block.subBlocks || []);
        lines.push(
          `INSERT INTO warehouse_blocks (id, code, name, sub_blocks_json) VALUES (${escapeSql(
            block.id || block.code
          )}, ${escapeSql(block.code)}, ${escapeSql(block.name)}, ${escapeSql(subJson)});`
        );
      });
    }
    lines.push('');

    lines.push('COMMIT;');
    lines.push('-- ==========================================================');
    lines.push('-- AKHIR DARI CADANGAN DATABASE backup.sql');
    lines.push('-- ==========================================================');

    return lines.join('\n');
  }

  /**
   * Menyimpan auto-backup ke localStorage dan server jika tersedia
   */
  public static async recordAutoBackup(trigger: 'startup' | 'shutdown' | 'manual'): Promise<AutoBackupMeta> {
    const sql = this.generateSql(trigger);
    const pkg = kioskStorage.getActivePackage() || samplePlnPackage;
    const users = UserManagementService.getUsers();
    const blocks = WarehouseLayoutService.getBlocks();
    const sizeBytes = new Blob([sql]).size;
    const lineCount = sql.split('\n').length;
    const timestamp = new Date().toISOString();

    const meta: AutoBackupMeta = {
      timestamp,
      trigger,
      sizeBytes,
      lineCount,
      tableCounts: {
        materials: pkg.materials?.length || 0,
        categories: pkg.categories?.length || 0,
        locations: pkg.locations?.length || 0,
        stockSnapshots: pkg.stockSnapshots?.length || 0,
        barcodeAliases: pkg.barcodeAliases?.length || 0,
        adminUsers: users.length,
        warehouseBlocks: blocks.length,
      },
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.LATEST_SQL, sql);
        localStorage.setItem(STORAGE_KEYS.META_LATEST, JSON.stringify(meta));

        if (trigger === 'startup') {
          localStorage.setItem(STORAGE_KEYS.META_STARTUP, JSON.stringify(meta));
        } else if (trigger === 'shutdown') {
          localStorage.setItem(STORAGE_KEYS.META_SHUTDOWN, JSON.stringify(meta));
        }
      }
    } catch (e) {
      console.warn('[SqlBackupService] Gagal menyimpan ke localStorage:', e);
    }

    // Catat log diagnostik
    try {
      kioskStorage.addLog(
        'info',
        'AutoBackup',
        `Auto-backup backup.sql [pemicu=${trigger}] selesai dibuat (${(sizeBytes / 1024).toFixed(
          1
        )} KB, ${lineCount} baris SQL).`
      );
    } catch {
      // Abaikan jika logger belum siap
    }

    // Kirim ke server file system jika server lokal aktif
    if (typeof fetch !== 'undefined') {
      try {
        await fetch('/api/system/backup-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          body: sql,
        });
      } catch {
        // Mode offline / static browser fallback
      }
    }

    return meta;
  }

  /**
   * Eksekusi otomatis saat awal aplikasi berjalan
   */
  public static async performStartupAutoBackup(): Promise<AutoBackupMeta> {
    return await this.recordAutoBackup('startup');
  }

  /**
   * Eksekusi otomatis sebelum kiosk dimatikan (shutdown)
   */
  public static async performShutdownAutoBackup(): Promise<AutoBackupMeta> {
    return await this.recordAutoBackup('shutdown');
  }

  /**
   * Mengambil metadata auto-backup terakhir
   */
  public static getAutoBackupMeta(type: 'startup' | 'shutdown' | 'latest' = 'latest'): AutoBackupMeta | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const key =
        type === 'startup'
          ? STORAGE_KEYS.META_STARTUP
          : type === 'shutdown'
          ? STORAGE_KEYS.META_SHUTDOWN
          : STORAGE_KEYS.META_LATEST;

      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as AutoBackupMeta;
    } catch {
      return null;
    }
  }

  /**
   * Mengambil konten SQL terakhir yang dicadangkan
   */
  public static getLatestSql(): string {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEYS.LATEST_SQL);
        if (saved) return saved;
      }
    } catch {
      // Fallback generate on the fly
    }
    return this.generateSql('manual');
  }

  /**
   * Mengunduh berkas backup.sql langsung di browser
   */
  public static downloadSqlFile(filename: string = 'backup.sql'): void {
    const sql = this.generateSql('manual');
    const blob = new Blob([sql], { type: 'application/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Update metadata manual
    this.recordAutoBackup('manual').catch(() => {});
  }

  /**
   * Pemulihan (Restore) database dari konten file .sql
   */
  public static restoreFromSql(sqlContent: string): {
    success: boolean;
    message: string;
    stats?: { materials: number; categories: number; locations: number };
    error?: string;
  } {
    if (!sqlContent || !sqlContent.trim()) {
      return { success: false, message: 'Berkas SQL kosong.', error: 'Empty content' };
    }

    try {
      const config = kioskStorage.getConfig();
      const categories: Category[] = [];
      const locations: Location[] = [];
      const materials: Material[] = [];
      const stockSnapshots: StockSnapshot[] = [];
      const barcodeAliases: BarcodeAlias[] = [];

      // Regex matching INSERT INTO untuk setiap entitas
      const insertCatRegex = /INSERT INTO categories\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\);/gi;
      let match: RegExpExecArray | null;

      while ((match = insertCatRegex.exec(sqlContent)) !== null) {
        const values = this.parseSqlRowValues(match[1]);
        if (values.length >= 2) {
          categories.push({
            id: values[0],
            name: values[1],
            sortOrder: Number(values[2]) || categories.length + 1,
            active: values[3] !== '0',
          });
        }
      }

      const insertLocRegex = /INSERT INTO locations\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\);/gi;
      while ((match = insertLocRegex.exec(sqlContent)) !== null) {
        const values = this.parseSqlRowValues(match[1]);
        if (values.length >= 2) {
          locations.push({
            id: values[0],
            warehouseCode: values[1] || config.warehouseCode || 'GD-MLG-01',
            zone: values[2] || null,
            rack: values[3] || null,
            bin: values[4] || null,
          });
        }
      }

      const insertMatRegex = /INSERT INTO materials\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\);/gi;
      while ((match = insertMatRegex.exec(sqlContent)) !== null) {
        const values = this.parseSqlRowValues(match[1]);
        if (values.length >= 4) {
          materials.push({
            id: values[0],
            code: values[1] || values[0],
            sapCode: values[2] || null,
            name: values[3],
            categoryId: values[4] || '',
            unit: values[5] || 'PCS',
            specification: values[6] || null,
            photoPath: values[7] || null,
            condition: (values[8] as 'BARU' | 'RETURN') || 'BARU',
            status: values[9] || 'Baru',
          });
        }
      }

      const insertSnapRegex = /INSERT INTO stock_snapshots\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\);/gi;
      while ((match = insertSnapRegex.exec(sqlContent)) !== null) {
        const values = this.parseSqlRowValues(match[1]);
        if (values.length >= 2) {
          stockSnapshots.push({
            materialId: values[0],
            locationId: values[1],
            quantity: values[2] !== '' && values[2] !== null ? Number(values[2]) : null,
            reserved: values[3] !== '' && values[3] !== null ? Number(values[3]) : null,
            available: values[4] !== '' && values[4] !== null ? Number(values[4]) : null,
            sourceAt: values[5] || new Date().toISOString(),
          });
        }
      }

      const insertAliasRegex = /INSERT INTO barcode_aliases\s*\([^)]+\)\s*VALUES\s*\(([^;]+)\);/gi;
      while ((match = insertAliasRegex.exec(sqlContent)) !== null) {
        const values = this.parseSqlRowValues(match[1]);
        if (values.length >= 3) {
          barcodeAliases.push({
            value: values[0],
            targetType: (values[1] as 'material' | 'asset') || 'material',
            targetId: values[2],
          });
        }
      }

      if (materials.length === 0 && categories.length === 0) {
        return {
          success: false,
          message: 'Format berkas SQL tidak memuat perintah INSERT tabel materiil Universal-KIOSK yang valid.',
          error: 'Invalid schema',
        };
      }

      const current = kioskStorage.getActivePackage() || samplePlnPackage;
      const restoredPkg: ImportPackage = {
        ...current,
        schemaVersion: current.schemaVersion || '1.0.0',
        datasetVersion: (current.datasetVersion || 1) + 1,
        sourceName: 'Restorasi backup.sql Universal-KIOSK',
        sourceAt: new Date().toISOString(),
        categories: categories.length > 0 ? categories : current.categories,
        locations: locations.length > 0 ? locations : current.locations,
        materials,
        assets: current.assets || [],
        stockSnapshots: stockSnapshots.length > 0 ? stockSnapshots : current.stockSnapshots,
        barcodeAliases: barcodeAliases.length > 0 ? barcodeAliases : current.barcodeAliases,
        contentItems: current.contentItems || [],
        importedAt: new Date().toISOString(),
        restoredAt: new Date().toISOString(),
      };

      kioskStorage.activatePackage(restoredPkg, 'all');
      kioskStorage.addLog(
        'warn',
        'SqlRestore',
        `Database berhasil dipulihkan dari berkas backup.sql: ${materials.length} material, ${categories.length} kategori, ${locations.length} lokasi.`
      );

      return {
        success: true,
        message: `Database berhasil dipulihkan dari backup.sql! (${materials.length} material, ${categories.length} kategori).`,
        stats: {
          materials: materials.length,
          categories: categories.length,
          locations: locations.length,
        },
      };
    } catch (err) {
      return {
        success: false,
        message: 'Gagal memproses berkas SQL.',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Helper parser untuk membedah baris nilai VALUES (...) SQL
   */
  private static parseSqlRowValues(rawValues: string): string[] {
    const results: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < rawValues.length; i++) {
      const char = rawValues[i];

      if (char === "'") {
        if (inQuotes && rawValues[i + 1] === "'") {
          current += "'";
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        results.push(this.cleanParsedValue(current));
        current = '';
      } else {
        current += char;
      }
    }

    if (current) {
      results.push(this.cleanParsedValue(current));
    }

    return results;
  }

  private static cleanParsedValue(val: string): string {
    const trimmed = val.trim();
    if (trimmed.toUpperCase() === 'NULL') return '';
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }
}
