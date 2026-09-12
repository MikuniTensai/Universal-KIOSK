# CATATAN PENYESUAIAN SISTEM & DISTRIBUSI PRODUKSI
**Universal-KIOSK Gudang Logistik PLN UP3 Malang (Aris Munandar)**
*Tanggal Pembaruan: 12 September 2026*

---

## 1. Keselarasan Tabel Stok dengan Master Excel SAP (`export_material NEW(1).csv`)

Struktur tabel di panel **Manajemen Stok & Material** telah diselaraskan secara presisi dengan format master file Excel SAP:

| No | Nama Kolom di Tabel | Kolom di Excel SAP | Keterangan |
|---|---|---|---|
| 1 | **NO** | `No` | Nomor urut 1 s.d. 151 |
| 2 | **NAMA MATERIAL** | `Nama Material` | Deskripsi material lengkap |
| 3 | **KODE NORMALISASI** | `Kode Normalisasi` | Kode unik material SAP (7 digit) |
| 4 | **SATUAN** | `Satuan` | Unit pengukuran (BH, SET, M, dll) |
| 5 | **STOK** | `Stok` | Jumlah kuantitas stok fisik tersedia |
| 6 | **BLOK** | `BLOK` | Zona gudang (Blok A, B, C, D, GD Bululawang) |
| 7 | **RAK** | `RAK` | Kode baris rak penyimpanan (A, B, C s.d. H) |
| 8 | **SUB RAK** | Kolom kosong ke-8 | Kolom bin / sub-rak (misal: H12, H13, H14, A11) |
| 9 | **KATEGORI** | *Atribut Kios* | Klasifikasi logistik (MDU, Gardu, APP, APD, Kabel) |
| 10 | **AKSI** | *Kontrol Admin* | Tombol **Sesuaikan** dan Hapus Material |

> **Catatan Penting:** 8 Kolom pertama (No s.d. Sub Rak) disusun **persis 1:1** dengan urutan file CSV master Excel SAP agar hasil ekspor/impor identik. Kolom Kategori diletakkan setelah Sub Rak agar tidak menyela urutan atribut utama SAP.

---

## 2. Cara Menyesuaikan Kategori Stok di Panel Admin

Kategori material dapat disesuaikan melalui 3 jalur:

1. **Mengubah Kategori Material yang Sudah Ada**:
   * Buka menu **Kelola & Tambah Stok**.
   * Klik tombol **Sesuaikan** di baris material yang bersangkutan.
   * Pada pop-up modal, pilih kategori baru dari dropdown **Kategori Material**.
   * Klik **Simpan Perubahan Stok**. Kategori akan langsung terbarui di tabel stok dan katalog.

2. **Menentukan Kategori Saat Menambah Material Baru**:
   * Klik tombol kuning **+ Tambah Material Baru** di bagian atas tabel.
   * Masukkan Nama Material, pilih **Kategori Material** dari dropdown (atau klik *+ Kelola Kategori*).
   * Isi Stok, BLOK, RAK, dan SUB RAK, lalu klik **Daftarkan Material**.

3. **Membuat Kategori Baru**:
   * Buka tab **Kelola Kategori** di bilah navigasi kiri.
   * Masukkan nama kategori baru (contoh: *Trafo Khusus*, *Material Transmisi*).
   * Kategori baru langsung tersedia di seluruh pilihan material.

---

## 3. Proteksi Gambar Material Saat Import Excel / CSV

* **Kunci Berdasarkan Kode Normalisasi**:
  Ketika fitur **Import CSV (Ganti/Update Stok)** dijalankan (baik mode *Replace All* maupun *Merge*), sistem mencocokkan setiap baris dengan `Kode Normalisasi`.
* **Gambar Tidak Akan Terhapus**:
  Jika material tersebut sudah memiliki gambar (baik dari database awal atau foto yang diunggah manual oleh admin), gambar tersebut **tetap dipertahankan secara permanen** dan tidak akan tertimpa.
* **Gambar Default (Fallback)**:
  Jika ada item yang belum memiliki gambar kustom, sistem secara otomatis menetapkan **Foto Resmi Gudang PLN Aris Munandar** (`WhatsApp Image 2026-09-12 at 16.56.14.jpeg` / `wallpaper_warehouse.webp`) sehingga tidak ada item katalog yang kosong tanpa visual.
* **Unggah Foto Mandiri**:
  Admin dapat mengunggah file foto langsung dari laptop/flashdisk atau menempel tautan URL gambar melalui jendela pop-up **Sesuaikan** atau **Tambah Material Baru**.

---

## 4. Panduan Refresh Produksi (Browser Cache)

Jika tampilan pada browser unit Kiosk atau komputer administrator masih menampilkan versi cache sebelumnya:
1. Tekan tombol kombinasi keyboard **`Ctrl + F5`** (atau `Ctrl + Shift + R`) untuk melakukan *Hard Refresh*.
2. Atau bersihkan Cache Browser pada pengaturan browser (Clear browsing data -> Cached images and files).
3. Paket rilis offline mandiri di folder `release-bundle/` sudah mencakup seluruh berkas build produksi terbaru yang telah disinkronkan.
