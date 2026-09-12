import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../../src/app/App';
import { AdminAuth } from '../../src/features/admin/adminAuth';

describe('Universal-KIOSK UI End-to-End Navigation & Flow', () => {
  beforeEach(() => {
    AdminAuth.logout();
    window.localStorage.clear();
  });

  it('renders screensaver idle mode initially and wakes up to Home on touch', () => {
    render(<App />);

    // Screensaver is visible
    expect(screen.getByText(/SELAMAT DATANG DI GUDANG LOGISTIK PLN/i)).toBeInTheDocument();
    expect(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i)).toBeInTheDocument();

    // User touches screen
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Home Hub with 3 Modul Thumbnails is shown
    expect(screen.getByText(/Program Kerja Gudang PLN/i)).toBeInTheDocument();
    expect(screen.getByText(/Daftar Item & Material Gudang/i)).toBeInTheDocument();
    expect(screen.getByText(/Scan Item \(Cek Spesifikasi\)/i)).toBeInTheDocument();
  });

  it('navigates to Program Kerja and returns to Beranda', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Click Thumbnail A
    fireEvent.click(screen.getByText(/Program Kerja Gudang PLN/i));

    // Verify Program Kerja view
    expect(screen.getByText(/Program Kerja & Tata Kelola Logistik PLN/i)).toBeInTheDocument();
    expect(screen.getByText(/Visi & KPI Logistik/i)).toBeInTheDocument();

    // Click Beranda in header
    fireEvent.click(screen.getByRole('button', { name: /Beranda/i }));

    // Back at Home Hub
    expect(screen.getByText(/Daftar Item & Material Gudang/i)).toBeInTheDocument();
  });

  it('navigates to Daftar Item & Material, uses search and opens material detail modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Click Thumbnail B
    fireEvent.click(screen.getByText(/Daftar Item & Material Gudang/i));

    // Catalog view is displayed
    expect(screen.getByPlaceholderText(/Cari nama material/i)).toBeInTheDocument();

    // Check material items rendered
    expect(screen.getByText(/Transformator Distribusi 3 Fasa 100 kVA/i)).toBeInTheDocument();

    // Click on material card to open detail
    fireEvent.click(screen.getByText(/Transformator Distribusi 3 Fasa 100 kVA/i));

    // Detail modal shows SPLN specification and stock table
    expect(screen.getByText(/SPLN D3.002-1:2007/i)).toBeInTheDocument();
    expect(screen.getByText(/Lokasi Rak & Rincian Persediaan/i)).toBeInTheDocument();

    // Close detail modal
    fireEvent.click(screen.getByRole('button', { name: /Tutup/i }));
  });

  it('navigates to Scan Item, simulates barcode scan, and displays result', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Click Thumbnail C
    fireEvent.click(screen.getByText(/Scan Item \(Cek Spesifikasi\)/i));

    // Viewfinder standby screen
    expect(screen.getByText(/SIAGA MEMINDAI \(SCANNER READY\)/i)).toBeInTheDocument();

    // Click simulation button for Trafo 100kVA
    fireEvent.click(screen.getByText(/Trafo 100kVA \(PLN-TRF-100KVA-2026\)/i));

    // Result card appears
    expect(screen.getByText(/Hasil Pemindaian Barcode Material/i)).toBeInTheDocument();
    expect(screen.getByText(/Transformator Distribusi 3 Fasa 100 kVA/i)).toBeInTheDocument();
    expect(screen.getByText(/Posisi Rak & Alamat Lokasi Gudang/i)).toBeInTheDocument();
  });

  it('opens Admin panel with PIN authentication via emergency 5-tap gesture', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Admin button is hidden on public kiosk; emergency access is triggered via 5 taps on PLN logo
    expect(screen.queryByTitle(/Akses Petugas Gudang/i)).not.toBeInTheDocument();
    const plnLogo = screen.getByTitle(/PT PLN \(Persero\)/i);
    for (let i = 0; i < 5; i++) {
      fireEvent.click(plnLogo);
    }

    // PIN modal is displayed
    expect(screen.getByText(/Masukkan PIN Akses/i)).toBeInTheDocument();

    // Enter correct PIN: 123456
    ['1', '2', '3', '4', '5', '6'].forEach(digit => {
      fireEvent.click(screen.getByRole('button', { name: digit }));
    });

    // Admin dashboard is displayed
    expect(screen.getByText(/Panel Administrator Kiosk Gudang PLN/i)).toBeInTheDocument();
    expect(screen.getByText(/Impor Paket Baru/i)).toBeInTheDocument();
    expect(screen.getByText(/Riwayat & Restore/i)).toBeInTheDocument();
    expect(screen.getByText(/Pengaturan Kiosk/i)).toBeInTheDocument();
    expect(screen.getByText(/Kelola & Tambah Stok/i)).toBeInTheDocument();
    expect(screen.getByText(/Kelola Kategori/i)).toBeInTheDocument();
  });

  it('allows admin to add category, register material with barcode, and scans it dynamically from preset', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Open Admin via 5 taps on PLN logo
    const plnLogo = screen.getByTitle(/PT PLN \(Persero\)/i);
    for (let i = 0; i < 5; i++) {
      fireEvent.click(plnLogo);
    }
    ['1', '2', '3', '4', '5', '6'].forEach(digit => {
      fireEvent.click(screen.getByRole('button', { name: digit }));
    });

    // 1. Test Add Category Tab
    fireEvent.click(screen.getByText(/Kelola Kategori/i));
    const catInput = screen.getByPlaceholderText(/Kabel Tegangan Menengah, APD/i);
    fireEvent.change(catInput, { target: { value: 'Kabel Tanah 20kV' } });
    fireEvent.click(screen.getByRole('button', { name: /Tambah Kategori/i }));

    // Check newly added category is in list
    expect(screen.getByText('Kabel Tanah 20kV')).toBeInTheDocument();

    // 2. Test Add Material & Stock Tab
    fireEvent.click(screen.getByText(/Kelola & Tambah Stok/i));
    fireEvent.click(screen.getByRole('button', { name: /Tambah Material Baru & Barcode/i }));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/Contoh: 001999/i), { target: { value: '008899' } });
    fireEvent.change(screen.getByPlaceholderText(/Kabel Tegangan Menengah 20kV/i), { target: { value: 'Kabel SKTM 3x150mm' } });
    fireEvent.change(screen.getByPlaceholderText(/PLN-KBL-20KV-2026/i), { target: { value: 'PLN-SKTM-8899' } });

    fireEvent.click(screen.getByRole('button', { name: /Daftarkan Material & Barcode/i }));

    // Verify success banner is displayed in Admin modal
    expect(screen.getByText(/berhasil didaftarkan beserta barcode/i)).toBeInTheDocument();

    // Close Admin Panel
    fireEvent.click(screen.getByRole('button', { name: /Tutup Panel Administrator/i }));

    // 3. Navigate to Scan Item
    fireEvent.click(screen.getByText(/Scan Item \(Cek Spesifikasi\)/i));

    // Dynamic preset button should be rendered
    const dynamicPresetBtn = screen.getByRole('button', { name: /Kabel SKTM 3x150mm \(PLN-SKTM-8899\)/i });
    expect(dynamicPresetBtn).toBeInTheDocument();

    // Click the dynamic preset button to simulate scan
    fireEvent.click(dynamicPresetBtn);

    // Verify product result card displays newly added item and stock
    expect(screen.getByText(/Hasil Pemindaian Barcode Material/i)).toBeInTheDocument();
    expect(screen.getByText('Kabel SKTM 3x150mm')).toBeInTheDocument();
    expect(screen.getAllByText(/10 Unit/i).length).toBeGreaterThanOrEqual(1);
  });
});

