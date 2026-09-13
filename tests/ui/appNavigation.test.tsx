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
    expect(screen.getByText('SELAMAT DATANG')).toBeInTheDocument();
    expect(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i)).toBeInTheDocument();

    // User touches screen
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Home Hub with 4 Modul Thumbnails is shown (Katalog Baru, Return, SOP, Layout)
    expect(screen.getByText(/Program Kerja Gudang PLN/i)).toBeInTheDocument();
    expect(screen.getByText(/Daftar Item & Material Gudang \(Katalog Blok & Rak Baru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Daftar Item & Material Gudang \(Katalog Blok & Rak Return\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Scan Item \(Cek Spesifikasi\)/i)).toBeInTheDocument();
  });

  it('navigates to Program Kerja and returns to Beranda', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Click Thumbnail A
    fireEvent.click(screen.getByText(/Program Kerja Gudang PLN/i));

    // Verify SOP view
    expect(screen.getByRole('heading', { level: 2, name: 'SOP' })).toBeInTheDocument();
    expect(screen.getByText(/Standar 5S Pergudangan/i)).toBeInTheDocument();

    // Click Beranda in header
    fireEvent.click(screen.getByRole('button', { name: /Beranda/i }));

    // Back at Home Hub
    expect(screen.getByText(/Daftar Item & Material Gudang \(Katalog Blok & Rak Baru\)/i)).toBeInTheDocument();
  });

  it('navigates to Daftar Item & Material, uses search and opens material detail modal', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));

    // Click Thumbnail Baru
    fireEvent.click(screen.getByText(/Daftar Item & Material Gudang \(Katalog Blok & Rak Baru\)/i));

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

    // Login form is displayed (direct credentials input)
    expect(screen.getByLabelText(/Email \/ Username Operator/i)).toBeInTheDocument();

    // Client inputs credentials manually
    fireEvent.change(screen.getByLabelText(/Email \/ Username Operator/i), {
      target: { value: 'admin@pln-kiosk.id' },
    });
    fireEvent.change(screen.getByLabelText(/Kata Sandi \/ PIN Akses/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Konsol Admin/i }));

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
    fireEvent.change(screen.getByLabelText(/Email \/ Username Operator/i), {
      target: { value: 'admin@pln-kiosk.id' },
    });
    fireEvent.change(screen.getByLabelText(/Kata Sandi \/ PIN Akses/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Konsol Admin/i }));

    // 1. Test Add Category Tab
    fireEvent.click(screen.getAllByText(/Kelola Kategori/i)[0]);
    const catInput = screen.getByPlaceholderText(/Kabel Tegangan Menengah, APD/i);
    fireEvent.change(catInput, { target: { value: 'Kabel Tanah 20kV' } });
    fireEvent.click(screen.getByRole('button', { name: /Tambah Kategori/i }));

    // Check newly added category is in list
    expect(screen.getByText('Kabel Tanah 20kV')).toBeInTheDocument();

    // 2. Test Add Material & Stock Tab
    fireEvent.click(screen.getAllByText(/Kelola & Tambah Stok/i)[0]);
    fireEvent.click(screen.getByRole('button', { name: /Tambah Material Baru/i }));

    // Fill simplified form: nama material, stok, rak, sub rak
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Kabel XLPE 20kV/i), { target: { value: 'Kabel SKTM 3x150mm' } });
    fireEvent.change(screen.getByPlaceholderText(/Contoh: 10/i), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Rak A-01/i), { target: { value: 'Rak A-02' } });
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Sub Rak 01/i), { target: { value: 'Sub Rak 2' } });

    fireEvent.click(screen.getByRole('button', { name: /Daftarkan Material/i }));

    // Verify success banner is displayed in Admin modal
    expect(screen.getByText(/berhasil didaftarkan/i)).toBeInTheDocument();

    // Close Admin Panel
    fireEvent.click(screen.getByRole('button', { name: /Tutup Panel Administrator/i }));

    // 3. Navigate to Scan Item
    fireEvent.click(screen.getByText(/Scan Item \(Cek Spesifikasi\)/i));

    // Dynamic preset button should be rendered
    const dynamicPresetBtn = screen.getByRole('button', { name: /Kabel SKTM 3x150mm/i });
    expect(dynamicPresetBtn).toBeInTheDocument();

    // Click the dynamic preset button to simulate scan
    fireEvent.click(dynamicPresetBtn);

    // Verify product result card displays newly added item and stock
    expect(screen.getByText(/Hasil Pemindaian Barcode Material/i)).toBeInTheDocument();
    expect(screen.getByText('Kabel SKTM 3x150mm')).toBeInTheDocument();
    expect(screen.getAllByText(/10 Unit/i).length).toBeGreaterThanOrEqual(1);
  });
});

