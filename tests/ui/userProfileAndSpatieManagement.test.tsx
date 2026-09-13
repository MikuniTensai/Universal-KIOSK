import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboardModal } from '../../src/features/admin/AdminDashboardModal';
import { UserManagementService } from '../../src/features/admin/userManagementService';

describe('Admin Console: Profile & Spatie User Management UI Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders Profile tab, changes password, and verifies new password is saved', () => {
    render(
      <AdminDashboardModal
        visible={true}
        onClose={vi.fn()}
        bypassPin={true}
        initialTab="profile"
      />
    );

    // Profile heading and account info are visible
    expect(screen.getByText(/Ubah Kata Sandi Akun/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi Saat Ini/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Kata Sandi Baru/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Konfirmasi Kata Sandi Baru/i)).toBeInTheDocument();

    // Fill in password change form
    fireEvent.change(screen.getByLabelText(/Kata Sandi Saat Ini/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText(/^Kata Sandi Baru/i), {
      target: { value: 'NewAdminSecret2026' },
    });
    fireEvent.change(screen.getByLabelText(/Konfirmasi Kata Sandi Baru/i), {
      target: { value: 'NewAdminSecret2026' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Simpan Kata Sandi Baru/i }));

    // Success banner is displayed
    expect(screen.getByText(/Kata sandi berhasil diperbarui!/i)).toBeInTheDocument();

    // Verify user can now authenticate with new password
    const authRes = UserManagementService.authenticate('admin@pln-kiosk.id', 'NewAdminSecret2026');
    expect(authRes.success).toBe(true);
  });

  it('renders Users tab with Spatie wildcard permissions and adds user with access everywhere', () => {
    render(
      <AdminDashboardModal
        visible={true}
        onClose={vi.fn()}
        bypassPin={true}
        initialTab="users"
      />
    );

    // Users tab header and Spatie wildcard notice
    expect(screen.getByText(/Manajemen Pengguna & Otorisasi Spatie/i)).toBeInTheDocument();
    expect(screen.getByText(/Bisa Akses Kemana Saja \(\*\)/i)).toBeInTheDocument();

    // Open Add User modal
    fireEvent.click(screen.getByRole('button', { name: /Tambah Pengguna \(Add User\)/i }));

    // Modal is opened
    expect(screen.getByText(/Tambah Pengguna Baru \(Spatie\)/i)).toBeInTheDocument();

    // Fill new user form
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Budi Santoso/i), {
      target: { value: 'Ahmad Fauzi' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contoh: budi@pln-kiosk.id/i), {
      target: { value: 'ahmad@pln-kiosk.id' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Minimal 4 karakter/i), {
      target: { value: 'fauzi2026' },
    });

    // Verify Wildcard * is checked by default (bisa akses kemana saja)
    const wildcardCheckbox = screen.getByRole('checkbox', {
      name: /Bisa Akses Kemana Saja \(Wildcard `\*`\)/i,
    });
    expect(wildcardCheckbox).toBeChecked();

    // Submit new user
    fireEvent.click(screen.getByRole('button', { name: /Simpan & Daftarkan Pengguna/i }));

    // Success notification is displayed
    expect(screen.getByText(/berhasil ditambahkan dengan akses Spatie Wildcard/i)).toBeInTheDocument();

    // Newly added user is in table with Spatie wildcard
    expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
    expect(screen.getByText('ahmad@pln-kiosk.id')).toBeInTheDocument();

    // Authenticate with the new user
    const authRes = UserManagementService.authenticate('ahmad@pln-kiosk.id', 'fauzi2026');
    expect(authRes.success).toBe(true);
    expect(UserManagementService.hasPermission(authRes.user, 'settings.manage')).toBe(true);
  });
});
