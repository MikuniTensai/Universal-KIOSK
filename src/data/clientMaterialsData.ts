// Generated from permintaan-client/export_material NEW.csv
import { Material, Location, StockSnapshot, BarcodeAlias } from '../domain/types';

export const clientLocations: Location[] = [
  {
    "id": "loc-a-01",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok A (Perlengkapan Gardu & Jaringan)",
    "rack": "Rak A1",
    "bin": "A.1.1 (Isolator Pin Post & Tarik)"
  },
  {
    "id": "loc-a-02",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok A (Perlengkapan Gardu & Jaringan)",
    "rack": "Rak A2",
    "bin": "A.2.1 (Lightning Arrester & FCO)"
  },
  {
    "id": "loc-a-03",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok A (Perlengkapan Gardu & Jaringan)",
    "rack": "Rak A3",
    "bin": "A.3.1 (Fuse Link 20kV)"
  },
  {
    "id": "loc-a-04",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok A (Perlengkapan Gardu & Jaringan)",
    "rack": "Rak A4",
    "bin": "A.3.2 (NH Fuse TR 63-400A)"
  },
  {
    "id": "loc-a-05",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok A (Perlengkapan Gardu & Jaringan)",
    "rack": "Rak A5",
    "bin": "A.3.3 (Konektor CCO & LLC)"
  },
  {
    "id": "loc-a-06",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok A (Perlengkapan Gardu & Jaringan)",
    "rack": "Rak A6",
    "bin": "A.3.4 (PHB-TR / LVSB & Box Panel)"
  },
  {
    "id": "loc-b-01",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok B (Heavy Material & Trafo)",
    "rack": "Jalur Hoist 1",
    "bin": "B.1.1 (Pondasi Trafo 100kVA)"
  },
  {
    "id": "loc-b-02",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok B (Heavy Material & Trafo)",
    "rack": "Jalur Hoist 2",
    "bin": "B.2.1 (Pondasi Trafo 160kVA)"
  },
  {
    "id": "loc-b-03",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok B (Heavy Material & Trafo)",
    "rack": "Jalur Hoist 3",
    "bin": "B.2.2 (Pondasi Trafo 250kVA)"
  },
  {
    "id": "loc-b-drum-01",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok B (Heavy Material & Kabel)",
    "rack": "Blok Drum D-01",
    "bin": "B.3.1 (Kabel TM 20kV)"
  },
  {
    "id": "loc-b-drum-02",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok B (Heavy Material & Kabel)",
    "rack": "Blok Drum D-02",
    "bin": "B.3.2 (Kabel Twisted SUTR)"
  },
  {
    "id": "loc-b-drum-03",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok B (Heavy Material & Kabel)",
    "rack": "Blok Drum D-03",
    "bin": "B.3.3 (Kabel Opstig NYY)"
  },
  {
    "id": "loc-b-drum-04",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok B (Heavy Material & Kabel)",
    "rack": "Blok Drum D-04",
    "bin": "B.3.4 (Konduktor AAAC)"
  },
  {
    "id": "loc-c-01",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok C (Ruang Bersih Kalibrasi APP)",
    "rack": "Rak A-001",
    "bin": "C.1.1 (Smart Meter AMI)"
  },
  {
    "id": "loc-c-02",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok C (Ruang Bersih Kalibrasi APP)",
    "rack": "Rak C-002",
    "bin": "C.1.2 (kWh Meter Pascabayar)"
  },
  {
    "id": "loc-c-03",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok C (Ruang Bersih Kalibrasi APP)",
    "rack": "Rak C-003",
    "bin": "C.1.3 (Modem 4G & Segel Putar)"
  },
  {
    "id": "loc-c-04",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok C (Ruang Bersih Kalibrasi APP)",
    "rack": "Rak C-004",
    "bin": "C.2.1 (Current Transformer CT)"
  },
  {
    "id": "loc-c-05",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok C (Ruang Bersih Kalibrasi APP)",
    "rack": "Rak MCB-01",
    "bin": "C.2.2 (MCB 1 Fasa 2-50A)"
  },
  {
    "id": "loc-c-06",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok C (Ruang Bersih Kalibrasi APP)",
    "rack": "Rak MCB-02",
    "bin": "C.2.3 (MCB 3 Fasa & MCCB)"
  },
  {
    "id": "loc-c-07",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok C (Ruang Bersih Kalibrasi APP)",
    "rack": "Rak Panel-01",
    "bin": "C.3.1 (Box Panel APP kVA)"
  },
  {
    "id": "loc-d-01",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok D (Gudang APD & Tool K3)",
    "rack": "Rak K3-01",
    "bin": "D.1.1 (Alat Kerja & Tang Inggris)"
  },
  {
    "id": "loc-d-02",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok D (Gudang APD & Tool K3)",
    "rack": "Rak K3-02",
    "bin": "D.1.2 (Cover Isolasi Satwa & Arrester)"
  },
  {
    "id": "loc-e-01",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok E (Aksesoris Sambungan Kabel)",
    "rack": "Rak E1",
    "bin": "E.1.1 (Cable Shoe AL/CU)"
  },
  {
    "id": "loc-e-02",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok E (Aksesoris Sambungan Kabel)",
    "rack": "Rak E2",
    "bin": "E.2.1 (Joint Sleeve & Ties)"
  },
  {
    "id": "loc-e-03",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok E (Aksesoris Sambungan Kabel)",
    "rack": "Rak E3",
    "bin": "E.3.1 (Dead End & Large Angle Assy)"
  },
  {
    "id": "loc-f-01",
    "warehouseCode": "GUD-PLN-MLG-AM01",
    "zone": "Blok F (Tiang & Cross Arm Travers)",
    "rack": "Rak F1",
    "bin": "F.1.1 (Cross Arm UNP 2000-3000mm)"
  }
];

