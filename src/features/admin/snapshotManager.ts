import { ImportPackage } from '../../domain/types';
import { kioskStorage, KioskStorage } from '../../adapters/storage/kioskStorage';
import { AdminAuth } from './adminAuth';
import { validateImportPackage } from '../../domain/validation';

export class SnapshotManager {
  private storage: KioskStorage;

  constructor(storage: KioskStorage = kioskStorage) {
    this.storage = storage;
  }

  /**
   * Activate validated package (requires admin authentication)
   */
  public activate(pkg: ImportPackage): { success: boolean; message: string } {
    if (!AdminAuth.isAuthenticated()) {
      return { success: false, message: 'Akses ditolak: Memerlukan sesi petugas yang terautentikasi.' };
    }

    const active = this.storage.getActivePackage();
    const validation = validateImportPackage(pkg, active);
    if (!validation.isValid) {
      return {
        success: false,
        message: `Paket tidak valid: ${validation.errors.map(e => e.message).join(', ')}`,
      };
    }

    this.storage.activatePackage(pkg);
    return {
      success: true,
      message: `Paket versi ${pkg.datasetVersion} berhasil diaktifkan secara atomik.`,
    };
  }

  /**
   * Restore previous snapshot (requires admin authentication)
   */
  public restore(datasetVersion: number): { success: boolean; message: string } {
    if (!AdminAuth.isAuthenticated()) {
      return { success: false, message: 'Akses ditolak: Memerlukan sesi petugas yang terautentikasi.' };
    }

    const ok = this.storage.restoreSnapshot(datasetVersion);
    if (!ok) {
      return {
        success: false,
        message: `Snapshot versi ${datasetVersion} tidak ditemukan di arsip riwayat.`,
      };
    }

    return {
      success: true,
      message: `Snapshot versi ${datasetVersion} berhasil dipulihkan. Waktu sumber & impor asli dipertahankan.`,
    };
  }
}

export const snapshotManager = new SnapshotManager();
