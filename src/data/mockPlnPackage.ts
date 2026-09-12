import { ImportPackage, KioskConfig } from '../domain/types';
import {
  clientLocations,
  clientMaterials,
  clientStockSnapshots,
  clientBarcodeAliases,
} from './clientMaterialsData';
import cardLayoutImg from '../assets/cards/card_layout.webp';
import cardSopImg from '../assets/cards/card_sop.webp';
import cardKatalogImg from '../assets/cards/card_katalog.webp';
import wallpaperWarehouseImg from '../assets/cards/wallpaper_warehouse.webp';

export const WALLPAPER_PRESETS = {
  warehouse: {
    id: 'warehouse',
    name: 'Gudang Logistik Modern PLN',
    url: wallpaperWarehouseImg,
    description: 'Lorong rak material gudang dengan pencahayaan hangat',
  },
  substation: {
    id: 'substation',
    name: 'Gardu Induk & Distribusi Listrik 20kV',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1920&q=80',
    description: 'Transformator daya dan jaringan distribusi listrik PLN',
  },
  safety: {
    id: 'safety',
    name: 'Budaya Keselamatan Kerja K3 (Zero Accident)',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80',
    description: 'Petugas lapangan & insinyur dengan APD keselamatan kerja',
  },
  none: {
    id: 'none',
    name: 'Gradien Gelap Minimalis',
    url: '',
    description: 'Latar gradien slate gelap polos tanpa foto',
  },
};

export const DEFAULT_CARD_PHOTOS = {
  thumbnailA: cardSopImg, // Tim teknisi meninjau SOP/program
  thumbnailB: cardKatalogImg, // Rak gudang material tersusun rapi
  thumbnailC: cardLayoutImg, // Visualisasi denah & rak gudang
};

export const defaultKioskConfig: KioskConfig = {
  organizationName: 'PT PLN (Persero) UP3 Malang',
  warehouseCode: 'UP3 MALANG',
  timezone: 'Asia/Jakarta',
  idleSeconds: 60,
  warningSeconds: 10,
  staleAfterHours: 24,
  orientation: 'landscape',
  cardStyle: 'photo', // Default: Foto bergambar nyata (sangat disukai orang-orang lama & petugas senior)
  wallpaperPreset: 'warehouse',
  thumbnailAPhoto: DEFAULT_CARD_PHOTOS.thumbnailA,
  thumbnailBPhoto: DEFAULT_CARD_PHOTOS.thumbnailB,
  thumbnailCPhoto: DEFAULT_CARD_PHOTOS.thumbnailC,
};

