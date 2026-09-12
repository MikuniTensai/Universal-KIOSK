/**
 * Admin authentication and session management for warehouse petugas / administrator
 */
export class AdminAuth {
  private static readonly DEFAULT_PIN = '123456';
  private static activeSessionUntil: number | null = null;
  private static readonly SESSION_DURATION_MS = 15 * 60 * 1000; // 15 menit

  public static authenticate(pin: string): boolean {
    if (pin === this.DEFAULT_PIN) {
      this.activeSessionUntil = Date.now() + this.SESSION_DURATION_MS;
      return true;
    }
    return false;
  }

  public static isAuthenticated(): boolean {
    if (!this.activeSessionUntil) return false;
    if (Date.now() > this.activeSessionUntil) {
      this.logout();
      return false;
    }
    return true;
  }

  public static logout(): void {
    this.activeSessionUntil = null;
  }

  public static refreshSession(): void {
    if (this.isAuthenticated()) {
      this.activeSessionUntil = Date.now() + this.SESSION_DURATION_MS;
    }
  }
}
