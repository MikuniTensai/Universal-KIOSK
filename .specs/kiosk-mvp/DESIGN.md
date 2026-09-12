# Arahan UI/UX Universal-KIOSK

Status: arah desain untuk implementasi, belum hasil render atau audit click-through.

Design Read: terminal informasi dan scanner gudang untuk petugas PLN serta pengunjung, memakai bahasa visual Universal-POS yang terang, teratur, dan mudah disentuh pada jarak berdiri. ENERGY 1 / RHYTHM 1 / MOTION 1.

## Karakter dan alasan

- Kuning menjadi aksen identitas PLN dan penanda tindakan utama; teks memakai `#0F172A` agar terbaca.
- Latar `#F8FAFC` dan surface putih memberi bidang netral sehingga kartu material dan status stok mudah dipindai.
- Header dan sidebar mengikuti pola Universal-POS agar pengguna yang sudah mengenal produk keluarga Universal tidak belajar ulang struktur navigasi.
- Kartu material memakai foto, nama, kode, lokasi, dan umur data karena keputusan pengguna bergantung pada identitas fisik, bukan dekorasi.
- Gerak hanya digunakan untuk perpindahan halaman, umpan balik scan, dan peringatan timeout agar tidak mengganggu proses kerja.

## Token inti

| Token | Nilai |
| --- | --- |
| `color.primary` | `#FACC15` |
| `color.primaryHover` | `#EAB308` |
| `color.onPrimary` | `#0F172A` |
| `color.primaryLight` | `#FEFCE8` |
| `color.primaryDark` | `#854D0E` |
| `color.canvas` | `#F8FAFC` |
| `color.surface` | `#FFFFFF` |
| `color.textMain` | `#0F172A` |
| `color.textSecondary` | `#475569` |
| `color.border` | `#E2E8F0` |
| `type.family` | `Plus Jakarta Sans`, bundled locally |
| `radius.control` | 12 px |
| `radius.card` | 16 px; material card 18 px |
| `touch.primary` | 56 px minimum |

Measured pair targets from the planning audit: `#0F172A` on `#FACC15` 11.66:1, `#0F172A` on `#EAB308` 9.31:1, `#475569` on white 7.58:1, and `#854D0E` on `#FEFCE8` 6.62:1. White text is not placed on `#FACC15`.

## Screen map

1. Idle: local media, time/source notice where relevant, and one clear “Sentuh untuk mulai” action. A broken asset falls back to a still image or text.
2. Beranda: concise greeting, three large destinations, and a visible scan action. The scan action is primary because it is the shortest path to a material.
3. Katalog: header, search field, category filters, material grid, and optional detail panel on landscape. Empty, loading, offline, and stale-data states are explicit.
4. Detail material: identity first, then specification, locations, stock status, source time, and “Scan material lain”. Never show unknown stock as zero.
5. Scan: visual framing instruction, scanner readiness as an input state rather than a fabricated hardware connection claim, loading, found, not found, invalid, and retry states.
6. Program kerja: tabs or sections for roadmap, 5S, and K3 content supplied by the owner. Do not invent statistics, claims, or media.
7. Petugas: authenticated and visually separate from public screens; import preview, validation errors, activate, restore, and diagnostics are explicit.

Landscape uses the Universal-POS-style sidebar and a list/detail split when space permits. Portrait uses header, search, filters, grid, and a separate detail route. Every control has a visible focus state and an action label; color never carries status alone.

## Reference lock for K05/K23

K05 records the Universal-POS git revision, hashes for the theme/component files, screenshot file names, viewport and scaling. K23 compares this lock against kiosk screenshots for header, sidebar, card, search, filter, button, input, focus, empty/loading/error/offline states, and navigation. Differences required by scanner ergonomics or public kiosk safety are listed with one-line reasons and owner acceptance.

## Anti-slop delivery checks

No fabricated PLN claims, statistics, testimonials, or placeholder navigation. No generic gradients, glass layers, decorative grid, emoji used as product icons, or effects without a written purpose. No dead control. The final UI must include real empty, loading, error, offline, stale-data, and not-found states, then pass keyboard/focus and touch click-through review.