export const samplePlnPackage: ImportPackage = {
  schemaVersion: '1.0',
  datasetVersion: 1,
  sourceName: 'PLN ERP SAP Logistik Terpadu UP3 Malang',
  sourceAt: '2026-09-11T08:00:00+07:00',
  packageHash: 'pln-snapshot-v1-hash-20260911',
  categories: [
    { id: 'cat-mdu', name: 'Material Distribusi Utama (MDU)', sortOrder: 1, active: true },
    { id: 'cat-gardu', name: 'Perlengkapan Gardu & Jaringan', sortOrder: 2, active: true },
    { id: 'cat-kwh', name: 'Alat Pengukur & Pembatas (APP)', sortOrder: 3, active: true },
    { id: 'cat-k3', name: 'Alat Pelindung Diri (APD) & K3', sortOrder: 4, active: true },
    { id: 'cat-kabel', name: 'Kabel & Aksesoris Sambungan', sortOrder: 5, active: true },
  ],
  locations: [
    { id: 'loc-01', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Trafo)', rack: 'Jalur Hoist 2', bin: 'B.2.1 (Blok H-04)' },
    { id: 'loc-02', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok A (Rak Perlengkapan Gardu)', rack: 'Rak A3', bin: 'A.3.1 (Tingkat 2)' },
    { id: 'loc-03', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok C (Ruang Bersih Kalibrasi APP)', rack: 'Rak A-001', bin: 'C.1.1 (Kotak 12 kWh Meter)' },
    { id: 'loc-04', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok D (Gudang APD & Tool K3)', rack: 'Rak K3-01', bin: 'D.1.1 (Rak 1)' },
    { id: 'loc-05', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Kabel)', rack: 'Blok Drum D-02', bin: 'B.3.2 (Jalur 1)' },
  ],
  materials: [
    {
      id: 'mat-001',
      code: '000123',
      sapCode: '100028471',
      name: 'Transformator Distribusi 3 Fasa 100 kVA 20kV / 400V',
      categoryId: 'cat-mdu',
      unit: 'Unit',
      specification: 'Tegangan Primer 20 kV, Sekunder 400/230 V, Hermetically Sealed, Standar SPLN D3.002-1:2007. Lolos Uji Hubung Singkat Puslitbang PLN.',
      photoPath: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mat-002',
      code: '000456',
      sapCode: '100039210',
      name: 'Isolator Tumpu Keramik (Pin Post) 20 kV',
      categoryId: 'cat-gardu',
      unit: 'Buah',
      specification: 'Bahan Keramik Glasir Coklat, Jarak Rayap 650 mm, Cantilever Strength 12.5 kN, Standar SPLN 10-1C:1996.',
      photoPath: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mat-003',
      code: '000789',
      sapCode: '100045129',
      name: 'Smart Meter Listrik (kWh Meter) AMI 1 Fasa 5(60)A',
      categoryId: 'cat-kwh',
      unit: 'Buah',
      specification: 'Komunikasi Seluler 4G LTE Cat-M1/NB-IoT & RF Mesh, Optical Port IEC 62056-21, Relai Pemutus Terintegrasi, Sertifikasi Balai Metrologi.',
      photoPath: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mat-004',
      code: '001012',
      sapCode: '100062301',
      name: 'Helm Safety K3 Proyek V-Gard Full Brim Putih',
      categoryId: 'cat-k3',
      unit: 'Buah',
      specification: 'Material High-Density Polyethylene (HDPE), Fas-Trac III Suspension, Uji Dielektrik Class E (20.000 Volt), Standar ANSI/ISEA Z89.1-2014 & SNI.',
      photoPath: 'https://images.unsplash.com/photo-1578873375969-d65274936d93?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mat-005',
      code: '001345',
      sapCode: '100078902',
      name: 'Kabel MVTIC 3 x 150 mm² + 1 x 95 mm² 20 kV (Medium Voltage Twisted)',
      categoryId: 'cat-kabel',
      unit: 'Meter',
      specification: 'Konduktor Aluminium Padat / Pilin, Isolasi XLPE, Layar Pita Tembaga, Selubung Luar PVC Tahan Cuaca, Standar SPLN 43-5-6.',
      photoPath: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mat-006',
      code: '001678',
      sapCode: '100088211',
      name: 'Fused Cut Out (FCO) Polymer 24 kV 100A',
      categoryId: 'cat-gardu',
      unit: 'Set',
      specification: 'Isolator Silikon Polimer Hidrofobik, Fuse Tube Fiber-Glass, Rating Pemutus Simetris 8 kA, Standar SPLN 64:1985.',
      photoPath: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    },
  ],
  assets: [
    { id: 'ast-01', materialId: 'mat-001', serialNumber: 'TRF-TRAFOINDO-2026-081', locationId: 'loc-01' },
    { id: 'ast-02', materialId: 'mat-001', serialNumber: 'TRF-TRAFOINDO-2026-082', locationId: 'loc-01' },
    { id: 'ast-03', materialId: 'mat-003', serialNumber: 'AMI-HEX-2026-00912', locationId: 'loc-03' },
  ],
  barcodeAliases: [
    { value: '000123', targetType: 'material', targetId: 'mat-001' },
    { value: 'PLN-TRF-100KVA-2026', targetType: 'material', targetId: 'mat-001' },
    { value: 'TRF-TRAFOINDO-2026-081', targetType: 'asset', targetId: 'ast-01' },
    { value: '000456', targetType: 'material', targetId: 'mat-002' },
    { value: 'PLN-ISO-20KV-PIN', targetType: 'material', targetId: 'mat-002' },
    { value: 'A.3.1', targetType: 'material', targetId: 'mat-002' },
    { value: '000789', targetType: 'material', targetId: 'mat-003' },
    { value: 'kwh', targetType: 'material', targetId: 'mat-003' },
    { value: 'RAK-A-001', targetType: 'material', targetId: 'mat-003' },
    { value: 'A-001', targetType: 'material', targetId: 'mat-003' },
    { value: 'C.1.1', targetType: 'material', targetId: 'mat-003' },
    { value: 'AMI-HEX-2026-00912', targetType: 'asset', targetId: 'ast-03' },
    { value: '001012', targetType: 'material', targetId: 'mat-004' },
    { value: 'D.1.1', targetType: 'material', targetId: 'mat-004' },
    { value: 'PLN-K3-HELM-PUTIH', targetType: 'material', targetId: 'mat-004' },
    { value: '001345', targetType: 'material', targetId: 'mat-005' },
    { value: 'B.3.2', targetType: 'material', targetId: 'mat-005' },
    { value: '001678', targetType: 'material', targetId: 'mat-006' },
    { value: 'B.2.1', targetType: 'material', targetId: 'mat-001' },
  ],
  stockSnapshots: [
    {
      materialId: 'mat-001',
      locationId: 'loc-01',
      quantity: 4,
      reserved: 2,
      available: 2,
      sourceAt: '2026-09-11T08:00:00+07:00',
    },
    {
      materialId: 'mat-002',
      locationId: 'loc-02',
      quantity: 85,
      reserved: 15,
      available: 70,
      sourceAt: '2026-09-11T08:00:00+07:00',
    },
    {
      materialId: 'mat-003',
      locationId: 'loc-03',
      quantity: 240,
      reserved: 40,
      available: 200,
      sourceAt: '2026-09-11T08:00:00+07:00',
    },
    {
      materialId: 'mat-004',
      locationId: 'loc-04',
      quantity: 35,
      reserved: 0,
      available: 35,
      sourceAt: '2026-09-11T08:00:00+07:00',
    },
    {
      materialId: 'mat-005',
      locationId: 'loc-05',
      quantity: 1250, // 1250 Meter
      reserved: 300,
      available: 950,
      sourceAt: '2026-09-11T08:00:00+07:00',
    },
    {
      materialId: 'mat-006',
      locationId: 'loc-02',
      quantity: 0, // Habis terpasang
      reserved: 0,
      available: 0,
      sourceAt: '2026-09-11T08:00:00+07:00',
    },
  ],
  contentItems: [
    {
      id: 'cnt-01',
      title: 'Budaya K3 & Keselamatan Kerja PLN Logistik',
      type: 'text',
      localPath: null,
      text: 'Zero Accident adalah komitmen utama kami. Wajib gunakan APD lengkap: Helm Safety, Sepatu Safety, dan Rompi Reflektif saat berada di area gudang.',
      order: 1,
      validFrom: '2026-01-01T00:00:00+07:00',
      validUntil: '2026-12-31T23:59:59+07:00',
    },
    {
      id: 'cnt-02',
      title: 'Penerapan 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke)',
      type: 'text',
      localPath: null,
      text: 'Ringkas, Rapi, Resik, Rawat, Rajin. Pastikan setiap material distribusi tersusun pada blok rak sesuai normalisasi SAP PLN.',
      order: 2,
      validFrom: '2026-01-01T00:00:00+07:00',
      validUntil: '2026-12-31T23:59:59+07:00',
    },
    {
      id: 'cnt-03',
      title: 'Roadmap Digitalisasi Pergudangan Cerdas 2026',
      type: 'text',
      localPath: null,
      text: 'Integrasi Barcode 2D pada seluruh material MDU dan Non-MDU untuk percepatan suplai kebutuhan pemeliharaan jaringan distribusi.',
      order: 3,
      validFrom: '2026-01-01T00:00:00+07:00',
      validUntil: '2026-12-31T23:59:59+07:00',
    },
  ],
};

/**
 * Paket Lengkap 151 Material Aktual PLN UP3 Malang (Gudang Aris Munandar)
 * Berdasarkan permintaan-client/export_material NEW(1).csv (dengan BLOK dan RAK aktual)
 */
export const plnUp3MalangFullPackage: ImportPackage = {
  schemaVersion: '1.0',
  datasetVersion: 3,
  sourceName: 'PLN ERP SAP Logistik Terpadu UP3 Malang (export_material NEW(1).csv)',
  sourceAt: '2026-09-12T08:00:00+07:00',
  packageHash: 'pln-snapshot-v3-hash-20260912-blok-rak',
  categories: samplePlnPackage.categories,
  locations: [
    ...samplePlnPackage.locations,
    ...clientLocations,
  ],
  materials: [
    ...samplePlnPackage.materials,
    ...clientMaterials,
  ],
  assets: samplePlnPackage.assets,
  barcodeAliases: [
    ...samplePlnPackage.barcodeAliases,
    ...clientBarcodeAliases,
  ],
  stockSnapshots: [
    ...samplePlnPackage.stockSnapshots,
    ...clientStockSnapshots,
  ],
  contentItems: samplePlnPackage.contentItems,
};
