# Buku Panduan Administrator & Petugas Logistik (Runbook Admin)
### Kiosk Mandiri Informasi & Scanner Inventaris Gudang PLN (Kassen WK-215)

## 1. Akses Masuk Panel Administrator
1. Sentuh ikon gembok/perisai kecil di sudut kanan atas Header.
2. Masukkan PIN keamanan 6-digit pada keypad sentuh (Default: `123456`).
3. Sesi administrator berlaku selama 15 menit dan otomatis keluar jika tidak ada interaksi.

## 2. Prosedur Impor Paket Data Berkala (Atomic Update)
1. Buka tab **"Impor Paket Baru"**.
2. Petugas logistik menyalin isi berkas ekspor JSON dari sistem ERP/SAP Logistik.
3. Tempel teks JSON pada area teks, lalu tekan **"Validasi & Pratinjau Paket"**.
4. Sistem akan memeriksa integritas data:
   - Keunikan barcode alias
   - Keterikatan relasi material terhadap kategori
   - Format waktu dan zona waktu IANA
   - Keutuhan checksum / hash data
5. Jika valid, sistem menampilkan kartu ringkasan (jumlah material, versi, dll.).
6. Tekan tombol **"Aktivasi Paket Sekarang (Atomik)"**.
7. Paket langsung aktif secara instan tanpa mengganggu kiosk, dan paket sebelumnya otomatis disimpan ke arsip riwayat.

## 3. Prosedur Pemulihan Data Lama (Snapshot Restore)
Jika paket yang baru diaktifkan ternyata memiliki kesalahan input dari kantor pusat:
1. Buka tab **"Riwayat & Restore"**.
2. Cari versi paket sebelumnya yang valid pada daftar.
3. Tekan tombol **"Pulihkan (Restore)"** di sebelah kanan baris versi tersebut.
4. Konfirmasi dialog pemulihan.
5. Versi tersebut akan kembali aktif seketika dengan tetap mempertahankan waktu sumber dan waktu impor aslinya, serta mencatat `restoredAt`.

## 4. Pengaturan Parameter Kiosk
Pada tab **"Pengaturan Kiosk"**, petugas dapat mengubah:
- **Nama Organisasi & Kode Gudang:** Disesuaikan dengan unit pelaksana gudang terkait.
- **Zona Waktu IANA:** Standar `Asia/Jakarta` (WIB), `Asia/Makassar` (WITA), atau `Asia/Jayapura` (WIT).
- **Timeout Idle:** Durasi tanpa sentuhan sebelum screensaver aktif (default 60 detik).
- **Timeout Warning:** Waktu munculnya dialog peringatan hitung mundur (default 10 detik).
- **Batas Umur Stok (Stale Hours):** Batas waktu dalam jam sebelum peringatan "Data Lama" muncul (default 24 jam).
