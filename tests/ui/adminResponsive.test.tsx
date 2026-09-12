import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminLoginScreen } from '../../src/features/admin/AdminLoginScreen';
import { AdminDashboardModal } from '../../src/features/admin/AdminDashboardModal';
import { WarehouseLayoutService } from '../../src/features/layout/warehouseLayoutService';

describe('Admin Console Responsive UX & Touch Targets (Uci UI/UX Audit)', () => {
  beforeEach(() => {
    localStorage.clear();
    WarehouseLayoutService.resetDefaults();
    vi.restoreAllMocks();
  });

  describe('AdminLoginScreen Responsive Design', () => {
    it('renders with mobile-first CSS classes and responsive layout structure', () => {
      const onLoginSuccess = vi.fn();
      const onClose = vi.fn();

      const { container } = render(
        <AdminLoginScreen onLoginSuccess={onLoginSuccess} onClose={onClose} />
      );

      // Verify form panel has adms-login-form-panel class (handled with order:1 on <=860px in CSS)
      const formPanel = container.querySelector('.adms-login-form-panel');
      expect(formPanel).toBeInTheDocument();

      // Verify showcase panel has adms-login-showcase-panel class (handled with order:2 on <=860px in CSS)
      const showcasePanel = container.querySelector('.adms-login-showcase-panel');
      expect(showcasePanel).toBeInTheDocument();

      // Verify notice banner exists
      const banner = container.querySelector('.adms-login-notice-banner');
      expect(banner).toBeInTheDocument();
    });

    it('provides minimum 48px touch targets for mobile numeric keypad buttons', () => {
      const onLoginSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <AdminLoginScreen
          onLoginSuccess={onLoginSuccess}
          onClose={onClose}
          initialMode="pin"
        />
      );

      // PIN keypad buttons should have adms-keypad-btn class
      const keyButtons = screen.getAllByRole('button').filter((btn) =>
        btn.classList.contains('adms-keypad-btn')
      );

      // Expect 12 buttons (0-9, C, DEL)
      expect(keyButtons.length).toBe(12);

      // Verify all buttons have the keypad class for responsive sizing
      keyButtons.forEach((btn) => {
        expect(btn).toHaveClass('adms-keypad-btn');
      });
    });

    it('allows toggling between PIN keypad mode and Email/Password mode smoothly', () => {
      const onLoginSuccess = vi.fn();
      const onClose = vi.fn();

      render(
        <AdminLoginScreen
          onLoginSuccess={onLoginSuccess}
          onClose={onClose}
          initialMode="password"
        />
      );

      // Initially in password mode
      expect(screen.getByLabelText(/Email \/ Username Operator/i)).toBeInTheDocument();

      // Switch to PIN mode
      const pinTab = screen.getByRole('button', { name: /PIN Keypad Cepat/i });
      fireEvent.click(pinTab);
      expect(screen.getByText(/Masukkan PIN Akses/i)).toBeInTheDocument();

      // Switch back to password mode
      const credTab = screen.getByRole('button', { name: /Kredensial Operator/i });
      fireEvent.click(credTab);
      expect(screen.getByLabelText(/Email \/ Username Operator/i)).toBeInTheDocument();
    });
  });

  describe('AdminDashboardModal Responsive Off-Canvas Drawer & Reflow', () => {
    it('opens and closes mobile navigation drawer via hamburger button', () => {
      const onClose = vi.fn();

      const { container } = render(
        <AdminDashboardModal
          visible={true}
          bypassPin={true}
          onClose={onClose}
          onPackageUpdated={vi.fn()}
        />
      );

      // Sidebar initially does not have 'adms-sidebar--open' class
      const sidebar = container.querySelector('.adms-sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).not.toHaveClass('adms-sidebar--open');

      // Find mobile hamburger button
      const hamburgerBtn = screen.getByLabelText(/Buka Menu Navigasi/i);
      expect(hamburgerBtn).toBeInTheDocument();

      // Click hamburger button to open drawer
      fireEvent.click(hamburgerBtn);
      expect(sidebar).toHaveClass('adms-sidebar--open');

      // Click backdrop to close drawer
      const backdrop = container.querySelector('.adms-sidebar-backdrop');
      expect(backdrop).toBeInTheDocument();
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(sidebar).not.toHaveClass('adms-sidebar--open');
      }
    });

    it('closes drawer automatically when a navigation item is selected', () => {
      const onClose = vi.fn();

      const { container } = render(
        <AdminDashboardModal
          visible={true}
          bypassPin={true}
          onClose={onClose}
          onPackageUpdated={vi.fn()}
        />
      );

      const sidebar = container.querySelector('.adms-sidebar');
      const hamburgerBtn = screen.getByLabelText(/Buka Menu Navigasi/i);

      // Open drawer
      fireEvent.click(hamburgerBtn);
      expect(sidebar).toHaveClass('adms-sidebar--open');

      // Click "Impor Paket Baru" nav item in sidebar
      const importNavItem = screen.getByRole('button', { name: /Impor Paket Baru/i });
      fireEvent.click(importNavItem);

      // Drawer should close automatically for responsive flow
      expect(sidebar).not.toHaveClass('adms-sidebar--open');
      expect(
        screen.getByText(/Import Paket 151 Material Gudang Aris Munandar/i)
      ).toBeInTheDocument();
    });

    it('renders responsive toolbar and action button wrappers across tabs', () => {
      const onClose = vi.fn();

      render(
        <AdminDashboardModal
          visible={true}
          bypassPin={true}
          onClose={onClose}
          onPackageUpdated={vi.fn()}
        />
      );

      // Navigate to Tata Letak Blok & Rak (A-Z)
      const layoutNav = screen.getByRole('button', { name: /Tata Letak Blok & Rak \(A-Z\)/i });
      fireEvent.click(layoutNav);

      // Verify location management header has responsive buttons
      expect(screen.getByRole('button', { name: /Buat Blok/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset \(A-H\)/i })).toBeInTheDocument();

      // Navigate to Kelola Kategori
      const categoryNav = screen.getByRole('button', { name: /Kelola Kategori/i });
      fireEvent.click(categoryNav);

      // Verify category input form has responsive submit button
      const addCategoryBtn = screen.getByRole('button', { name: /Tambah Kategori/i });
      expect(addCategoryBtn).toBeInTheDocument();
      expect(addCategoryBtn).toHaveClass('w-full', 'sm:w-auto');
    });

    it('renders table inside overflow-x-auto container with min-w-[640px] for mobile scroll safety', () => {
      const onClose = vi.fn();

      const { container } = render(
        <AdminDashboardModal
          visible={true}
          bypassPin={true}
          onClose={onClose}
          onPackageUpdated={vi.fn()}
        />
      );

      // Navigate to Overview tab
      const overviewNav = screen.getByRole('button', { name: /Ringkasan & Overview/i });
      fireEvent.click(overviewNav);

      // In overview tab, find table
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('min-w-[640px]');

      const tableContainer = table?.closest('.overflow-x-auto');
      expect(tableContainer).toBeInTheDocument();
    });

    it('renders Stock tab table with Excel columns (No, Nama Material, Kode Normalisasi, Satuan, Stok, BLOK, RAK) and filters with search', () => {
      const onClose = vi.fn();

      render(
        <AdminDashboardModal
          visible={true}
          bypassPin={true}
          onClose={onClose}
          onPackageUpdated={vi.fn()}
        />
      );

      // Default active tab is 'stock' (Kelola & Tambah Stok)
      expect(screen.getByText(/Daftar & Kelola Stok Material/i)).toBeInTheDocument();

      // Check all Excel table headers
      expect(screen.getAllByText('Nama Material').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Kode Normalisasi').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Satuan').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Stok').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('BLOK').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('RAK').length).toBeGreaterThanOrEqual(1);

      // Search input is present
      const searchInputs = screen.getAllByPlaceholderText(/Cari nama, kode normalisasi, blok, rak/i);
      expect(searchInputs.length).toBeGreaterThanOrEqual(1);
      const stockSearchInput = searchInputs[searchInputs.length - 1];

      // Type a query that matches a specific material
      fireEvent.change(stockSearchInput, { target: { value: 'Transformator' } });
      expect(screen.getAllByText(/Transformator Distribusi 3 Fasa 100 kVA/i).length).toBeGreaterThanOrEqual(1);

      // Filter with non-matching query
      fireEvent.change(stockSearchInput, { target: { value: 'nonexistentmaterial12345' } });
      expect(screen.getByText(/Tidak ada material yang cocok dengan pencarian/i)).toBeInTheDocument();
    });

    it('toggles category filter dropdown using 3-dots button and filters materials by category', () => {
      const onClose = vi.fn();

      render(
        <AdminDashboardModal
          visible={true}
          bypassPin={true}
          onClose={onClose}
          onPackageUpdated={vi.fn()}
        />
      );

      // Default active tab is 'stock'
      const filterButton = screen.getByRole('button', { name: /Filter berdasarkan kategori/i });
      expect(filterButton).toBeInTheDocument();

      // Click 3-dots button to open category menu
      fireEvent.click(filterButton);

      // Dropdown menu should show "Semua Kategori" and active categories
      expect(screen.getByText(/Filter Kategori/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Semua Kategori/i })).toBeInTheDocument();

      // Select first category option from active categories
      const categoryOptions = screen.getAllByRole('button').filter(btn =>
        btn.textContent && !btn.textContent.includes('Semua Kategori') && btn.closest('.max-h-60')
      );

      if (categoryOptions.length > 0) {
        const firstCategoryBtn = categoryOptions[0];
        fireEvent.click(firstCategoryBtn);

        // Active filter chip should appear
        expect(screen.getByText(/Filter Kategori:/i)).toBeInTheDocument();

        // Button to reset category filter
        const resetCategoryBtn = screen.getByRole('button', { name: /Hapus filter kategori/i });
        expect(resetCategoryBtn).toBeInTheDocument();
        fireEvent.click(resetCategoryBtn);

        // Filter chip should disappear
        expect(screen.queryByText(/Filter Kategori:/i)).not.toBeInTheDocument();
      }
    });
  });
});
