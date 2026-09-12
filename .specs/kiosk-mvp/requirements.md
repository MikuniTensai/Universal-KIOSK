# Kebutuhan Universal-KIOSK MVP

Status: spesifikasi untuk review implementasi; belum ada kode atau bukti uji aplikasi.
Dasar: [PLAN.md](../../PLAN.md). Arahan Owner: UI/UX mengikuti Universal-POS dengan tema kuning. Cakupan rilis pertama: satu terminal, satu gudang, informasi dan lookup material offline.

## Kebutuhan dan penerimaan

| ID | Kebutuhan EARS | Kriteria penerimaan |
| --- | --- | --- |
| R01 | KETIKA aplikasi dibuka, sistem harus memuat konfigurasi dan snapshot data valid terakhir | Tanpa jaringan tetap dapat masuk; tanpa snapshot tampilkan konfigurasi diperlukan; tanpa fallback valid jangan menampilkan data parsial |
| R02 | KETIKA pengguna memilih menu, sistem harus membuka Program Kerja, Daftar Material, atau Scan Material | Ketiga menu dan Beranda bisa disentuh; navigasi tidak menyisakan dialog halaman sebelumnya |
| R03 | Sistem harus menggunakan pola visual Universal-POS dan profil kuning pada PLAN §6.1 | K05 membekukan revision dan perubahan lokal referensi, layar/state, viewport efektif serta scaling; K23 membandingkan font, kartu, input, tombol, header, pencarian dan filter terhadap baseline tersebut; perbedaan kiosk tercatat dan diterima; teks di tombol kuning gelap |
| R04 | KETIKA pengguna mencari atau memilih kategori, sistem harus menyaring material lokal | Nama/kode dapat dicari; kode dengan nol awal utuh; hasil kosong dibedakan dari kesalahan baca data |
| R05 | KETIKA material dibuka, sistem harus menampilkan identitas, spesifikasi yang tersedia, lokasi dan informasi stok | Nol, tidak diketahui dan data lama dibedakan; waktu sumber/impor terlihat; stok nol tetap dapat dibuka; material multi-rak tampil tanpa kehilangan lokasi |
| R06 | KETIKA satu frame scanner yang valid diterima, sistem harus melakukan lookup lokal | Berlaku dari idle/menu/modul; scan tidak dikenal memberi langkah lanjut; ketikan pencarian tidak terambil; isi QR tidak dieksekusi |
| R07 | JIKA scan datang berulang atau lookup bersamaan, sistem harus menampilkan hasil scan terbaru | Hasil lama tidak menimpa hasil baru; satu scan tidak menumpuk modal; kode unit berseri membuka unit yang tepat |
| R08 | SELAMA tidak ada aktivitas pengguna selama timeout konfigurasi, sistem harus kembali ke media idle | Default prototipe 60 detik dengan peringatan 10 detik; sentuh/scan membatalkan hitung mundur; video berjalan tidak dianggap interaksi |
| R09 | KETIKA konten informasi dibuka atau idle aktif, sistem harus menggunakan media lokal yang valid | Konten resmi dapat ditelusuri; media hilang/rusak punya pengganti; konten kedaluwarsa tidak terus diputar; media berhenti ketika halaman ditinggalkan |
| R10 | KETIKA petugas mengimpor paket, sistem harus memvalidasi seluruh paket sebelum aktivasi | Kolom wajib, kategori dan referensi, tipe, barcode unik, tanggal/zona, path dan media diperiksa; versi sama dengan hash sama tidak mengaktifkan ulang; versi bentrok atau lebih lama ditolak melalui impor normal; preview terikat pada identitas paket dan snapshot aktif |
| R11 | JIKA impor/aktivasi gagal, sistem harus mempertahankan atau memulihkan snapshot valid | Paket parsial tidak menjadi aktif; disk penuh, proses berhenti dan berkas rusak diuji; restore manual memerlukan sesi petugas, preview dampak dan konfirmasi; sourceAt/importedAt asli tetap, restoredAt dicatat terpisah |
| R12 | Sistem harus membatasi impor, konfigurasi, restore dan diagnostik kepada petugas berwenang serta membatasi akun publik Windows | Akses ditolak di native/layanan; URL/API langsung tidak melewati otorisasi; tidak ada kredensial default; akun publik tidak memiliki hak admin atau akses desktop/alat sistem tanpa autentikasi; jalur pemeliharaan diuji pada edisi OS aktual |
| R13 | Sistem harus menyediakan umpan balik sentuh dan keadaan kosong/memuat/gagal/offline | Target utama minimal 56 px, fokus terlihat, keyboard sentuh berfungsi, warna bukan satu-satunya informasi; kedua orientasi diuji |
| R14 | Sistem harus menyediakan paket Windows yang dapat dipasang tanpa jaringan, penguncian kiosk, serta prosedur pemulihan | Instalasi bersih offline dengan prerequisite tersedia dan belum tersedia diuji pada Windows nyata/VM berlisensi yang sesuai; unit target membuktikan login otomatis/akses publik, startup, pemulihan proses dan pemeliharaan; font/media lokal; uji cold start tidak menggantikan instalasi offline |
| R15 | Sistem harus menyediakan bukti kualitas sebelum serah terima | Build, tes logika, click-through, scanner fisik, performa dan UAT terikat versi kandidat/dataset/config; seluruh kasus wajib lulus, tanpa temuan kritis/tinggi terbuka; ambang dan rumus pada quality-gates.md dibekukan K06 sebelum pengujian formal |

