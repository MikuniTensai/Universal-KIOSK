import { describe, it, expect, beforeEach } from 'vitest';
import { AdminAuth } from '../../src/features/admin/adminAuth';
import { ImportService } from '../../src/features/admin/importService';
import { SnapshotManager } from '../../src/features/admin/snapshotManager';
import { KioskStorage } from '../../src/adapters/storage/kioskStorage';
import { samplePlnPackage } from '../../src/data/mockPlnPackage';
import { ImportPackage } from '../../src/domain/types';

describe('Admin Authentication & Session', () => {
  beforeEach(() => {
    AdminAuth.logout();
  });

  it('authenticates with correct default PIN 123456', () => {
    expect(AdminAuth.isAuthenticated()).toBe(false);
    const ok = AdminAuth.authenticate('123456');
    expect(ok).toBe(true);
    expect(AdminAuth.isAuthenticated()).toBe(true);
  });

  it('rejects incorrect PIN', () => {
    const ok = AdminAuth.authenticate('000000');
    expect(ok).toBe(false);
    expect(AdminAuth.isAuthenticated()).toBe(false);
  });

  it('logs out successfully', () => {
    AdminAuth.authenticate('123456');
    expect(AdminAuth.isAuthenticated()).toBe(true);
    AdminAuth.logout();
    expect(AdminAuth.isAuthenticated()).toBe(false);
  });
});

describe('ImportService & SnapshotManager', () => {
  let storage: KioskStorage;
  let manager: SnapshotManager;

  beforeEach(() => {
    AdminAuth.logout();
    storage = new KioskStorage();
    manager = new SnapshotManager(storage);
  });

  it('parses valid JSON package and provides preview', async () => {
    const jsonStr = JSON.stringify(samplePlnPackage);
    const result = await ImportService.parseAndValidate(jsonStr);

    expect(result.validation.isValid).toBe(true);
    expect(result.preview).toBeDefined();
    expect(result.preview?.materialCount).toBe(samplePlnPackage.materials.length);
    expect(result.preview?.datasetVersion).toBe(samplePlnPackage.datasetVersion);
  });

  it('catches malformed JSON string', async () => {
    const malformed = '{ datasetVersion: 1, invalid';
    const result = await ImportService.parseAndValidate(malformed);
    expect(result.validation.isValid).toBe(false);
    expect(result.validation.errors[0].code).toBe('JSON_SYNTAX_ERROR');
  });

  it('denies package activation when unauthenticated', () => {
    const result = manager.activate(samplePlnPackage);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Akses ditolak');
  });

  it('activates package atomically when authenticated', () => {
    AdminAuth.authenticate('123456');

    const newPkg: ImportPackage = {
      ...samplePlnPackage,
      datasetVersion: 2,
      packageHash: 'hash-v2-test',
    };

    const result = manager.activate(newPkg);
    expect(result.success).toBe(true);
    expect(storage.getActivePackage()?.datasetVersion).toBe(2);
    expect(storage.getActivePackage()?.importedAt).toBeDefined();

    // Previous version 1 is in history
    const history = storage.getPackageHistory();
    expect(history.some(p => p.datasetVersion === 1)).toBe(true);
  });

  it('restores previous snapshot with sourceAt preserved and restoredAt set', () => {
    AdminAuth.authenticate('123456');

    const v2Pkg: ImportPackage = {
      ...samplePlnPackage,
      datasetVersion: 2,
      packageHash: 'hash-v2-test',
      sourceAt: '2026-09-11T10:00:00+07:00',
    };
    manager.activate(v2Pkg);

    // Now restore version 1
    const restoreResult = manager.restore(1);
    expect(restoreResult.success).toBe(true);

    const active = storage.getActivePackage();
    expect(active?.datasetVersion).toBe(1);
    expect(active?.sourceAt).toBe(samplePlnPackage.sourceAt); // sourceAt preserved!
    expect(active?.restoredAt).toBeDefined(); // restoredAt tracked!
  });
});
