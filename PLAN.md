# Rencana Pengembangan Universal-KIOSK

Tanggal penyusunan: 11 September 2026
Status: paket rencana pengerjaan telah disusun; implementasi dan pengujian perangkat belum dimulai. Arah UI Universal-POS dengan tema kuning mengikuti persetujuan Owner.
Perencana: Sulastri, dilaporkan melalui Nisa.

Pintu masuk pengerjaan: [.specs/kiosk-mvp/tasks.md](.specs/kiosk-mvp/tasks.md), berisi urutan K01–K32 sampai serah terima, prasyarat dan bukti penerimaan. Baca bersama [requirements.md](.specs/kiosk-mvp/requirements.md), [design.md](.specs/kiosk-mvp/design.md), [DESIGN.md](.specs/kiosk-mvp/DESIGN.md), dan [quality-gates.md](.specs/kiosk-mvp/quality-gates.md). Berkas-berkas ini memerinci rencana; pertentangan harus diselesaikan mengikuti arahan Owner terbaru sebelum tugas terkait dijalankan.

## 1. Sasaran dan kondisi awal

Membangun kiosk informasi gudang PLN pada Kassen WK215 agar pengguna dapat melihat program kerja, mencari material, dan memindai label untuk memperoleh spesifikasi, lokasi, serta stok dari data terakhir yang tersedia, termasuk saat jaringan terputus.

Pemeriksaan folder pada sesi ini menemukan dua dokumen sumber: rancangan awal dan brosur Kassen. Belum ditemukan kode aplikasi, manifest dependency, atau pengujian. Seluruh milestone di bawah berstatus belum dimulai.

Sumber lokal:

- [Rancangan awal](RANCANGAN_KIOSK_PLN_KASSEN_WK215.md).
- [Brosur Kassen, halaman spesifikasi](2504%20kassen%20kiosk%20series%20productsheet%20%282%29.pdf), halaman 2; teks diekstrak menggunakan `pdftotext -layout` pada sesi ini.

Universal-KIOSK belum tercantum di registri `agent-nusamanda/agent-dev-kit/project/workspaces.md` yang dibaca pada sesi ini. Sebelum sesi implementasi resmi NSM, konfirmasi akun pengembang dan registrasi workspace melalui pengelola ADK. Dokumen awal menyebut develop-mikunitensai; itu belum merupakan konfirmasi identitas sesi dari Owner.

## 2. Temuan yang mengubah rencana awal

| Pokok | Bukti atau ketidakpastian | Dampak pada rencana |
| --- | --- | --- |
| Sistem operasi | Brosur menyebut Windows 10; rancangan menyebut Windows 10/11 | Catat edisi, versi, lisensi, dan kebijakan dukungan OS unit aktual sebelum memilih cara penguncian kiosk |
| Scanner | Brosur menyebut scanner pembayaran 2D; scanner barang adalah opsi | Uji label gudang pada unit aktual; USB HID dan akhiran Enter belum terbukti |
| Printer | Brosur menyebut thermal 80 mm dengan auto cutter | Driver, protokol, status kertas, dan cara cetak dari aplikasi masih perlu diuji |
| Layar | Brosur menyebut 1920 × 1080 | Orientasi pemasangan dan scaling Windows perlu dikonfirmasi |
| Timeout | Rancangan menggunakan 45 detik dan 60 detik | Usulan satu konfigurasi idle 60 detik; validasi bersama pengguna |
| Performa | Angka RAM, ukuran installer, dan 60 FPS di rancangan belum memiliki hasil ukur | Tetapkan anggaran performa melalui pengukuran pada perangkat |
| Data material | Tampilan contoh memuat stok, SPLN, status uji, dan instruksi penanganan | Perlakukan semua contoh sebagai ilustrasi; hanya tampilkan data operasional yang disahkan pengelola gudang |

## 3. Batas MVP

MVP mencakup satu terminal dan satu gudang, tiga menu utama, media idle lokal, program kerja, katalog dengan pencarian nama/kode/kategori, keyboard sentuh, detail material, dan pemindaian barcode/QR. Data tersedia secara lokal dan diperbarui melalui impor paket oleh petugas berwenang.

