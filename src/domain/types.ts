export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface Material {
  id: string;
  code: string; // Utuh termasuk nol di depan (misal '000123')
  sapCode: string | null;
  name: string;
  categoryId: string;
  unit: string;
  specification: string | null;
  photoPath: string | null;
}

export interface Asset {
  id: string;
  materialId: string;
  serialNumber: string;
  locationId: string | null;
}

export type BarcodeTargetType = 'material' | 'asset';

export interface BarcodeAlias {
  value: string; // Nilai barcode/QR unik
  targetType: BarcodeTargetType;
  targetId: string;
}

export interface Location {
  id: string;
  warehouseCode: string;
  zone: string | null;
  rack: string | null;
  bin: string | null;
}

export interface StockSnapshot {
  materialId: string;
  locationId: string;
  quantity: number | null; // NULL != 0
  reserved: number | null;
  available: number | null;
  sourceAt: string; // ISO 8601 with timezone
}

export type ContentType = 'image' | 'video' | 'text';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  localPath: string | null;
  text: string | null;
  order: number;
  validFrom: string | null;
  validUntil: string | null;
}

export interface ManifestFileEntry {
  path: string;
  size: number;
  sha256?: string;
}

export interface ImportPackage {
  schemaVersion: string;
  datasetVersion: number;
  sourceName: string;
  sourceAt: string;
  fileList?: ManifestFileEntry[];
  categories: Category[];
  materials: Material[];
  assets: Asset[];
  barcodeAliases: BarcodeAlias[];
  locations: Location[];
  stockSnapshots: StockSnapshot[];
  contentItems: ContentItem[];
  importedAt?: string;
  restoredAt?: string;
  packageHash?: string;
}

export interface KioskConfig {
  organizationName: string;
  warehouseCode: string;
  timezone: string; // e.g. "Asia/Jakarta"
  idleSeconds: number; // default 60
  warningSeconds: number; // default 10
  staleAfterHours: number | null; // default 24
  orientation: 'auto' | 'portrait' | 'landscape';
  cardStyle?: 'photo' | 'minimal';
  wallpaperPreset?: 'warehouse' | 'substation' | 'safety' | 'none';
  customWallpaperUrl?: string;
  thumbnailAPhoto?: string;
  thumbnailBPhoto?: string;
  thumbnailCPhoto?: string;
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface MaterialWithStock extends Material {
  categoryName: string;
  locations: Array<{
    location: Location;
    stock: StockSnapshot;
    assets: Asset[];
  }>;
  totalQuantity: number | null;
  totalReserved: number | null;
  totalAvailable: number | null;
  latestSourceAt: string | null;
  isStale: boolean;
}

export interface ScanResolveResult {
  status: 'found' | 'not_found' | 'invalid' | 'unavailable';
  rawCode: string;
  targetType?: BarcodeTargetType;
  material?: MaterialWithStock;
  asset?: Asset;
  errorMessage?: string;
}
