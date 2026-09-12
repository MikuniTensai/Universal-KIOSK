import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboardModal } from '../../src/features/admin/AdminDashboardModal';
import { AdminConsoleShell } from '../../src/features/admin/AdminConsoleShell';
import { WarehouseLayoutService } from '../../src/features/layout/warehouseLayoutService';

describe('Admin Panel Stock Submenu (Baru & Return) Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    WarehouseLayoutService.resetDefaults();
    vi.restoreAllMocks();
  });

  it('renders submenu container and items for Baru and Return in AdminConsoleShell', () => {
    const onTabChange = vi.fn();
    const { container } = render(
      <AdminConsoleShell
        activeTab="stock-baru"
        onTabChange={onTabChange}
        onLogout={vi.fn()}
        onRefresh={vi.fn()}
        standalone={true}
      >
        <div>Content</div>
      </AdminConsoleShell>
    );

    // Verify submenu wrapper exists
    const submenuWrapper = container.querySelector('.adms-menu-item-wrapper');
    expect(submenuWrapper).toBeInTheDocument();

    // Verify submenu container exists
    const submenu = container.querySelector('.adms-submenu');
    expect(submenu).toBeInTheDocument();

    // Verify sub-menu item "Baru" exists
    const baruBtn = screen.getByRole('menuitem', { name: /baru/i });
    expect(baruBtn).toBeInTheDocument();

    // Verify sub-menu item "Return" exists
    const returnBtn = screen.getByRole('menuitem', { name: /return/i });
    expect(returnBtn).toBeInTheDocument();

    // Click on "Return" sub-menu item
    fireEvent.click(returnBtn);
    expect(onTabChange).toHaveBeenCalledWith('stock-return');
  });

  it('navigates to Return catalog in AdminDashboardModal and provides 4 return status filters', () => {
    render(
      <AdminDashboardModal
        visible={true}
        onClose={vi.fn()}
        standalone={true}
        bypassPin={true}
        initialTab="stock-return"
      />
    );

    // Verify title/pill indicates Katalog Return
    expect(screen.getAllByText(/Katalog Return/i).length).toBeGreaterThanOrEqual(1);

    // Verify 4 status return filters exist
    expect(screen.getByRole('button', { name: /GARANSI/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PERBAIKAN/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /USUL HAPUS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /STANDBY/i })).toBeInTheDocument();

    // Verify Sub-Katalog Switcher button exists
    const katalogBaruPill = screen.getByRole('button', { name: /Katalog Baru/i });
    expect(katalogBaruPill).toBeInTheDocument();

    // Switch to Katalog Baru
    fireEvent.click(katalogBaruPill);
    expect(screen.getAllByText(/Katalog Baru/i).length).toBeGreaterThanOrEqual(1);
  });
});
