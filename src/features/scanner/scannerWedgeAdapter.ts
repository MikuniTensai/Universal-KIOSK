import { ScanResolveResult } from '../../domain/types';
import { CatalogService } from '../catalog/catalogService';
import { kioskStorage } from '../../adapters/storage/kioskStorage';

export type ScanCallback = (result: ScanResolveResult) => void;

export class ScannerWedgeAdapter {
  private buffer: string = '';
  private lastKeystrokeTime: number = 0;
  private currentRequestId: number = 0;
  private listeners: Set<ScanCallback> = new Set();
  private maxKeystrokeIntervalMs: number = 75; // USB HID sends burst in <50ms
  private isListening: boolean = false;
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.keydownHandler = this.handleKeyDown.bind(this);
  }

  public subscribe(callback: ScanCallback): () => void {
    this.listeners.add(callback);
    if (!this.isListening && typeof window !== 'undefined') {
      window.addEventListener('keydown', this.keydownHandler);
      this.isListening = true;
    }
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0 && typeof window !== 'undefined') {
        window.removeEventListener('keydown', this.keydownHandler);
        this.isListening = false;
      }
    };
  }

  /**
   * Play standard POS barcode scanner audio beep via Web Audio API
   */
  public playScannerBeep(isSuccess = true): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        // High crisp beep: 1760 Hz for 75ms
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.075);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else {
        // Low double buzz for not found / error: 440 Hz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.16);
      }
    } catch {
      // Audio context might be restricted before first interaction
    }
  }

  /**
   * Internal keystroke event handler
   */
  public handleKeyDown(e: KeyboardEvent): void {
    const now = Date.now();
    const interval = now - this.lastKeystrokeTime;

    // Reset buffer if delay exceeds threshold (human typing vs hardware scanner burst)
    if (interval > this.maxKeystrokeIntervalMs && this.buffer.length > 0) {
      this.buffer = '';
    }
    this.lastKeystrokeTime = now;

    if (e.key === 'Enter') {
      const code = this.buffer.trim();
      this.buffer = '';

      if (code.length >= 2) {
        // Prevent default form submission or navigation
        if (e.preventDefault) {
          e.preventDefault();
        }
        this.processScan(code);
      }
    } else if (e.key && e.key.length === 1) {
      // Ignore control characters, tab, function keys
      this.buffer += e.key;
    }
  }

  /**
   * Dispatches and coordinates scan lookup, preventing stale results from overriding newer scans
   */
  public async processScan(rawCode: string): Promise<ScanResolveResult> {
    const thisRequestId = ++this.currentRequestId;
    const activePkg = kioskStorage.getActivePackage();
    const config = kioskStorage.getConfig();

    if (!activePkg) {
      const unavailableResult: ScanResolveResult = {
        status: 'unavailable',
        rawCode,
        errorMessage: 'Database lokal belum terpasang atau belum diaktivasi.',
      };
      this.playScannerBeep(false);
      this.notifyListeners(unavailableResult, thisRequestId);
      return unavailableResult;
    }

    const result = CatalogService.resolveScan(rawCode, activePkg, config);

    // Coordinate: if another scan was processed in the meantime, discard stale result
    if (thisRequestId !== this.currentRequestId) {
      return result;
    }

    // Play feedback audio beep
    this.playScannerBeep(result.status === 'found');

    this.notifyListeners(result, thisRequestId);
    return result;
  }

  private notifyListeners(result: ScanResolveResult, requestId: number): void {
    if (requestId === this.currentRequestId) {
      for (const listener of this.listeners) {
        try {
          listener(result);
        } catch (err) {
          console.error('Error in scan listener:', err);
        }
      }
    }
  }

  public reset(): void {
    this.buffer = '';
    this.lastKeystrokeTime = 0;
  }
}

export const scannerAdapter = new ScannerWedgeAdapter();
