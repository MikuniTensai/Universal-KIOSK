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
  private static pollingSession = 0;
  private static pollingRequest: AbortController | null = null;
  private static removePollingListener: (() => void) | null = null;
  private static lastAppliedEtag: string | null = null;
  private static responseValidators = new WeakMap<ServerSyncPayload, string | null>();
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
    this.lastAppliedEtag = null;

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
  public static async pullState(signal?: AbortSignal): Promise<ServerSyncPayload | null> {
    try {
      if (typeof window === 'undefined' || typeof fetch !== 'function') return null;

      const response = await fetch('/api/sync', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(this.lastAppliedEtag ? { 'If-None-Match': this.lastAppliedEtag } : {}),
        },
        cache: 'no-cache',
        signal,
      });

      if (signal?.aborted || response.status === 304 || !response.ok) return null;
      const data = await response.json();
      if (signal?.aborted || !data || typeof data.lastUpdated !== 'number'
        || !Number.isFinite(data.lastUpdated) || data.lastUpdated <= 0) return null;

      this.responseValidators.set(data, response.headers.get('ETag'));
      return data as ServerSyncPayload;
    } catch {
      return null;
    }
  }

  /**
   * Menerapkan data hasil sinkronisasi ke storage lokal in-memory & localStorage
   */
  public static applySyncedState(payload: ServerSyncPayload): boolean {
    if (!Number.isFinite(payload.lastUpdated) || payload.lastUpdated <= this.lastKnownTimestamp) {
      // A payload received after a local broadcast may have the same timestamp.
      // It was already applied, so acknowledge its validator without notifying UI.
      if (payload.lastUpdated === this.lastKnownTimestamp) {
        const validator = this.responseValidators.get(payload);
        if (validator) this.lastAppliedEtag = validator;
        this.responseValidators.delete(payload);
      }
      return false;
    }

    if (payload.activePackage) {
      kioskStorage.setActivePackageDirectly(payload.activePackage);
    }
    if (payload.config) {
      kioskStorage.saveConfig(payload.config);
    }
    if (payload.blocks && payload.blocks.length > 0) {
      WarehouseLayoutService.saveBlocks(payload.blocks);
    }

    // A failed storage write must leave the same response eligible for retry.
    this.lastKnownTimestamp = payload.lastUpdated;
    this.lastAppliedEtag = this.responseValidators.get(payload) ?? null;
    this.responseValidators.delete(payload);
    return true;
  }

  /**
   * Memulai polling otomatis untuk layar kios agar selalu sinkron dengan perubahan admin
   */
  public static startPolling(onUpdated?: () => void, intervalMs = 5000): void {
    this.initBroadcast();
    if (this.syncIntervalTimer !== null) return;

    if (onUpdated) {
      this.removePollingListener = this.addListener(() => onUpdated());
    }

    const session = ++this.pollingSession;
    const poll = async () => {
      if (this.pollingRequest || session !== this.pollingSession) return;
      const request = new AbortController();
      this.pollingRequest = request;
      try {
        const remoteState = await this.pullState(request.signal);
        if (request.signal.aborted || session !== this.pollingSession) return;
        if (remoteState && this.applySyncedState(remoteState)) {
          this.notifyListeners(remoteState);
        }
      } catch {
        // Keep polling after a storage failure; the validator has not been acknowledged.
      } finally {
        if (this.pollingRequest === request) this.pollingRequest = null;
      }
    };

    this.syncIntervalTimer = setInterval(() => void poll(), intervalMs);
    void poll();
  }

  /**
   * Menghentikan polling
   */
  public static stopPolling(): void {
    ++this.pollingSession;
    this.pollingRequest?.abort();
    this.pollingRequest = null;
    this.removePollingListener?.();
    this.removePollingListener = null;
    if (this.syncIntervalTimer !== null) {
      clearInterval(this.syncIntervalTimer);
      this.syncIntervalTimer = null;
    }
  }
}
