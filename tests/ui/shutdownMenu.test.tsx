import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ShutdownMenuModal } from '../../src/features/system/ShutdownMenuModal';
import { Header } from '../../src/shared/ui/Header';
import { IdleScreensaver } from '../../src/features/idle/IdleScreensaver';
import { defaultKioskConfig, samplePlnPackage } from '../../src/data/mockPlnPackage';

describe('Kiosk Shutdown & System Power Menu', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ShutdownMenuModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Shutdown, Restart, and Exit Kiosk options when isOpen is true', () => {
    render(<ShutdownMenuModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Menu Daya & Keluar Kiosk/i })).toBeInTheDocument();
    expect(screen.getByText(/Matikan Komputer \(Shutdown\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Mulai Ulang \(Restart\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Keluar ke Desktop Windows/i)).toBeInTheDocument();
  });

  it('opens confirmation screen with 5s countdown on clicking Shutdown and cancels on Batal', () => {
    render(<ShutdownMenuModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText(/Matikan Komputer \(Shutdown\)/i));

    expect(screen.getByText(/Konfirmasi Matikan Komputer/i)).toBeInTheDocument();
    expect(screen.getByText(/^5$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ya, Matikan Sekarang/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Batal/i })).toBeInTheDocument();

    // Cancel returns to menu
    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    expect(screen.getByText(/Pilih tindakan yang ingin dijalankan/i)).toBeInTheDocument();
  });

  it('triggers /api/system/shutdown when Ya, Matikan Sekarang is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    render(<ShutdownMenuModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText(/Matikan Komputer \(Shutdown\)/i));
    fireEvent.click(screen.getByRole('button', { name: /Ya, Matikan Sekarang/i }));

    expect(fetchMock).toHaveBeenCalledWith('/api/system/shutdown', { method: 'POST' });
    expect(screen.getByText(/Mematikan komputer Windows/i)).toBeInTheDocument();
  });

  it('triggers /api/system/restart when Ya, Restart Sekarang is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    render(<ShutdownMenuModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText(/Mulai Ulang \(Restart\)/i));
    fireEvent.click(screen.getByRole('button', { name: /Ya, Restart Sekarang/i }));

    expect(fetchMock).toHaveBeenCalledWith('/api/system/restart', { method: 'POST' });
    expect(screen.getByText(/Memulai ulang \(restart\) komputer/i)).toBeInTheDocument();
  });

  it('triggers /api/system/exit-kiosk when Ya, Keluar Kiosk is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    render(<ShutdownMenuModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText(/Keluar ke Desktop Windows/i));
    fireEvent.click(screen.getByRole('button', { name: /Ya, Keluar Kiosk/i }));

    expect(fetchMock).toHaveBeenCalledWith('/api/system/exit-kiosk', { method: 'POST' });
    expect(screen.getByText(/Menutup layar Kiosk ke Desktop Windows/i)).toBeInTheDocument();
  });

  it('automatically triggers action when countdown expires', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    render(<ShutdownMenuModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText(/Matikan Komputer \(Shutdown\)/i));

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/system/shutdown', { method: 'POST' });
  });

  it('renders Power button in Header and triggers onOpenShutdown when clicked', () => {
    const onOpenShutdown = vi.fn();
    render(
      <Header
        config={defaultKioskConfig}
        currentRoute="home"
        onNavigate={vi.fn()}
        onOpenAdmin={vi.fn()}
        onOpenShutdown={onOpenShutdown}
      />
    );

    const powerBtn = screen.getByRole('button', { name: /Menu Daya & Matikan Komputer/i });
    expect(powerBtn).toBeInTheDocument();
    fireEvent.click(powerBtn);
    expect(onOpenShutdown).toHaveBeenCalledTimes(1);
  });

  it('renders Power button in IdleScreensaver and triggers onOpenShutdown when clicked', () => {
    const onOpenShutdown = vi.fn();
    const onStart = vi.fn();

    render(
      <IdleScreensaver
        pkg={samplePlnPackage}
        config={defaultKioskConfig}
        onStart={onStart}
        onOpenShutdown={onOpenShutdown}
      />
    );

    const powerBtn = screen.getByRole('button', { name: /Menu Daya & Matikan Komputer/i });
    expect(powerBtn).toBeInTheDocument();
    fireEvent.click(powerBtn);
    expect(onOpenShutdown).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled(); // e.stopPropagation verified
  });
});
