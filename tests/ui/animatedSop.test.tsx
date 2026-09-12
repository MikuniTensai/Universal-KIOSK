import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkProgramsView } from '../../src/features/programs/WorkProgramsView';
import { AnimatedSopExplorer } from '../../src/features/programs/AnimatedSopExplorer';

describe('Animated SOP Explorer & Interactive Flow Audit (Uci UI/UX)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AnimatedSopExplorer inside WorkProgramsView under SOP tab', () => {
    render(<WorkProgramsView onBack={vi.fn()} />);

    // Tab header
    expect(screen.getByText(/SIMULASI ALUR OPERASIONAL BER-ANIMASI RESMI PLN/i)).toBeInTheDocument();
    expect(screen.getByText(/Standar Operasional Prosedur \(SOP\) Pergudangan PLN/i)).toBeInTheDocument();

    // 3 official SOP flow options exist
    expect(screen.getAllByRole('button', { name: /Penerimaan Material/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /Pengeluaran Material/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /Pengembalian Barang/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('displays default Penerimaan Material flow with 7 sequential steps and TUG 3 Karantina', () => {
    render(<AnimatedSopExplorer />);

    // Step 1 title & document code
    expect(screen.getByText(/LANGKAH 1 DARI 7/i)).toBeInTheDocument();
    expect(screen.getByText(/TUG 3 KARANTINA/i)).toBeInTheDocument();
    expect(screen.getByText(/Kedatangan armada pengantar material dari supplier di area karantina/i)).toBeInTheDocument();

    // Checkpoints
    expect(screen.getByText(/Pemeriksaan surat jalan \(DO\), Purchase Order \(PO\), dan segel armada/i)).toBeInTheDocument();
  });

  it('switches between Penerimaan, Pengeluaran, and Pengembalian flows smoothly', () => {
    render(<AnimatedSopExplorer />);

    // Switch to Pengeluaran Material
    const pengeluaranBtn = screen.getByRole('button', { name: /Pengeluaran Material/i });
    fireEvent.click(pengeluaranBtn);

    expect(screen.getByText(/LANGKAH 1 DARI 6/i)).toBeInTheDocument();
    expect(screen.getByText(/RESERVASI FORM & PERINTAH KERJA/i)).toBeInTheDocument();
    expect(screen.getByText(/Pengajuan kebutuhan material oleh unit pemohon atau teknisi/i)).toBeInTheDocument();

    // Switch to Pengembalian Barang (Retur / MRWI)
    const pengembalianBtn = screen.getByRole('button', { name: /Pengembalian Barang/i });
    fireEvent.click(pengembalianBtn);

    expect(screen.getByText(/LANGKAH 1 DARI 5/i)).toBeInTheDocument();
    expect(screen.getByText(/BUKTI PENGEMBALIAN BARANG/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dokumen TUG 10/i).length).toBeGreaterThanOrEqual(1);
  });

  it('advances step on manual Next button and step node click', () => {
    render(<AnimatedSopExplorer />);

    // Advance to Step 2 (Pemeriksaan Material TUG 4)
    const nextBtn = screen.getByRole('button', { name: /Langkah Selanjutnya/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/LANGKAH 2 DARI 7/i)).toBeInTheDocument();
    expect(screen.getByText(/TUG 4 \(INSPEKSI MUTU\)/i)).toBeInTheDocument();

    // Advance again to Step 3
    fireEvent.click(nextBtn);
    expect(screen.getByText(/LANGKAH 3 DARI 7/i)).toBeInTheDocument();
    expect(screen.getByText(/TEMPORARY HOLDING ZONE/i)).toBeInTheDocument();

    // Step back
    const prevBtn = screen.getByRole('button', { name: /Langkah Sebelumnya/i });
    fireEvent.click(prevBtn);
    expect(screen.getByText(/LANGKAH 2 DARI 7/i)).toBeInTheDocument();
  });

  it('toggles auto-play simulation state and speed settings', () => {
    render(<AnimatedSopExplorer />);

    const playBtn = screen.getByRole('button', { name: /Mulai Animasi/i });
    expect(screen.getByText(/Mode Penjelajahan Manual/i)).toBeInTheDocument();

    // Click to start simulation
    fireEvent.click(playBtn);
    expect(screen.getByText(/Jeda Simulasi/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulasi Berjalan Otomatis/i)).toBeInTheDocument();

    // Speed toggle
    const speedBtn = screen.getByRole('button', { name: /Speed: 1x \(4s\)/i });
    fireEvent.click(speedBtn);
    expect(screen.getByText(/Speed: 2x \(2s\)/i)).toBeInTheDocument();

    // Pause simulation
    const pauseBtn = screen.getByRole('button', { name: /Jeda Simulasi/i });
    fireEvent.click(pauseBtn);
    expect(screen.getAllByText(/Mulai Animasi/i).length).toBeGreaterThanOrEqual(1);
  });

  it('opens and closes high-res infographic lightbox modal with zoom controls', () => {
    render(<AnimatedSopExplorer />);

    const openLightboxBtn = screen.getByRole('button', { name: /Lihat Poster Infografis \(Full HD\)/i });
    fireEvent.click(openLightboxBtn);

    // Modal dialog is rendered
    expect(screen.getByRole('dialog', { name: /Tampilan Penuh Infografis SOP PLN/i })).toBeInTheDocument();
    expect(screen.getByText(/Infografis Alur Standar Operasional Prosedur • PT PLN \(Persero\)/i)).toBeInTheDocument();

    // Zoom buttons exist
    const zoomInBtn = screen.getByLabelText('Perbesar');
    fireEvent.click(zoomInBtn);
    expect(screen.getByText(/125%/i)).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByText('Kembali ke Alur');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog', { name: /Tampilan Penuh Infografis SOP PLN/i })).not.toBeInTheDocument();
  });
});
