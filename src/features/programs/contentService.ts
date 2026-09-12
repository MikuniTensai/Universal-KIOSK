import { ContentItem, ImportPackage } from '../../domain/types';

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
   */
  public static getFallbackImage(): string {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23FEFCE8" width="400" height="300"/><text fill="%23854D0E" font-family="sans-serif" font-size="18" font-weight="bold" x="50%25" y="50%25" text-anchor="middle">PT PLN (Persero) Logistik</text></svg>';
  }
}