Semua aksi publik bersifat baca saja terhadap persediaan. Stok tersedia bukan hasil perhitungan otomatis sebelum definisinya disahkan pengelola gudang. Contoh data pengembangan wajib berlabel SIMULASI dan tidak berisi klaim uji laboratorium atau keselamatan operasional rekaan.

## Skenario Gherkin utama

```gherkin
Feature: Lookup material offline
  Scenario: Scan saat idle tanpa jaringan
    Given snapshot valid memuat alias "000123" untuk material A
    And aplikasi idle dan jaringan terputus
    When scanner mengirim frame valid "000123"
    Then detail material A tampil dengan kode utuh
    And waktu sumber data terlihat
    And persediaan tidak berubah

  Scenario: Scan baru mengalahkan hasil lama
    Given lookup A belum selesai
    When pengguna melakukan scan B dan lookup B selesai lebih dahulu
    Then detail B tetap tampil ketika lookup A selesai

  Scenario: Pencarian dengan keyboard
    Given fokus berada pada input pencarian
    When pengguna mengetik nama material dan menekan Enter
    Then input diproses sebagai pencarian
    And sistem tidak membuat peristiwa scan dari kecepatan ketikan saja

Feature: Pembaruan aman
  Scenario: Paket mengandung barcode ganda
    Given snapshot A sedang aktif
    When petugas mengimpor paket B dengan satu alias untuk dua tujuan
    Then paket B ditolak dengan identitas baris bermasalah
    And snapshot A tetap aktif

  Scenario: Proses berhenti saat aktivasi
    Given snapshot A valid dan paket B sudah divalidasi
    When proses aplikasi berhenti pada tahap aktivasi B
    Then pembukaan berikutnya memilih snapshot lengkap yang valid
    And tidak menggabungkan sebagian data A dengan sebagian data B

  Scenario: Versi sama membawa isi berbeda
    Given versi dataset 12 dengan hash H1 pernah diterima
    When petugas mengimpor versi dataset 12 dengan hash H2
    Then paket ditolak sebagai konflik identitas versi
    And snapshot aktif beserta waktu impornya tidak berubah

  Scenario: Restore data lama oleh petugas
    Given snapshot versi 12 aktif dan snapshot versi 10 masih valid
    When petugas melihat peringatan data lebih lama dan mengonfirmasi restore versi 10
    Then versi 10 aktif secara atomik dengan sourceAt dan importedAt aslinya
    And restoredAt mencatat waktu pemulihan
    And penanda data lama dihitung dari sourceAt asli

  Scenario: Paket berulang tidak menyegarkan stok
    Given snapshot versi 12 dengan hash H1 aktif
    When petugas mengimpor kembali versi 12 dengan hash H1
    Then sistem memberi hasil tidak ada perubahan
    And sourceAt dan importedAt tetap

Feature: Data dan akses petugas
  Scenario: Stok belum diketahui
    Given material memiliki quantity null
    When detail dibuka
    Then tampil "Data stok belum tersedia"
    And sistem tidak mengganti null dengan nol

  Scenario: Pengguna publik mencoba impor langsung
    Given sesi petugas tidak aktif
    When pengguna memanggil operasi impor tanpa melalui menu
    Then operasi ditolak oleh lapisan yang memiliki akses penyimpanan
```

## Kasus wajib untuk celah audit teknis

ID berikut adalah skenario yang harus diimplementasikan dan dijalankan, belum hasil pengujian. Tiap variasi wajib mempunyai expected/actual sendiri; satu variasi gagal membuat kasus induknya gagal.