Setiap detail material menampilkan waktu data sumber dan waktu impor. Ketika stok tidak tersedia, tampilkan “Data stok belum tersedia”, bukan angka nol. Ketika data melewati batas umur yang disepakati pengelola gudang, tampilkan peringatan data lama. Kiosk hanya membaca stok; pencarian, pemindaian, dan pencetakan tidak mengubah persediaan.

Cetak tiket lokasi adalah tambahan setelah MVP. Integrasi SAP/API pusat, dashboard administrasi jarak jauh, banyak cabang, transaksi keluar-masuk barang, pembayaran, dan reservasi material memerlukan tahap serta kebutuhan terpisah.

Nama Universal-KIOSK tidak otomatis menjadi mandat membangun seluruh jenis kiosk. Profil PLN menjadi implementasi pertama; nama organisasi, media, kategori, dan timeout disimpan sebagai konfigurasi agar dapat digunakan kembali.

## 4. Usulan arsitektur dan keputusan teknis

Usulan frontend mengikuti opsi di rancangan awal: React, TypeScript, dan Vite. Pilih runtime setelah percobaan perangkat, sebelum membangun seluruh fitur.

| Kandidat | Alasan dipertimbangkan | Syarat pemilihan |
| --- | --- | --- |
| Tauri dengan data lokal SQLite | Menyatukan aplikasi desktop, media lokal, dan pengelolaan data dalam satu paket | Percobaan Windows membuktikan instalasi, akses data, scanner, pemulihan aplikasi, dan jalur printer bila cetak masuk cakupan |
| Edge kiosk dengan layanan lokal | Memakai jalur kiosk browser yang didokumentasikan Microsoft | Buktikan layanan lokal otomatis tersedia saat boot, pemulihan layanan, penyimpanan offline, dan jalur administrasi |

