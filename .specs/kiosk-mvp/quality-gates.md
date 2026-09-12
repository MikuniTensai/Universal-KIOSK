# Quality Gates Universal-KIOSK

Dokumen ini menetapkan cara mengukur target Owner “di atas 96%”. Angka ini adalah hasil observasi pengujian, bukan probabilitas keberhasilan dan bukan hasil yang sudah dicapai. Semua ambang dibekukan pada K06 sebelum pengujian formal. Perubahan setelah kegagalan memerlukan keputusan tertulis dan pengujian ulang.

## Gate wajib

1. Semua kasus wajib DATA-01–04, OS-01–03, dan WIN-01–03 memiliki expected/actual serta bukti pada lingkungan yang tepat.
2. Semua kebutuhan R01–R15 memiliki bukti uji yang terhubung ke versi kandidat, dataset, konfigurasi, dan profil perangkat.
3. Tidak ada temuan kritis atau tinggi yang terbuka.
4. Tidak ada satu pun kontrol UI yang mati, akses publik yang melewati otorisasi, atau snapshot data parsial yang aktif.
5. Uji instalasi dan scanner pada Windows/Kassen yang disyaratkan harus benar-benar dijalankan; simulasi hanya boleh mendukung tahap pengembangan.

Gate wajib gagal jika satu kasus wajib gagal atau belum dapat diuji. Persentase tidak menggantikan kasus wajib.

## Target operasional terukur

Target usulan berikut dibekukan di K06 sebagai baseline awal dan boleh berubah hanya sebelum uji formal dengan alasan perangkat/data:

| Metrik | Target usulan | Metode dan syarat |
| --- | --- | --- |
| Keberhasilan tugas pengguna | **≥97 dari 100 percobaan valid** | Percobaan valid mencakup boot, buka menu, cari material, buka detail, scan dikenal, scan tidak dikenal, kembali ke Beranda, dan kembali idle. Satu percobaan gagal bila hasil salah, timeout melewati ambang yang dibekukan, pengguna membutuhkan intervensi admin, atau status tidak dapat dijelaskan. Catat denominator dan bantuan yang diberikan. |
| Lookup lokal | p95 ≤1 detik | Dari terminator frame scanner sampai detail tampil, 100 lookup dataset representatif, kondisi offline dicatat. |
| Boot publik | ≥99 dari 100 restart uji | Akun publik mencapai kiosk tanpa klik admin dan tanpa desktop interaktif; crash recovery dipisahkan sebagai OS-03. |
| False activation | 0 kasus | Paket lama, hash bentrok, paket invalid, dan akses publik tidak boleh mengaktifkan data. |
| Data integrity | 100% kasus wajib | DATA-01–04 harus seluruhnya lulus; null, nol, waktu sumber, dan restore diverifikasi. |
| Target sentuh | 100% kontrol utama ≥56 px | Ukur bounding box efektif, fokus terlihat, dan label aksi; ikon tanpa teks memiliki label aksesibel. |
| Kontras | 100% pasangan UI wajib | Teks normal ≥4,5:1, teks besar ≥3:1; pasangan aktual dicatat, bukan dinilai dari tampilan. |
| Soak pilot | 1 shift yang durasinya disahkan K06 | Rekam crash, pemulihan, RAM/CPU, perubahan suhu/perangkat, dan fungsi setelah jaringan diputus. Durasi shift bukan angka yang boleh diubah setelah melihat hasil. |

Keberhasilan tugas pengguna dihitung hanya dari percobaan yang didefinisikan sebelum pengujian. Percobaan yang dibatalkan karena gangguan eksternal dicatat terpisah, tidak dihapus diam-diam. Hasil 97/100 memenuhi target observasional di atas 96%; hasil 96/100 tidak memenuhi. Hasil ini tidak mengizinkan Go bila gate wajib, temuan kritis/tinggi, atau bukti perangkat belum terpenuhi.

## Profil bukti yang dibekukan K06

K06 harus menghasilkan satu lembar baseline berisi: hash/revisi aplikasi kandidat, revisi dan hash file referensi Universal-POS, edisi/build/arsitektur Windows, runtime/WebView2, resolusi dan scaling, identitas unit uji, jumlah/komposisi dataset, ukuran paket/media, konfigurasi timeout/staleAfter/timezone, daftar kasus, jumlah pengulangan, durasi soak, dan pemilik tanda tangan. Setiap perubahan baseline membatalkan hasil yang bergantung padanya.

## Keputusan Go/No-Go

Go hanya bila K01–K30 berstatus VERIFIED, gate wajib seluruhnya lulus, hasil tugas pengguna minimal 97/100, UAT diterima pengelola gudang, dan laporan Tia, Uci, serta Vinka masing-masing menyertakan artefak. Jika perangkat, data resmi, atau environment Windows belum tersedia, statusnya BLOCKED/No-Go, bukan estimasi keberhasilan.
