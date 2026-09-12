import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboardModal } from '../../src/features/admin/AdminDashboardModal';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';
import { plnUp3MalangFullPackage } from '../../src/data/mockPlnPackage';

describe('AdminDashboardModal CSV Import Two-Way Protection UI Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    kioskStorage.activatePackage(plnUp3MalangFullPackage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Two-Way Protection badge and Target Scope selector in CSV Import Modal', async () => {
    render(
      <AdminDashboardModal
        visible={true}
        bypassPin={true}
        onClose={vi.fn()}
        onPackageUpdated={vi.fn()}
        initialTab="stock-return"
      />
    );

    // Buka dialog import dari header stok
    const importBtn = screen.getByRole('button', { name: /import csv \(katalog return\)/i });
    fireEvent.click(importBtn);

    // Modal Import CSV harus terbuka
    expect(screen.getByText(/Import & Replace Database Material/i)).toBeInTheDocument();

    // Verifikasi badge proteksi dua database terpisah aktif
    expect(screen.getByText(/2 Database Terpisah & Terisolasi/i)).toBeInTheDocument();

    // Verifikasi 4 tombol target database
    expect(screen.getByRole('button', { name: /database return database baru aman/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /database baru database return aman/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto \(deteksi csv\) otomatis pintar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kedua database master gabungan/i })).toBeInTheDocument();
  });

  it('displays two-way protection banner and isolates Database Return from Database Baru', async () => {
    const initialBaruCount = kioskStorage.getPackageBaru()?.materials.length || 0;
    expect(initialBaruCount).toBeGreaterThan(0);

    render(
      <AdminDashboardModal
        visible={true}
        bypassPin={true}
        onClose={vi.fn()}
        onPackageUpdated={vi.fn()}
        initialTab="stock-return"
      />
    );

    // Buka modal import
    const importBtn = screen.getByRole('button', { name: /import csv \(katalog return\)/i });
    fireEvent.click(importBtn);

    // Simulasikan upload file CSV Return
    const returnCsv = `No,Nama Material,Kode Normalisasi,Satuan,Stok,BLOK,RAK,SUB RAK,STATUS
1,BOX 105 KVA RETUR GARANSI,4120470,SET,4,C,-,,GARANSI
2,BOX 147 KVA RETUR PERBAIKAN,4120472,BH,2,C,-,,PERBAIKAN
`;

    const file = new File([returnCsv], 'export_material NEW RETUR.csv', { type: 'text/csv' });
    file.text = vi.fn().mockResolvedValue(returnCsv);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Tunggu banner proteksi muncul
    await waitFor(() => {
      expect(screen.getByText(/Terisolasi ke Database Return/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Harus tertera bahwa material aman tersimpan
    expect(screen.getByText(/100% aman tersimpan/i)).toBeInTheDocument();

    // Tombol konfirmasi harus bertuliskan Terapkan Katalog Return (Baru Tetap Aman)
    const applyBtn = screen.getByRole('button', { name: /terapkan katalog return \(baru tetap aman\)/i });
    expect(applyBtn).toBeInTheDocument();

    // Terapkan import
    fireEvent.click(applyBtn);

    // Modal tertutup dan verifikasi database Baru dan Return
    await waitFor(() => {
      const pkgBaru = kioskStorage.getPackageBaru();
      const pkgReturn = kioskStorage.getPackageReturn();

      // Database Baru sama sekali tidak berkurang/terhapus!
      expect(pkgBaru?.materials.length).toBe(initialBaruCount);
      // Database Return sekarang terisi material return baru!
      expect(pkgReturn?.materials.some(m => m.name.includes('BOX 105 KVA RETUR GARANSI'))).toBe(true);
      expect(pkgReturn?.materials.some(m => m.name.includes('BOX 147 KVA RETUR PERBAIKAN'))).toBe(true);

      // Active package gabungan juga memiliki keduanya
      const activePkg = kioskStorage.getActivePackage();
      expect(activePkg?.materials.some(m => m.condition !== 'RETURN')).toBe(true);
      expect(activePkg?.materials.some(m => m.name.includes('BOX 105 KVA RETUR GARANSI'))).toBe(true);
    });
  });
});

