/**
 * NetworkService - Layanan Deteksi Real-Time Alamat IP & Panduan Akses LAN / WiFi
 * Mendukung deteksi dinamis saat alamat IP WiFi berubah (misal DHCP 0.29 / 0.43).
 */

export interface NetworkInterfaceInfo {
  name: string;
  type: 'wifi' | 'ethernet' | 'virtual' | 'other';
  address: string;
  adminUrl: string;
  kioskUrl: string;
  isPrimary: boolean;
}

export interface NetworkInfoResponse {
  success: boolean;
  primaryIp: string;
  isDynamic: boolean;
  hostname: string;
  kioskPort: number;
  adminPort: number;
  adminUrl: string;
  kioskUrl: string;
  interfaces: NetworkInterfaceInfo[];
  allIps: string[];
  serverTime: string;
}

type NetworkListener = (info: NetworkInfoResponse) => void;

class NetworkServiceClass {
  private cachedInfo: NetworkInfoResponse | null = null;
  private listeners: Set<NetworkListener> = new Set();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private isFetching = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    this.fetchNetworkInfo();
    // Poll setiap 12 detik untuk mendeteksi jika IP WiFi diperbarui oleh DHCP
    this.pollTimer = setInterval(() => {
      this.fetchNetworkInfo();
    }, 12000);

    window.addEventListener('online', () => this.fetchNetworkInfo());
  }

  public destroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Mengambil data network info dari server dual-port
   */
  public async fetchNetworkInfo(): Promise<NetworkInfoResponse> {
    if (this.isFetching && this.cachedInfo) {
      return this.cachedInfo;
    }

    this.isFetching = true;
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5001';
      // Coba panggil /api/network-info
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${origin}/api/network-info`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }).catch(async () => {
        // Fallback jika dipanggil dari port 5000 ke 5001 atau sebaliknya
        return await fetch(`${origin}/api/status`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
      });

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data: NetworkInfoResponse = await res.json();
        const prevIp = this.cachedInfo?.primaryIp;
        this.cachedInfo = data;

        // Beritahu listeners jika ada perubahan data atau IP baru
        if (prevIp !== data.primaryIp || !prevIp) {
          this.notifyListeners(data);
        }
        return data;
      }
    } catch {
      // Offline fallback
    } finally {
      this.isFetching = false;
    }

    // Jika server backend tidak merespons (misal unit test atau static preview),
    // buat representasi pintar dari window.location
    const fallback = this.generateFallbackInfo();
    this.cachedInfo = fallback;
    return fallback;
  }

  /**
   * Fallback cerdas saat backend API tidak terjangkau
   */
  public generateFallbackInfo(): NetworkInfoResponse {
    let hostname = 'localhost';

    if (typeof window !== 'undefined') {
      hostname = window.location.hostname || 'localhost';
    }

    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const displayIp = isLocalhost ? '192.168.0.x' : hostname;

    return {
      success: true,
      primaryIp: displayIp,
      isDynamic: true,
      hostname: 'Kassen-WK215-PLN',
      kioskPort: 5000,
      adminPort: 5001,
      adminUrl: `http://${displayIp}:5001`,
      kioskUrl: `http://${displayIp}:5000`,
      interfaces: [
        {
          name: 'wlan0 (WiFi)',
          type: 'wifi',
          address: displayIp,
          adminUrl: `http://${displayIp}:5001`,
          kioskUrl: `http://${displayIp}:5000`,
          isPrimary: true,
        },
      ],
      allIps: [displayIp],
      serverTime: new Date().toISOString(),
    };
  }

  /**
   * Mendapatkan cached network info secara synchronous
   */
  public getCachedInfo(): NetworkInfoResponse {
    return this.cachedInfo || this.generateFallbackInfo();
  }

  /**
   * Berlangganan event perubahan IP / status jaringan
   */
  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    if (this.cachedInfo) {
      listener(this.cachedInfo);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(info: NetworkInfoResponse) {
    this.listeners.forEach((fn) => {
      try {
        fn(info);
      } catch (err) {
        console.error('Error in network info listener:', err);
      }
    });
  }
}

export const NetworkService = new NetworkServiceClass();