| ID | Kebutuhan | Tugas terkait | Skenario dan hasil yang diwajibkan |
| --- | --- | --- | --- |
| DATA-01 | R04/R05/R10 | K04/K08/K09/K10 | Kategori valid dan kosong diterima; ID kategori duplikat atau categoryId material tanpa tujuan ditolak beserta baris/field; pencarian/filter memakai nama kategori yang benar |
| DATA-02 | R05/R09/R10 | K04/K14/K16/K24 | ISO dengan offset berbeda untuk waktu sama menghasilkan umur sama; zona gudang valid, invalid ditolak; batas tengah malam dan tepat batas stale/validUntil diuji; timestamp tanpa zona/future invalid ditolak; null stok tetap null |
| DATA-03 | R10 | K04/K10/K22/K24 | Versi baru sah dapat dipreview; paket aktif versi/hash sama no-op; paket lama atau sourceAt mundur ditolak normal; versi sama/hash berbeda ditolak; paket dikenal tetapi tidak aktif diarahkan ke restore, tidak diaktifkan otomatis |
| DATA-04 | R11/R12 | K11/K15/K22/K24 | Restore tanpa sesi ditolak; pembatalan tidak mengubah data; restore dikonfirmasi mempertahankan sourceAt/importedAt, menambah restoredAt dan audit; hash rusak ditolak; proses berhenti di setiap titik aktivasi tetap menyisakan snapshot lengkap |
| OS-01 | R12/R14 | K02/K03/K06 | Catat unit, build/edisi/arsitektur OS dan dukungan runtime; keputusan Tauri atau Edge memakai mekanisme kiosk yang didukung edisi aktual dan PoC lulus; unsupported menjadi blocker bernama |
| OS-02 | R12/R14 | K03/K26 | Dari akun publik coba Alt+Tab, Alt+F4, Win, Win+R, Ctrl+Shift+Esc, Ctrl+Alt+Del, gesture tepi, klik kanan, F11/F12 dan tautan/file dialog; tidak memberi desktop, shell, konfigurasi atau aplikasi lain tanpa autentikasi; layar aman Windows boleh muncul bila kembali ke kiosk/maintenance terautentikasi; admin dapat memelihara dan kembali ke mode publik |
| OS-03 | R01/R14 | K03/K26/K27 | Login/boot yang diizinkan membuka kiosk tanpa klik publik; proses aplikasi berhenti lalu kembali otomatis ke snapshot valid; bila Edge dipilih, layanan lokal juga pulih otomatis; tidak meninggalkan desktop interaktif; hasil dibandingkan ambang quality-gates.md |
| WIN-01 | R01/R14 | K03/K25/K26 | Pada image Windows bersih yang cocok dan belum memiliki prerequisite runtime, jaringan sudah putus sebelum installer: paket offline memasok prerequisite, pemasangan dan peluncuran berhasil tanpa download; keadaan awal dan runtime akhir direkam |
| WIN-02 | R01/R14 | K03/K25/K26 | Pada Windows dengan prerequisite runtime terpasang, jaringan putus sebelum installer: paket dapat dipasang, font/media tampil dan snapshot terbaca tanpa CDN; versi runtime dan checksum kandidat direkam |
| WIN-03 | R11/R14 | K25/K26/K30 | Update kandidat dari versi yang benar-benar tersedia dan didukung, kegagalan update serta rollback offline menjaga config/data; rilis pertama menggunakan kandidat uji sebelumnya yang terdokumentasi, bukan mengarang versi produksi lama; operator dapat menjalankan pemulihan sesuai panduan |

OS-02/OS-03 dan uji gangguan hanya dijalankan pada unit/VM uji yang disetujui, mengikuti konfirmasi Owner sebelum reboot, penghentian sesi desktop, penghapusan permanen atau tindakan keselamatan lain. Tidak perlu mengubah perangkat sekarang untuk menyiapkan rencana ini.

## Batas penerimaan dan keputusan eksternal

Ambang numerik, populasi pengukuran, jumlah pengulangan dan syarat Go berada pada [quality-gates.md](quality-gates.md). K06 membekukan profil perangkat, ukuran dataset/paket, konfigurasi dan metode pengukuran sebelum K07; ambang tidak boleh diturunkan setelah melihat kegagalan tanpa keputusan perubahan dan pengujian ulang. Nilai target bukan klaim hasil.

K04 boleh memakai SIMULASI untuk draf kontrak. K06 hanya menutup kontrak produksi setelah memeriksa contoh sumber nyata yang disanitasi: kategori, kode/alias, null/nol, stok per lokasi, zona/waktu, satuan/presisi dan identitas versi. Pemilik data mengesahkan pemetaan dan definisi stok; bila contoh tidak ada, K06 BLOCKED. K28 kemudian memvalidasi paket operasional penuh sebelum pengujian kandidat lapangan yang membutuhkannya.

Data asli, label scanner, edisi OS, orientasi pemasangan, kebijakan akses stok, administrator dan penanda tangan UAT perlu tersedia untuk pilot. Ketidakhadiran input tersebut tidak menghalangi dokumentasi dan prototipe berlabel simulasi; tetap menghalangi penerimaan produksi yang bergantung padanya.

Target di atas 96% berarti sasaran hasil pengamatan sesuai quality-gates.md. Kelengkapan dokumen, keberhasilan tugas pada sampel dan probabilitas keberhasilan operasional adalah ukuran berbeda; dokumen ini tidak menyatakan aplikasi sudah mencapai salah satunya.

Cetak, SAP/API, pembayaran, mutasi stok dan multi-gudang bukan syarat MVP. Jika Owner mewajibkan cetak, perluas kebutuhan dan jadwal sebelum pekerjaan printer dimulai.
