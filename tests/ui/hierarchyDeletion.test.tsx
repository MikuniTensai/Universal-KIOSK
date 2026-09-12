import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('renders official printed blueprint and interactive controls in WarehouseLayoutView', () => {
    const handleBack = vi.fn();
    const handleSelectRack = vi.fn();

    render(
      <WarehouseLayoutView
        pkg={samplePlnPackage}
        config={defaultKioskConfig}
        onBack={handleBack}
        onSelectRack={handleSelectRack}
      />
    );

    // Verify title and official document badge
    expect(screen.getByText(/Denah & Tata Letak Gudang/i)).toBeInTheDocument();
    expect(screen.getByText(/DOKUMEN RESMI TATA LETAK/i)).toBeInTheDocument();
    expect(screen.getAllByText(/GUDANG ARIS MUNANDAR/i).length).toBeGreaterThanOrEqual(1);

    // Verify blueprint image is rendered
    const blueprintImg = screen.getByAltText(/Denah dan Tata Letak Gudang Aris Munandar/i);
    expect(blueprintImg).toBeInTheDocument();

    // Verify Zoom In / Zoom Out controls
    const zoomInBtn = screen.getByRole('button', { name: /Perbesar Denah/i });
    expect(zoomInBtn).toBeInTheDocument();
    fireEvent.click(zoomInBtn);

    // Verify zoom scale text reflects increment (125%)
    expect(screen.getByText('125%')).toBeInTheDocument();

    // Verify back button calls onBack
    const backBtn = screen.getByRole('button', { name: /Kembali/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
