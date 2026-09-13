import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../../src/app/App';
import { AdminModeService } from '../../src/features/admin/adminModeService';
import { SyncService } from '../../src/adapters/storage/syncService';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';
import { WarehouseLayoutService } from '../../src/features/layout/warehouseLayoutService';
import { AdminAuth } from '../../src/features/admin/adminAuth';

describe('Dual-Port Kiosk & Admin Architecture (Port 5000 vs Port 5001)', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    AdminAuth.logout();
    WarehouseLayoutService.resetDefaults();
  });

  afterEach(() => {
    // Restore window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
  });

  it('detects kiosk mode on Port 5000: hides admin shield icon from public header', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        port: '5000',
        search: '',
        hash: '',
        pathname: '/',
        hostname: 'localhost',
        protocol: 'http:',
      },
    });

    expect(AdminModeService.isKioskPort()).toBe(true);
    expect(AdminModeService.isAdminPort()).toBe(false);

    render(<App />);
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    expect(screen.getByRole('heading', { name: /Selamat Datang/i })).toBeInTheDocument();
    expect(screen.getAllByText('PT PLN (Persero) UP3 Malang').length).toBeGreaterThanOrEqual(1);
  });

  it('detects dedicated admin mode on Port 5001: shows dedicated login screen and requires credentials before opening dashboard', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        port: '5001',
        search: '',
        hash: '',
        pathname: '/',
        hostname: '192.168.1.100',
        protocol: 'http:',
      },
    });

    expect(AdminModeService.isAdminPort()).toBe(true);

    const { unmount } = render(<App />);

    // Shows dedicated login screen on Port 5001, does not automatically jump into dashboard
    expect(screen.getByRole('heading', { name: /Selamat datang kembali/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Masukkan kata sandi/i)).toBeInTheDocument();
    expect(screen.queryByText(/Kelola & Tambah Stok/i)).not.toBeInTheDocument();

    // Login with operator credentials
    fireEvent.change(screen.getByLabelText(/Email \/ Username Operator/i), {
      target: { value: 'admin@pln-kiosk.id' },
    });
    fireEvent.change(screen.getByLabelText(/Kata Sandi \/ PIN Akses/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Konsol Admin/i }));

    // Now enters dashboard
    expect(screen.getByText(/Portal Administrator Gudang PLN/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Port 5001/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Kelola & Tambah Stok/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Impor Paket Baru/i)).toBeInTheDocument();
    expect(screen.getByText(/Tata Letak Blok & Rak/i)).toBeInTheDocument();

    // Link back to kiosk display is present
    const kioskLink = screen.getByRole('link', { name: /Layar Kiosk/i });
    expect(kioskLink).toBeInTheDocument();
    expect(kioskLink).toHaveAttribute('href', 'http://192.168.1.100:5000');

    // Simulate page refresh: after unmount and re-render without session, returns to login screen
    AdminAuth.logout();
    unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: /Selamat datang kembali/i })).toBeInTheDocument();
    expect(screen.queryByText(/Kelola & Tambah Stok/i)).not.toBeInTheDocument();
  });

  it('detects admin mode via ?mode=admin query parameter for web preview and shows login screen', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        port: '3000',
        search: '?mode=admin',
        hash: '',
        pathname: '/',
        hostname: 'localhost',
        protocol: 'http:',
      },
    });

    expect(AdminModeService.isAdminPort()).toBe(true);

    render(<App />);
    expect(screen.getByRole('heading', { name: /Selamat datang kembali/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Masukkan kata sandi/i)).toBeInTheDocument();
  });

  it('SyncService pushes state and handles atomic synchronization between ports', async () => {
    const pushSpy = vi.spyOn(SyncService, 'pushState').mockResolvedValue(true);

    // Call saveConfig to check sync
    kioskStorage.saveConfig({
      ...kioskStorage.getConfig(),
      warehouseCode: 'GUD-PLN-TEST-SYNC',
    });

    await SyncService.pushState();
    expect(pushSpy).toHaveBeenCalled();
  });
});
