/**
 * Service untuk mendeteksi apakah aplikasi dijalankan sebagai Kiosk Display publik (Port 5000)
 * atau Dedicated Admin Portal (Port 5001 / LAN Management).
 */
export class AdminModeService {
  /**
   * Menentukan apakah lingkungan saat ini merupakan Admin Portal
   */
  public static isAdminPort(): boolean {
    if (typeof window === 'undefined') return false;

    const port = window.location.port;
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    const pathname = window.location.pathname || '';

    // Port 5001 adalah port resmi dedicated admin
    // Port 5174 adalah port alternatif sekunder pada dev environment
    return (
      port === '5001' ||
      port === '5174' ||
      search.includes('mode=admin') ||
      search.includes('admin=true') ||
      hash.includes('admin') ||
      pathname.startsWith('/admin')
    );
  }

  /**
   * Menentukan apakah lingkungan saat ini merupakan Kiosk Display publik
   */
  public static isKioskPort(): boolean {
    return !this.isAdminPort();
  }

  /**
   * Mengembalikan URL untuk membuka Kiosk Display
   */
  public static getKioskUrl(): string {
    if (typeof window === 'undefined') return 'http://localhost:5000';
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${hostname}:5000`;
  }

  /**
   * Mengembalikan URL untuk membuka Admin Portal
   */
  public static getAdminUrl(): string {
    if (typeof window === 'undefined') return 'http://localhost:5001';
    const hostname = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${hostname}:5001`;
  }
}
