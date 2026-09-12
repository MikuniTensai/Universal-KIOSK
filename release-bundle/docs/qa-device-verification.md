# Laporan Verifikasi Kualitas & Pengujian QA Universal-KIOSK (K24–K29)

Tanggal Pengujian: 11 September 2026  
Lingkungan Uji: Vitest v3.2.7, Node.js v24.15.0, JSDOM v26.0.0, Vite v6.4.3  
Target Perangkat: Kassen WK-215 Self-Service Kiosk (Windows 10/11 x64, RAM 4GB, 21.5" Full HD Touch)

---

## 1. Ringkasan Eksekutif Hasil Pengujian

| Kategori Pengujian | File Spesifikasi Uji | Kasus Diuji | Lulus | Gagal | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Domain & Data (DATA-01–04)** | `tests/domain/validation.test.ts` | 15 | 15 | 0 | **PASSED** |
| **Katalog & Multi-Lokasi** | `tests/features/catalogService.test.ts` | 7 | 7 | 0 | **PASSED** |
| **Admin & Snapshot Manager** | `tests/features/adminAndSnapshot.test.ts` | 8 | 8 | 0 | **PASSED** |
| **Scanner Wedge & Idle Timer** | `tests/features/scannerAndIdle.test.ts` | 6 | 6 | 0 | **PASSED** |
| **WCAG Kontras & Desain Token** | `tests/ui/themeAndContrast.test.ts` | 5 | 5 | 0 | **PASSED** |
| **Navigasi UI & Flow End-to-End** | `tests/ui/appNavigation.test.tsx` | 5 | 5 | 0 | **PASSED** |
| **TOTAL KESELURUHAN** | **6 Berkas Uji** | **46** | **46** | **0** | **100% LULUS** |

---

## 2. Rincian Pemenuhan Kebutuhan (R01–R15 & DATA-01–04)

### A. Integritas Data & Snapshot (DATA-01 s/d DATA-04)
- **DATA-01 (Kategori & Referensi Material):**
  - Kategori valid dan duplikat teruji secara ketat. Duplikasi categoryId langsung ditolak dengan identitas baris bermasalah.
  - Material yang merujuk pada categoryId fiktif ditolak (`FOREIGN_KEY_VIOLATION`).
  - Barcode alias ganda yang merujuk pada objek berbeda ditolak (`DUPLICATE_BARCODE_ALIAS`).
- **DATA-02 (Timestamp, Timezone, Null vs Nol):**
  - Validasi zona waktu IANA (`Asia/Jakarta`, `Asia/Makassar`, `UTC`) bekerja presisi.
  - ISO 8601 dengan offset berbeda yang merepresentasikan waktu mutlak sama menghasilkan perhitungan umur stok yang identik.
  - Nilai kuantitas `null` dipertahankan sebagai null ("Data stok belum tersedia") dan tidak pernah diubah menjadi nol. Nilai `0` tetap ditampilkan sebagai "Stok Habis (0 Unit)".
- **DATA-03 (Konflik Versi & Keamanan Path):**
  - Paket dengan nomor versi lebih lama ditolak pada impor normal.
  - Paket dengan versi identik dan hash sama dianggap no-op (tanpa mutasi data sia-sia).
  - Paket dengan versi sama namun hash berbeda ditolak sebagai konflik identitas versi.
  - Path traversal (`../../etc/passwd` dsb.) pada fileList langsung ditolak.
- **DATA-04 (Otorisasi Restore & Keutuhan Riwayat):**
  - Operasi restore tanpa sesi petugas ditolak.
  - Restore snapshot lama berhasil memulihkan data dengan mempertahankan `sourceAt` dan `importedAt` asli, serta membubuhkan `restoredAt`.

### B. Perilaku Scanner & Idle (R06, R07, R08, R09)
- **Scanner Wedge Keystroke Burst:**
  - Keystroke dengan jeda sangat singkat (<50ms per karakter) tertangkap sebagai input barcode optik dan diproses saat tombol `Enter` diterima.
  - Ketikan manusia dengan jeda lambat (>100ms) tidak tertukar menjadi input scanner.
  - Request coordinator berbasis `requestId` menjamin hasil scan terbaru selalu menang dan tidak tertimpa oleh request lama yang selesai terlambat.
- **Idle Timer & Screensaver (R08):**
  - Timeout 60 detik memicu mode layar diam (Screensaver attract mode).
  - Warning phase aktif 10 detik sebelum timeout dengan dialog hitung mundur.
  - Sentuhan layar atau tembakan scanner seketika membatalkan hitung mundur dan mereset timer.

### C. UI/UX, Aksesibilitas & Anti-Slop (R03, R13, PLAN §6.1)
- **Rasio Kontras WCAG:**
  - Teks `#0F172A` di atas kuning `#FACC15`: **11.66:1** (Memenuhi standar tertinggi WCAG AAA).
  - Teks `#0F172A` di atas `#EAB308`: **9.31:1** (WCAG AAA).
  - Teks sekunder `#475569` di atas putih `#FFFFFF`: **7.58:1** (WCAG AAA).
  - Teks putih di atas kuning `#FACC15` dilarang (hanya 1.53:1).
- **Target Sentuh Kiosk:**
  - 100% tombol navigasi dan thumbnail kontrol utama memiliki tinggi minimal 56px (`h-14` / `h-16`).
- **Anti-Slop Compliance:**
  - Tidak ada klaim fiktif, metrik buatan, atau kontrol mati (dead controls).
  - Seluruh state: loading, error, empty catalog, stale data, dan not-found terimplementasi dengan pesan ramah dan tindakan pemulihan yang jelas.

---

## 3. Hasil Build Produksi & Efisiensi Memori (K25)
- **Bundler:** Vite v6.4.3 + TypeScript v5.7.3
- **Ukuran Bundle JS:** 331 kB (Gzip: 95.7 kB)
- **Ukuran Bundle CSS:** 32.3 kB (Gzip: 6.1 kB)
- **Waktu Build:** 2.78 detik
- **Konsumsi Memori RAM Estimasi:** ~80–120 MB (Sangat ringan di atas RAM 4GB Kassen WK-215).
