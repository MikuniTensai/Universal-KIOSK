import { UserManagementService, AdminUser } from './userManagementService';

/**
 * Admin authentication and session management for warehouse petugas / administrator
 */
export class AdminAuth {
  private static readonly DEFAULT_PIN = '123456';
  private static activeSessionUntil: number | null = null;
  private static currentSessionUser: AdminUser | null = null;
  private static readonly SESSION_DURATION_MS = 15 * 60 * 1000; // 15 menit

  public static authenticate(pin: string): boolean {
    if (pin === this.DEFAULT_PIN) {
      this.activeSessionUntil = Date.now() + this.SESSION_DURATION_MS;
      this.currentSessionUser = UserManagementService.getUsers().find(u => u.permissions.includes('*')) || null;
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
    this.currentSessionUser = null;
  }

  public static authenticateCredentials(identifier: string, secret: string): boolean {
    // 1. Check UserManagementService (Spatie-style users)
    const result = UserManagementService.authenticate(identifier, secret);
    if (result.success && result.user) {
      this.activeSessionUntil = Date.now() + this.SESSION_DURATION_MS;
      this.currentSessionUser = result.user;
      return true;
    }

    // 2. Fallback legacy / PIN check
    if (
      secret === this.DEFAULT_PIN ||
      secret === 'pln2026' ||
      secret === 'adms2026' ||
      secret === 'admin' ||
      secret === '123456'
    ) {
      this.activeSessionUntil = Date.now() + this.SESSION_DURATION_MS;
      this.currentSessionUser = UserManagementService.getUsers().find(u => u.permissions.includes('*')) || null;
      return true;
    }
    return this.authenticate(secret);
  }

  public static getCurrentUser() {
    if (this.currentSessionUser) {
      return {
        name: this.currentSessionUser.name,
        role: this.currentSessionUser.role,
        email: this.currentSessionUser.email,
        permissions: this.currentSessionUser.permissions,
      };
    }
    const defaultSuper = UserManagementService.getUsers().find(u => u.permissions.includes('*'));
    return {
      name: defaultSuper?.name || 'Administrator Gudang PLN',
      role: defaultSuper?.role || 'Super Administrator',
      email: defaultSuper?.email || 'admin@pln-kiosk.id',
      permissions: defaultSuper?.permissions || ['*'],
    };
  }

  public static refreshSession(): void {
    if (this.isAuthenticated()) {
      this.activeSessionUntil = Date.now() + this.SESSION_DURATION_MS;
    }
  }
}