export const clientMaterials: Material[] = [
  {
    "id": "mat-csv-001",
    "code": "4120470",
    "sapCode": "4120470",
    "name": "BOX 105 KVA - BOX;APPMCCB160A+STRIP;AL2MM;1205X420X250",
    "categoryId": "cat-kwh",
    "unit": "Set",
    "specification": "Box Panel APP Pelanggan Daya Terpasang MCCB Aluminium Plat 2mm ukuran 1205x420x250mm powder coating anti korosi.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-002",
    "code": "4120472",
    "sapCode": "4120472",
    "name": "BOX 147 KVA - BOX;APPMCCB225A+STRIP;AL2MM;1205X420X250",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Box Panel APP Pelanggan Daya Terpasang MCCB Aluminium Plat 2mm ukuran 1205x420x250mm powder coating anti korosi.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-003",
    "code": "4120473",
    "sapCode": "4120473",
    "name": "BOX 164 KVA - BOX;APPMCCB250A+STRIP;AL2MM;1205X420X250",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Box Panel APP Pelanggan Daya Terpasang MCCB Aluminium Plat 2mm ukuran 1205x420x250mm powder coating anti korosi.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-004",
    "code": "4120474",
    "sapCode": "4120474",
    "name": "BOX 197 KVA - BOX;APPMCCB300A+STRIP;AL2MM;1205X420X250",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Box Panel APP Pelanggan Daya Terpasang MCCB Aluminium Plat 2mm ukuran 1205x420x250mm powder coating anti korosi.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-005",
    "code": "4120467",
    "sapCode": "4120467",
    "name": "BOX 53KVA - BOX;APPMCCB80A+STRIP;AL2MM;1205X420X250",
    "categoryId": "cat-kwh",
    "unit": "Meter",
    "specification": "Box Panel APP Pelanggan Daya Terpasang MCCB Aluminium Plat 2mm ukuran 1205x420x250mm powder coating anti korosi.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-006",
    "code": "4120468",
    "sapCode": "4120468",
    "name": "BOX 66KVA - BOX;APPMCCB100A+STRIP;AL2MM;1205X420X250",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Box Panel APP Pelanggan Daya Terpasang MCCB Aluminium Plat 2mm ukuran 1205x420x250mm powder coating anti korosi.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-007",
    "code": "4120469",
    "sapCode": "4120469",
    "name": "BOX 82,5 KVA - BOX;APPMCCB125A+STRIP;AL2MM;1205X420X250",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Box Panel APP Pelanggan Daya Terpasang MCCB Aluminium Plat 2mm ukuran 1205x420x250mm powder coating anti korosi.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-008",
    "code": "4120538",
    "sapCode": "4120538",
    "name": "BOX TR - BOX;APP PL CB;AL1.6MM;650X400X220MM",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Box Panel Distribusi / Low Voltage Main Distribution Panel (LVMDP / LVSDP) plat baja 2mm outdoor cat tahan cuaca.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-009",
    "code": "4120079",
    "sapCode": "4120079",
    "name": "BOX;LVMDP ;ST PLATE 2mm;80X90X40cm",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Box Panel Distribusi / Low Voltage Main Distribution Panel (LVMDP / LVSDP) plat baja 2mm outdoor cat tahan cuaca.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-010",
    "code": "4120453",
    "sapCode": "4120453",
    "name": "BOX;LVSDP;CABANG;STPLATE 2MM;80X107X30CM",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Box Panel Distribusi / Low Voltage Main Distribution Panel (LVMDP / LVSDP) plat baja 2mm outdoor cat tahan cuaca.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-011",
    "code": "3120159",
    "sapCode": "3120159",
    "name": "CABLE PWR ACC;CABLE SHOE AL-CU 1H 150mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-012",
    "code": "3120154",
    "sapCode": "3120154",
    "name": "CABLE PWR ACC;CABLE SHOE AL-CU 1H 35mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-013",
    "code": "3120156",
    "sapCode": "3120156",
    "name": "CABLE PWR ACC;CABLE SHOE AL-CU 1H 70mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-014",
    "code": "3120171",
    "sapCode": "3120171",
    "name": "CABLE PWR ACC;CABLE SHOE AL-CU 2H 150mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-015",
    "code": "3120223",
    "sapCode": "3120223",
    "name": "CABLE PWR ACC;CABLE SHOE CU ID 1H 10mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-016",
    "code": "3120231",
    "sapCode": "3120231",
    "name": "CABLE PWR ACC;CABLE SHOE CU ID 1H 150mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-017",
    "code": "3120226",
    "sapCode": "3120226",
    "name": "CABLE PWR ACC;CABLE SHOE CU ID 1H 35mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-018",
    "code": "3120227",
    "sapCode": "3120227",
    "name": "CABLE PWR ACC;CABLE SHOE CU ID 1H 50mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-019",
    "code": "3120228",
    "sapCode": "3120228",
    "name": "CABLE PWR ACC;CABLE SHOE CU ID 1H 70mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Sepatu kabel (cable lug / bimetal AL-CU) kompresi presisi tinggi untuk terminasi kabel distribusi TR/TM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-020",
    "code": "3120038",
    "sapCode": "3120038",
    "name": "CABLE PWR ACC;DEAD END ASSY FIXED 70mm",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris penarik dan pengikat kabel saluran udara (Dead End Assembly / Large Angle Assembly). Standar PLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-021",
    "code": "3120058",
    "sapCode": "3120058",
    "name": "CABLE PWR ACC;LARGE ANGLE ASSY  70mm",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris penarik dan pengikat kabel saluran udara (Dead End Assembly / Large Angle Assembly). Standar PLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-022",
    "code": "3110014",
    "sapCode": "3110014",
    "name": "CABLE PWR;NA2XSEYBY;3X150mm2;20kV;UG",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Tanah Tegangan Menengah 20 kV Aluminium berisolasi XLPE berlapis baja (SKTM NA2XSEYBY). Standar SPLN 43-5-1.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-023",
    "code": "3110015",
    "sapCode": "3110015",
    "name": "CABLE PWR;NA2XSEYBY;3X240mm2;20kV;UG",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Tanah Tegangan Menengah 20 kV Aluminium berisolasi XLPE berlapis baja (SKTM NA2XSEYBY). Standar SPLN 43-5-1.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-024",
    "code": "3110039",
    "sapCode": "3110039",
    "name": "CABLE PWR;NFA2X-T;3X35+1X35;0.6/1kV;OH",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Pilin Udara Tegangan Rendah (SUTR / NFA2X-T) 0.6/1kV konduktor Aluminium berisolasi XLPE tahan cuaca. Standar SPLN 42-10.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-025",
    "code": "3110542",
    "sapCode": "3110542",
    "name": "CABLE PWR;NFA2X-T;3X70+1X70;0.6/1kV;OH",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Pilin Udara Tegangan Rendah (SUTR / NFA2X-T) 0.6/1kV konduktor Aluminium berisolasi XLPE tahan cuaca. Standar SPLN 42-10.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-026",
    "code": "3110025",
    "sapCode": "3110025",
    "name": "CABLE PWR;NFA2X;2X10mm2;0.6/1kV;OH",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Pilin Udara Tegangan Rendah (SUTR / NFA2X-T) 0.6/1kV konduktor Aluminium berisolasi XLPE tahan cuaca. Standar SPLN 42-10.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-027",
    "code": "3110026",
    "sapCode": "3110026",
    "name": "CABLE PWR;NFA2X;2X16mm2;0.6/1kV;OH",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Pilin Udara Tegangan Rendah (SUTR / NFA2X-T) 0.6/1kV konduktor Aluminium berisolasi XLPE tahan cuaca. Standar SPLN 42-10.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-028",
    "code": "3110029",
    "sapCode": "3110029",
    "name": "CABLE PWR;NFA2X;4X16mm2;0.6/1kV;OH",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Pilin Udara Tegangan Rendah (SUTR / NFA2X-T) 0.6/1kV konduktor Aluminium berisolasi XLPE tahan cuaca. Standar SPLN 42-10.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-029",
    "code": "3110030",
    "sapCode": "3110030",
    "name": "CABLE PWR;NFA2X;4X25mm2;0.6/1kV;OH",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Pilin Udara Tegangan Rendah (SUTR / NFA2X-T) 0.6/1kV konduktor Aluminium berisolasi XLPE tahan cuaca. Standar SPLN 42-10.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-030",
    "code": "3110034",
    "sapCode": "3110034",
    "name": "CABLE PWR;NFA2XSY-T;3X150+1X95;20kV;OH",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Pilin Udara Tegangan Rendah (SUTR / NFA2X-T) 0.6/1kV konduktor Aluminium berisolasi XLPE tahan cuaca. Standar SPLN 42-10.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-031",
    "code": "3110516",
    "sapCode": "3110516",
    "name": "CABLE PWR;NYY;1X150mm2;0.6/1kV;Opstig",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Naik Gardu Opstig NYY 0.6/1kV tembaga inti tunggal/multi berisolasi PVC tebal. Standar SPLN 43-1.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-032",
    "code": "3110518",
    "sapCode": "3110518",
    "name": "CABLE PWR;NYY;4X70mm2;0.6/1kV;Opstig",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kabel Naik Gardu Opstig NYY 0.6/1kV tembaga inti tunggal/multi berisolasi PVC tebal. Standar SPLN 43-1.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-033",
    "code": "2230042",
    "sapCode": "2230042",
    "name": "CLAMP;PG;CU;50mm2;BOLT",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-034",
    "code": "3060192",
    "sapCode": "3060192",
    "name": "COND ACC;ALL BINDING WIRE 2.0mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-035",
    "code": "3061272",
    "sapCode": "3061272",
    "name": "COND ACC;ALL BINDING WIRE 4.0MM2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-036",
    "code": "3060644",
    "sapCode": "3060644",
    "name": "COND ACC;COMP JOINT INTS COVER 35mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-037",
    "code": "3060642",
    "sapCode": "3060642",
    "name": "COND ACC;COMP JOINT INTS COVER70mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-038",
    "code": "3060382",
    "sapCode": "3060382",
    "name": "COND ACC;DOUBLE SIDE TIE 150mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-039",
    "code": "3061804",
    "sapCode": "3061804",
    "name": "COND ACC;EXT GROUND WIRE TYPE A",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-040",
    "code": "3061805",
    "sapCode": "3061805",
    "name": "COND ACC;EXT GROUND WIRE TYPE B",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-041",
    "code": "3060145",
    "sapCode": "3060145",
    "name": "COND ACC;JOINT SLEEVE AL 150mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-042",
    "code": "3060409",
    "sapCode": "3060409",
    "name": "COND ACC;JOINT SLEEVE AL 185mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-043",
    "code": "3060143",
    "sapCode": "3060143",
    "name": "COND ACC;JOINT SLEEVE AL 70mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-044",
    "code": "3060233",
    "sapCode": "3060233",
    "name": "COND ACC;JOINT SLEEVE ALCU 70mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-045",
    "code": "3060132",
    "sapCode": "3060132",
    "name": "COND ACC;NON TENSION JOINT AL 150mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-046",
    "code": "3060133",
    "sapCode": "3060133",
    "name": "COND ACC;NON TENSION JOINT AL 240mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-047",
    "code": "3060130",
    "sapCode": "3060130",
    "name": "COND ACC;NON TENSION JOINT AL 70mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Joint sleeve sambungan kompresi bimetal konduktor saluran udara SUTM / SUTR tahan tarikan mekanis.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-048",
    "code": "3060051",
    "sapCode": "3060051",
    "name": "COND ACC;PLSTIC TREE GUARD 150MM2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-049",
    "code": "3060152",
    "sapCode": "3060152",
    "name": "COND ACC;PLSTIC TREE GUARD 240mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-050",
    "code": "3060050",
    "sapCode": "3060050",
    "name": "COND ACC;PLSTIC TREE GUARD 70MM2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-051",
    "code": "3060504",
    "sapCode": "3060504",
    "name": "COND ACC;SIDE TIE 150mm2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-052",
    "code": "3060677",
    "sapCode": "3060677",
    "name": "COND ACC;TOP TIES 150MM2",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Aksesoris konduktor (binding wire, side tie, top ties, tree guard plastik pelindung dahan).",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-053",
    "code": "3050084",
    "sapCode": "3050084",
    "name": "CONDUCTOR;AAAC-S;150mm2;",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kawat Penghantar Telanjang Saluran Udara Tegangan Menengah All Aluminium Alloy Conductor (AAAC/AAAC-S). Standar SPLN 41-8.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-054",
    "code": "3050004",
    "sapCode": "3050004",
    "name": "CONDUCTOR;AAAC;70mm2;21.07kN",
    "categoryId": "cat-kabel",
    "unit": "Buah",
    "specification": "Kawat Penghantar Telanjang Saluran Udara Tegangan Menengah All Aluminium Alloy Conductor (AAAC/AAAC-S). Standar SPLN 41-8.",
    "photoPath": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-055",
    "code": "3280456",
    "sapCode": "3280456",
    "name": "CONN;1KV;CCO;AL;35-50/10-16;INSUL;PITA",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-056",
    "code": "3280457",
    "sapCode": "3280457",
    "name": "CONN;1KV;CCO;AL;35-50/35-50;INSUL;PITA",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-057",
    "code": "3280458",
    "sapCode": "3280458",
    "name": "CONN;1KV;CCO;AL;35-70/10-16;INSUL;PITA",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-058",
    "code": "3280459",
    "sapCode": "3280459",
    "name": "CONN;1KV;CCO;AL;50-70/50-70;INSUL;PITA",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-059",
    "code": "3280460",
    "sapCode": "3280460",
    "name": "CONN;1KV;CCO;AL;70-95/10-16;INSUL;PITA",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-060",
    "code": "3280461",
    "sapCode": "3280461",
    "name": "CONN;1KV;CCO;AL;70-95/25-35;INSUL;PITA",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-061",
    "code": "3280474",
    "sapCode": "3280474",
    "name": "CONN;1KV;CCO;AL;70-95/70-95;INSUL;PITA",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-062",
    "code": "3280282",
    "sapCode": "3280282",
    "name": "CONN;1kV;CCO;AL;120-150/50-70mm2;PRS;",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-063",
    "code": "3280466",
    "sapCode": "3280466",
    "name": "CONN;20KV;CCO;AL;150-150MM2;PRS;",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-064",
    "code": "3280129",
    "sapCode": "3280129",
    "name": "CONN;20KV;LLC;AL;70-150mm2; BOLT",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-065",
    "code": "3280384",
    "sapCode": "3280384",
    "name": "CONN;20kV;CCO;AL;70-150mm2;PRS",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-066",
    "code": "3280186",
    "sapCode": "3280186",
    "name": "CONN;20kV;LLC;AL;240/150MM2;PRS;2BOLT",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-067",
    "code": "3280158",
    "sapCode": "3280158",
    "name": "CONN;20kV;LLC;AL;35-70mm2;PRS;2BOLT",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Konektor Kompresi CCO Aluminium / Konektor Piercing LLC kedap air anti-korosi standar SPLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-068",
    "code": "2050128",
    "sapCode": "2050128",
    "name": "CT;380/220V;SQUARE;100/5A;0.5;5VA;P",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Current Transformer (Trafo Arus TR) tipe Square kelas akurasi 0.5/0.5S untuk pengukuran beban pelanggan daya menengah-besar.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-069",
    "code": "2050133",
    "sapCode": "2050133",
    "name": "CT;380/220V;SQUARE;150/5A;0.5;5VA;P",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Current Transformer (Trafo Arus TR) tipe Square kelas akurasi 0.5/0.5S untuk pengukuran beban pelanggan daya menengah-besar.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-070",
    "code": "2050136",
    "sapCode": "2050136",
    "name": "CT;380/220V;SQUARE;200/5A;0.5;5VA;P",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Current Transformer (Trafo Arus TR) tipe Square kelas akurasi 0.5/0.5S untuk pengukuran beban pelanggan daya menengah-besar.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-071",
    "code": "2050139",
    "sapCode": "2050139",
    "name": "CT;380/220V;SQUARE;250/5A;0.5;5VA;P",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Current Transformer (Trafo Arus TR) tipe Square kelas akurasi 0.5/0.5S untuk pengukuran beban pelanggan daya menengah-besar.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-072",
    "code": "2050142",
    "sapCode": "2050142",
    "name": "CT;380/220V;SQUARE;300/5A;0.5;5VA;P",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Current Transformer (Trafo Arus TR) tipe Square kelas akurasi 0.5/0.5S untuk pengukuran beban pelanggan daya menengah-besar.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-073",
    "code": "2050808",
    "sapCode": "2050808",
    "name": "CT;380/220V;SQUARE;300/5A;0.5S;2.5VA;P",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Current Transformer (Trafo Arus TR) tipe Square kelas akurasi 0.5/0.5S untuk pengukuran beban pelanggan daya menengah-besar.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-074",
    "code": "2160146",
    "sapCode": "2160146",
    "name": "CUB ACC;HEATER 50W + THERMOSTAT",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Material standar jaringan distribusi PLN UP3 Malang. Sesuai SPLN dan standar mutu Puslitbang PLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-075",
    "code": "2150082",
    "sapCode": "2150082",
    "name": "CUB;N ISO;LBS INC;20kV;630A;16kA;",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Material standar jaringan distribusi PLN UP3 Malang. Sesuai SPLN dan standar mutu Puslitbang PLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-076",
    "code": "3200055",
    "sapCode": "3200055",
    "name": "CUT OUT ACC;COVER CUT OUT ATAS",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Fused Cut Out (FCO) 20-24 kV 100A rating pemutus 10-12.5 kA perlengkapan proteksi trafo gardu portal/cantol.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-077",
    "code": "3200054",
    "sapCode": "3200054",
    "name": "CUT OUT ACC;COVER CUT OUT BAWAH",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Fused Cut Out (FCO) 20-24 kV 100A rating pemutus 10-12.5 kA perlengkapan proteksi trafo gardu portal/cantol.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-078",
    "code": "3200002",
    "sapCode": "3200002",
    "name": "CUT OUT ACC;FUSE LINK 20kV 10A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-079",
    "code": "3200003",
    "sapCode": "3200003",
    "name": "CUT OUT ACC;FUSE LINK 20kV 12A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-080",
    "code": "3200004",
    "sapCode": "3200004",
    "name": "CUT OUT ACC;FUSE LINK 20kV 15A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-081",
    "code": "3200005",
    "sapCode": "3200005",
    "name": "CUT OUT ACC;FUSE LINK 20kV 20A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-082",
    "code": "3200007",
    "sapCode": "3200007",
    "name": "CUT OUT ACC;FUSE LINK 20kV 25A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-083",
    "code": "3200008",
    "sapCode": "3200008",
    "name": "CUT OUT ACC;FUSE LINK 20kV 2A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-084",
    "code": "3200010",
    "sapCode": "3200010",
    "name": "CUT OUT ACC;FUSE LINK 20kV 3A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-085",
    "code": "3200018",
    "sapCode": "3200018",
    "name": "CUT OUT ACC;FUSE LINK 20kV 5A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-086",
    "code": "3200015",
    "sapCode": "3200015",
    "name": "CUT OUT ACC;FUSE LINK 20kV 6A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-087",
    "code": "3200017",
    "sapCode": "3200017",
    "name": "CUT OUT ACC;FUSE LINK 20kV 8A",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Elemen pelebur Fuse Link 20 kV tipe K / T pemutus arus gangguan saluran gardu distribusi.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-088",
    "code": "3190002",
    "sapCode": "3190002",
    "name": "CUT OUT;20kV;6-100A;10kA;125kV",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Fused Cut Out (FCO) 20-24 kV 100A rating pemutus 10-12.5 kA perlengkapan proteksi trafo gardu portal/cantol.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-089",
    "code": "2030022",
    "sapCode": "2030022",
    "name": "DS;K;20kV;3P;630A;;;OD",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Material standar jaringan distribusi PLN UP3 Malang. Sesuai SPLN dan standar mutu Puslitbang PLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-090",
    "code": "2240024",
    "sapCode": "2240024",
    "name": "FUSE;380/220V;100A;SQUARE;1",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-091",
    "code": "2240029",
    "sapCode": "2240029",
    "name": "FUSE;380/220V;125A;SQUARE;1",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-092",
    "code": "2240035",
    "sapCode": "2240035",
    "name": "FUSE;380/220V;160A;SQUARE;1",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-093",
    "code": "2240038",
    "sapCode": "2240038",
    "name": "FUSE;380/220V;200A;SQUARE;1",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-094",
    "code": "2240044",
    "sapCode": "2240044",
    "name": "FUSE;380/220V;250A;SQUARE;1",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-095",
    "code": "2240048",
    "sapCode": "2240048",
    "name": "FUSE;380/220V;300A;SQUARE;2",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-096",
    "code": "2240050",
    "sapCode": "2240050",
    "name": "FUSE;380/220V;355A;SQUARE;2",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-097",
    "code": "2240055",
    "sapCode": "2240055",
    "name": "FUSE;380/220V;400A;SQUARE;2",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-098",
    "code": "2240067",
    "sapCode": "2240067",
    "name": "FUSE;380/220V;63A;SQUARE;1",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-099",
    "code": "2240072",
    "sapCode": "2240072",
    "name": "FUSE;380/220V;80A;SQUARE;1",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "NH Fuse Pisau Square HRC Tegangan Rendah 380/220V kapasitas pemutus 120kA proteksi jalur kabel jurusan.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-100",
    "code": "3080015",
    "sapCode": "3080015",
    "name": "ISOLATOR ACC;STRAIN CLAMP 70-150MM2",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Isolator Tumpu Pin Post Keramik / Isolator Tarik Suspensi Polimer 24 kV kekuatan mekanis 12.5kN - 70kN.",
    "photoPath": "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-101",
    "code": "3070151",
    "sapCode": "3070151",
    "name": "ISOLATOR;PINPOST;PORC;24KV;;12.5kN",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Isolator Tumpu Pin Post Keramik / Isolator Tarik Suspensi Polimer 24 kV kekuatan mekanis 12.5kN - 70kN.",
    "photoPath": "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-102",
    "code": "3070160",
    "sapCode": "3070160",
    "name": "ISOLATOR;STRAIN KAP PIN;PORC;24KV;;70kN",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Isolator Tumpu Pin Post Keramik / Isolator Tarik Suspensi Polimer 24 kV kekuatan mekanis 12.5kN - 70kN.",
    "photoPath": "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-103",
    "code": "3070154",
    "sapCode": "3070154",
    "name": "ISOLATOR;SUSP;POLYMER;24KV;;70kN",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Isolator Tumpu Pin Post Keramik / Isolator Tarik Suspensi Polimer 24 kV kekuatan mekanis 12.5kN - 70kN.",
    "photoPath": "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-104",
    "code": "2090032",
    "sapCode": "2090032",
    "name": "LA;20-24kV;K;10kA;POLYMER;;",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Lightning Arrester Polimer Logam Oksida (ZnO) 20-24 kV 10 kA pengaman surja tegangan lebih petir.",
    "photoPath": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-105",
    "code": "3260161",
    "sapCode": "3260161",
    "name": "LVSB;DIST;3P;400V;250A;2LINE;OD",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Low Voltage Switchboard (PHB-TR) 3 Fasa 400V 2-Line / 4-Line lengkap busbar tembaga dan fuse base.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-106",
    "code": "3260238",
    "sapCode": "3260238",
    "name": "LVSB;DIST;3P;400V;400A;4LINE;OD",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Low Voltage Switchboard (PHB-TR) 3 Fasa 400V 2-Line / 4-Line lengkap busbar tembaga dan fuse base.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-107",
    "code": "3250052",
    "sapCode": "3250052",
    "name": "MCB;230/400V;1P;10A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-108",
    "code": "3250054",
    "sapCode": "3250054",
    "name": "MCB;230/400V;1P;16A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-109",
    "code": "3250056",
    "sapCode": "3250056",
    "name": "MCB;230/400V;1P;20A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-110",
    "code": "3250058",
    "sapCode": "3250058",
    "name": "MCB;230/400V;1P;25A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-111",
    "code": "3250046",
    "sapCode": "3250046",
    "name": "MCB;230/400V;1P;2A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-112",
    "code": "3250059",
    "sapCode": "3250059",
    "name": "MCB;230/400V;1P;35A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-113",
    "code": "3250048",
    "sapCode": "3250048",
    "name": "MCB;230/400V;1P;4A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-114",
    "code": "3250060",
    "sapCode": "3250060",
    "name": "MCB;230/400V;1P;50A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-115",
    "code": "3250050",
    "sapCode": "3250050",
    "name": "MCB;230/400V;1P;6A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Miniature Circuit Breaker (MCB) 1 Fasa 230V kapasitas pemutus 4.5kA / 6kA pembatas daya resmi pelanggan PLN.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-116",
    "code": "3250097",
    "sapCode": "3250097",
    "name": "MCB;230/400V;3P;10A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-117",
    "code": "3250099",
    "sapCode": "3250099",
    "name": "MCB;230/400V;3P;16A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-118",
    "code": "3250100",
    "sapCode": "3250100",
    "name": "MCB;230/400V;3P;20A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-119",
    "code": "3250102",
    "sapCode": "3250102",
    "name": "MCB;230/400V;3P;25A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-120",
    "code": "3250103",
    "sapCode": "3250103",
    "name": "MCB;230/400V;3P;35A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-121",
    "code": "3250292",
    "sapCode": "3250292",
    "name": "MCB;230/400V;3P;63A;50HZ;MCCB+SHUNTTRIP",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-122",
    "code": "3250301",
    "sapCode": "3250301",
    "name": "MCB;230/415V;3P;100A;50Hz;MCCB+SHUNTTRIP",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-123",
    "code": "3250302",
    "sapCode": "3250302",
    "name": "MCB;230/415V;3P;125A;50Hz;MCCB+SHUNTTRIP",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-124",
    "code": "3250303",
    "sapCode": "3250303",
    "name": "MCB;230/415V;3P;160A;50Hz;MCCB+SHUNTTRIP",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-125",
    "code": "3250296",
    "sapCode": "3250296",
    "name": "MCB;230/415V;3P;200A;50Hz;MCCB+SHUNTTRIP",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-126",
    "code": "3250297",
    "sapCode": "3250297",
    "name": "MCB;230/415V;3P;225A;50Hz;MCCB+SHUNTTRIP",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-127",
    "code": "3250298",
    "sapCode": "3250298",
    "name": "MCB;230/415V;3P;250A;50Hz;MCCB+SHUNTTRIP",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-128",
    "code": "3250299",
    "sapCode": "3250299",
    "name": "MCB;230/415V;3P;300A;50Hz;MCCB+SHUNTTRIP",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-129",
    "code": "3250029",
    "sapCode": "3250029",
    "name": "MCB;380/440V;3P;50A;50Hz;",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-130",
    "code": "3250032",
    "sapCode": "3250032",
    "name": "MCB;380/440V;3P;63A;50Hz;MCCB",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "MCB 3 Fasa / Moulded Case Circuit Breaker (MCCB) + Shunt Trip pengaman beban lebih dan hubung singkat daya besar.",
    "photoPath": "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-131",
    "code": "2200125",
    "sapCode": "2200125",
    "name": "MTR ACC;MODEM 4G LTE",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Modem Komunikasi AMI 4G LTE industri terintegrasi antena gain tinggi untuk pembacaan jarak jauh AMR.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-132",
    "code": "2200016",
    "sapCode": "2200016",
    "name": "MTR ACC;SEGEL PUTAR PLASTIC",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Segel putar polikarbonat tahan cuaca anti-rusak untuk pengamanan kotak APP dan terminal meter.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-133",
    "code": "2190224",
    "sapCode": "2190224",
    "name": "MTR;kWH E-PR;;1P;230V;5-60A;1;;2W",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Meter Listrik Elektronik (kWh Meter) presisi tinggi bersertifikat Tera Metrologi Legal. Dilengkapi optical port dan anti-tamper.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-134",
    "code": "2190252",
    "sapCode": "2190252",
    "name": "MTR;kWH E-PR;;3P;230/400V;5-80A;1;;4W",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Meter Listrik Elektronik (kWh Meter) presisi tinggi bersertifikat Tera Metrologi Legal. Dilengkapi optical port dan anti-tamper.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-135",
    "code": "2190502",
    "sapCode": "2190502",
    "name": "MTR;kWH E;;1P;230V;5-60A;1;;2W",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Meter Listrik Elektronik (kWh Meter) presisi tinggi bersertifikat Tera Metrologi Legal. Dilengkapi optical port dan anti-tamper.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-136",
    "code": "2190218",
    "sapCode": "2190218",
    "name": "MTR;kWH E;;3P;230/400V;5-80A;1;;4W",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Meter Listrik Elektronik (kWh Meter) presisi tinggi bersertifikat Tera Metrologi Legal. Dilengkapi optical port dan anti-tamper.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-137",
    "code": "2190438",
    "sapCode": "2190438",
    "name": "MTR;kWHE;;3P;57.7/100V-230/400;5A;0.5;4W",
    "categoryId": "cat-kwh",
    "unit": "Buah",
    "specification": "Meter Listrik Elektronik (kWh Meter) presisi tinggi bersertifikat Tera Metrologi Legal. Dilengkapi optical port dan anti-tamper.",
    "photoPath": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-138",
    "code": "3040883",
    "sapCode": "3040883",
    "name": "POLE ACC;CONNECTION CLAMP NETRAL 35MM2",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Cross Arm Travers Profil Baja UNP Galvanis Hot-Dip 2000-3000mm penguat dudukan isolator tiang SUTM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-139",
    "code": "3040325",
    "sapCode": "3040325",
    "name": "POLE ACC;CR ARM A1 UNP100X50X5X2000mm GA (TUMPU)",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Cross Arm Travers Profil Baja UNP Galvanis Hot-Dip 2000-3000mm penguat dudukan isolator tiang SUTM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-140",
    "code": "3040327",
    "sapCode": "3040327",
    "name": "POLE ACC;CR ARM A3 UNP100X50X5X2000mm GA (TARIK)",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Cross Arm Travers Profil Baja UNP Galvanis Hot-Dip 2000-3000mm penguat dudukan isolator tiang SUTM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-141",
    "code": "3040246",
    "sapCode": "3040246",
    "name": "POLE ACC;CR ARM UNP100X50X5X2500mm GALV",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Cross Arm Travers Profil Baja UNP Galvanis Hot-Dip 2000-3000mm penguat dudukan isolator tiang SUTM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-142",
    "code": "3040247",
    "sapCode": "3040247",
    "name": "POLE ACC;CR ARM UNP100X50X5X3000mm GALV",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Cross Arm Travers Profil Baja UNP Galvanis Hot-Dip 2000-3000mm penguat dudukan isolator tiang SUTM.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-143",
    "code": "3100061",
    "sapCode": "3100061",
    "name": "STRINGSET ACC;STRAIN CLAMP 150-240 mm2",
    "categoryId": "cat-gardu",
    "unit": "Buah",
    "specification": "Material standar jaringan distribusi PLN UP3 Malang. Sesuai SPLN dan standar mutu Puslitbang PLN.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-144",
    "code": "202608",
    "sapCode": "202608",
    "name": "TANG INGGRIS 20026-08",
    "categoryId": "cat-k3",
    "unit": "Pack",
    "specification": "Tang Inggris perkakas mekanik presisi baja vanadium berlapis krom isolasi pengaman standar ergonomis.",
    "photoPath": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-145",
    "code": "1060798",
    "sapCode": "1060798",
    "name": "TRF ACC;DUDUKAN TRFCANTOL-PIPA KBL-LA-CO",
    "categoryId": "cat-mdu",
    "unit": "Buah",
    "specification": "Dudukan dan konstruksi braket transformator distribusi cantol / portal pipa kabel LA-CO galvanis hot-dip.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-146",
    "code": "1060799",
    "sapCode": "1060799",
    "name": "TRF ACC;DUDUKAN TRFPORTAL-PIPA KBL-LA-CO",
    "categoryId": "cat-mdu",
    "unit": "Buah",
    "specification": "Dudukan dan konstruksi braket transformator distribusi cantol / portal pipa kabel LA-CO galvanis hot-dip.",
    "photoPath": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-147",
    "code": "1030074",
    "sapCode": "1030074",
    "name": "TRF DIS;D3;20kV/400V;3P;100kVA;YZN5;OD",
    "categoryId": "cat-mdu",
    "unit": "Buah",
    "specification": "Transformator Distribusi 3 Fasa 20kV / 400V 100 kVA, Vektor Grup Yzn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.",
    "photoPath": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-148",
    "code": "1030075",
    "sapCode": "1030075",
    "name": "TRF DIS;D3;20kV/400V;3P;160kVA;YZN5;OD",
    "categoryId": "cat-mdu",
    "unit": "Buah",
    "specification": "Transformator Distribusi 3 Fasa 20kV / 400V 160 kVA, Vektor Grup Yzn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.",
    "photoPath": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-149",
    "code": "1030077",
    "sapCode": "1030077",
    "name": "TRF DIS;D3;20kV/400V;3P;250kVA;DYN5;OD",
    "categoryId": "cat-mdu",
    "unit": "Buah",
    "specification": "Transformator Distribusi 3 Fasa 20kV / 400V 250 kVA, Vektor Grup Dyn5, Outdoor hermetically sealed sesuai SPLN D3.002-1.",
    "photoPath": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-150",
    "code": "4190647",
    "sapCode": "4190647",
    "name": "UNIV ACC;COVER ARRESTER",
    "categoryId": "cat-k3",
    "unit": "Buah",
    "specification": "Cover isolasi silikon pelindung bushing trafo / arrester dari gangguan sentuhan satwa / pohon.",
    "photoPath": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
  },
  {
    "id": "mat-csv-151",
    "code": "4190646",
    "sapCode": "4190646",
    "name": "UNIV ACC;COVER BUSHING TRAFO",
    "categoryId": "cat-k3",
    "unit": "Buah",
    "specification": "Cover isolasi silikon pelindung bushing trafo / arrester dari gangguan sentuhan satwa / pohon.",
    "photoPath": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
  }
];

