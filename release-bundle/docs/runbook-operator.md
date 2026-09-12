# Buku Panduan Pengguna & Operator Gudang (Runbook Operator)
### Kiosk Mandiri Informasi & Scanner Inventaris Gudang PLN (Kassen WK-215)

## 1. Menghidupkan & Mengawali Operasional Terminal
1. Pastikan kabel daya Kassen WK-215 terhubung ke stop kontak PLN dengan grounding yang baik.
2. Tekan tombol Power di bagian bawah kanan bodi mesin.
3. Tunggu sistem Windows booting. Aplikasi Kiosk PLN akan otomatis terbuka dalam mode layar penuh (Full Screen Kiosk Mode).
4. Jika tidak ada aktivitas sentuhan selama 60 detik, layar akan masuk ke **Mode Layar Diam (Screensaver/Attract Mode)** yang menampilkan video profil K3 PLN.

## 2. Cara Menggunakan Terminal
### A. Membuka Menu Utama (Beranda)
- Sentuh layar di bagian mana saja pada mode Screensaver. Layar akan beralih ke Menu Utama.
- Menu Utama menyediakan 3 Modul:
  1. **Modul A: 📋 Program Kerja Gudang PLN** (Visi misi, roadmap digitalisasi, panduan 5S, dan K3).
  2. **Modul B: 📦 E-Katalog Material** (Pencarian barang, filter kategori, dan lokasi rak).
  3. **Modul C: 🔍 Scan Barcode / QR** (Pengecekan spesifikasi mandiri).

### B. Memindai Label Barcode / QR Material
1. Pilih **Modul C (Scan Barcode / QR)** atau langsung dekatkan barcode ke pemindai saat di layar mana saja.
2. Arahkan label barcode/QR pada fisik barang ke kotak kaca pemindai di bawah layar (jarak optimal 10–15 cm).
3. Scanner akan berbunyi "Beep" dan layar langsung menampilkan:
   - Foto resmi material
   - Nama lengkap dan standar spesifikasi SPLN
   - Alamat rak gudang (Zona, Jalur, Blok Bin)
   - Status ketersediaan stok fisik & teralokasi
4. Tekan **"Scan Material Lain"** untuk memindai barang berikutnya.

### C. Mencari Material di E-Katalog
1. Pilih **Modul B (E-Katalog Material)**.
2. Sentuh kolom pencarian. **Keyboard Sentuh Virtual** akan otomatis muncul di bagian bawah layar.
3. Ketik nama barang (misal: *Trafo*, *Kabel*, *Isolator*) atau nomor normalisasi/SAP.
4. Sentuh salah satu kartu material untuk melihat rincian lokasi rak dan stok lengkap.

### D. Memahami Indikator Status Stok
- **Hijau ("Tersedia: X Unit"):** Material ada di gudang dan siap digunakan.
- **Merah ("Stok Habis / 0 Unit"):** Material tercatat dalam normalisasi gudang namun saldo fisik saat ini nol.
- **Abu-abu ("Data stok belum tersedia"):** Saldo kuantitas belum tercatat pada ekspor terakhir.
- **Kuning ("Data Lama"):** Waktu ekspor data telah melewati batas umur kesegaran (default 24 jam). Harap verifikasi fisik ke pengawas gudang.

### E. Tombol Beranda
- Tombol kuning **"Beranda"** selalu tersedia di sudut kanan atas pada setiap modul untuk kembali ke menu awal.
