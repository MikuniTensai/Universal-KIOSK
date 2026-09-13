import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SqlBackupService } from '../../src/features/admin/sqlBackupService';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';
import { samplePlnPackage } from '../../src/data/mockPlnPackage';

describe('SqlBackupService & Auto-Backup System (backup.sql)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Initialize active package
    kioskStorage.activatePackage(samplePlnPackage, 'all');
  });

  it('generates a complete SQL dump with DDL and DML for all tables', () => {
    const sql = SqlBackupService.generateSql('manual');

    expect(sql).toContain('-- UNIVERSAL-KIOSK ENTERPRISE DATABASE BACKUP (backup.sql)');
    expect(sql).toContain('PRAGMA foreign_keys = OFF;');
    expect(sql).toContain('BEGIN TRANSACTION;');
    expect(sql).toContain('CREATE TABLE categories');
    expect(sql).toContain('CREATE TABLE locations');
    expect(sql).toContain('CREATE TABLE materials');
    expect(sql).toContain('CREATE TABLE stock_snapshots');
    expect(sql).toContain('CREATE TABLE barcode_aliases');
    expect(sql).toContain('CREATE TABLE admin_users');
    expect(sql).toContain('CREATE TABLE kiosk_config');
    expect(sql).toContain('CREATE TABLE warehouse_blocks');
    expect(sql).toContain('COMMIT;');

    // Verify INSERT statements exist
    expect(sql).toContain('INSERT INTO categories');
    expect(sql).toContain('INSERT INTO materials');
    expect(sql).toContain('INSERT INTO kiosk_config');
  });

  it('performs startup auto-backup and records metadata in localStorage', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const meta = await SqlBackupService.performStartupAutoBackup();

    expect(meta.trigger).toBe('startup');
    expect(meta.sizeBytes).toBeGreaterThan(100);
    expect(meta.lineCount).toBeGreaterThan(10);
    expect(meta.tableCounts.materials).toBeGreaterThan(0);
    expect(meta.tableCounts.categories).toBeGreaterThan(0);

    const savedStartupMeta = SqlBackupService.getAutoBackupMeta('startup');
    expect(savedStartupMeta).not.toBeNull();
    expect(savedStartupMeta?.trigger).toBe('startup');

    const latestSql = SqlBackupService.getLatestSql();
    expect(latestSql).toContain('Pemicu: STARTUP (Awal Aplikasi Berjalan)');

    // Verify local API call was attempted
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/system/backup-sql',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    );

    vi.unstubAllGlobals();
  });

  it('performs shutdown auto-backup and records metadata in localStorage', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const meta = await SqlBackupService.performShutdownAutoBackup();

    expect(meta.trigger).toBe('shutdown');
    expect(meta.sizeBytes).toBeGreaterThan(100);

    const savedShutdownMeta = SqlBackupService.getAutoBackupMeta('shutdown');
    expect(savedShutdownMeta).not.toBeNull();
    expect(savedShutdownMeta?.trigger).toBe('shutdown');

    const latestSql = SqlBackupService.getLatestSql();
    expect(latestSql).toContain('Pemicu: SHUTDOWN (Sebelum Kiosk Shutdown)');

    vi.unstubAllGlobals();
  });

  it('restores materials and categories from a valid SQL dump', () => {
    const customSql = `
BEGIN TRANSACTION;
CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT, sort_order INTEGER, active INTEGER);
INSERT INTO categories (id, name, sort_order, active) VALUES ('cat-test-1', 'Trafo Khusus SQL', 1, 1);

CREATE TABLE locations (id TEXT PRIMARY KEY, warehouse_code TEXT, zone TEXT, rack TEXT, bin TEXT);
INSERT INTO locations (id, warehouse_code, zone, rack, bin) VALUES ('loc-test-1', 'GD-TEST', 'A', '01', '01');

CREATE TABLE materials (id TEXT PRIMARY KEY, code TEXT, sap_code TEXT, name TEXT, category_id TEXT, unit TEXT, specification TEXT, photo_path TEXT, condition TEXT, status TEXT);
INSERT INTO materials (id, code, sap_code, name, category_id, unit, specification, photo_path, condition, status) VALUES ('mat-sql-999', 'TRF-999', 'SAP-999', 'Trafo Uji Coba Backup SQL', 'cat-test-1', 'UNIT', 'Spek uji', NULL, 'BARU', 'Baru');

CREATE TABLE stock_snapshots (material_id TEXT, location_id TEXT, quantity REAL, reserved REAL, available REAL, source_at TEXT, PRIMARY KEY (material_id, location_id));
INSERT INTO stock_snapshots (material_id, location_id, quantity, reserved, available, source_at) VALUES ('mat-sql-999', 'loc-test-1', 42, 0, 42, '2026-09-13T12:00:00Z');

CREATE TABLE barcode_aliases (value TEXT PRIMARY KEY, target_type TEXT, target_id TEXT);
INSERT INTO barcode_aliases (value, target_type, target_id) VALUES ('BC-SQL-999', 'material', 'mat-sql-999');
COMMIT;
`;

    const result = SqlBackupService.restoreFromSql(customSql);

    expect(result.success).toBe(true);
    expect(result.stats?.materials).toBe(1);
    expect(result.stats?.categories).toBe(1);

    const currentPkg = kioskStorage.getActivePackage();
    expect(currentPkg).not.toBeNull();
    const testMat = currentPkg?.materials.find((m) => m.id === 'mat-sql-999');
    expect(testMat).toBeDefined();
    expect(testMat?.name).toBe('Trafo Uji Coba Backup SQL');

    const testCat = currentPkg?.categories.find((c) => c.id === 'cat-test-1');
    expect(testCat).toBeDefined();
    expect(testCat?.name).toBe('Trafo Khusus SQL');
  });

  it('rejects invalid or empty SQL dumps gracefully', () => {
    const emptyResult = SqlBackupService.restoreFromSql('');
    expect(emptyResult.success).toBe(false);
    expect(emptyResult.error).toBe('Empty content');

    const invalidResult = SqlBackupService.restoreFromSql('SELECT * FROM random_table;');
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toBe('Invalid schema');
  });
});