export const clientStockSnapshots: StockSnapshot[] = [
  {
    "materialId": "mat-csv-001",
    "locationId": "loc-c-07",
    "quantity": 4,
    "reserved": 0,
    "available": 4,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-002",
    "locationId": "loc-c-07",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-003",
    "locationId": "loc-c-07",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-004",
    "locationId": "loc-c-07",
    "quantity": 11,
    "reserved": 1,
    "available": 10,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-005",
    "locationId": "loc-c-07",
    "quantity": 3,
    "reserved": 0,
    "available": 3,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-006",
    "locationId": "loc-c-07",
    "quantity": 6,
    "reserved": 0,
    "available": 6,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-007",
    "locationId": "loc-c-07",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-008",
    "locationId": "loc-a-06",
    "quantity": 125,
    "reserved": 12,
    "available": 113,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-009",
    "locationId": "loc-a-06",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-010",
    "locationId": "loc-a-06",
    "quantity": 5,
    "reserved": 0,
    "available": 5,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-011",
    "locationId": "loc-e-01",
    "quantity": 1000,
    "reserved": 100,
    "available": 900,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-012",
    "locationId": "loc-e-01",
    "quantity": 25,
    "reserved": 2,
    "available": 23,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-013",
    "locationId": "loc-e-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-014",
    "locationId": "loc-e-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-015",
    "locationId": "loc-e-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-016",
    "locationId": "loc-e-01",
    "quantity": 90,
    "reserved": 9,
    "available": 81,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-017",
    "locationId": "loc-e-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-018",
    "locationId": "loc-e-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-019",
    "locationId": "loc-e-01",
    "quantity": 100,
    "reserved": 10,
    "available": 90,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-020",
    "locationId": "loc-e-03",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-021",
    "locationId": "loc-e-03",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-022",
    "locationId": "loc-b-drum-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-023",
    "locationId": "loc-b-drum-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-024",
    "locationId": "loc-b-drum-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-025",
    "locationId": "loc-b-drum-02",
    "quantity": 14000,
    "reserved": 1400,
    "available": 12600,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-026",
    "locationId": "loc-b-drum-02",
    "quantity": 45000,
    "reserved": 4500,
    "available": 40500,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-027",
    "locationId": "loc-b-drum-02",
    "quantity": 3000,
    "reserved": 300,
    "available": 2700,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-028",
    "locationId": "loc-b-drum-02",
    "quantity": 5000,
    "reserved": 500,
    "available": 4500,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-029",
    "locationId": "loc-b-drum-02",
    "quantity": 7300,
    "reserved": 730,
    "available": 6570,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-030",
    "locationId": "loc-b-drum-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-031",
    "locationId": "loc-b-drum-03",
    "quantity": 1500,
    "reserved": 150,
    "available": 1350,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-032",
    "locationId": "loc-b-drum-03",
    "quantity": 3000,
    "reserved": 300,
    "available": 2700,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-033",
    "locationId": "loc-a-05",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-034",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-035",
    "locationId": "loc-e-02",
    "quantity": 200,
    "reserved": 20,
    "available": 180,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-036",
    "locationId": "loc-e-02",
    "quantity": 2000,
    "reserved": 200,
    "available": 1800,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-037",
    "locationId": "loc-e-02",
    "quantity": 1000,
    "reserved": 100,
    "available": 900,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-038",
    "locationId": "loc-e-02",
    "quantity": 1000,
    "reserved": 100,
    "available": 900,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-039",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-040",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-041",
    "locationId": "loc-e-02",
    "quantity": 500,
    "reserved": 50,
    "available": 450,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-042",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-043",
    "locationId": "loc-e-02",
    "quantity": 400,
    "reserved": 40,
    "available": 360,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-044",
    "locationId": "loc-e-02",
    "quantity": 300,
    "reserved": 30,
    "available": 270,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-045",
    "locationId": "loc-e-02",
    "quantity": 100,
    "reserved": 10,
    "available": 90,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-046",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-047",
    "locationId": "loc-e-02",
    "quantity": 100,
    "reserved": 10,
    "available": 90,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-048",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-049",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-050",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-051",
    "locationId": "loc-e-02",
    "quantity": 500,
    "reserved": 50,
    "available": 450,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-052",
    "locationId": "loc-e-02",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-053",
    "locationId": "loc-b-drum-04",
    "quantity": 2000,
    "reserved": 200,
    "available": 1800,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-054",
    "locationId": "loc-b-drum-04",
    "quantity": 996,
    "reserved": 99,
    "available": 897,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-055",
    "locationId": "loc-a-05",
    "quantity": 2000,
    "reserved": 200,
    "available": 1800,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-056",
    "locationId": "loc-a-05",
    "quantity": 500,
    "reserved": 50,
    "available": 450,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-057",
    "locationId": "loc-a-05",
    "quantity": 1500,
    "reserved": 150,
    "available": 1350,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-058",
    "locationId": "loc-a-05",
    "quantity": 400,
    "reserved": 40,
    "available": 360,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-059",
    "locationId": "loc-a-05",
    "quantity": 1500,
    "reserved": 150,
    "available": 1350,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-060",
    "locationId": "loc-a-05",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-061",
    "locationId": "loc-a-05",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-062",
    "locationId": "loc-a-05",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-063",
    "locationId": "loc-a-05",
    "quantity": 30,
    "reserved": 3,
    "available": 27,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-064",
    "locationId": "loc-a-05",
    "quantity": 800,
    "reserved": 80,
    "available": 720,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-065",
    "locationId": "loc-a-05",
    "quantity": 300,
    "reserved": 30,
    "available": 270,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-066",
    "locationId": "loc-a-05",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-067",
    "locationId": "loc-a-05",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-068",
    "locationId": "loc-c-04",
    "quantity": 50,
    "reserved": 5,
    "available": 45,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-069",
    "locationId": "loc-c-04",
    "quantity": 50,
    "reserved": 5,
    "available": 45,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-070",
    "locationId": "loc-c-04",
    "quantity": 50,
    "reserved": 5,
    "available": 45,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-071",
    "locationId": "loc-c-04",
    "quantity": 50,
    "reserved": 5,
    "available": 45,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-072",
    "locationId": "loc-c-04",
    "quantity": 50,
    "reserved": 5,
    "available": 45,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-073",
    "locationId": "loc-c-04",
    "quantity": 50,
    "reserved": 5,
    "available": 45,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-074",
    "locationId": "loc-a-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-075",
    "locationId": "loc-a-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-076",
    "locationId": "loc-a-02",
    "quantity": 45,
    "reserved": 4,
    "available": 41,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-077",
    "locationId": "loc-a-02",
    "quantity": 45,
    "reserved": 4,
    "available": 41,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-078",
    "locationId": "loc-a-03",
    "quantity": 481,
    "reserved": 48,
    "available": 433,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-079",
    "locationId": "loc-a-03",
    "quantity": 350,
    "reserved": 35,
    "available": 315,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-080",
    "locationId": "loc-a-03",
    "quantity": 355,
    "reserved": 35,
    "available": 320,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-081",
    "locationId": "loc-a-03",
    "quantity": 253,
    "reserved": 25,
    "available": 228,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-082",
    "locationId": "loc-a-03",
    "quantity": 265,
    "reserved": 26,
    "available": 239,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-083",
    "locationId": "loc-a-03",
    "quantity": 654,
    "reserved": 65,
    "available": 589,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-084",
    "locationId": "loc-a-03",
    "quantity": 1119,
    "reserved": 111,
    "available": 1008,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-085",
    "locationId": "loc-a-03",
    "quantity": 496,
    "reserved": 49,
    "available": 447,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-086",
    "locationId": "loc-a-03",
    "quantity": 1489,
    "reserved": 148,
    "available": 1341,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-087",
    "locationId": "loc-a-03",
    "quantity": 323,
    "reserved": 32,
    "available": 291,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-088",
    "locationId": "loc-a-02",
    "quantity": 2,
    "reserved": 0,
    "available": 2,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-089",
    "locationId": "loc-a-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-090",
    "locationId": "loc-a-04",
    "quantity": 300,
    "reserved": 30,
    "available": 270,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-091",
    "locationId": "loc-a-04",
    "quantity": 590,
    "reserved": 59,
    "available": 531,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-092",
    "locationId": "loc-a-04",
    "quantity": 600,
    "reserved": 60,
    "available": 540,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-093",
    "locationId": "loc-a-04",
    "quantity": 410,
    "reserved": 41,
    "available": 369,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-094",
    "locationId": "loc-a-04",
    "quantity": 420,
    "reserved": 42,
    "available": 378,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-095",
    "locationId": "loc-a-04",
    "quantity": 350,
    "reserved": 35,
    "available": 315,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-096",
    "locationId": "loc-a-04",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-097",
    "locationId": "loc-a-04",
    "quantity": 310,
    "reserved": 31,
    "available": 279,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-098",
    "locationId": "loc-a-04",
    "quantity": 270,
    "reserved": 27,
    "available": 243,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-099",
    "locationId": "loc-a-04",
    "quantity": 270,
    "reserved": 27,
    "available": 243,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-100",
    "locationId": "loc-a-01",
    "quantity": 95,
    "reserved": 9,
    "available": 86,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-101",
    "locationId": "loc-a-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-102",
    "locationId": "loc-a-01",
    "quantity": 1,
    "reserved": 0,
    "available": 1,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-103",
    "locationId": "loc-a-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-104",
    "locationId": "loc-a-02",
    "quantity": 204,
    "reserved": 20,
    "available": 184,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-105",
    "locationId": "loc-a-06",
    "quantity": 15,
    "reserved": 1,
    "available": 14,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-106",
    "locationId": "loc-a-06",
    "quantity": 44,
    "reserved": 4,
    "available": 40,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-107",
    "locationId": "loc-c-05",
    "quantity": 1550,
    "reserved": 155,
    "available": 1395,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-108",
    "locationId": "loc-c-05",
    "quantity": 419,
    "reserved": 41,
    "available": 378,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-109",
    "locationId": "loc-c-05",
    "quantity": 48,
    "reserved": 4,
    "available": 44,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-110",
    "locationId": "loc-c-05",
    "quantity": 5,
    "reserved": 0,
    "available": 5,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-111",
    "locationId": "loc-c-05",
    "quantity": 265,
    "reserved": 26,
    "available": 239,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-112",
    "locationId": "loc-c-05",
    "quantity": 533,
    "reserved": 53,
    "available": 480,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-113",
    "locationId": "loc-c-05",
    "quantity": 1736,
    "reserved": 173,
    "available": 1563,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-114",
    "locationId": "loc-c-05",
    "quantity": 80,
    "reserved": 8,
    "available": 72,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-115",
    "locationId": "loc-c-05",
    "quantity": 4728,
    "reserved": 472,
    "available": 4256,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-116",
    "locationId": "loc-c-06",
    "quantity": 171,
    "reserved": 17,
    "available": 154,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-117",
    "locationId": "loc-c-06",
    "quantity": 150,
    "reserved": 15,
    "available": 135,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-118",
    "locationId": "loc-c-06",
    "quantity": 317,
    "reserved": 31,
    "available": 286,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-119",
    "locationId": "loc-c-06",
    "quantity": 173,
    "reserved": 17,
    "available": 156,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-120",
    "locationId": "loc-c-06",
    "quantity": 188,
    "reserved": 18,
    "available": 170,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-121",
    "locationId": "loc-c-06",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-122",
    "locationId": "loc-c-06",
    "quantity": 27,
    "reserved": 2,
    "available": 25,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-123",
    "locationId": "loc-c-06",
    "quantity": 28,
    "reserved": 2,
    "available": 26,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-124",
    "locationId": "loc-c-06",
    "quantity": 26,
    "reserved": 2,
    "available": 24,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-125",
    "locationId": "loc-c-06",
    "quantity": 2,
    "reserved": 0,
    "available": 2,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-126",
    "locationId": "loc-c-06",
    "quantity": 6,
    "reserved": 0,
    "available": 6,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-127",
    "locationId": "loc-c-06",
    "quantity": 6,
    "reserved": 0,
    "available": 6,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-128",
    "locationId": "loc-c-06",
    "quantity": 16,
    "reserved": 1,
    "available": 15,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-129",
    "locationId": "loc-c-06",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-130",
    "locationId": "loc-c-06",
    "quantity": 4,
    "reserved": 0,
    "available": 4,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-131",
    "locationId": "loc-c-03",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-132",
    "locationId": "loc-c-03",
    "quantity": 14444,
    "reserved": 1444,
    "available": 13000,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-133",
    "locationId": "loc-c-01",
    "quantity": 204,
    "reserved": 20,
    "available": 184,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-134",
    "locationId": "loc-c-01",
    "quantity": 618,
    "reserved": 61,
    "available": 557,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-135",
    "locationId": "loc-c-02",
    "quantity": 455,
    "reserved": 45,
    "available": 410,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-136",
    "locationId": "loc-c-02",
    "quantity": 620,
    "reserved": 62,
    "available": 558,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-137",
    "locationId": "loc-c-02",
    "quantity": 69,
    "reserved": 6,
    "available": 63,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-138",
    "locationId": "loc-f-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-139",
    "locationId": "loc-f-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-140",
    "locationId": "loc-f-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-141",
    "locationId": "loc-f-01",
    "quantity": 187,
    "reserved": 18,
    "available": 169,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-142",
    "locationId": "loc-f-01",
    "quantity": 19,
    "reserved": 1,
    "available": 18,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-143",
    "locationId": "loc-a-01",
    "quantity": 1965,
    "reserved": 196,
    "available": 1769,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-144",
    "locationId": "loc-d-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-145",
    "locationId": "loc-b-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-146",
    "locationId": "loc-b-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-147",
    "locationId": "loc-b-01",
    "quantity": 0,
    "reserved": 0,
    "available": 0,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-148",
    "locationId": "loc-b-02",
    "quantity": 3,
    "reserved": 0,
    "available": 3,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-149",
    "locationId": "loc-b-03",
    "quantity": 3,
    "reserved": 0,
    "available": 3,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-150",
    "locationId": "loc-d-02",
    "quantity": 1,
    "reserved": 0,
    "available": 1,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  },
  {
    "materialId": "mat-csv-151",
    "locationId": "loc-d-02",
    "quantity": 21,
    "reserved": 2,
    "available": 19,
    "sourceAt": "2026-09-12T08:00:00+07:00"
  }
];

