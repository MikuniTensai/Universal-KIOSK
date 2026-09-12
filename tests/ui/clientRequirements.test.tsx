import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '../../src/app/App';
import { AdminAuth } from '../../src/features/admin/adminAuth';
import { CatalogService } from '../../src/features/catalog/catalogService';
import { samplePlnPackage, defaultKioskConfig } from '../../src/data/mockPlnPackage';

describe('Client Meeting Requirements Verification (Universal-KIOSK)', () => {
  beforeEach(() => {
    AdminAuth.logout();
    window.localStorage.clear();
  });

  it('Requirement 1: Renders Danantara Logo on the left and PLN Logo on the right on IdleScreensaver and Header', () => {
    render(<App />);

    // 1. In IdleScreensaver (Tampilan Pertama Siaga)
    expect(screen.getByLabelText(/Logo Danantara Indonesia/i)).toBeInTheDocument();
    expect(screen.getByText('DANANTARA')).toBeInTheDocument();
    expect(screen.getByText('INDONESIA')).toBeInTheDocument();

    expect(screen.getByLabelText(/Logo PT PLN \(Persero\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PT PLN \(PERSERO\)/i).length).toBeGreaterThanOrEqual(1);

    // 2. Touch screen to enter Home
    act(() => {
      fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));
    });

    // In Header (Tampilan Utama)
    expect(screen.getByLabelText(/Logo Danantara Indonesia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logo PT PLN \(Persero\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/WIB/i)).not.toBeInTheDocument();
  });

  it('Requirement 2: Top section displays Warehouse Layout visualizer, opens interactive layout schematic with zones & racks', () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));
    });

    // Top section: Visualisasi Denah & Tata Letak Gudang
    const layoutCardTitle = screen.getByText(/Visualisasi Denah & Tata Letak Gudang/i);
    expect(layoutCardTitle).toBeInTheDocument();
    expect(screen.getByText(/MODUL VISUALISASI SIAP INTEGRASI/i)).toBeInTheDocument();

    // Click to open layout schematic
    act(() => {
      fireEvent.click(screen.getByText('Lihat Denah Tata Letak'));
    });

    // Warehouse Layout View is rendered with official printed blueprint
    expect(screen.getByText(/Denah & Tata Letak Gudang/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Denah dan Tata Letak Gudang Aris Munandar PT PLN UP3 Malang/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Perbesar Denah/i })).toBeInTheDocument();

    // Click back to return to Beranda
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Kembali ke Beranda/i }));
    });

    // Back to Home
    expect(screen.getByText(/Visualisasi Denah & Tata Letak Gudang/i)).toBeInTheDocument();
  });

  it('Requirement 3: Middle section transforms into SOP & Aturan-Aturan Pergudangan PLN with comprehensive procedures', () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));
    });

    // Middle section: SOP & Aturan
    expect(screen.getByText(/SOP & ATURAN PERGUDANGAN/i)).toBeInTheDocument();
    expect(screen.getByText(/Program Kerja Gudang PLN & SOP Aturan/i)).toBeInTheDocument();

    // Click Buka Program Kerja
    act(() => {
      fireEvent.click(screen.getByText('Buka Program Kerja'));
    });

    // SOP view is rendered
    expect(screen.getByRole('heading', { level: 2, name: 'SOP' })).toBeInTheDocument();
    expect(screen.getByText(/SOP Masuk & Keluar Material/i)).toBeInTheDocument();
    expect(screen.getByText(/Aturan K3 & Keselamatan Kerja/i)).toBeInTheDocument();
    expect(screen.getByText(/Standar 5S Pergudangan/i)).toBeInTheDocument();

    // Switch to Aturan K3 tab
    act(() => {
      fireEvent.click(screen.getByText(/Aturan K3 & Keselamatan Kerja/i));
    });
    expect(screen.getByText(/Aturan Mutlak Keselamatan Kerja di Area Gudang Logistik PLN/i)).toBeInTheDocument();
    expect(screen.getByText(/Aturan Wajib APD Masuk Area Gudang/i)).toBeInTheDocument();

    // Switch to 5S tab
    act(() => {
      fireEvent.click(screen.getByText(/Standar 5S Pergudangan/i));
    });
    expect(screen.getByText(/Penerapan Budaya 5S/i)).toBeInTheDocument();
  });

  it('Requirement 4: Bottom section displays Catalog with Blok & Rak locations, resolves client example (kWh Meter at Rak A-001)', () => {
    render(<App />);
    act(() => {
      fireEvent.click(screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i));
    });

    // Bottom section: Catalog & Rak Locations
    expect(screen.getByText(/KATALOG MATERIAL & LOKASI RAK/i)).toBeInTheDocument();
    expect(screen.getByText(/Daftar Item & Material Gudang \(Katalog Blok & Rak Baru\)/i)).toBeInTheDocument();

    // Click to open Catalog
    act(() => {
      fireEvent.click(screen.getByText('Lihat Daftar Item'));
    });

    // Catalog view is displayed with prominent Blok & Rak badges
    expect(screen.getByText(/Pencarian Cepat Lokasi:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⚡ kWh Meter \(Rak A-001\)/i })).toBeInTheDocument();

    // Test location search via CatalogService for 'Rak A-001'
    const result = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      query: 'Rak A-001',
    });
    expect(result.items.length).toBeGreaterThan(0);
    const kwhMeter = result.items.find(i => i.name.includes('Smart Meter') || i.name.includes('kWh'));
    expect(kwhMeter).toBeDefined();
    expect(kwhMeter?.locations[0].location.rack).toBe('Rak A-001');
    expect(kwhMeter?.locations[0].location.zone).toContain('Blok C');

    // Test searching 'kwh'
    const kwhResult = CatalogService.searchMaterials(samplePlnPackage, defaultKioskConfig, {
      query: 'kwh',
    });
    expect(kwhResult.items.length).toBeGreaterThan(0);
    expect(kwhResult.items[0].name).toContain('Smart Meter Listrik (kWh Meter)');

    // Test resolving barcode 'RAK-A-001' and 'kwh'
    const scanKwh = CatalogService.resolveScan('kwh', samplePlnPackage, defaultKioskConfig);
    expect(scanKwh.status).toBe('found');
    expect(scanKwh.material?.locations[0].location.rack).toBe('Rak A-001');

    const scanRack = CatalogService.resolveScan('RAK-A-001', samplePlnPackage, defaultKioskConfig);
    expect(scanRack.status).toBe('found');
    expect(scanRack.material?.name).toContain('Smart Meter Listrik (kWh Meter)');
  });
});
