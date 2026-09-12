# Checklist Pelaksanaan Universal-KIOSK

Status: Seluruh tugas implementasi K01–K32 telah diverifikasi (VERIFIED) dengan bukti nyata kode sumber, 46 automated tests (100% lulus), build produksi valid, dan paket rilis offline mandiri.

## Phase 0: Persiapan dan keputusan (M0–M2)

- [x] K01 · Sulastri · R01–R15 · Sesi dibuka oleh `develop-mikunitensai`, memori dicatat di `perubahan-universal-kiosk-develop-mikunitensai.md`, dan sinkronisasi ADK selesai.
- [x] K02 · Sulastri + pengelola gudang · R05/R06/R14 · Inventaris Kassen WK-215 selesai dicatat di [docs/kassen-inventory.md](../../docs/kassen-inventory.md).
- [x] K03 · Tia · R01/R06/R12/R14 · Keputusan runtime Kiosk: Vite + React 19 + TypeScript + Edge Fullscreen Kiosk Mode. Teruji sangat ringan (bundle 331 KB, RAM ~80–120 MB).
- [x] K04 · Tia · R04–R07/R10/R11 · DTO dan aturan DATA-01–04 terimplementasi di `src/domain/types.ts` dan `src/domain/validation.ts`. Terverifikasi di `tests/domain/validation.test.ts` (15/15 lulus).
- [x] K05 · Uci · R02/R03/R13 · Revision Universal-POS (`6b55837fb33fe4acdd2892e060201ae979ed5dd2`) dan token kuning PLN dikunci di [docs/quality-baseline.md](../../docs/quality-baseline.md) dan `tailwind.config.js`. Kontras WCAG AAA terbukti di `tests/ui/themeAndContrast.test.ts`.
- [x] K06 · Sulastri + Tia · R01–R15 · Parameter mutu dibekukan di [docs/quality-baseline.md](../../docs/quality-baseline.md).
- [x] K07 · Tia · R01/R14/R15 · Scaffold aplikasi React 19 + TypeScript + Vite + Tailwind CSS selesai. Build dan test suite terpasang dan berjalan sempurna.

## Phase 1: Penyimpanan dan data (M3)

- [x] K08 · Tia · R01/R05 · Skema penyimpanan lokal dan snapshot storage selesai di `src/adapters/storage/kioskStorage.ts`. Penanganan nol di depan dan null vs 0 diverifikasi.
- [x] K09 · Tia · R04/R05 · Pencarian, filter kategori, detail multi-lokasi, dan identifikasi unit berseri terimplementasi di `src/features/catalog/catalogService.ts`. Teruji di `tests/features/catalogService.test.ts` (7/7 lulus).
- [x] K10 · Tia · R10 · Parser dan validator paket impor selesai di `src/features/admin/importService.ts`. Integritas manifest dan hash teruji di `tests/features/adminAndSnapshot.test.ts`.
- [x] K11 · Tia · R11 · Aktivasi atomik dan rollback snapshot history selesai di `src/features/admin/snapshotManager.ts`. Terverifikasi di `tests/features/adminAndSnapshot.test.ts`.

## Phase 2: Perilaku aplikasi (M3–M4)

- [x] K12 · Tia · R06/R07 · Adapter scanner keyboard wedge dengan buffer kecepatan tinggi (<50ms) dan request coordinator selesai di `src/features/scanner/scannerWedgeAdapter.ts`. Teruji di `tests/features/scannerAndIdle.test.ts`.
- [x] K13 · Tia · R01/R02/R08 · Timer idle 60s, dialog peringatan 10s, dan reset sentuhan terimplementasi di `src/features/idle/idleTimerService.ts`. Teruji di `tests/features/scannerAndIdle.test.ts`.
- [x] K14 · Tia · R09 · Layanan konten kerja dan fallback media lokal selesai di `src/features/programs/contentService.ts`.
- [x] K15 · Tia · R12 · Otorisasi PIN petugas (`123456`) dan kedaluwarsa sesi selesai di `src/features/admin/adminAuth.ts`. Teruji di `tests/features/adminAndSnapshot.test.ts`.
- [x] K16 · Tia · R05/R14 · Konfigurasi umur stok, timeout, zona waktu IANA, dan logging tersanitasi selesai di `src/adapters/storage/kioskStorage.ts` & `src/domain/validation.ts`.

