import { Profiler } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnimatedSopExplorer } from '../../src/features/programs/AnimatedSopExplorer';

describe('SOP playback resource usage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('moves the progress bar without committing the explorer on animation frames', () => {
    const onRender = vi.fn();
    const { container } = render(
      <Profiler id="sop" onRender={onRender}>
        <AnimatedSopExplorer />
      </Profiler>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mulai Animasi' }));
    const commitsAfterPlay = onRender.mock.calls.length;

    act(() => { vi.advanceTimersByTime(1000); });

    const progress = container.querySelector<HTMLElement>('.sop-progress-shimmer');
    expect(parseFloat(progress!.style.width)).toBeGreaterThan(20);
    expect(parseFloat(progress!.style.width)).toBeLessThanOrEqual(25);
    expect(onRender).toHaveBeenCalledTimes(commitsAfterPlay);
    expect(screen.getByText(/LANGKAH 1 DARI 7/i)).toBeInTheDocument();
  });

  it('keeps timed steps, speed changes, pause and replay working', () => {
    render(<AnimatedSopExplorer />);
    fireEvent.click(screen.getByRole('button', { name: 'Mulai Animasi' }));
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.getByText(/LANGKAH 2 DARI 7/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Speed: 1x/i }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText(/LANGKAH 3 DARI 7/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Jeda Simulasi' }));
    expect(vi.getTimerCount()).toBe(0);
    act(() => { vi.advanceTimersByTime(8000); });
    expect(screen.getByText(/LANGKAH 3 DARI 7/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mulai Ulang dari Langkah 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mulai Animasi' }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText(/LANGKAH 2 DARI 7/i)).toBeInTheDocument();
  });

  it('cancels playback when unmounted and starts a clean loop on remount', () => {
    const view = render(<AnimatedSopExplorer />);
    fireEvent.click(screen.getByRole('button', { name: 'Mulai Animasi' }));
    act(() => { vi.advanceTimersByTime(500); });
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);

    render(<AnimatedSopExplorer />);
    fireEvent.click(screen.getByRole('button', { name: 'Mulai Animasi' }));
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.getByText(/LANGKAH 2 DARI 7/i)).toBeInTheDocument();
  });

  it('reuses one audio context for repeated controls and closes it on exit', () => {
    const close = vi.fn().mockResolvedValue(undefined);
    const oscillator = () => ({
      type: '',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(),
    });
    const createContext = vi.fn(function () {
      return {
        state: 'running', currentTime: 0, destination: {}, close,
        createOscillator: oscillator,
        createGain: () => ({
          gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(), disconnect: vi.fn(),
        }),
      };
    });
    vi.stubGlobal('AudioContext', createContext);
    const view = render(<AnimatedSopExplorer />);
    fireEvent.click(screen.getByRole('button', { name: 'Langkah Selanjutnya' }));
    fireEvent.click(screen.getByRole('button', { name: 'Langkah Selanjutnya' }));
    fireEvent.click(screen.getByRole('button', { name: 'Langkah Sebelumnya' }));

    expect(createContext).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Suara Aktif' }));
    fireEvent.click(screen.getByRole('button', { name: 'Langkah Selanjutnya' }));
    expect(createContext).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
