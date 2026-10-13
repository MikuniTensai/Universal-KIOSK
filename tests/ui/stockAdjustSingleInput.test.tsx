import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboardModal } from '../../src/features/admin/AdminDashboardModal';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';
import { WarehouseLayoutService } from '../../src/features/layout/warehouseLayoutService';

const totalQtyOf = (materialId: string) =>
  (kioskStorage.getActivePackage()?.stockSnapshots || [])
    .filter(s => s.materialId === materialId)
    .reduce((sum, s) => sum + (s.quantity || 0), 0);

describe('Pop-up Tambah / Sesuaikan Stok Material: satu input jumlah stok', () => {
  beforeEach(() => {
    localStorage.clear();
    WarehouseLayoutService.resetDefaults();
    vi.restoreAllMocks();
  });

  it('mengisi input dengan stok saat ini dan menyimpan angka yang diketik sebagai stok baru', () => {
    const material = kioskStorage.getPackageBaru().materials[0];
    const qtyBefore = totalQtyOf(material.id);
    const newQty = qtyBefore + 37;

    render(
      <AdminDashboardModal visible={true} bypassPin={true} onClose={vi.fn()} onPackageUpdated={vi.fn()} />
    );

    fireEvent.click(screen.getByTitle(`Sesuaikan stok dan edit katalog ${material.name}`));

    expect(screen.queryByText(/Stok Masuk \(IN\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Stok Keluar \(OUT\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Pilih Operasi Mutasi Stok/i)).not.toBeInTheDocument();

    const qtyInput = screen.getByLabelText(/Jumlah Stok/i) as HTMLInputElement;
    expect(qtyInput.value).toBe(String(qtyBefore));

    fireEvent.change(qtyInput, { target: { value: String(newQty) } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Perubahan Katalog & Stok/i }));

    expect(totalQtyOf(material.id)).toBe(newQty);
  });

  it('menolak simpan saat jumlah stok negatif dan stok tidak berubah', () => {
    const material = kioskStorage.getPackageBaru().materials[0];
    const qtyBefore = totalQtyOf(material.id);

    render(
      <AdminDashboardModal visible={true} bypassPin={true} onClose={vi.fn()} onPackageUpdated={vi.fn()} />
    );

    fireEvent.click(screen.getByTitle(`Sesuaikan stok dan edit katalog ${material.name}`));
    const qtyInput = screen.getByLabelText(/Jumlah Stok/i) as HTMLInputElement;
    fireEvent.change(qtyInput, { target: { value: '-5' } });
    // fireEvent.submit melewati validasi min={0} bawaan browser, jadi validasi di handler ikut teruji.
    fireEvent.submit(qtyInput.form!);

    expect(screen.getByText('Jumlah stok tidak boleh negatif.')).toBeInTheDocument();
    expect(totalQtyOf(material.id)).toBe(qtyBefore);
  });
});