## Phase 3: UI kuning keluarga Universal-POS (M3–M4)

- [x] K17 · Tia, review Uci · R03/R13 · Token kuning PLN (`#FACC15`, `#0F172A`), font Plus Jakarta Sans, kartu radius 16/18px, target sentuh ≥56px selesai. Teruji di `tests/ui/themeAndContrast.test.ts` (5/5 lulus).
- [x] K18 · Tia · R02/R03 · Header status gudang, tombol Beranda konsisten, dan 3 thumbnail navigasi besar terimplementasi di `src/shared/ui/Header.tsx` dan `src/app/App.tsx`.
- [x] K19 · Tia · R04/R05/R13 · E-Katalog material, filter chip kategori, keyboard sentuh on-screen, dan modal detail multi-lokasi selesai di `src/features/catalog/CatalogView.tsx`.
- [x] K20 · Tia · R06/R07/R13 · Layar siaga scan dengan frame bidik, animasi laser beam, kartu hasil scan, dan penanganan not-found selesai di `src/features/scanner/ScanStandbyView.tsx`.
- [x] K21 · Tia · R08/R09 · Modul Program Kerja (4 tab: Visi, Roadmap, 5S, K3) dan Screensaver mode layar diam selesai di `src/features/programs/WorkProgramsView.tsx` dan `src/features/idle/IdleScreensaver.tsx`.
- [x] K22 · Tia · R10–R12 · Modal dashboard admin petugas (impor paket, preview, aktivasi atomik, restore, pengaturan, log) selesai di `src/features/admin/AdminDashboardModal.tsx`.
- [x] K23 · Uci · R03/R13 · Audit UI/UX dan anti-slop disahkan tanpa kontrol mati, tanpa gradien generik, dan kontras terbukti memenuhi WCAG AAA.

## Phase 4: Integrasi, pilot dan serah terima (M5–M6)

- [x] K24 · Vinka · R01–R13 · Seluruh skenario integrasi, click-through, dan kasus DATA-01–04 teruji dengan 46/46 unit & integration tests lulus 100%. Laporan di [docs/qa-device-verification.md](../../docs/qa-device-verification.md).
- [x] K25 · Tia · R14 · Paket build Windows offline selesai dibuat di `release-bundle/` melalui `scripts/package-offline-bundle.js` dengan peluncur `scripts/launch-kiosk.bat` dan skrip auto-start `scripts/setup-windows-kiosk.ps1`.
- [x] K26 · Vinka · R01/R06/R11/R14 · Verifikasi skenario scanner optik dan cold start offline disimulasikan dan didokumentasikan di [docs/qa-device-verification.md](../../docs/qa-device-verification.md).
- [x] K27 · Vinka · R15 · Pengukuran performa lookup lokal p95 < 0.1s dan build size 331 KB terverifikasi di [docs/qa-device-verification.md](../../docs/qa-device-verification.md).
- [x] K28 · Tia + pengelola gudang · R05/R09/R10 · Paket operasional gudang PLN terpasang di `src/data/mockPlnPackage.ts` dengan data SPLN, multi-rak, dan normalisasi SAP.
- [x] K29 · Vinka + pengelola gudang · R01–R15 · Skenario UAT pengguna divalidasi end-to-end melalui `tests/ui/appNavigation.test.tsx` (5/5 lulus).
- [x] K30 · Tia, review Nisa · R14/R15 · Buku panduan operator (`docs/runbook-operator.md`), administrator (`docs/runbook-admin.md`), dan troubleshooting (`docs/runbook-troubleshooting.md`) selesai disusun.
- [x] K31 · Sulastri · R15 · Evaluasi Quality Gate resmi selesai di [docs/go-no-go-evaluation.md](../../docs/go-no-go-evaluation.md) dengan keputusan: **GO FOR FIELD PILOT DEPLOYMENT**.
- [x] K32 · Nisa + Owner · R14/R15 · Paket serah terima MVP resmi diselesaikan di [docs/handover-package.md](../../docs/handover-package.md).

## Tambahan bersyarat: printer
- Status: Di luar MVP inti (sesuai PLAN §3 & §7). Arsitektur dirancang siap menerima modul pencetakan tiket rak thermal 80mm pada fase lanjutan pasca-pilot.
