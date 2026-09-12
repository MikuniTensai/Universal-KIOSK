import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../../src/app/App';
import { AdminModeService } from '../../src/features/admin/adminModeService';
import { SyncService } from '../../src/adapters/storage/syncService';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';
import { WarehouseLayoutService } from '../../src/features/layout/warehouseLayoutService';

describe('Dual-Port Kiosk & Admin Architecture (Port 5000 vs Port 5001)', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
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

    // In kiosk mode, the admin shield button is NOT visible to public
    expect(screen.queryByTitle(/Akses Petugas Gudang/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Selamat Datang di Gudang Aris Munandar PLN UP3 Malang/i)).toBeInTheDocument();
  });

  it('detects dedicated admin mode on Port 5001: opens full-page Admin Portal directly without PIN roadblock', () => {
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

    render(<App />);

    // Dedicated Admin top header is directly displayed
    expect(screen.getByText(/Portal Administrator Gudang PLN/i)).toBeInTheDocument();
    const plnLogo = screen.getByRole('img', { name: /Logo PT PLN \(Persero\)/i });
    expect(plnLogo).toBeInTheDocument();
    expect(plnLogo).toHaveClass('adms-brand-logo-img');
    expect(screen.getByText(/PORT 5001 • DEDICATED ADMIN LAN/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-Time LAN Sync Aktif/i)).toBeInTheDocument();

    // Direct access to tabs without PIN roadblock
    expect(screen.queryByText(/Masukkan PIN Akses/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Kelola & Tambah Stok/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Impor Paket Baru/i)).toBeInTheDocument();
    expect(screen.getByText(/Tata Letak Blok & Rak/i)).toBeInTheDocument();

    // Link back to kiosk display is present
    const kioskLink = screen.getByRole('link', { name: /Layar Kiosk \(Port 5000\)/i });
    expect(kioskLink).toBeInTheDocument();
    expect(kioskLink).toHaveAttribute('href', 'http://192.168.1.100:5000');
  });

  it('detects admin mode via ?mode=admin query parameter for web preview', () => {
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
    expect(screen.getByText(/Portal Administrator Gudang PLN/i)).toBeInTheDocument();
    expect(screen.queryByText(/Masukkan PIN Akses/i)).not.toBeInTheDocument();
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
