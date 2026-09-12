import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { App } from '../../src/app/App';
import { AdminAuth } from '../../src/features/admin/adminAuth';

describe('Kassen WK-215 Hardware Resolution & Responsive Audit', () => {
  beforeEach(() => {
    AdminAuth.logout();
    window.localStorage.clear();
  });

  it('verifies viewport layout for Kassen WK-215 Landscape (1920x1080)', () => {
    // Set window dimensions to Kassen WK-215 Full HD Landscape
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<App />);

    // Screensaver is rendered cleanly without scrollbars
    expect(screen.getAllByText(/PT PLN \(PERSERO\)/i)[0]).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('fixed', 'inset-0');
  });

  it('verifies viewport layout for Kassen WK-215 Portrait (1080x1920)', () => {
    // Set window dimensions to Kassen WK-215 Full HD Portrait
    window.innerWidth = 1080;
    window.innerHeight = 1920;
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<App />);

    expect(screen.getAllByText(/PT PLN \(PERSERO\)/i)[0]).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('fixed', 'inset-0');
  });

  it('verifies touch target size complies with Kassen PCAP Multi-touch requirements', () => {
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    render(<App />);

    // Tap to start button
    const startBtn = screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i).closest('div');
    expect(startBtn).toHaveClass('h-20'); // 80px > 56px touch target standard!
  });

  it('verifies Home screen uses edge-to-edge full screen layout without clipping buttons', () => {
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<App />);

    // Tap to exit idle screensaver into Home screen
    const startBtn = screen.getByText(/Sentuh Layar di Mana Saja untuk Memulai/i);
    act(() => {
      fireEvent.click(startBtn);
    });

    // Verify outer container is locked to full viewport
    expect(container.firstChild).toHaveClass('fixed', 'inset-0', 'h-full', 'w-full');

    // Verify main content container has overflow-y-auto no-scrollbar to guarantee no cut-off
    const mainEl = container.querySelector('main');
    expect(mainEl).toHaveClass('flex-1', 'w-full', 'overflow-y-auto', 'no-scrollbar');

    // Verify Home container uses full-screen width max-w-[1780px] instead of cramped max-w-6xl
    const homeContainer = container.querySelector('.max-w-\\[1780px\\]');
    expect(homeContainer).toBeInTheDocument();
    expect(homeContainer).toHaveClass('w-full', 'h-full');

    // Verify client requested thumbnail buttons are rendered (Katalog Baru, Return, SOP, Layout)
    expect(screen.getByText(/Program Kerja Gudang PLN/i)).toBeInTheDocument();
    expect(screen.getByText(/Daftar Item & Material Gudang \(Katalog Blok & Rak Baru\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Daftar Item & Material Gudang \(Katalog Blok & Rak Return\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Scan Item \(Cek Spesifikasi\)/i)).toBeInTheDocument();

    // Verify action buttons at the bottom of the cards have full 56px touch height and flex-shrink-0
    const programBtn = screen.getByText('Buka Program Kerja').closest('div');
    expect(programBtn).toHaveClass('h-14', 'flex-shrink-0');

    const catalogBtn = screen.getByText('Lihat Daftar Item').closest('div');
    expect(catalogBtn).toHaveClass('h-14', 'flex-shrink-0');

    const scanBtn = screen.getByText('Mulai Scan Material').closest('div');
    expect(scanBtn).toHaveClass('h-14', 'flex-shrink-0');

    // Verify Kassen WK-215 status bar is present confirming 1920x1080 full resolution lock
    expect(screen.getByText(/Resolusi Layar Penuh 1920×1080 Full HD/i)).toBeInTheDocument();
  });
});

