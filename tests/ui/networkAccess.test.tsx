import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NetworkService } from '../../src/features/network/networkService';
import { NetworkAccessModal } from '../../src/features/network/NetworkAccessModal';
import { NetworkInfoCard } from '../../src/features/network/NetworkInfoCard';
import { NetworkQrCode } from '../../src/features/network/NetworkQrCode';
import { Header } from '../../src/shared/ui/Header';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';

describe('WiFi LAN Dynamic IP Detection & Network Access Guide', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('NetworkService: fetches dynamic IP and adapts when WiFi IP changes (e.g. 0.29 to 0.43)', async () => {
    // 1. Mock first IP response: 192.168.0.29
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        primaryIp: '192.168.0.29',
        isDynamic: true,
        hostname: 'Kassen-WK215-PLN',
        kioskPort: 5000,
        adminPort: 5001,
        adminUrl: 'http://192.168.0.29:5001',
        kioskUrl: 'http://192.168.0.29:5000',
        interfaces: [
          {
            name: 'wlan0',
            type: 'wifi',
            address: '192.168.0.29',
            adminUrl: 'http://192.168.0.29:5001',
            kioskUrl: 'http://192.168.0.29:5000',
            isPrimary: true,
          },
        ],
        allIps: ['192.168.0.29'],
        serverTime: new Date().toISOString(),
      }),
    });

    const info1 = await NetworkService.fetchNetworkInfo();
    expect(info1.primaryIp).toBe('192.168.0.29');
    expect(info1.adminUrl).toBe('http://192.168.0.29:5001');

    // 2. Mock DHCP IP change: router assigns new IP 192.168.0.43
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        primaryIp: '192.168.0.43',
        isDynamic: true,
        hostname: 'Kassen-WK215-PLN',
        kioskPort: 5000,
        adminPort: 5001,
        adminUrl: 'http://192.168.0.43:5001',
        kioskUrl: 'http://192.168.0.43:5000',
        interfaces: [
          {
            name: 'wlan0',
            type: 'wifi',
            address: '192.168.0.43',
            adminUrl: 'http://192.168.0.43:5001',
            kioskUrl: 'http://192.168.0.43:5000',
            isPrimary: true,
          },
        ],
        allIps: ['192.168.0.43'],
        serverTime: new Date().toISOString(),
      }),
    });

    const info2 = await NetworkService.fetchNetworkInfo();
    expect(info2.primaryIp).toBe('192.168.0.43');
    expect(info2.adminUrl).toBe('http://192.168.0.43:5001');
    expect(info2.kioskUrl).toBe('http://192.168.0.43:5000');
  });

  it('NetworkQrCode: generates valid SVG QR code for given IP address URL', async () => {
    const testUrl = 'http://192.168.0.43:5001';
    const { container } = render(<NetworkQrCode url={testUrl} size={150} />);

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('NetworkAccessModal: renders dynamic IP info, admin & kiosk access cards, and step instructions', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        primaryIp: '192.168.0.43',
        isDynamic: true,
        hostname: 'Kassen-WK215-PLN',
        kioskPort: 5000,
        adminPort: 5001,
        adminUrl: 'http://192.168.0.43:5001',
        kioskUrl: 'http://192.168.0.43:5000',
        interfaces: [
          {
            name: 'wlan0',
            type: 'wifi',
            address: '192.168.0.43',
            adminUrl: 'http://192.168.0.43:5001',
            kioskUrl: 'http://192.168.0.43:5000',
            isPrimary: true,
          },
        ],
        allIps: ['192.168.0.43'],
        serverTime: new Date().toISOString(),
      }),
    });

    const handleClose = vi.fn();
    render(<NetworkAccessModal visible={true} onClose={handleClose} />);

    // Header & title
    expect(screen.getByText(/Panduan Akses Panel Admin & Kiosk via WiFi/i)).toBeInTheDocument();

    // Active IP address
    await waitFor(() => {
      expect(screen.getAllByText('192.168.0.43').length).toBeGreaterThanOrEqual(1);
    });

    // Admin card with Port 5001 & Kiosk card with Port 5000
    expect(screen.getByText(/Portal Administrator Mandiri/i)).toBeInTheDocument();
    expect(screen.getByText(/Layar Kiosk Publik/i)).toBeInTheDocument();
    expect(screen.getAllByText('http://192.168.0.43:5001').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('http://192.168.0.43:5000').length).toBeGreaterThanOrEqual(1);

    // Step by step guide
    expect(screen.getByText(/WiFi Harus Sama/i)).toBeInTheDocument();
    expect(screen.getByText(/Buka Browser \/ Scan/i)).toBeInTheDocument();
    expect(screen.getByText(/IP Dinamis Otomatis/i)).toBeInTheDocument();

    // Close button
    fireEvent.click(screen.getByText(/Tutup Informasi/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('NetworkInfoCard: displays current admin URL and toggles QR preview on demand', async () => {
    const handleOpenFull = vi.fn();
    render(<NetworkInfoCard onOpenFullModal={handleOpenFull} />);

    expect(screen.getByText(/Akses Remote Panel Admin via WiFi Lokal/i)).toBeInTheDocument();

    // Click "Tampilkan QR" button
    const toggleQrBtn = screen.getByText(/Tampilkan QR/i);
    fireEvent.click(toggleQrBtn);

    // QR preview should now be visible
    expect(screen.getByText(/Scan QR dengan Kamera HP Petugas/i)).toBeInTheDocument();

    // Click link to open full modal
    const fullModalLink = screen.getByText(/Panduan Lengkap →/i);
    fireEvent.click(fullModalLink);
    expect(handleOpenFull).toHaveBeenCalledTimes(1);
  });

  it('Header: renders WiFi network info button and triggers modal open callback on click', () => {
    const config = kioskStorage.getConfig();
    const handleOpenNetwork = vi.fn();

    render(
      <Header
        config={config}
        currentRoute="home"
        onNavigate={() => {}}
        onOpenAdmin={() => {}}
        onOpenNetwork={handleOpenNetwork}
      />
    );

    const wifiBtn = screen.getByTitle(/Informasi Akses WiFi & Panel Admin/i);
    expect(wifiBtn).toBeInTheDocument();

    fireEvent.click(wifiBtn);
    expect(handleOpenNetwork).toHaveBeenCalledTimes(1);
  });
});
