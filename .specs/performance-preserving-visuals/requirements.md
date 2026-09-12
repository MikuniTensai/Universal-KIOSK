# Optimasi performa dengan visual tetap

Dasar: Owner meminta performa meningkat dan mempertahankan visual yang sekarang. Baseline adalah working tree saat permintaan diterima, termasuk perubahan material baru/retur. Implementasi dibatasi pada optimasi internal yang sudah diizinkan permintaan tersebut.

- Sistem harus mempertahankan warna, tipografi, ukuran, susunan, gambar, efek, isi, dan kontrol yang tersedia.
- Ketika katalog dicari, difilter, atau barcode dipindai, hasil dan urutannya harus sama dengan baseline, termasuk stok null/nol, status, kondisi baru/retur, serta data setelah pembaruan paket.
- Selama SOP diputar, progress dan pergantian langkah harus berjalan dengan kecepatan yang dipilih tanpa merender ulang seluruh explorer setiap frame. Jeda, reset, perpindahan alur, dan cleanup tetap berfungsi.
- Ketika polling menerima data yang belum berubah, klien tidak perlu mengunduh dan membaca ulang paket penuh jika server mendukung validasi HTTP. Server lama tetap kompatibel.
- Setelah polling dihentikan, listener/timer milik polling harus dilepas; respons lama tidak boleh menerapkan pembaruan ke sesi polling yang sudah berhenti.
- Pengukuran desktop tidak boleh dilaporkan sebagai bukti 60 fps pada Kassen. Flag GPU dan desain tidak diubah dalam optimasi ini.

```gherkin
Scenario: Katalog tetap benar setelah pembaruan
  Given hasil pencarian dan scan sudah dihitung untuk paket A
  When paket diganti dengan paket B berisi stok dan lokasi baru
  Then pencarian dan detail menggunakan data B

Scenario: Poll tanpa perubahan
  Given klien sudah menerapkan paket dengan validator HTTP tertentu
  When server mengembalikan 304 untuk validator itu
  Then JSON paket tidak dibaca dan callback pembaruan tidak dijalankan

Scenario: Animasi tidak mengulang render halaman
  Given SOP sedang diputar
  When satu frame progress berjalan tanpa perpindahan langkah
  Then progress bergerak tanpa commit React seluruh explorer
```
