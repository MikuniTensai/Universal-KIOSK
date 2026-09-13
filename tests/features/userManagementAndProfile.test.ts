import { describe, it, expect, beforeEach } from 'vitest';
import { UserManagementService } from '../../src/features/admin/userManagementService';
import { AdminAuth } from '../../src/features/admin/adminAuth';

describe('UserManagementService & Profile Password Management (Spatie Authorization)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes default superadmin with Spatie wildcard (*) permission', () => {
    const users = UserManagementService.getUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);

    const defaultAdmin = users.find((u) => u.email === 'admin@pln-kiosk.id');
    expect(defaultAdmin).toBeDefined();
    expect(defaultAdmin?.permissions).toContain('*');
    expect(UserManagementService.hasPermission(defaultAdmin, 'settings.manage')).toBe(true);
    expect(UserManagementService.hasPermission(defaultAdmin, 'stock.manage')).toBe(true);
  });

  it('allows adding a new user with Spatie wildcard (*) - bisa akses kemana saja', () => {
    const result = UserManagementService.addUser({
      name: 'Rian Pratama',
      email: 'rian@pln-kiosk.id',
      password: 'password123',
      role: 'Super Administrator',
      permissions: ['*'], // Wildcard: bisa akses kemana saja
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.permissions).toEqual(['*']);

    // Check wildcard access to various modules
    expect(UserManagementService.hasPermission(result.user, 'dashboard.view')).toBe(true);
    expect(UserManagementService.hasPermission(result.user, 'stock.manage')).toBe(true);
    expect(UserManagementService.hasPermission(result.user, 'categories.manage')).toBe(true);
    expect(UserManagementService.hasPermission(result.user, 'locations.manage')).toBe(true);
    expect(UserManagementService.hasPermission(result.user, 'import.manage')).toBe(true);
    expect(UserManagementService.hasPermission(result.user, 'users.manage')).toBe(true);

    // Can authenticate with the new user credentials
    const authRes = UserManagementService.authenticate('rian@pln-kiosk.id', 'password123');
    expect(authRes.success).toBe(true);
    expect(authRes.user?.name).toBe('Rian Pratama');
  });

  it('allows adding a restricted modular user and enforces fine-grained permissions', () => {
    const result = UserManagementService.addUser({
      name: 'Siti Aminah',
      email: 'siti@pln-kiosk.id',
      password: 'secret456',
      role: 'Operator Gudang',
      permissions: ['stock.view', 'stock.manage'],
    });

    expect(result.success).toBe(true);
    const user = result.user;

    expect(UserManagementService.hasPermission(user, 'stock.view')).toBe(true);
    expect(UserManagementService.hasPermission(user, 'stock.manage')).toBe(true);
    expect(UserManagementService.hasPermission(user, 'settings.manage')).toBe(false);
    expect(UserManagementService.hasPermission(user, 'users.manage')).toBe(false);
  });

  it('allows updating password from profile and authenticates with new password', () => {
    // 1. Initial auth works with default password
    const initialAuth = UserManagementService.authenticate('admin@pln-kiosk.id', '123456');
    expect(initialAuth.success).toBe(true);

    // 2. Update password in profile menu
    const updateRes = UserManagementService.updatePassword(
      'admin@pln-kiosk.id',
      '123456',
      'NewSecurePassword2026!'
    );
    expect(updateRes.success).toBe(true);

    // 3. Old password should now fail
    const oldAuth = UserManagementService.authenticate('admin@pln-kiosk.id', '123456');
    expect(oldAuth.success).toBe(false);

    // 4. New password succeeds
    const newAuth = UserManagementService.authenticate('admin@pln-kiosk.id', 'NewSecurePassword2026!');
    expect(newAuth.success).toBe(true);
    expect(newAuth.user?.email).toBe('admin@pln-kiosk.id');

    // 5. AdminAuth integration works
    const adminAuthRes = AdminAuth.authenticateCredentials('admin@pln-kiosk.id', 'NewSecurePassword2026!');
    expect(adminAuthRes).toBe(true);
  });

  it('prevents updating password if current password is incorrect', () => {
    const updateRes = UserManagementService.updatePassword(
      'admin@pln-kiosk.id',
      'wrong-password',
      'newPass'
    );
    expect(updateRes.success).toBe(false);
    expect(updateRes.error).toContain('tidak sesuai');
  });

  it('protects main super administrator from accidental deletion', () => {
    const users = UserManagementService.getUsers();
    const mainAdmin = users.find((u) => u.email === 'admin@pln-kiosk.id')!;

    const delRes = UserManagementService.deleteUser(mainAdmin.id);
    expect(delRes.success).toBe(false);
    expect(delRes.error).toContain('dilindungi');
  });
});
