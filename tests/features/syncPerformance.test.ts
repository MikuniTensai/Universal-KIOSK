import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ServerSyncPayload, SyncService as SyncServiceType } from '../../src/adapters/storage/syncService';
import type { KioskConfig } from '../../src/domain/types';

const storage = vi.hoisted(() => ({
  setActivePackageDirectly: vi.fn(),
  saveConfig: vi.fn(),
  getActivePackage: vi.fn(() => null),
  getConfig: vi.fn(() => ({})),
  getPackageHistory: vi.fn(() => []),
}));
const layout = vi.hoisted(() => ({ saveBlocks: vi.fn(), getBlocks: vi.fn(() => []) }));

vi.mock('../../src/adapters/storage/kioskStorage', () => ({ kioskStorage: storage }));
vi.mock('../../src/features/layout/warehouseLayoutService', () => ({ WarehouseLayoutService: layout }));

class TestBroadcastChannel {
  static instances: TestBroadcastChannel[] = [];
  onmessage: ((event: { data: ServerSyncPayload }) => void) | null = null;
  postMessage = vi.fn();

  constructor() {
    TestBroadcastChannel.instances.push(this);
  }

  emit(data: ServerSyncPayload) {
    this.onmessage?.({ data });
  }
}

function payload(lastUpdated: number): ServerSyncPayload {
  return { lastUpdated, config: { warehouseCode: `WAREHOUSE-${lastUpdated}` } as KioskConfig };
}

function response(data: unknown, etag: string | null = null, status = 200) {
  const json = vi.fn().mockResolvedValue(data);
  return {
    value: { ok: status >= 200 && status < 300, status, headers: new Headers(etag ? { ETag: etag } : {}), json } as unknown as Response,
    json,
  };
}

