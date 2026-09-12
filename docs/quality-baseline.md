# Quality Baseline Universal-KIOSK (K06)

Dokumen ini membekukan parameter dasar dan target kualitas pengujian Universal-KIOSK:

## 1. Referensi Desain Universal-POS
- **Git HEAD Universal-POS:** `6b55837fb33fe4acdd2892e060201ae979ed5dd2`
- **File Tema & Hash:**
  - `app_typography.dart`: `aa74bb213def97fe992897100bb059a700a46b5c2d8bb187f2263dc0bc8ab384`
  - `app_colors.dart`: `4a60d9469b63e2fcae0dadc6fe2285f203ad14fec97b492728af82bb85f213c4`
  - `app_theme.dart`: `ed22845c40b0214a37c6130189e1269e8cd4eef7b8d69f058423feb0cc6aadb9`
  - `brand_theme.dart`: `bb9c67a63b8abae2db7a41c92b591c52ab526018d3f2603f3d6b8097124521e2`
  - `product_card.dart`: `f6b54658cd3039aefda19c0a894c8d65528eadb548b0f03c6b944f1485e66c9b`
- **Palet Warna PLN Kuning:**
  - `primary`: `#FACC15` (Kuning PLN)
  - `onPrimary`: `#0F172A` (Slate gelap, kontras 11.66:1)
  - `canvas`: `#F8FAFC`
  - `surface`: `#FFFFFF`
  - `textMain`: `#0F172A`
  - `textSecondary`: `#475569` (Slate medium, kontras 7.58:1 pada putih)
  - `border`: `#E2E8F0`
- **Tipografi:** Plus Jakarta Sans
- **Ukuran Sentuh:** Minimal 56 px untuk seluruh tombol navigasi utama dan kontrol aksi.

## 2. Ambang Mutu Operasional
- **Waktu Lookup Scanner Lokal:** p95 ≤ 1.0 detik setelah terminator `Enter` diterima.
- **Konsistensi Data:** 100% kasus uji DATA-01 s/d DATA-04 lulus.
- **Keamanan:** 0 temuan bypass hak akses admin pada fitur impor/restore/diagnostik.
- **Ketahanan Idle:** Sesi publik otomatis bersih setelah timeout idle (default 60 detik).
- **Akurasi Barcode:** Kode dengan nol di depan (misal `000123`) dipertahankan utuh sebagai teks.
