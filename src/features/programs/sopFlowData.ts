import sopPenerimaanImg from '../../assets/sop/sop_penerimaan.webp';
import sopPengeluaranImg from '../../assets/sop/sop_pengeluaran.webp';
import sopPengembalianImg from '../../assets/sop/sop_pengembalian.webp';

export interface SopStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  documentCode?: string;
  role: string;
  keyPoints: string[];
  spotlightHint: string;
  iconType: 'truck' | 'clipboard' | 'forklift' | 'barcode' | 'computer' | 'rack' | 'check' | 'package' | 'search' | 'printer' | 'shield';
}

export interface SopFlow {
  id: 'penerimaan' | 'pengeluaran' | 'pengembalian';
  title: string;
  shortTitle: string;
  badge: string;
  category: string;
  themeColor: {
    primary: string;
    border: string;
    bg: string;
    accent: string;
    glow: string;
  };
  infographicImg: string;
  infographicAlt: string;
  totalSteps: number;
  steps: SopStep[];
}

export const SOP_FLOWS: SopFlow[] = [
  {
    id: 'penerimaan',
    title: 'Alur Proses Penerimaan Material (Inbound)',
    shortTitle: 'Penerimaan Material',
    badge: 'INBOUND • 7 TAHAP',
    category: 'Proses Kedatangan Logistik Supplier & Pabrikan',
    themeColor: {
      primary: '#0284C7',
      border: '#38BDF8',
      bg: '#F0F9FF',
      accent: '#0369A1',
      glow: 'rgba(2, 132, 199, 0.35)',
    },
    infographicImg: sopPenerimaanImg,
    infographicAlt: 'Infografis Resmi Alur Proses Penerimaan Material PT PLN (Persero)',
    totalSteps: 7,
    steps: [
      {
        stepNumber: 1,
        title: 'Penerimaan Material',
        subtitle: 'TUG 3 KARANTINA',
        description: 'Kedatangan armada pengantar material dari supplier di area karantina gudang. Dokumen TUG 3 awal diperiksa dan dicocokkan.',
        documentCode: 'TUG 3 (Karantina)',
        role: 'Petugas Logistik & Sopir Vendor',
        keyPoints: [
          'Pemeriksaan surat jalan (DO), Purchase Order (PO), dan segel armada.',
          'Pencatatan jam kedatangan armada pada logbook penerimaan karantina.',
          'Penurunan palet material secara hati-hati di area drop-off awal.',
        ],
        spotlightHint: 'Kiri Atas (Armada Truk & Area Karantina Awal)',
        iconType: 'truck',
      },
      {
        stepNumber: 2,
        title: 'Pemeriksaan Material',
        subtitle: 'TUG 4 (INSPEKSI MUTU)',
        description: 'Inspeksi kualitas, kuantitas, dan spesifikasi teknis material. Pencatatan resmi pada formulir TUG 4.',
        documentCode: 'TUG 4 (LHP)',
        role: 'Tim Quality Control (QC) & Pengawas K3',
        keyPoints: [
          'Pemeriksaan fisik visual: baut tangki trafo, segel tera meteran, body isolator.',
          'Pengecekan sertifikat uji pabrikan sesuai Standar Perusahaan Listrik Negara (SPLN).',
          'Penerbitan dokumen Laporan Hasil Pemeriksaan (LHP) TUG 4.',
        ],
        spotlightHint: 'Tengah Atas (Checklist & Kaca Pembesar QC)',
        iconType: 'clipboard',
      },
      {
        stepNumber: 3,
        title: 'Penempatan di Area Karantina',
        subtitle: 'TEMPORARY HOLDING ZONE',
        description: 'Material yang telah lulus pemeriksaan teknis untuk sementara waktu disimpan di zona karantina berpagar.',
        documentCode: 'Label Kuning Karantina',
        role: 'Operator Forklift Gudang',
        keyPoints: [
          'Pemberian label status sementara TUG 3 Karantina pada palet.',
          'Pemisahan aman agar tidak tercampur dengan material sisa retur.',
          'Menunggu proses digitalisasi registrasi barcode sistem Kiosk.',
        ],
        spotlightHint: 'Kanan Atas (Forklift & Palet di Area Karantina)',
        iconType: 'forklift',
      },
      {
        stepNumber: 4,
        title: 'Scan Barcode (Fisik)',
        subtitle: 'INVENTARISASI DIGITAL',
        description: 'Pemindaian barcode fisik pada setiap kemasan/item untuk pencatatan inventarisasi digital ke sistem Kiosk & SAP.',
        documentCode: 'Barcode 2D / Label QR',
        role: 'Operator Kiosk Barcode Scanner',
        keyPoints: [
          'Scanning kode normalisasi dan nomor seri unik material.',
          'Verifikasi keselarasan database kuantitas master material.',
          'Sinkronisasi real-time ke modul inventaris gudang UP3 Malang.',
        ],
        spotlightHint: 'Kanan Tengah (Petugas Memindai Barcode Kardus)',
        iconType: 'barcode',
      },
      {
        stepNumber: 5,
        title: 'Pembuatan TUG 3 Persediaan',
        subtitle: 'GOOD RECEIPT ENTRY',
        description: 'Pencatatan data material ke sistem ERP SAP Terpadu dan penerbitan dokumen resmi TUG 3 Persediaan.',
        documentCode: 'TUG 3 Persediaan (GR)',
        role: 'Admin Sistem SAP Gudang PLN',
        keyPoints: [
          'Posting dokumen Good Receipt (GR) secara atomik di SAP.',
          'Penerbitan bukti sah penambahan saldo buku persediaan gudang.',
          'Penandatanganan dokumen TUG 3 Persediaan oleh Pejabat Pengadaan.',
        ],
        spotlightHint: 'Kiri Bawah (Komputer Workstation & Mesin Cetak)',
        iconType: 'computer',
      },
      {
        stepNumber: 6,
        title: 'Penempatan di Area Material Baru',
        subtitle: 'ALOKASI DEFINITIF BLOK & RAK',
        description: 'Material dipindahkan dari zona karantina dan disimpan secara permanen di lokasi rak penyimpanan material baru.',
        documentCode: 'Kode Rak Fisik (Contoh: A.1.1)',
        role: 'Operator Forklift & Petugas Penataan',
        keyPoints: [
          'Pemindahan palet menuju rak bertingkat (Area Material Baru).',
          'Penataan sesuai standar 5S (Rapi, Teratur, Resik) & batas beban rak.',
          'Pencatatan koordinat Blok, Sub-blok, dan Slot Rak di sistem.',
        ],
        spotlightHint: 'Tengah Bawah (Rak Bertingkat Material Baru)',
        iconType: 'rack',
      },
      {
        stepNumber: 7,
        title: 'Selesai',
        subtitle: 'MATERIAL SIAP DIDISTRIBUSIKAN',
        description: 'Proses penerimaan material selesai paripurna. Barang berstatus aktif dan siap digunakan untuk pekerjaan jaringan PLN.',
        documentCode: 'Status: Ready Stock (Tersedia)',
        role: 'Seluruh Tim Logistik Gudang',
        keyPoints: [
          'Pembaruan status stok menjadi "Tersedia" di layar Kiosk publik.',
          'Pintu gudang ditutup kembali dengan protokol K3 Zero Accident.',
          'Siap melayani reservasi dan permintaan pelayanan teknik.',
        ],
        spotlightHint: 'Kanan Bawah (Tanda Centang Hijau & Tim Bergembira)',
        iconType: 'check',
      },
    ],
  },
  {
    id: 'pengeluaran',
    title: 'Alur Proses Pengeluaran Material (Outbound)',
    shortTitle: 'Pengeluaran Material',
    badge: 'OUTBOUND • 6 TAHAP',
    category: 'Proses Permintaan Pelayanan Teknik & Pemeliharaan Jaringan',
    themeColor: {
      primary: '#D97706',
      border: '#FBBF24',
      bg: '#FFFBEB',
      accent: '#B45309',
      glow: 'rgba(217, 119, 6, 0.35)',
    },
    infographicImg: sopPengeluaranImg,
    infographicAlt: 'Infografis Resmi Alur Proses Pengeluaran Material PT PLN (Persero)',
    totalSteps: 6,
    steps: [
      {
        stepNumber: 1,
        title: 'Reservasi',
        subtitle: 'RESERVASI FORM & PERINTAH KERJA',
        description: 'Pengajuan kebutuhan material oleh unit pemohon atau teknisi melalui formulir reservasi resmi dan dokumen PK.',
        documentCode: 'Formulir Reservasi / SPM',
        role: 'Teknisi Lapangan / Unit Pemohon',
        keyPoints: [
          'Pengisian nomor Perintah Kerja (PK) dan estimasi kebutuhan proyek.',
          'Pengecekan alokasi anggaran dan kuota material pada sistem SAP.',
          'Validasi tanda tangan pejabat yang berwenang (Asman / Manager Bagian).',
        ],
        spotlightHint: 'Kiri Atas (Meja Petugas Reservasi & Dokumen)',
        iconType: 'clipboard',
      },
      {
        stepNumber: 2,
        title: 'Pengambilan Material',
        subtitle: 'MATERIAL SIAP DIAMBIL (PICKING)',
        description: 'Petugas gudang mengambil fisik material dari rak penyimpanan berdasarkan lembar kerja reservasi yang telah diverifikasi.',
        documentCode: 'Picking List Reservasi',
        role: 'Petugas Gudang / Picker',
        keyPoints: [
          'Navigasi menuju alamat Blok dan Rak presisi (misal: Rak B.2.1).',
          'Prinsip FIFO (First In First Out) atau FEFO diterapkan dengan ketat.',
          'Pengecekan nomor seri dan label identitas sebelum diangkut ke meja serah.',
        ],
        spotlightHint: 'Kanan Atas (Petugas Mengambil Kardus di Rak)',
        iconType: 'forklift',
      },
      {
        stepNumber: 3,
        title: 'Scan Barcode & Pemeriksaan',
        subtitle: 'STATUS PEMERIKSAAN KELUAR',
        description: 'Pemindaian barcode dan pencocokan kondisi fisik material dengan spesifikasi pesanan di hadapan tim pemohon.',
        documentCode: 'Barcode Verifier',
        role: 'Petugas Verifikasi & Pemohon',
        keyPoints: [
          'Scan barcode fisik item untuk memvalidasi nomor seri sesuai reservasi.',
          'Pemeriksaan fisik bersama memastikan aksesoris lengkap dan tanpa cacat.',
          'Layar konfirmasi sistem menunjukkan status pemeriksaan hijau (cocok).',
        ],
        spotlightHint: 'Tengah (Serah Terima Kardus di Depan Monitor)',
        iconType: 'barcode',
      },
      {
        stepNumber: 4,
        title: 'Pembuatan Surat Jalan',
        subtitle: 'SURAT JALAN DATA (DELIVERY NOTE)',
        description: 'Penerbitan dokumen Surat Jalan pengiriman sebagai bukti sah mobilitas dan transportasi logistik keluar pintu gudang.',
        documentCode: 'Surat Jalan Resmi',
        role: 'Admin Gudang PLN',
        keyPoints: [
          'Pencetakan Surat Jalan rangkap (arsip gudang, sopir armada, & penerima).',
          'Pencantuman nomor polisi kendaraan pengangkut dan nama pengemudi.',
          'Pemeriksaan stempel dan tanda tangan petugas pengamanan gudang.',
        ],
        spotlightHint: 'Kiri Bawah (Admin Mencetak Dokumen Surat Jalan)',
        iconType: 'printer',
      },
      {
        stepNumber: 5,
        title: 'Pembuatan TUG 9',
        subtitle: 'SLIP GOOD ISSUE (SAP)',
        description: 'Penerbitan formulir TUG 9 (Slip Good Issue) untuk memotong saldo inventaris secara sah di sistem SAP ERP Terpadu.',
        documentCode: 'TUG 9 (Slip Good Issue)',
        role: 'Admin SAP Logistik PLN',
        keyPoints: [
          'Posting pemotongan stok pada akun biaya proyek yang bersangkutan.',
          'Saldo stok gudang berkurang secara atomik dan tersinkronisasi di Kiosk.',
          'Pemberian nomor registrasi TUG 9 untuk jejak audit berkala.',
        ],
        spotlightHint: 'Kanan Bawah (Tabel Dokumen TUG 9 di Komputer)',
        iconType: 'computer',
      },
      {
        stepNumber: 6,
        title: 'Selesai',
        subtitle: 'PROSES PENGELUARAN SELESAI',
        description: 'Material diberangkatkan ke lokasi gardu/jaringan distribusi. Seluruh administrasi pengeluaran barang selesai sempurna.',
        documentCode: 'BAST Pengeluaran Selesai',
        role: 'Tim Lapangan & Pengemudi',
        keyPoints: [
          'Muatan diikat aman di armada transportasi sesuai standar K3 keselamatan jalan.',
          'Gerbang keluar dibuka setelah security mencocokkan Surat Jalan fisik.',
          'Dukungan penuh untuk keandalan pasokan listrik pelanggan.',
        ],
        spotlightHint: 'Kanan Bawah (Palet Keluar & Centang Biru Selesai)',
        iconType: 'check',
      },
    ],
  },
  {
    id: 'pengembalian',
    title: 'Alur Proses Pengembalian Barang (Return / MRWI)',
    shortTitle: 'Pengembalian Barang',
    badge: 'RETURN & MRWI • 5 TAHAP',
    category: 'Proses Retur Sisa Pakai & Material Bekas Bongkaran',
    themeColor: {
      primary: '#059669',
      border: '#34D399',
      bg: '#ECFDF5',
      accent: '#047857',
      glow: 'rgba(5, 150, 105, 0.35)',
    },
    infographicImg: sopPengembalianImg,
    infographicAlt: 'Infografis Resmi Alur Proses Pengembalian Barang PT PLN (Persero)',
    totalSteps: 5,
    steps: [
      {
        stepNumber: 1,
        title: 'Pembuatan TUG 10',
        subtitle: 'BUKTI PENGEMBALIAN BARANG',
        description: 'Penerbitan dokumen TUG 10 untuk mencatat pengembalian material sisa proyek atau peralatan bekas bongkaran jaringan.',
        documentCode: 'Dokumen TUG 10',
        role: 'Teknisi Lapangan & Admin Gudang',
        keyPoints: [
          'Pengisian identitas asal pekerjaan dan alasan pengembalian.',
          'Pencatatan estimasi kuantitas serta spesifikasi material yang dikembalikan.',
          'Otorisasi dokumen TUG 10 oleh pengawas lapangan.',
        ],
        spotlightHint: 'Kiri Atas (Operator Mengisi Dokumen TUG 10 di Meja)',
        iconType: 'computer',
      },
      {
        stepNumber: 2,
        title: 'Pengembalian Material & Cetak Barcode',
        subtitle: 'LOKET SERAH TERIMA & RETUR TAG',
        description: 'Penyerahan fisik barang di counter retur gudang dan pencetakan barcode pengembalian untuk identifikasi item.',
        documentCode: 'Label Barcode Retur',
        role: 'Petugas Loket Gudang & Tim Lapangan',
        keyPoints: [
          'Pengecekan kelengkapan fisik di loket penerimaan barang retur.',
          'Pencetakan label barcode kuning/oranye khusus inventaris retur.',
          'Penempelan barcode pada kemasan box sebelum masuk ruang inspeksi.',
        ],
        spotlightHint: 'Kanan Atas (Loket Counter Serah Terima & Printer Barcode)',
        iconType: 'barcode',
      },
      {
        stepNumber: 3,
        title: 'Pemeriksaan Material',
        subtitle: 'UJI KELAYAKAN TEKNIS & K3',
        description: 'Pengujian kondisi material oleh tim teknis: diklasifikasikan sebagai Layak Pakai (Bagus), Perlu Rekondisi, atau Limbah/Rusak.',
        documentCode: 'Form Hasil Uji Kelayakan',
        role: 'Teknisi Penguji Kualitas & K3',
        keyPoints: [
          'Pengujian tahanan isolasi, uji kelistrikan, dan inspeksi keausan mekanis.',
          'Klasifikasi status: Masuk Stok Aktif, Reparasi, atau Hapus Buku.',
          'Pencatatan berita acara hasil penilaian kelayakan operasional.',
        ],
        spotlightHint: 'Tengah (Teknisi dengan Kacamata K3 & Kaca Pembesar)',
        iconType: 'search',
      },
      {
        stepNumber: 4,
        title: 'Penempatan Area Karantina',
        subtitle: 'ZONA ISOLASI STATUS HOLD',
        description: 'Material yang memerlukan penyelidikan teknis lanjutan atau menunggu keputusan manajerial diamankan di zona karantina bergaris polisi.',
        documentCode: 'Tag Status: HOLD / Isolasi',
        role: 'Petugas Gudang & Pengawas K3',
        keyPoints: [
          'Pemberian garis barikade pembatas dan lampu peringatan merah.',
          'Pemisahan ketat agar tidak salah terambil oleh kru lapangan.',
          'Menunggu hasil evaluasi komite logistik dan inspeksi laboratorium.',
        ],
        spotlightHint: 'Kiri Bawah (Barikade Karantina & Tanda Sirene HOLD)',
        iconType: 'shield',
      },
      {
        stepNumber: 5,
        title: 'Penempatan Area MRWI',
        subtitle: 'GUDANG PENGEMBALIAN (MRWI)',
        description: 'Penempatan permanen material pada rak Material Retur Warehouse Inventory (MRWI) untuk pengelolaan audit dan sirkulasi ulang.',
        documentCode: 'Alokasi Blok MRWI',
        role: 'Operator Forklift Gudang',
        keyPoints: [
          'Penyusunan rapi di rak multi-tier Area MRWI Gudang Pengembalian.',
          'Sinkronisasi saldo inventaris MRWI di sistem Kiosk & SAP.',
          'Barang siap digunakan kembali (jika bagus) atau proses lelang limbah resmi.',
        ],
        spotlightHint: 'Kanan Bawah (Rak Hijau Bertingkat Area MRWI & Forklift)',
        iconType: 'rack',
      },
    ],
  },
];