Rekomendasi awal adalah menguji Tauri terlebih dahulu untuk kebutuhan offline dan paket desktop. Ini keputusan sementara, bukan hasil benchmark. Tauri menggunakan WebView2 di Windows; runtime dan instalasi offline harus diperiksa dalam percobaan. Lihat [prasyarat Tauri](https://v2.tauri.app/start/prerequisites/).

Edge mendokumentasikan mode kiosk dan integrasi Assigned Access. Pilihan penguncian harus sesuai edisi Windows dan jenis aplikasi; konfigurasi Edge tidak otomatis berlaku untuk aplikasi Tauri. Lihat [mode kiosk Edge](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-configure-kiosk-mode) dan [opsi kiosk Windows](https://learn.microsoft.com/en-us/windows/configuration/kiosk/).

Pisahkan modul informasi, katalog, scanner, impor, serta adapter perangkat. UI membaca data melalui antarmuka repositori agar keputusan runtime tidak menyebar ke seluruh halaman. Definisi struktur direktori final dan dependency menjadi keluaran desain teknis Tia setelah percobaan.

Blokir klik kanan atau shortcut pada JavaScript hanya sebagai perilaku UI. Pengamanan terminal menggunakan konfigurasi OS yang diuji, akun kiosk terbatas, serta jalur pemeliharaan untuk administrator. Usulan reboot terjadwal pada rancangan awal tidak diaktifkan otomatis; kebutuhan dan jadwalnya harus disetujui Owner.

## 5. Kontrak data awal

| Entitas | Isi minimum | Aturan |
| --- | --- | --- |
| Material | ID, kode SAP jika tersedia, nama, kategori, satuan, spesifikasi, foto opsional | Kode disimpan sebagai teks agar nol di depan tidak hilang |
| Alias barcode | Nilai barcode, jenis objek, ID tujuan | Nilai harus terpetakan secara tidak ambigu; bedakan label jenis material dan aset berseri |
| Aset berseri | ID, material induk, nomor seri, lokasi dan status jika ada | Dibutuhkan hanya bila label mengidentifikasi satu unit fisik |
| Saldo per lokasi | Material, gudang, rak/bin, kuantitas, waktu sumber | Bedakan stok fisik, reservasi, dan tersedia; rumus harus disahkan pemilik data |
| Konten informasi | Judul, urutan, media lokal, masa berlaku | Media hilang/rusak memiliki tampilan pengganti |
| Paket pembaruan | Versi skema, versi data, waktu sumber, asal data, daftar berkas | Validasi seluruh paket sebelum aktivasi; kegagalan mempertahankan data aktif sebelumnya |

Usulan alur administrasi: petugas menyiapkan ekspor CSV/JSON dan media, aplikasi memvalidasi tipe data, kolom wajib, barcode ganda, referensi, serta ukuran/jenis berkas, lalu menunjukkan ringkasan sebelum aktivasi. Penggantian data dilakukan atomik. Paket lama disimpan sesuai kebijakan retensi yang disepakati; uji pemulihan sebelum digunakan di gudang.

Jangan menampilkan label “scanner terhubung” hanya karena listener keyboard aktif. Bila tidak ada API status perangkat, gunakan petunjuk “Silakan scan” dan sediakan pemeriksaan perangkat oleh petugas.

## 6. Alur interaksi yang akan diuji

1. Boot membuka aplikasi dan data terakhir yang valid. Tanpa data awal, layar menunjukkan kebutuhan konfigurasi kepada petugas.
2. Idle memutar media lokal. Sentuhan membuka menu utama; scan valid saat idle langsung membuka hasil material.
3. Menu menyediakan Program Kerja, Daftar Material, dan Scan Material; setiap modul memiliki tombol Beranda yang terlihat.
4. Pencarian menggunakan keyboard sentuh. Penanganan scanner tidak boleh menganggap ketikan pencarian sebagai barcode hanya berdasarkan kecepatan.
5. Scan menampilkan detail atau pesan tidak ditemukan. Nilai barcode diproses sebagai data, tidak dibuka sebagai URL atau perintah.
6. Scan berulang tidak memicu tumpukan dialog atau cetak ganda. Hasil permintaan lama tidak boleh menggantikan scan terbaru.
7. Aktivitas sentuh dan scan mereset timer idle. Usulan peringatan 10 detik sebelum kembali ke idle memberi pengguna kesempatan melanjutkan; durasi ini perlu UAT.
8. Impor atau pekerjaan cetak yang masih aktif ditangani secara eksplisit saat timeout, tanpa kehilangan status atau mengulang pekerjaan otomatis.

Uci menyiapkan rancangan untuk orientasi unit aktual, tombol minimal 56 px mengikuti brief awal, teks yang terbaca pada jarak penggunaan, kontras, fokus keyboard, serta keadaan kosong, memuat, gagal, dan offline. Aset PLN harus berasal dari pemilik konten; desain visual belum dibuat dalam tugas perencanaan ini.

### 6.1 Arahan Owner: mengikuti Universal-POS dengan tema kuning

Arahan Owner pada 11 September 2026: UI/UX hampir persis dengan keluarga Universal-*, menggunakan kuning untuk profil PLN. Pemeriksaan direktori repo menemukan Universal-POS sebagai referensi aplikasi yang tersedia. Pemeriksaan sesi ini dilakukan pada dokumen dan kode sumber; aplikasi referensi belum dijalankan atau dibandingkan melalui screenshot.

Dasar referensi yang sudah dibaca:

- `../Universal-POS/client/lib/core/theme/app_typography.dart:7`: font `PlusJakartaSans`.
- `../Universal-POS/client/lib/core/theme/app_colors.dart:42`: canvas `#F0F4FA`; surface putih, teks `#0F172A`, border `#E2E8F0` pada berkas yang sama.
- `../Universal-POS/client/lib/core/theme/app_theme.dart`: kartu radius 16, input dan tombol radius 12, warna mengikuti `BrandTheme`.
- `../Universal-POS/client/lib/presentation/widgets/product_card.dart:114`: radius kartu produk 12 untuk compact dan 18 untuk ukuran biasa, foto serta informasi produk dalam satu kartu.
- `../Universal-POS/client/lib/presentation/screens/web_dashboard_screen.dart:216`: sidebar desktop dengan area konten utama.
- `../Universal-POS/client/lib/core/theme/brand_theme.dart`: kontrak primary, primaryDark, primaryLight, primaryHover, onPrimary, accent, dan border. Preset yellow yang ada menggunakan amber `#D97706`; kuning cerah kiosk menjadi profil tersendiri.

Target kemiripan mencakup bentuk komponen, font, hierarki informasi, pola pencarian/filter, sidebar, grid material, dan respons ketika disentuh. Ukuran teks dan kontrol disesuaikan dengan terminal 21,5 inci serta jarak pengguna. Kode referensi berbasis Flutter; pilihan React pada rencana tetap usulan sampai M1. Jika React dipilih, pola visual dan token diterjemahkan, bukan menyalin widget Dart langsung.

| Bagian | Pola yang dipertahankan | Adaptasi kiosk |
| --- | --- | --- |
| Kerangka layar | Header, sidebar berlabel, konten pada surface terang | Sidebar hanya Program Kerja, Daftar Material, Scan Material; Beranda selalu terlihat |
| Katalog | Pencarian di atas, filter kategori, kartu foto dan nama | Tampilkan kode, lokasi dan stok; ketuk membuka detail, termasuk saat stok nol |
| Panel detail | Pemisahan area daftar dan detail pada layar lebar | Landscape dapat memakai detail di kanan; portrait memakai halaman detail dengan tombol kembali yang jelas |
| Tombol/input | Radius 12, label tegas, state fokus dan ditekan | Target sentuh minimal 56 px; aksi utama kuning dengan teks gelap |
| Kartu | Surface putih, border tipis, radius keluarga Universal-POS | Kartu umum radius 16, material 18; fokus isi spesifikasi dan lokasi |
| Tipografi | Plus Jakarta Sans dan hierarki tebal/normal | Font tersedia lokal untuk offline; ukuran akhir diuji pada unit |
| Tema | Token warna terpusat | Profil kuning PLN; pengaturan tema menjadi fungsi petugas bila diperlukan |

Usulan token warna untuk prototipe berikutnya, mengikuti arahan kuning Owner. Nilai ini belum diklaim sebagai pedoman merek resmi PLN; aset/logo resmi tetap menggunakan berkas yang disediakan pengelola.

| Token | Nilai usulan | Pemakaian |
| --- | --- | --- |
| primary | `#FACC15` | Tombol utama dan penanda menu aktif |
| primaryHover | `#EAB308` | Tombol saat hover/ditekan |
| onPrimary | `#0F172A` | Teks dan ikon di atas kuning |
| primaryLight | `#FEFCE8` | Latar pilihan aktif yang lembut |
| primaryDark | `#854D0E` | Label pada primaryLight |
| canvas | `#F8FAFC` | Latar netral agar kuning menjadi penanda utama |
| surface | `#FFFFFF` | Kartu, input, dan panel |
| textMain | `#0F172A` | Teks utama |
| textSecondary | `#475569` | Keterangan dan waktu pembaruan |
| border | `#E2E8F0` | Pemisah surface; bukan satu-satunya penanda kontrol |

Hasil perhitungan luminansi sRGB pada sesi ini: teks `#0F172A` pada `#FACC15` = 11,66:1; pada `#EAB308` = 9,31:1; `#475569` pada putih = 7,58:1; `#854D0E` pada `#FEFCE8` = 6,62:1. Teks putih pada `#FACC15` hanya 1,53:1 sehingga tidak digunakan. Ini pemeriksaan pasangan warna, belum audit aksesibilitas UI yang dirender.

Status sukses, peringatan data lama, dan error tetap memiliki ikon serta teks yang membedakan maknanya. Kuning merek tidak otomatis berarti peringatan. Fokus memakai outline gelap yang terlihat di surface putih maupun kuning.

Arah visual: terminal gudang untuk petugas dan pengunjung, mengikuti komponen Universal-POS, light mode dengan identitas kuning. ENERGY 1 / RHYTHM 1 / MOTION 1; konsistensi tata letak membantu pengguna menemukan fungsi, dan gerak hanya memberi umpan balik sentuhan/perpindahan. Saat ini keluaran berupa spesifikasi rencana, belum mockup.

Tambahan kriteria M2: bandingkan referensi Universal-POS dan prototipe kiosk pada viewport yang sama untuk bentuk kartu, font, header, pencarian, filter, tombol dan detail. Catat perbedaan yang memang diperlukan oleh operasi kiosk. M5 tetap memerlukan bukti render dan uji sentuh pada perangkat.

## 7. Gelombang kerja dan Definition of Done

Penanggung jawab di tabel adalah usulan pembagian peran, bukan klaim agen telah menjalankan pekerjaan.

| Tahap | Pemilik | Prasyarat | Keluaran dan kriteria penerimaan | Estimasi hari kerja |
| --- | --- | --- | --- | --- |
| M0: Validasi lapangan | Sulastri + Owner/pengelola gudang; Tia untuk perangkat | Akses unit, contoh label dan ekspor data | Catatan OS/orientasi/periferal, contoh data yang boleh digunakan, definisi stok, cakupan MVP, dan keputusan kebutuhan cetak tersedia | 1–2 |
| M1: Percobaan runtime | Tia; Vinka memeriksa bukti | M0 | Satu alur scan ke detail berjalan offline di unit; hasil ukur startup/RAM; runtime dipilih dengan alasan; printer diuji bila diwajibkan | 2–3 |
| M2: Kontrak dan rancangan UX | Tia + Uci; Sulastri menjaga scope | M0; hasil M1 untuk desain runtime final | Kontrak data, aturan impor, state aplikasi, rancangan semua layar dan error, serta kriteria uji disepakati | 2–3 |
| M3: Fitur inti | Tia | M1 dan M2 | Menu, katalog, keyboard, lookup scan dan data lokal memenuhi skenario fungsional; pencarian tidak tertukar dengan scan; data lama ditandai | 4–6 |
| M4: Konten dan pemeliharaan | Tia + Uci | M3 dan media resmi | Program kerja, media idle, impor tervalidasi, pemulihan data, konfigurasi dan log diagnostik berfungsi | 3–4 |
| M5: QA perangkat dan pilot | Vinka; Uci menilai UX; Tia memperbaiki | M4 dan paket kandidat | Uji fisik, offline, kegagalan impor, pemulihan dan penggunaan satu shift memiliki bukti; temuan penghambat pilot ditutup | 3–5 |
| M6: Serah terima | Sulastri + Nisa + pengelola gudang | Bukti M5 | Paket instalasi, panduan operator/admin, prosedur backup/pemulihan, laporan QA, serta penerimaan pengguna tersedia | 1–2 |

Estimasi total bila berurutan: 16–25 hari kerja. Ini perkiraan awal, belum komitmen kalender; tidak termasuk pengadaan perangkat, menunggu data/branding, perubahan scope, cetak tambahan, atau integrasi SAP. M2 dapat dimulai sebagian setelah M0, tetapi keputusan runtime final menunggu M1.

Jalur kritis: akses perangkat dan data → M0 → M1 → finalisasi M2 → M3 → M4 → M5 → M6. Integrasi printer atau API tidak boleh menjadi ketergantungan tersembunyi MVP.

Ketentuan penerimaan setelah perbaikan audit poin 1 yang disetujui Owner: K16 menjadi prasyarat katalog/detail (K19), media idle (K21), dan UI petugas (K22). QA integrasi final K24 menunggu bukti seluruh K01–K23, termasuk integrasi konfigurasi umur stok, timeout dan diagnostik. Go pada K31 menunggu bukti seluruh K01–K30 yang sesuai dengan versi kandidat; K32 tetap serah terima setelah Go. Bukti yang belum tersedia atau tugas yang masih terblokir tidak dapat diganti dengan persentase kelengkapan checklist.

Target Owner di atas 96% diterjemahkan sebagai minimal 97/100 percobaan tugas pengguna yang valid pada profil yang dibekukan K06, dengan gate wajib 100% lulus dan tanpa temuan kritis/tinggi. Rumus, denominator, dan metode ada di [quality-gates.md](.specs/kiosk-mvp/quality-gates.md); ini target observasi untuk pilot, bukan klaim probabilitas sebelum aplikasi diuji.

## 8. Bukti pengujian yang wajib tersedia

| Area | Skenario | Kriteria penerimaan usulan |
| --- | --- | --- |
| Scanner | Label nyata yang disepakati, kode dengan nol awal, tidak dikenal, scan berulang, scan saat mencari/idle | Semua kasus terpetakan benar tanpa mengubah input pencarian atau mengeksekusi isi QR |
| Konsistensi data | Barcode ganda, referensi hilang, stok tidak diketahui, lebih dari satu rak | Impor tidak ambigu; UI membedakan data kosong, stok nol, dan data lama |
| Offline | Jaringan diputus sebelum boot dan ketika digunakan | Katalog, scan, serta media lokal tetap bekerja dengan data terakhir |
| Impor | Paket rusak, disk tidak cukup, aplikasi berhenti saat aktivasi | Data sebelumnya tetap dapat dipakai atau dipulihkan; tidak ada dataset aktif parsial |
| UI | Sentuh, keyboard, timeout, media gagal, fokus setelah pindah halaman | Semua fungsi utama dapat dicapai dan kegagalan memiliki langkah pemulihan |
| Performa | Dataset representatif; 100 lookup; penggunaan satu shift | Target awal p95 lookup ≤1 detik setelah terminator diterima; target disahkan setelah baseline M1; rekam RAM, CPU dan kondisi pengukuran |
| Operasional | Boot, restart aplikasi, putus jaringan, pemeliharaan admin | Aplikasi dan data pulih sesuai runbook; akun publik tidak mendapat fungsi admin |
| Cetak jika diaktifkan | Kertas habis, printer tidak tersedia, klik ganda | Tidak memblokir katalog; tidak mengklaim tiket tercetak hanya berdasarkan pengiriman job |

Tia menyertakan bukti build dan pengujian logika penting; Vinka memeriksa integrasi dan perilaku pada perangkat secara independen. Pengujian belum dijalankan pada sesi perencanaan ini.

## 9. Risiko dan penanganan

| Risiko | Penanganan | Pemilik |
| --- | --- | --- |
| Scanner bawaan gagal membaca label gudang | Buktikan pada M0/M1; jika perlu scanner barang tambahan, ajukan kebutuhan dengan hasil uji | Tia + Owner |
| Stok lokal dianggap real-time | Tampilkan waktu sumber, tetapkan umur maksimum data, dan sahkan definisi tersedia | Pengelola data + Tia |
| Stok material tercampur nomor seri aset | Pisahkan pemetaan material dan aset sebelum impor data pertama | Tia + pengelola gudang |
| Video membebani RAM 4 GB | Ukur pada perangkat, batasi ukuran/resolusi media berdasarkan hasil, sediakan gambar pengganti | Tia + Uci |
| Kebijakan Windows tidak cocok dengan runtime | Uji penguncian dan pemulihan sebelum deployment; dokumentasikan edisi OS | Tia + admin perangkat |
| Sumber SAP/API belum tersedia | Gunakan impor terkontrol untuk MVP; rencanakan API setelah kontrak dan akses resmi tersedia | Sulastri + Owner |

## 10. Keputusan yang perlu ditutup sebelum implementasi

- Unit WK215 yang tersedia, versi/edisi OS, orientasi layar, dan akses untuk percobaan.
- Contoh label beserta arti identitasnya: jenis material, batch, atau satu aset berseri.
- Sumber ekspor data, jumlah material perkiraan, petugas pembaruan, dan batas umur stok.
- Apakah cetak wajib pada pilot; jika ya, masukkan percobaan printer ke gerbang M1 dan revisi estimasi.
- Media/branding resmi, pengguna yang boleh melihat stok, serta pihak yang menerima UAT.
- Konfirmasi akun pengembang dan penanganan registrasi NSM sebelum sesi implementasi.

Rencana dapat ditinjau sekarang. Status kesiapan implementasi masih menunggu M0; status kesiapan rilis belum dinilai karena belum ada aplikasi maupun bukti pengujian.
