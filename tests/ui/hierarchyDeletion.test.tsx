import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WarehouseLayoutService } from '../../src/features/layout/warehouseLayoutService';
import { WarehouseLayoutView } from '../../src/features/layout/WarehouseLayoutView';
import { AdminDashboardModal } from '../../src/features/admin/AdminDashboardModal';
import { samplePlnPackage, defaultKioskConfig } from '../../src/data/mockPlnPackage';

describe('Warehouse Hierarchy Deletion Tests (Blok, Sub-Blok, Slot)', () => {
  beforeEach(() => {
    localStorage.clear();
    WarehouseLayoutService.resetDefaults();
  });

  it('allows deleting a custom block with confirmation modal in Admin Locations tab', () => {
    // Add custom block Z
    WarehouseLayoutService.addBlock({
      letter: 'Z',
      name: 'Zona Karantina Khusus',
      subBlockCount: 2,
      slotsPerSubBlock: 3,
    });

    render(
      <AdminDashboardModal
        visible={true}
        onClose={() => {}}
        standalone={true}
        bypassPin={true}
        initialTab="locations"
      />
    );

    // Check Blok Z is listed
    expect(screen.getByText('Zona Karantina Khusus')).toBeInTheDocument();

    // Click "Hapus Blok" for Blok Z
    const deleteBlockButtons = screen.getAllByRole('button', { name: /Hapus Blok/i });
    expect(deleteBlockButtons.length).toBeGreaterThan(0);

    // Find delete button specifically with title "Hapus Blok BLOK Z"
    const deleteZBtn = screen.getByTitle('Hapus Blok BLOK Z');
    fireEvent.click(deleteZBtn);

    // Confirmation modal should appear
    expect(screen.getByText('Konfirmasi Hapus Blok Gudang')).toBeInTheDocument();
    expect(screen.getByText(/Tindakan ini menghapus seluruh hirarki blok/i)).toBeInTheDocument();

    // Click confirm button: "Ya, Hapus Blok Ini"
    const confirmBtn = screen.getByRole('button', { name: /Ya, Hapus Blok Ini/i });
    fireEvent.click(confirmBtn);

    // Modal should close and success message should appear
    expect(screen.queryByText('Konfirmasi Hapus Blok Gudang')).not.toBeInTheDocument();
    expect(screen.getByText(/berhasil dihapus/i)).toBeInTheDocument();

    // Verify Blok Z is gone from service
    expect(WarehouseLayoutService.getBlocks().some(b => b.letter === 'Z')).toBe(false);
  });

  it('allows deleting a sub-block with confirmation modal in Admin Locations tab', () => {
    // Add sub-block A.4
    WarehouseLayoutService.addSubBlock('A', 4, 3);

    render(
      <AdminDashboardModal
        visible={true}
        onClose={() => {}}
        standalone={true}
        bypassPin={true}
        initialTab="locations"
      />
    );

    // Find delete button for Baris A.4
    const deleteA4Btn = screen.getByTitle('Hapus baris A.4');
    fireEvent.click(deleteA4Btn);

    // Confirmation modal should appear
    expect(screen.getByText('Konfirmasi Hapus Baris Sub-Blok')).toBeInTheDocument();
    expect(screen.getAllByText(/Baris A.4/i).length).toBeGreaterThan(0);

    // Click "Ya, Hapus Baris Ini"
    const confirmBtn = screen.getByRole('button', { name: /Ya, Hapus Baris Ini/i });
    fireEvent.click(confirmBtn);

    // Modal closes and sub-block is deleted
    expect(screen.queryByText('Konfirmasi Hapus Baris Sub-Blok')).not.toBeInTheDocument();
    const blokA = WarehouseLayoutService.getBlocks().find(b => b.letter === 'A');
    expect(blokA?.subBlocks.some(sb => sb.code === 'A.4')).toBe(false);
  });

  it('allows deleting an individual slot with confirmation modal in Admin Locations tab', () => {
    // Add extra slot A.1.6
    WarehouseLayoutService.addSlotToSubBlock('A.1', 'Slot Uji Khusus');

    render(
      <AdminDashboardModal
        visible={true}
        onClose={() => {}}
        standalone={true}
        bypassPin={true}
        initialTab="locations"
      />
    );

    // Find delete button for Slot A.1.6
    const deleteSlotBtn = screen.getByTitle('Hapus Slot A.1.6');
    fireEvent.click(deleteSlotBtn);

    // Confirmation modal should appear
    expect(screen.getByText('Konfirmasi Hapus Slot Rak')).toBeInTheDocument();
    expect(screen.getByText(/Slot: A.1.6/i)).toBeInTheDocument();

    // Click "Ya, Hapus Slot Ini"
    const confirmBtn = screen.getByRole('button', { name: /Ya, Hapus Slot Ini/i });
    fireEvent.click(confirmBtn);

    // Modal closes and slot is removed
    expect(screen.queryByText('Konfirmasi Hapus Slot Rak')).not.toBeInTheDocument();
    const blokA = WarehouseLayoutService.getBlocks().find(b => b.letter === 'A');
    const subA1 = blokA?.subBlocks.find(sb => sb.code === 'A.1');
    expect(subA1?.slots.some(s => s.code === 'A.1.6')).toBe(false);
  });

  it('allows deleting a slot from WarehouseLayoutView inspector', () => {
    // Add slot C.1.6 to Blok C
    WarehouseLayoutService.addSlotToSubBlock('C.1', 'Slot Uji C16');

    render(
      <WarehouseLayoutView
        pkg={samplePlnPackage}
        config={defaultKioskConfig}
        onBack={() => {}}
      />
    );

    // Click on Slot C.1.6
    const slotBtn = screen.getByRole('button', { name: /C\.1\.6/i });
    fireEvent.click(slotBtn);

    // Inspector card shows "SLOT TERPILIH: C.1.6"
    expect(screen.getByText(/SLOT TERPILIH: C\.1\.6/i)).toBeInTheDocument();

    // Click "Hapus Slot"
    const deleteSlotBtn = screen.getByRole('button', { name: /Hapus Slot/i });
    fireEvent.click(deleteSlotBtn);

    // Confirmation modal appears
    expect(screen.getByText('Konfirmasi Hapus Slot Rak')).toBeInTheDocument();

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: /Ya, Hapus Slot Ini/i });
    fireEvent.click(confirmBtn);

    // Modal closes and slot is deleted
    expect(screen.queryByText('Konfirmasi Hapus Slot Rak')).not.toBeInTheDocument();
    const blokC = WarehouseLayoutService.getBlocks().find(b => b.letter === 'C');
    const subC1 = blokC?.subBlocks.find(sb => sb.code === 'C.1');
    expect(subC1?.slots.some(s => s.code === 'C.1.6')).toBe(false);
  });
});
