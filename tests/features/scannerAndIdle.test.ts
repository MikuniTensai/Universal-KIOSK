import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScannerWedgeAdapter } from '../../src/features/scanner/scannerWedgeAdapter';
import { IdleTimerService } from '../../src/features/idle/idleTimerService';
import { ContentService } from '../../src/features/programs/contentService';
import { samplePlnPackage } from '../../src/data/mockPlnPackage';

describe('ScannerWedgeAdapter Tests', () => {
  let adapter: ScannerWedgeAdapter;

  beforeEach(() => {
    adapter = new ScannerWedgeAdapter();
  });

  it('collects rapid keystrokes (<50ms) and dispatches scan upon Enter', () => {
    let receivedResult: any = null;
    adapter.subscribe((result) => {
      receivedResult = result;
    });

    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    // Simulate keystrokes for '000123'
    ['0', '0', '0', '1', '2', '3'].forEach((char, idx) => {
      vi.spyOn(Date, 'now').mockReturnValue(now + idx * 10);
      adapter.handleKeyDown({ key: char } as KeyboardEvent);
    });

    // Send Enter terminator
    vi.spyOn(Date, 'now').mockReturnValue(now + 70);
    adapter.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent);

    expect(receivedResult).toBeDefined();
    expect(receivedResult.status).toBe('found');
    expect(receivedResult.rawCode).toBe('000123');
    expect(receivedResult.material?.name).toContain('Transformator');
  });

  it('clears buffer if keystrokes have human-speed delay (>100ms)', () => {
    let receivedResult: any = null;
    adapter.subscribe((result) => {
      receivedResult = result;
    });

    const start = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(start);
    adapter.handleKeyDown({ key: '0' } as KeyboardEvent);

    // Human pause 200ms
    vi.spyOn(Date, 'now').mockReturnValue(start + 200);
    adapter.handleKeyDown({ key: '1' } as KeyboardEvent);

    // Hit Enter
    vi.spyOn(Date, 'now').mockReturnValue(start + 220);
    adapter.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent);

    // Buffer should only have '1' which is < 2 chars, so no scan dispatched
    expect(receivedResult).toBeNull();
  });
});

describe('IdleTimerService Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers warning at idleSeconds - warningSeconds and timeout at idleSeconds', () => {
    const timer = new IdleTimerService(60, 10);
    const events: string[] = [];

    timer.subscribe((event) => {
      events.push(event);
    });

    timer.start();

    // Advance 49 seconds -> no event
    vi.advanceTimersByTime(49000);
    expect(events).toHaveLength(0);

    // Advance 2 seconds (51s elapsed) -> warning triggered (<= 10s left)
    vi.advanceTimersByTime(2000);
    expect(events).toContain('warning');

    // Advance 10 more seconds (61s elapsed) -> timeout triggered
    vi.advanceTimersByTime(10000);
    expect(events).toContain('timeout');

    timer.stop();
  });

  it('resets timer upon user interaction', () => {
    const timer = new IdleTimerService(60, 10);
    const events: string[] = [];

    timer.subscribe((event) => {
      events.push(event);
    });

    timer.start();
    vi.advanceTimersByTime(55000); // in warning phase
    expect(events).toContain('warning');

    // User touches screen / keeps alive
    timer.recordActivity();
    expect(events).toContain('reset');

    // Advance 40 seconds (total 95s, but reset at 55s, so only 40s elapsed since reset)
    vi.advanceTimersByTime(40000);
    // Not timed out!
    expect(events.filter(e => e === 'timeout')).toHaveLength(0);

    timer.stop();
  });
});

describe('ContentService Tests', () => {
  it('filters active content within validFrom and validUntil range', () => {
    const active = ContentService.getActiveContent(samplePlnPackage, '2026-06-01T12:00:00+07:00');
    expect(active.length).toBeGreaterThan(0);
    expect(active.some(item => item.title.includes('Budaya K3'))).toBe(true);
  });

  it('provides a safe fallback image SVG string', () => {
    const fallback = ContentService.getFallbackImage();
    expect(fallback).toContain('data:image/svg+xml');
    expect(fallback).toContain('PLN');
  });
});
