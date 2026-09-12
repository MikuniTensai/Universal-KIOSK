export type IdleEvent = 'warning' | 'timeout' | 'reset';

export interface IdleState {
  isWarning: boolean;
  secondsRemaining: number;
}

export class IdleTimerService {
  private idleSeconds: number;
  private warningSeconds: number;
  private lastActivityTime: number = Date.now();
  private intervalId: any = null;
  private listeners: Set<(event: IdleEvent, state: IdleState) => void> = new Set();
  private isWarningActive: boolean = false;

  constructor(idleSeconds = 60, warningSeconds = 10) {
    this.idleSeconds = idleSeconds;
    this.warningSeconds = warningSeconds;
  }

  public updateTimeouts(idleSeconds: number, warningSeconds: number): void {
    this.idleSeconds = idleSeconds;
    this.warningSeconds = warningSeconds;
    this.recordActivity();
  }

  public subscribe(callback: (event: IdleEvent, state: IdleState) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public start(): void {
    if (this.intervalId) return;
    this.lastActivityTime = Date.now();
    this.isWarningActive = false;

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public recordActivity(): void {
    const wasWarning = this.isWarningActive;
    this.lastActivityTime = Date.now();
    this.isWarningActive = false;

    if (wasWarning) {
      this.notify('reset', { isWarning: false, secondsRemaining: this.idleSeconds });
    }
  }

  private tick(): void {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.lastActivityTime) / 1000);
    const remainingSeconds = this.idleSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
      // Timeout reached: trigger screensaver / return to idle
      this.isWarningActive = false;
      this.lastActivityTime = now;
      this.notify('timeout', { isWarning: false, secondsRemaining: 0 });
    } else if (remainingSeconds <= this.warningSeconds) {
      // Warning phase reached: 10s countdown
      this.isWarningActive = true;
      this.notify('warning', { isWarning: true, secondsRemaining: remainingSeconds });
    }
  }

  private notify(event: IdleEvent, state: IdleState): void {
    for (const listener of this.listeners) {
      try {
        listener(event, state);
      } catch (e) {
        console.error('Error in idle timer listener:', e);
      }
    }
  }
}

export const idleTimer = new IdleTimerService();
