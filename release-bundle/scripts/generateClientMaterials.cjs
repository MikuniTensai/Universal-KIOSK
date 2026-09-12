const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../permintaan-client/export_material NEW.csv');
const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean).slice(1);

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

const clientLocations = [
  { id: 'loc-a-01', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok A (Perlengkapan Gardu & Jaringan)', rack: 'Rak A1', bin: 'A.1.1 (Isolator Pin Post & Tarik)' },
  { id: 'loc-a-02', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok A (Perlengkapan Gardu & Jaringan)', rack: 'Rak A2', bin: 'A.2.1 (Lightning Arrester & FCO)' },
  { id: 'loc-a-03', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok A (Perlengkapan Gardu & Jaringan)', rack: 'Rak A3', bin: 'A.3.1 (Fuse Link 20kV)' },
  { id: 'loc-a-04', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok A (Perlengkapan Gardu & Jaringan)', rack: 'Rak A4', bin: 'A.3.2 (NH Fuse TR 63-400A)' },
  { id: 'loc-a-05', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok A (Perlengkapan Gardu & Jaringan)', rack: 'Rak A5', bin: 'A.3.3 (Konektor CCO & LLC)' },
  { id: 'loc-a-06', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok A (Perlengkapan Gardu & Jaringan)', rack: 'Rak A6', bin: 'A.3.4 (PHB-TR / LVSB & Box Panel)' },

  { id: 'loc-b-01', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Trafo)', rack: 'Jalur Hoist 1', bin: 'B.1.1 (Pondasi Trafo 100kVA)' },
  { id: 'loc-b-02', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Trafo)', rack: 'Jalur Hoist 2', bin: 'B.2.1 (Pondasi Trafo 160kVA)' },
  { id: 'loc-b-03', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Trafo)', rack: 'Jalur Hoist 3', bin: 'B.2.2 (Pondasi Trafo 250kVA)' },
  { id: 'loc-b-drum-01', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Kabel)', rack: 'Blok Drum D-01', bin: 'B.3.1 (Kabel TM 20kV)' },
  { id: 'loc-b-drum-02', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Kabel)', rack: 'Blok Drum D-02', bin: 'B.3.2 (Kabel Twisted SUTR)' },
  { id: 'loc-b-drum-03', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Kabel)', rack: 'Blok Drum D-03', bin: 'B.3.3 (Kabel Opstig NYY)' },
  { id: 'loc-b-drum-04', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok B (Heavy Material & Kabel)', rack: 'Blok Drum D-04', bin: 'B.3.4 (Konduktor AAAC)' },

  { id: 'loc-c-01', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok C (Ruang Bersih Kalibrasi APP)', rack: 'Rak A-001', bin: 'C.1.1 (Smart Meter AMI)' },
  { id: 'loc-c-02', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok C (Ruang Bersih Kalibrasi APP)', rack: 'Rak C-002', bin: 'C.1.2 (kWh Meter Pascabayar)' },
  { id: 'loc-c-03', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok C (Ruang Bersih Kalibrasi APP)', rack: 'Rak C-003', bin: 'C.1.3 (Modem 4G & Segel Putar)' },
  { id: 'loc-c-04', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok C (Ruang Bersih Kalibrasi APP)', rack: 'Rak C-004', bin: 'C.2.1 (Current Transformer CT)' },
  { id: 'loc-c-05', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok C (Ruang Bersih Kalibrasi APP)', rack: 'Rak MCB-01', bin: 'C.2.2 (MCB 1 Fasa 2-50A)' },
  { id: 'loc-c-06', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok C (Ruang Bersih Kalibrasi APP)', rack: 'Rak MCB-02', bin: 'C.2.3 (MCB 3 Fasa & MCCB)' },
  { id: 'loc-c-07', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok C (Ruang Bersih Kalibrasi APP)', rack: 'Rak Panel-01', bin: 'C.3.1 (Box Panel APP kVA)' },

  { id: 'loc-d-01', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok D (Gudang APD & Tool K3)', rack: 'Rak K3-01', bin: 'D.1.1 (Alat Kerja & Tang Inggris)' },
  { id: 'loc-d-02', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok D (Gudang APD & Tool K3)', rack: 'Rak K3-02', bin: 'D.1.2 (Cover Isolasi Satwa & Arrester)' },

  { id: 'loc-e-01', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok E (Aksesoris Sambungan Kabel)', rack: 'Rak E1', bin: 'E.1.1 (Cable Shoe AL/CU)' },
  { id: 'loc-e-02', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok E (Aksesoris Sambungan Kabel)', rack: 'Rak E2', bin: 'E.2.1 (Joint Sleeve & Ties)' },
  { id: 'loc-e-03', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok E (Aksesoris Sambungan Kabel)', rack: 'Rak E3', bin: 'E.3.1 (Dead End & Large Angle Assy)' },

  { id: 'loc-f-01', warehouseCode: 'GUD-PLN-MLG-AM01', zone: 'Blok F (Tiang & Cross Arm Travers)', rack: 'Rak F1', bin: 'F.1.1 (Cross Arm UNP 2000-3000mm)' },
];

const clientMaterials = [];
const clientStockSnapshots = [];
const clientBarcodeAliases = [];

lines.forEach((line) => {
  const match = line.match(/^(\d+),(\".*?\"|[^,]+),([^,]+),([^,]+),([^,]+)$/);
  if (!match) return;
  const [_, noStr, nameRaw, code, unitRaw, stockStr] = match;
  const no = parseInt(noStr, 10);
  const name = nameRaw.replace(/^\"|\"$/g, '').trim();
  const stock = parseInt(stockStr, 10) || 0;
  
  let unit = 'Buah';
  if (unitRaw === 'SET') unit = 'Set';
  else if (unitRaw === 'M') unit = 'Meter';
  else if (unitRaw === 'PACK') unit = 'Pack';
  else if (unitRaw === 'BH') unit = 'Buah';

  const uName = name.toUpperCase();
  let categoryId = 'cat-gardu';
  let locationId = 'loc-a-01';
  let photoPath = PHOTOS.hardware;
  let spec = 'Material standar jaringan distribusi PLN UP3 Malang. Sesuai SPLN dan standar mutu Puslitbang PLN.';

  if (uName.startsWith('TRF DIS')) {
    categoryId = 'cat-mdu';
    photoPath = PHOTOS.trafo;
    if (uName.includes('100KVA')) {
      locationId = 'loc-b-01';
      spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 100 kVA, Vektor Grup Yzn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
    } else if (uName.includes('160KVA')) {
      locationId = 'loc-b-02';
      spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 160 kVA, Vektor Grup Yzn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
    } else {
      locationId = 'loc-b-03';
      spec = 'Transformator Distribusi 3 Fasa 20kV / 400V 250 kVA, Vektor Grup Dyn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.';
    }
  } else if (uName.startsWith('TRF ACC')) {
    categoryId = 'cat-mdu';
    locationId = 'loc-b-01';
    photoPath = PHOTOS.hardware;
    spec = 'Dudukan dan konstruksi braket transformator distribusi cantol / portal pipa kabel LA-CO galvanis hot-dip.';
  } else if (uName.startsWith('CABLE PWR;')) {
    categoryId = 'cat-kabel';
    photoPath = PHOTOS.kabel;
    if (uName.includes('NA2X')) {
      locationId = 'loc-b-drum-01';
      spec = 'Kabel Tanah Tegangan Menengah 20 kV Aluminium berisolasi XLPE berlapis baja (SKTM NA2XSEYBY). Standar SPLN 43-5-1.';
    } else if (uName.includes('NFA2X')) {
      locationId = 'loc-b-drum-02';
      spec = 'Kabel Pilin Udara Tegangan Rendah (SUTR / NFA2X-T) 0.6/1kV konduktor Aluminium berisolasi XLPE tahan cuaca. Standar SPLN 42-10.';
    } else if (uName.includes('NYY')) {
      locationId = 'loc-b-drum-03';
      spec = 'Kabel Naik Gardu Opstig NYY 0.6/1kV tembaga inti tunggal/multi berisolasi PVC tebal. Standar SPLN 43-1.';
    } else {
      locationId = 'loc-b-drum-02';
      spec = 'Kabel daya distribusi standar PLN SPLN.';
    }
  } else if (uName.startsWith('CONDUCTOR;')) {
    categoryId = 'cat-kabel';
    locationId = 'loc-b-drum-04';
    photoPath = PHOTOS.kabel;
    spec = 'Kawat Penghantar Telanjang Saluran Udara Tegangan Menengah All Aluminium Alloy Conductor (AAAC/AAAC-S). Standar SPLN 41-8.';
  } else if (uName.startsWith('CABLE PWR ACC')) {
    categoryId = 'cat-kabel';
    photoPath = PHOTOS.hardware;
    if (uName.includes('CABLE SHOE')) {
      locationId = 'loc-e-01';
      spec = 'Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.';
    } else {
      locationId = 'loc-e-03';
      spec = 'Aksesoris penarik dan pengikat kabel saluran udara (Dead End Assembly / Large Angle Assembly). Standar PLN.';
    }
  } else if (uName.startsWith('COND ACC')) {
    categoryId = 'cat-kabel';
    photoPath = PHOTOS.hardware;
    if (uName.includes('JOINT') || uName.includes('SLEEVE')) {
      locationId = 'loc-e-02';
      spec = 'Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.';
    } else {
      locationId = 'loc-e-02';
      spec = 'Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).';
    }
  } else if (uName.startsWith('MTR;')) {
    categoryId = 'cat-kwh';
    locationId = uName.includes('E-PR') ? 'loc-c-01' : 'loc-c-02';
    photoPath = PHOTOS.meter;
    spec = 'Meter Listrik Elektronik (kWh Meter) presisi tinggi bersertifikat Tera Metrologi Legal. Dilengkapi optical port dan anti-tamper.';
  } else if (uName.startsWith('MTR ACC')) {
    categoryId = 'cat-kwh';
    locationId = 'loc-c-03';
    photoPath = PHOTOS.meter;
    spec = uName.includes('MODEM') ? 'Modem Komunikasi AMI 4G LTE industri terintegrasi antena gain tinggi untuk pembacaan jarak jauh AMR.' : 'Segel putar polikarbonat tahan cuaca anti-rusak untuk pengamanan kotak APP dan terminal meter.';
  } else if (uName.startsWith('CT;')) {
    categoryId = 'cat-kwh';
    locationId = 'loc-c-04';
    photoPath = PHOTOS.meter;
    spec = 'Current Transformer (Trafo Arus TR) tipe Square kelas akurasi 0.5/0.5S untuk pengukuran beban pelanggan daya menengah-besar.';
  } else if (uName.startsWith('MCB;') && (uName.includes('1P;') || uName.includes('1P;'))) {
    categoryId = 'cat-kwh';
    locationId = 'loc-c-05';
    photoPath = PHOTOS.box;
    spec = 'Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.';
  } else if (uName.startsWith('MCB;') && (uName.includes('3P;') || uName.includes('MCCB'))) {
    categoryId = 'cat-kwh';
    locationId = 'loc-c-06';
    photoPath = PHOTOS.box;
    spec = 'MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.';
  } else if (uName.startsWith('BOX') && uName.includes('KVA')) {
    categoryId = 'cat-kwh';
    locationId = 'loc-c-07';
    photoPath = PHOTOS.box;
    spec = 'Box Panel APP Pelanggan Daya Terpasang MCCB Aluminium Plat 2mm ukuran 1205x420x250mm powder coating anti korosi.';
  } else if (uName.startsWith('BOX TR') || uName.startsWith('BOX;LV')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-a-06';
    photoPath = PHOTOS.box;
    spec = 'Box Panel Distribusi / Low Voltage Main Distribution Panel (LVMDP / LVSDP) plat baja 2mm outdoor cat tahan cuaca.';
  } else if (uName.startsWith('CUT OUT ACC;FUSE LINK')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-a-03';
    photoPath = PHOTOS.fco;
    spec = 'Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.';
  } else if (uName.startsWith('CUT OUT')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-a-02';
    photoPath = PHOTOS.fco;
    spec = 'Fused Cut Out (FCO) 20-24 kV 100A rating pemutus 10-12.5 kA perlengkapan proteksi trafo gardu portal/cantol.';
  } else if (uName.startsWith('FUSE;')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-a-04';
    photoPath = PHOTOS.hardware;
    spec = 'NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.';
  } else if (uName.startsWith('ISOLATOR')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-a-01';
    photoPath = PHOTOS.isolator;
    spec = 'Isolator Tumpu Pin Post Keramik / Isolator Tarik Suspensi Polimer 24 kV kekuatan mekanis 12.5kN - 70kN.';
  } else if (uName.startsWith('LA;')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-a-02';
    photoPath = PHOTOS.fco;
    spec = 'Lightning Arrester Polimer Logam Oksida (ZnO) 20-24 kV 10 kA pengaman surja tegangan lebih petir.';
  } else if (uName.startsWith('LVSB;')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-a-06';
    photoPath = PHOTOS.box;
    spec = 'Low Voltage Switchboard (PHB-TR) 3 Fasa 400V 2-Line / 4-Line lengkap busbar tembaga dan fuse base.';
  } else if (uName.startsWith('CONN;') || uName.startsWith('CLAMP;')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-a-05';
    photoPath = PHOTOS.hardware;
    spec = 'Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.';
  } else if (uName.startsWith('POLE ACC')) {
    categoryId = 'cat-gardu';
    locationId = 'loc-f-01';
    photoPath = PHOTOS.hardware;
    spec = 'Cross Arm Travers Profil Baja UNP Galvanis Hot-Dip 2000-3000mm penguat dudukan isolator tiang SUTM.';
  } else if (uName.startsWith('TANG')) {
    categoryId = 'cat-k3';
    locationId = 'loc-d-01';
    photoPath = PHOTOS.k3;
    spec = 'Tang Inggris perkakas mekanik presisi baja vanadium berlapis krom isolasi pengaman standar ergonomis.';
  } else if (uName.includes('COVER ARRESTER') || uName.includes('COVER BUSHING')) {
    categoryId = 'cat-k3';
    locationId = 'loc-d-02';
    photoPath = PHOTOS.k3;
    spec = 'Cover isolasi silikon pelindung bushing trafo / arrester dari gangguan sentuhan satwa / pohon.';
  }

  const matId = 'mat-csv-' + String(no).padStart(3, '0');

  clientMaterials.push({
    id: matId,
    code,
    sapCode: code,
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
    locationId,
    quantity: stock,
    reserved,
    available,
    sourceAt: '2026-09-12T08:00:00+07:00',
  });

  clientBarcodeAliases.push({
    value: code,
    targetType: 'material',
    targetId: matId,
  });
});

const tsCode = `// Generated from permintaan-client/export_material NEW.csv
import { Material, Location, StockSnapshot, BarcodeAlias } from '../domain/types';

export const clientLocations: Location[] = ${JSON.stringify(clientLocations, null, 2)};

export const clientMaterials: Material[] = ${JSON.stringify(clientMaterials, null, 2)};

export const clientStockSnapshots: StockSnapshot[] = ${JSON.stringify(clientStockSnapshots, null, 2)};

export const clientBarcodeAliases: BarcodeAlias[] = ${JSON.stringify(clientBarcodeAliases, null, 2)};
`;

const outputPath = path.resolve(__dirname, '../src/data/clientMaterialsData.ts');
fs.writeFileSync(outputPath, tsCode, 'utf8');
console.log('Successfully wrote', outputPath, 'with', clientMaterials.length, 'materials.');
