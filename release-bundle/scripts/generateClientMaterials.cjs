const fs = require('fs');
const path = require('path');

// Prefer export_material NEW(1).csv if present, otherwise export_material NEW.csv
let csvPath = path.resolve(__dirname, '../permintaan-client/export_material NEW(1).csv');
if (!fs.existsSync(csvPath)) {
  csvPath = path.resolve(__dirname, '../permintaan-client/export_material NEW.csv');
}

console.log('Reading CSV from:', csvPath);
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);

function parseCSVLine(line) {
  const res = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      res.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  res.push(cur.trim());
  return res;
}

const header = parseCSVLine(lines[0]);
console.log('Detected CSV Header:', header);
const dataLines = lines.slice(1);

const PHOTOS = {
  trafo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  isolator: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80',
  meter: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
  kabel: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  fco: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
  k3: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
  box: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
  hardware: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
};

const locationsMap = new Map();
const clientMaterials = [];
const clientStockSnapshots = [];
const clientBarcodeAliases = [];

dataLines.forEach((line) => {
  const row = parseCSVLine(line);
  if (!row[0] || !row[1]) return;

  const no = parseInt(row[0], 10);
  const name = row[1];
  const normCode = row[2];
  const unitRaw = row[3] || 'BH';
  const stock = parseInt(row[4], 10) || 0;
  const blok = row[5] || 'C';
  const rakCol6 = row[6] || '-';
  const rakCol7 = row[7] || '';

  // Determine accurate rack code:
  // If Column 7 has a value (e.g. 'H12', 'A11'), use it.
  // Else if Column 6 has a value not '-', use it.
  // Otherwise '-' (Tanpa Rak / Area Terbuka).
  let rackCode = '-';
  if (rakCol7.trim()) {
    rackCode = rakCol7.trim();
  } else if (rakCol6.trim() && rakCol6.trim() !== '-') {
    rackCode = rakCol6.trim();
  }

  // Location key
  const locId = `loc-${blok.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${rackCode !== '-' ? rackCode.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'open'}`;

  if (!locationsMap.has(locId)) {
    const isBululawang = blok.toUpperCase().includes('BULULAWANG');
    const zoneName = isBululawang
      ? 'Gudang Bululawang (Penyimpanan Luar)'
      : `Blok ${blok} (Gudang Aris Munandar)`;
    const rackName = rackCode !== '-' ? `Rak ${rackCode}` : `Area Terbuka Blok ${blok}`;
    const binName = rackCode !== '-' ? rackCode : 'Luar Rak';

    locationsMap.set(locId, {
      id: locId,
      warehouseCode: 'GUD-PLN-MLG-AM01',
      zone: zoneName,
      rack: rackName,
      bin: binName,
    });
  }

  let unit = unitRaw.trim().toUpperCase();
  if (unit === 'SET') unit = 'SET';
  else if (unit === 'M') unit = 'M';
  else if (unit === 'PACK') unit = 'PACK';
  else unit = 'BH';

  const uName = name.toUpperCase();
  let categoryId = 'cat-gardu';
  let photoPath = PHOTOS.hardware;
  let spec = 'Material logistik distribusi standar PT PLN (Persero) UP3 Malang. Lolos uji spesifikasi SPLN dan standar Puslitbang PLN.';

  if (uName.startsWith('TRF DIS')) {
    categoryId = 'cat-mdu';
    photoPath = PHOTOS.trafo;
    if (uName.includes('100KVA')) {
      spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 100 kVA, Vektor Grup Yzn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
    } else if (uName.includes('160KVA')) {
      spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 160 kVA, Vektor Grup Yzn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
    } else {
      spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 250 kVA, Vektor Grup Dyn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
    }
  } else if (uName.startsWith('TRF ACC')) {
    categoryId = 'cat-mdu';
    photoPath = PHOTOS.hardware;
    spec = 'Dudukan dan konstruksi braket transformator distribusi cantol / portal pipa kabel LA-CO galvanis hot-dip.';
  } else if (uName.startsWith('CABLE PWR;') || uName.startsWith('CONDUCTOR;') || uName.startsWith('CABLE PWR ACC') || uName.startsWith('COND ACC')) {
    categoryId = 'cat-kabel';
    if (uName.startsWith('CABLE PWR ACC') || uName.startsWith('COND ACC')) {
      photoPath = PHOTOS.hardware;
      spec = 'Aksesoris kabel / sambungan konduktor tegangan menengah & rendah (sepatu kabel AL-CU, joint sleeve kompresi, side tie).';
    } else {
      photoPath = PHOTOS.kabel;
      spec = 'Kabel daya dan konduktor distribusi jaringan listrik tegangan menengah 20kV dan tegangan rendah 0.6/1kV standar SPLN.';
    }
  } else if (uName.startsWith('MTR;') || uName.startsWith('MTR ACC') || uName.startsWith('CT;') || uName.startsWith('MCB;') || (uName.startsWith('BOX') && uName.includes('KVA'))) {
    categoryId = 'cat-kwh';
    if (uName.startsWith('MTR;') || uName.startsWith('MTR ACC') || uName.startsWith('CT;')) {
      photoPath = PHOTOS.meter;
      spec = 'Peralatan Alat Pengukur & Pembatas (APP) / Smart Meter AMI, CT Trafo Arus, dan segel putar kalibrasi tera resmi.';
    } else {
      photoPath = PHOTOS.box;
      spec = 'Box Panel APP Pelanggan Daya Terpasang MCCB / MCB pembatas daya arus listrik standar PLN.';
    }
  } else if (uName.startsWith('TANG') || uName.includes('COVER ARRESTER') || uName.includes('COVER BUSHING')) {
    categoryId = 'cat-k3';
    photoPath = PHOTOS.k3;
    spec = 'Peralatan Keselamatan & Kesehatan Kerja (K3) dan cover pelindung isolasi satwa.';
  } else if (uName.startsWith('ISOLATOR')) {
    categoryId = 'cat-gardu';
    photoPath = PHOTOS.isolator;
    spec = 'Isolator Tumpu Pin Post Keramik / Isolator Tarik Suspensi Polimer 24 kV kekuatan mekanis 12.5kN - 70kN.';
  } else if (uName.startsWith('CUT OUT') || uName.startsWith('FUSE') || uName.startsWith('LA;')) {
    categoryId = 'cat-gardu';
    photoPath = PHOTOS.fco;
    spec = 'Peralatan proteksi gardu distribusi (FCO 20kV, Fuse Link, Lightning Arrester, dan NH Fuse TR).';
  } else if (uName.startsWith('BOX TR') || uName.startsWith('BOX;LV') || uName.startsWith('LVSB;')) {
    categoryId = 'cat-gardu';
    photoPath = PHOTOS.box;
    spec = 'Panel Hubung Bagi Tegangan Rendah (PHB-TR / LVSB) dan box panel distribusi outdoor.';
  }

  const matId = 'mat-csv-' + String(no).padStart(3, '0');

  clientMaterials.push({
    id: matId,
    code: normCode,
    sapCode: normCode,
    name,
    categoryId,
    unit,
    specification: spec,
    photoPath,
  });

  const reserved = stock > 5 ? Math.floor(stock * 0.1) : 0;
  const available = stock - reserved;

  clientStockSnapshots.push({
    materialId: matId,
    locationId: locId,
    quantity: stock,
    reserved,
    available,
    sourceAt: '2026-09-12T08:00:00+07:00',
  });

  // Barcode / QR alias: search by normalization code or rack code
  clientBarcodeAliases.push({
    value: normCode,
    targetType: 'material',
    targetId: matId,
  });
});

const clientLocations = Array.from(locationsMap.values());

const tsCode = `// Generated from permintaan-client/export_material NEW(1).csv
import { Material, Location, StockSnapshot, BarcodeAlias } from '../domain/types';

export const clientLocations: Location[] = ${JSON.stringify(clientLocations, null, 2)};

export const clientMaterials: Material[] = ${JSON.stringify(clientMaterials, null, 2)};

export const clientStockSnapshots: StockSnapshot[] = ${JSON.stringify(clientStockSnapshots, null, 2)};

export const clientBarcodeAliases: BarcodeAlias[] = ${JSON.stringify(clientBarcodeAliases, null, 2)};
`;

const outputPath = path.resolve(__dirname, '../src/data/clientMaterialsData.ts');
fs.writeFileSync(outputPath, tsCode, 'utf8');
console.log('Successfully wrote', outputPath, 'with', clientMaterials.length, 'materials and', clientLocations.length, 'unique locations.');