export const clientBarcodeAliases: BarcodeAlias[] = [
  {
    "value": "4120470",
    "targetType": "material",
    "targetId": "mat-csv-001"
  },
  {
    "value": "4120472",
    "targetType": "material",
    "targetId": "mat-csv-002"
  },
  {
    "value": "4120473",
    "targetType": "material",
    "targetId": "mat-csv-003"
  },
  {
    "value": "4120474",
    "targetType": "material",
    "targetId": "mat-csv-004"
  },
  {
    "value": "4120467",
    "targetType": "material",
    "targetId": "mat-csv-005"
  },
  {
    "value": "4120468",
    "targetType": "material",
    "targetId": "mat-csv-006"
  },
  {
    "value": "4120469",
    "targetType": "material",
    "targetId": "mat-csv-007"
  },
  {
    "value": "4120538",
    "targetType": "material",
    "targetId": "mat-csv-008"
  },
  {
    "value": "4120079",
    "targetType": "material",
    "targetId": "mat-csv-009"
  },
  {
    "value": "4120453",
    "targetType": "material",
    "targetId": "mat-csv-010"
  },
  {
    "value": "3120159",
    "targetType": "material",
    "targetId": "mat-csv-011"
  },
  {
    "value": "3120154",
    "targetType": "material",
    "targetId": "mat-csv-012"
  },
  {
    "value": "3120156",
    "targetType": "material",
    "targetId": "mat-csv-013"
  },
  {
    "value": "3120171",
    "targetType": "material",
    "targetId": "mat-csv-014"
  },
  {
    "value": "3120223",
    "targetType": "material",
    "targetId": "mat-csv-015"
  },
  {
    "value": "3120231",
    "targetType": "material",
    "targetId": "mat-csv-016"
  },
  {
    "value": "3120226",
    "targetType": "material",
    "targetId": "mat-csv-017"
  },
  {
    "value": "3120227",
    "targetType": "material",
    "targetId": "mat-csv-018"
  },
  {
    "value": "3120228",
    "targetType": "material",
    "targetId": "mat-csv-019"
  },
  {
    "value": "3120038",
    "targetType": "material",
    "targetId": "mat-csv-020"
  },
  {
    "value": "3120058",
    "targetType": "material",
    "targetId": "mat-csv-021"
  },
  {
    "value": "3110014",
    "targetType": "material",
    "targetId": "mat-csv-022"
  },
  {
    "value": "3110015",
    "targetType": "material",
    "targetId": "mat-csv-023"
  },
  {
    "value": "3110039",
    "targetType": "material",
    "targetId": "mat-csv-024"
  },
  {
    "value": "3110542",
    "targetType": "material",
    "targetId": "mat-csv-025"
  },
  {
    "value": "3110025",
    "targetType": "material",
    "targetId": "mat-csv-026"
  },
  {
    "value": "3110026",
    "targetType": "material",
    "targetId": "mat-csv-027"
  },
  {
    "value": "3110029",
    "targetType": "material",
    "targetId": "mat-csv-028"
  },
  {
    "value": "3110030",
    "targetType": "material",
    "targetId": "mat-csv-029"
  },
  {
    "value": "3110034",
    "targetType": "material",
    "targetId": "mat-csv-030"
  },
  {
    "value": "3110516",
    "targetType": "material",
    "targetId": "mat-csv-031"
  },
  {
    "value": "3110518",
    "targetType": "material",
    "targetId": "mat-csv-032"
  },
  {
    "value": "2230042",
    "targetType": "material",
    "targetId": "mat-csv-033"
  },
  {
    "value": "3060192",
    "targetType": "material",
    "targetId": "mat-csv-034"
  },
  {
    "value": "3061272",
    "targetType": "material",
    "targetId": "mat-csv-035"
  },
  {
    "value": "3060644",
    "targetType": "material",
    "targetId": "mat-csv-036"
  },
  {
    "value": "3060642",
    "targetType": "material",
    "targetId": "mat-csv-037"
  },
  {
    "value": "3060382",
    "targetType": "material",
    "targetId": "mat-csv-038"
  },
  {
    "value": "3061804",
    "targetType": "material",
    "targetId": "mat-csv-039"
  },
  {
    "value": "3061805",
    "targetType": "material",
    "targetId": "mat-csv-040"
  },
  {
    "value": "3060145",
    "targetType": "material",
    "targetId": "mat-csv-041"
  },
  {
    "value": "3060409",
    "targetType": "material",
    "targetId": "mat-csv-042"
  },
  {
    "value": "3060143",
    "targetType": "material",
    "targetId": "mat-csv-043"
  },
  {
    "value": "3060233",
    "targetType": "material",
    "targetId": "mat-csv-044"
  },
  {
    "value": "3060132",
    "targetType": "material",
    "targetId": "mat-csv-045"
  },
  {
    "value": "3060133",
    "targetType": "material",
    "targetId": "mat-csv-046"
  },
  {
    "value": "3060130",
    "targetType": "material",
    "targetId": "mat-csv-047"
  },
  {
    "value": "3060051",
    "targetType": "material",
    "targetId": "mat-csv-048"
  },
  {
    "value": "3060152",
    "targetType": "material",
    "targetId": "mat-csv-049"
  },
  {
    "value": "3060050",
    "targetType": "material",
    "targetId": "mat-csv-050"
  },
  {
    "value": "3060504",
    "targetType": "material",
    "targetId": "mat-csv-051"
  },
  {
    "value": "3060677",
    "targetType": "material",
    "targetId": "mat-csv-052"
  },
  {
    "value": "3050084",
    "targetType": "material",
    "targetId": "mat-csv-053"
  },
  {
    "value": "3050004",
    "targetType": "material",
    "targetId": "mat-csv-054"
  },
  {
    "value": "3280456",
    "targetType": "material",
    "targetId": "mat-csv-055"
  },
  {
    "value": "3280457",
    "targetType": "material",
    "targetId": "mat-csv-056"
  },
  {
    "value": "3280458",
    "targetType": "material",
    "targetId": "mat-csv-057"
  },
  {
    "value": "3280459",
    "targetType": "material",
    "targetId": "mat-csv-058"
  },
  {
    "value": "3280460",
    "targetType": "material",
    "targetId": "mat-csv-059"
  },
  {
    "value": "3280461",
    "targetType": "material",
    "targetId": "mat-csv-060"
  },
  {
    "value": "3280474",
    "targetType": "material",
    "targetId": "mat-csv-061"
  },
  {
    "value": "3280282",
    "targetType": "material",
    "targetId": "mat-csv-062"
  },
  {
    "value": "3280466",
    "targetType": "material",
    "targetId": "mat-csv-063"
  },
  {
    "value": "3280129",
    "targetType": "material",
    "targetId": "mat-csv-064"
  },
  {
    "value": "3280384",
    "targetType": "material",
    "targetId": "mat-csv-065"
  },
  {
    "value": "3280186",
    "targetType": "material",
    "targetId": "mat-csv-066"
  },
  {
    "value": "3280158",
    "targetType": "material",
    "targetId": "mat-csv-067"
  },
  {
    "value": "2050128",
    "targetType": "material",
    "targetId": "mat-csv-068"
  },
  {
    "value": "2050133",
    "targetType": "material",
    "targetId": "mat-csv-069"
  },
  {
    "value": "2050136",
    "targetType": "material",
    "targetId": "mat-csv-070"
  },
  {
    "value": "2050139",
    "targetType": "material",
    "targetId": "mat-csv-071"
  },
  {
    "value": "2050142",
    "targetType": "material",
    "targetId": "mat-csv-072"
  },
  {
    "value": "2050808",
    "targetType": "material",
    "targetId": "mat-csv-073"
  },
  {
    "value": "2160146",
    "targetType": "material",
    "targetId": "mat-csv-074"
  },
  {
    "value": "2150082",
    "targetType": "material",
    "targetId": "mat-csv-075"
  },
  {
    "value": "3200055",
    "targetType": "material",
    "targetId": "mat-csv-076"
  },
  {
    "value": "3200054",
    "targetType": "material",
    "targetId": "mat-csv-077"
  },
  {
    "value": "3200002",
    "targetType": "material",
    "targetId": "mat-csv-078"
  },
  {
    "value": "3200003",
    "targetType": "material",
    "targetId": "mat-csv-079"
  },
  {
    "value": "3200004",
    "targetType": "material",
    "targetId": "mat-csv-080"
  },
  {
    "value": "3200005",
    "targetType": "material",
    "targetId": "mat-csv-081"
  },
  {
    "value": "3200007",
    "targetType": "material",
    "targetId": "mat-csv-082"
  },
  {
    "value": "3200008",
    "targetType": "material",
    "targetId": "mat-csv-083"
  },
  {
    "value": "3200010",
    "targetType": "material",
    "targetId": "mat-csv-084"
  },
  {
    "value": "3200018",
    "targetType": "material",
    "targetId": "mat-csv-085"
  },
  {
    "value": "3200015",
    "targetType": "material",
    "targetId": "mat-csv-086"
  },
  {
    "value": "3200017",
    "targetType": "material",
    "targetId": "mat-csv-087"
  },
  {
    "value": "3190002",
    "targetType": "material",
    "targetId": "mat-csv-088"
  },
  {
    "value": "2030022",
    "targetType": "material",
    "targetId": "mat-csv-089"
  },
  {
    "value": "2240024",
    "targetType": "material",
    "targetId": "mat-csv-090"
  },
  {
    "value": "2240029",
    "targetType": "material",
    "targetId": "mat-csv-091"
  },
  {
    "value": "2240035",
    "targetType": "material",
    "targetId": "mat-csv-092"
  },
  {
    "value": "2240038",
    "targetType": "material",
    "targetId": "mat-csv-093"
  },
  {
    "value": "2240044",
    "targetType": "material",
    "targetId": "mat-csv-094"
  },
  {
    "value": "2240048",
    "targetType": "material",
    "targetId": "mat-csv-095"
  },
  {
    "value": "2240050",
    "targetType": "material",
    "targetId": "mat-csv-096"
  },
  {
    "value": "2240055",
    "targetType": "material",
    "targetId": "mat-csv-097"
  },
  {
    "value": "2240067",
    "targetType": "material",
    "targetId": "mat-csv-098"
  },
  {
    "value": "2240072",
    "targetType": "material",
    "targetId": "mat-csv-099"
  },
  {
    "value": "3080015",
    "targetType": "material",
    "targetId": "mat-csv-100"
  },
  {
    "value": "3070151",
    "targetType": "material",
    "targetId": "mat-csv-101"
  },
  {
    "value": "3070160",
    "targetType": "material",
    "targetId": "mat-csv-102"
  },
  {
    "value": "3070154",
    "targetType": "material",
    "targetId": "mat-csv-103"
  },
  {
    "value": "2090032",
    "targetType": "material",
    "targetId": "mat-csv-104"
  },
  {
    "value": "3260161",
    "targetType": "material",
    "targetId": "mat-csv-105"
  },
  {
    "value": "3260238",
    "targetType": "material",
    "targetId": "mat-csv-106"
  },
  {
    "value": "3250052",
    "targetType": "material",
    "targetId": "mat-csv-107"
  },
  {
    "value": "3250054",
    "targetType": "material",
    "targetId": "mat-csv-108"
  },
  {
    "value": "3250056",
    "targetType": "material",
    "targetId": "mat-csv-109"
  },
  {
    "value": "3250058",
    "targetType": "material",
    "targetId": "mat-csv-110"
  },
  {
    "value": "3250046",
    "targetType": "material",
    "targetId": "mat-csv-111"
  },
  {
    "value": "3250059",
    "targetType": "material",
    "targetId": "mat-csv-112"
  },
  {
    "value": "3250048",
    "targetType": "material",
    "targetId": "mat-csv-113"
  },
  {
    "value": "3250060",
    "targetType": "material",
    "targetId": "mat-csv-114"
  },
  {
    "value": "3250050",
    "targetType": "material",
    "targetId": "mat-csv-115"
  },
  {
    "value": "3250097",
    "targetType": "material",
    "targetId": "mat-csv-116"
  },
  {
    "value": "3250099",
    "targetType": "material",
    "targetId": "mat-csv-117"
  },
  {
    "value": "3250100",
    "targetType": "material",
    "targetId": "mat-csv-118"
  },
  {
    "value": "3250102",
    "targetType": "material",
    "targetId": "mat-csv-119"
  },
  {
    "value": "3250103",
    "targetType": "material",
    "targetId": "mat-csv-120"
  },
  {
    "value": "3250292",
    "targetType": "material",
    "targetId": "mat-csv-121"
  },
  {
    "value": "3250301",
    "targetType": "material",
    "targetId": "mat-csv-122"
  },
  {
    "value": "3250302",
    "targetType": "material",
    "targetId": "mat-csv-123"
  },
  {
    "value": "3250303",
    "targetType": "material",
    "targetId": "mat-csv-124"
  },
  {
    "value": "3250296",
    "targetType": "material",
    "targetId": "mat-csv-125"
  },
  {
    "value": "3250297",
    "targetType": "material",
    "targetId": "mat-csv-126"
  },
  {
    "value": "3250298",
    "targetType": "material",
    "targetId": "mat-csv-127"
  },
  {
    "value": "3250299",
    "targetType": "material",
    "targetId": "mat-csv-128"
  },
  {
    "value": "3250029",
    "targetType": "material",
    "targetId": "mat-csv-129"
  },
  {
    "value": "3250032",
    "targetType": "material",
    "targetId": "mat-csv-130"
  },
  {
    "value": "2200125",
    "targetType": "material",
    "targetId": "mat-csv-131"
  },
  {
    "value": "2200016",
    "targetType": "material",
    "targetId": "mat-csv-132"
  },
  {
    "value": "2190224",
    "targetType": "material",
    "targetId": "mat-csv-133"
  },
  {
    "value": "2190252",
    "targetType": "material",
    "targetId": "mat-csv-134"
  },
  {
    "value": "2190502",
    "targetType": "material",
    "targetId": "mat-csv-135"
  },
  {
    "value": "2190218",
    "targetType": "material",
    "targetId": "mat-csv-136"
  },
  {
    "value": "2190438",
    "targetType": "material",
    "targetId": "mat-csv-137"
  },
  {
    "value": "3040883",
    "targetType": "material",
    "targetId": "mat-csv-138"
  },
  {
    "value": "3040325",
    "targetType": "material",
    "targetId": "mat-csv-139"
  },
  {
    "value": "3040327",
    "targetType": "material",
    "targetId": "mat-csv-140"
  },
  {
    "value": "3040246",
    "targetType": "material",
    "targetId": "mat-csv-141"
  },
  {
    "value": "3040247",
    "targetType": "material",
    "targetId": "mat-csv-142"
  },
  {
    "value": "3100061",
    "targetType": "material",
    "targetId": "mat-csv-143"
  },
  {
    "value": "202608",
    "targetType": "material",
    "targetId": "mat-csv-144"
  },
  {
    "value": "1060798",
    "targetType": "material",
    "targetId": "mat-csv-145"
  },
  {
    "value": "1060799",
    "targetType": "material",
    "targetId": "mat-csv-146"
  },
  {
    "value": "1030074",
    "targetType": "material",
    "targetId": "mat-csv-147"
  },
  {
    "value": "1030075",
    "targetType": "material",
    "targetId": "mat-csv-148"
  },
  {
    "value": "1030077",
    "targetType": "material",
    "targetId": "mat-csv-149"
  },
  {
    "value": "4190647",
    "targetType": "material",
    "targetId": "mat-csv-150"
  },
  {
    "value": "4190646",
    "targetType": "material",
    "targetId": "mat-csv-151"
  }
];
