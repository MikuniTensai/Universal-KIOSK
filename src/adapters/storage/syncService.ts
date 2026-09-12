import { ImportPackage, KioskConfig } from '../../domain/types';
import { WarehouseBlock, WarehouseLayoutService } from '../../features/layout/warehouseLayoutService';
import { kioskStorage } from './kioskStorage';

export interface ServerSyncPayload {
  activePackage?: ImportPackage | null;
  config?: KioskConfig;
  blocks?: WarehouseBlock[];
  packageHistory?: ImportPackage[];
  lastUpdated: number;
}

export class SyncService {
  private static syncIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private static lastKnownTimestamp = 0;
  private static isSyncing = false;
  private static broadcastChannel: BroadcastChannel | null = null;
  private static listeners: Array<(payload: ServerSyncPayload) => void> = [];

  private static initBroadcast() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window && !this.broadcastChannel) {
      try {
        this.broadcastChannel = new BroadcastChannel('pln_universal_kiosk_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object' && event.data.lastUpdated) {
            const applied = this.applySyncedState(event.data);
            if (applied) {
              this.notifyListeners(event.data);
            }
          }
        };
      } catch {
        // Fallback jika BroadcastChannel dibatasi oleh security policy
      }
    }
  }

  public static addListener(cb: (payload: ServerSyncPayload) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private static notifyListeners(payload: ServerSyncPayload) {
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch {
        // Abaikan error pada subscriber callback
      }
    }
  }

  /**
   * Mengirim state saat ini ke backend peladen lokal (/api/sync) dan broadcast channel
   */
  public static async pushState(): Promise<boolean> {
    this.initBroadcast();

    const payload: ServerSyncPayload = {
      activePackage: kioskStorage.getActivePackage(),
      config: kioskStorage.getConfig(),
      blocks: WarehouseLayoutService.getBlocks(),
      packageHistory: kioskStorage.getPackageHistory(),
      lastUpdated: Date.now(),
    };

    this.lastKnownTimestamp = payload.lastUpdated;

    // Broadcast lokal instan (0ms) untuk tab pada mesin yang sama
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {
        // Abaikan
      }
    }

    // Kirim ke server HTTP lokal (untuk sinkronisasi antar-perangkat LAN dan persistensi berkas)
    try {
      if (typeof window !== 'undefined' && typeof fetch === 'function') {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        return response.ok;
      }
      return false;
    } catch {
      // Offline fallback: server /api/sync tidak tersedia di unit test / preview
      return false;
    }
  }

  /**
   * Menarik state terbaru dari backend peladen lokal (/api/sync)
   */
  public static async pullState(): Promise<ServerSyncPayload | null> {
    try {
      if (typeof window === 'undefined' || typeof fetch !== 'function') return null;

      const response = await fetch('/api/sync', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (!data || !data.lastUpdated) return null;

      return data as ServerSyncPayload;
    } catch {
      return null;
    }
  }

  /**
   * Menerapkan data hasil sinkronisasi ke storage lokal in-memory & localStorage
   */
  public static applySyncedState(payload: ServerSyncPayload): boolean {
    if (!payload.lastUpdated || payload.lastUpdated <= this.lastKnownTimestamp) {
      return false;
    }

    this.lastKnownTimestamp = payload.lastUpdated;

    if (payload.activePackage) {
      kioskStorage.setActivePackageDirectly(payload.activePackage);
    }
    if (payload.config) {
      kioskStorage.saveConfig(payload.config);
    }
    if (payload.blocks && payload.blocks.length > 0) {
      WarehouseLayoutService.saveBlocks(payload.blocks);
    }

    return true;
  }

  /**
   * Memulai polling otomatis untuk layar kios agar selalu sinkron dengan perubahan admin
   */
  public static startPolling(onUpdated?: () => void, intervalMs = 5000): void {
    this.initBroadcast();

    if (onUpdated) {
      this.addListener(() => onUpdated());
    }

    if (this.syncIntervalTimer) return;

    // Jalankan satu kali segera saat inisialisasi
    this.pullState().then((remoteState) => {
      if (remoteState && this.applySyncedState(remoteState)) {
        if (onUpdated) onUpdated();
      }
    });

    this.syncIntervalTimer = setInterval(async () => {
      if (this.isSyncing) return;
      this.isSyncing = true;
      try {
        const remoteState = await this.pullState();
        if (remoteState && this.applySyncedState(remoteState)) {
          if (onUpdated) onUpdated();
        }
      } finally {
        this.isSyncing = false;
      }
    }, intervalMs);
  }

  /**
   * Menghentikan polling
   */
  public static stopPolling(): void {
    if (this.syncIntervalTimer) {
      clearInterval(this.syncIntervalTimer);
      this.syncIntervalTimer = null;
    }
  }
}
