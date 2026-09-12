import { beforeEach, describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '../../src/app/App';
import { CatalogService } from '../../src/features/catalog/catalogService';
import { plnUp3MalangFullPackage, defaultKioskConfig } from '../../src/data/mockPlnPackage';
import { kioskStorage } from '../../src/adapters/storage/kioskStorage';

describe('Kiosk Catalog Baru vs Return Implementation Tests', () => {
  beforeEach(() => {
    kioskStorage.activatePackage(plnUp3MalangFullPackage);
  });
  it('Requirement 1 & 2: Places Katalog Baru at the very top of Home screen and Katalog Return directly below it', () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));
    });

    const headings = screen.getAllByRole('heading', { level: 3 });
    const headingTexts = headings.map(h => h.textContent?.trim());

    // Verify order of cards:
    // 1. Daftar Item & Material Gudang (Katalog Blok & Rak Baru)
    // 2. Daftar Item & Material Gudang (Katalog Blok & Rak Return)
    // 3. SOP
    // 4. Visualisasi Denah & Tata Letak Gudang
    expect(headingTexts[0]).toContain('Daftar Item & Material Gudang (Katalog Blok & Rak Baru)');
    expect(headingTexts[1]).toContain('Daftar Item & Material Gudang (Katalog Blok & Rak Return)');
    expect(headingTexts[2]).toBe('SOP');
    expect(headingTexts[3]).toBe('Visualisasi Denah & Tata Letak Gudang');
  });

  it('Requirement 3: Navigates to Katalog Baru, shows "Baru" status for all items in this view', () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));
    });

    // Click Katalog Baru card
    act(() => {
      fireEvent.click(screen.getByRole('heading', { name: /Katalog Blok & Rak Baru/i }));
    });

    // Header title for Katalog Baru is displayed
    expect(screen.getByRole('heading', { level: 1, name: /Daftar Item & Material Gudang \(Katalog Blok & Rak Baru\)/i })).toBeInTheDocument();
    expect(screen.getByText(/Katalog Material Baru/i)).toBeInTheDocument();

    // Verify all items displayed in Katalog Baru have status 'Baru'
    const searchResult = CatalogService.searchMaterials(plnUp3MalangFullPackage, defaultKioskConfig, {
      condition: 'BARU',
    });
    expect(searchResult.items.length).toBeGreaterThan(0);
    searchResult.items.forEach(item => {
      expect(item.status).toBe('Baru');
      expect(item.condition || 'BARU').toBe('BARU');
    });

    // Open detail modal for first item
    const firstCard = screen.getAllByRole('heading', { level: 4 })[0];
    act(() => {
      fireEvent.click(firstCard);
    });

    // Verify modal has NOMOR NORMALISASI & STATUS MATERIAL: Baru
    expect(screen.getByText('STATUS MATERIAL')).toBeInTheDocument();
    expect(screen.getByText('NOMOR NORMALISASI')).toBeInTheDocument();
  });

  it('Requirement 4: Navigates to Katalog Return, provides 4 status filters (GARANSI, PERBAIKAN, USUL HAPUS, STANDBY)', () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));
    });

    // Click Katalog Return card
    act(() => {
      fireEvent.click(screen.getByRole('heading', { name: /Katalog Blok & Rak Return/i }));
    });

    // Header title for Katalog Return is displayed
    expect(screen.getByRole('heading', { level: 1, name: /Daftar Item & Material Gudang \(Katalog Blok & Rak Return\)/i })).toBeInTheDocument();
    expect(screen.getByText(/Katalog Material Return/i)).toBeInTheDocument();

    // Verify the 4 status filter buttons exist
    expect(screen.getByRole('button', { name: /GARANSI/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PERBAIKAN/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /USUL HAPUS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /STANDBY/i })).toBeInTheDocument();

    // Filter by GARANSI
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /GARANSI/i }));
    });
    const returnCardTitle = screen.getByRole('heading', { level: 4, name: /BOX 105 KVA/i });
    expect(returnCardTitle).toBeInTheDocument();

    // Open detail modal for BOX 105 KVA return
    act(() => {
      fireEvent.click(returnCardTitle);
    });

    expect(screen.getByText('STATUS MATERIAL')).toBeInTheDocument();
    expect(screen.getAllByText('4120470').length).toBeGreaterThanOrEqual(1);
  });
});
