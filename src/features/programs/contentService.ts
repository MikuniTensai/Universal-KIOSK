import { ContentItem, ImportPackage } from '../../domain/types';
import wallpaperWarehouseImg from '../../assets/cards/wallpaper_warehouse.webp';

export class ContentService {
  /**
   * Retrieves active work programs & campaign content based on validity range
   */
  public static getActiveContent(pkg: ImportPackage, nowIso = new Date().toISOString()): ContentItem[] {
    if (!pkg.contentItems || !Array.isArray(pkg.contentItems)) return [];

    const now = new Date(nowIso).getTime();

    return pkg.contentItems
      .filter(item => {
        if (item.validFrom && new Date(item.validFrom).getTime() > now) {
          return false;
        }
        if (item.validUntil && new Date(item.validUntil).getTime() < now) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Safe fallback for media assets (images / video)
   * Menggunakan foto default Gudang PLN Aris Munandar (WhatsApp Image 2026-09-12 at 16.56.14.jpeg)
   */
  public static getFallbackImage(): string {
    return wallpaperWarehouseImg;
  }
}