describe('Sync polling performance and lifecycle', () => {
  let SyncService: typeof SyncServiceType;
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.clearAllMocks();
    TestBroadcastChannel.instances = [];
    vi.stubGlobal('BroadcastChannel', TestBroadcastChannel);
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    ({ SyncService } = await import('../../src/adapters/storage/syncService'));
  });

  afterEach(() => {
    SyncService.stopPolling();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('acknowledges applied ETags, skips JSON on 304, and applies the next changed payload', async () => {
    const initial = response(payload(100), '"a"');
    const unchanged = response(null, '"a"', 304);
    const changed = response(payload(200), '"b"');
    fetchMock.mockResolvedValueOnce(initial.value).mockResolvedValueOnce(unchanged.value).mockResolvedValueOnce(changed.value);
    const updated = vi.fn();

    SyncService.startPolling(updated);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty('If-None-Match');
    expect(updated).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock.mock.calls[1][1]?.headers).toHaveProperty('If-None-Match', '"a"');
    expect(unchanged.json).not.toHaveBeenCalled();
    expect(storage.saveConfig).toHaveBeenCalledTimes(1);
    expect(updated).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(5000);
    expect(storage.saveConfig).toHaveBeenLastCalledWith(payload(200).config);
    expect(updated).toHaveBeenCalledTimes(2);
    fetchMock.mockResolvedValueOnce(response(null, '"b"', 304).value);
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock.mock.calls[3][1]?.headers).toHaveProperty('If-None-Match', '"b"');
  });

  it('remains compatible with servers that return no ETag', async () => {
    const legacy = response(payload(100));
    fetchMock.mockResolvedValue(legacy.value);
    const updated = vi.fn();
    SyncService.startPolling(updated);
    await vi.advanceTimersByTimeAsync(10000);

    expect(legacy.json).toHaveBeenCalledTimes(3);
    expect(updated).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.every(([, options]) => !new Headers(options?.headers).has('If-None-Match'))).toBe(true);
  });

  it('does not acknowledge an invalid payload, broken JSON, HTTP failure, or network failure', async () => {
    const invalid = response({ lastUpdated: '200' }, '"invalid"');
    const broken = response(null, '"broken"');
    broken.json.mockRejectedValueOnce(new SyntaxError('broken JSON'));
    const unavailable = response(payload(300), '"unavailable"', 500);
    fetchMock.mockResolvedValueOnce(invalid.value)
      .mockResolvedValueOnce(broken.value)
      .mockResolvedValueOnce(unavailable.value)
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(response(payload(100), '"valid"').value);

    const updated = vi.fn();
    SyncService.startPolling(updated);
    await vi.advanceTimersByTimeAsync(20000);

    expect(unavailable.json).not.toHaveBeenCalled();
    expect(updated).toHaveBeenCalledTimes(1);
    expect(storage.saveConfig).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls.every(([, options]) => !new Headers(options?.headers).has('If-None-Match'))).toBe(true);
  });

  it('retries the same timestamp and keeps the old validator when applying an update fails', async () => {
    fetchMock.mockResolvedValueOnce(response(payload(100), '"a"').value);
    const updated = vi.fn();
    SyncService.startPolling(updated);
    await vi.advanceTimersByTimeAsync(0);

    storage.saveConfig.mockImplementationOnce(() => { throw new Error('storage unavailable'); });
    fetchMock.mockResolvedValue(response(payload(200), '"b"').value);
    await vi.advanceTimersByTimeAsync(5000);
    expect(updated).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5000);

    expect(fetchMock.mock.calls[2][1]?.headers).toHaveProperty('If-None-Match', '"a"');
    expect(storage.saveConfig).toHaveBeenCalledTimes(3);
    expect(updated).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock.mock.calls[3][1]?.headers).toHaveProperty('If-None-Match', '"b"');
  });

  it('removes only the polling listener and keeps external broadcast subscribers through restarts', async () => {
    fetchMock.mockResolvedValue(response(null, null, 304).value);
    const external = vi.fn();
    const removeExternal = SyncService.addListener(external);
    const first = vi.fn();
    const duplicate = vi.fn();
    const restarted = vi.fn();

    SyncService.startPolling(first);
    SyncService.startPolling(duplicate);
    await vi.advanceTimersByTimeAsync(0);
    const channel = TestBroadcastChannel.instances[0];
    channel.emit(payload(100));
    expect(first).toHaveBeenCalledTimes(1);
    expect(duplicate).not.toHaveBeenCalled();
    SyncService.stopPolling();
    channel.emit(payload(200));
    expect(first).toHaveBeenCalledTimes(1);
    expect(external).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);

    SyncService.startPolling(restarted);
    await vi.advanceTimersByTimeAsync(0);
    channel.emit(payload(300));
    expect(first).toHaveBeenCalledTimes(1);
    expect(restarted).toHaveBeenCalledTimes(1);
    expect(external).toHaveBeenCalledTimes(3);
    expect(TestBroadcastChannel.instances).toHaveLength(1);
    removeExternal();
  });

  it('does not overlap the initial request and ignores it after stopping and restarting', async () => {
    let resolveOld!: (value: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }));
    const first = vi.fn();
    SyncService.startPolling(first);
    await vi.advanceTimersByTimeAsync(10000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const oldSignal = fetchMock.mock.calls[0][1]?.signal;

    SyncService.stopPolling();
    expect(oldSignal?.aborted).toBe(true);
    const restarted = vi.fn();
    fetchMock.mockResolvedValueOnce(response(payload(100), '"current"').value);
    SyncService.startPolling(restarted);
    await vi.advanceTimersByTimeAsync(0);
    const stale = response(payload(900), '"stale"');
    resolveOld(stale.value);
    await vi.advanceTimersByTimeAsync(0);

    expect(stale.json).not.toHaveBeenCalled();
    expect(first).not.toHaveBeenCalled();
    expect(restarted).toHaveBeenCalledTimes(1);
    expect(storage.saveConfig).toHaveBeenCalledTimes(1);
    fetchMock.mockResolvedValueOnce(response(payload(200), '"next"').value);
    await vi.advanceTimersByTimeAsync(5000);
    expect(fetchMock.mock.calls[2][1]?.headers).toHaveProperty('If-None-Match', '"current"');
    expect(restarted).toHaveBeenCalledTimes(2);
  });

  it('ignores a JSON read that completes after polling stops', async () => {
    let resolveJson!: (value: ServerSyncPayload) => void;
    const pending = response(null, '"stale"');
    pending.json.mockImplementationOnce(() => new Promise((resolve) => { resolveJson = resolve; }));
    fetchMock.mockResolvedValueOnce(pending.value);
    const updated = vi.fn();
    SyncService.startPolling(updated);
    await vi.advanceTimersByTimeAsync(0);
    SyncService.stopPolling();
    resolveJson(payload(100));
    await vi.advanceTimersByTimeAsync(0);
    expect(updated).not.toHaveBeenCalled();
    expect(storage.saveConfig).not.toHaveBeenCalled();
  });

  it('does not treat a different ETag as permission to roll back to an older server state', async () => {
    fetchMock.mockResolvedValueOnce(response(payload(200), '"newer"').value)
      .mockResolvedValue(response(payload(100), '"restored-old-file"').value);
    const updated = vi.fn();
    SyncService.startPolling(updated);
    await vi.advanceTimersByTimeAsync(10000);
    expect(updated).toHaveBeenCalledTimes(1);
    expect(storage.saveConfig).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[2][1]?.headers).toHaveProperty('If-None-Match', '"newer"');
  });
});
