import { Material } from '../../domain/types';

export interface MaterialSearchLocation {
  blokDisplay: string;
  rakDisplay: string;
  subRakDisplay: string;
}

// Blok, rak, sub rak, satuan, dan status berisi kode pendek (C, H, H12, BH, M).
// Bila dicocokkan sebagai substring, query satu huruf seperti "b" atau "h" ikut
// mengenai semua material bersatuan "BH" sehingga hampir seluruh daftar muncul.
// Karena itu kolom pendek hanya cocok bila utuh, memakai label ("blok c",
// "rak h", "sub rak h12"), atau query minimal 3 huruf (mis. "bululawang").
const matchesShortField = (value: string, query: string, label?: string): boolean => {
  const v = value.toLowerCase().trim();
  if (!v || v === '-') return false;
  if (v === query || (label && `${label} ${v}` === query)) return true;
  return query.length >= 3 && v.includes(query);
};

export const matchesMaterialSearch = (
  material: Pick<Material, 'name' | 'code' | 'sapCode' | 'unit' | 'status'>,
  location: MaterialSearchLocation,
  rawQuery: string
): boolean => {
  const query = rawQuery.toLowerCase().trim().replace(/\s+/g, ' ');
  if (!query) return true;
  return (
    material.name.toLowerCase().includes(query) ||
    material.code.toLowerCase().includes(query) ||
    (material.sapCode ? material.sapCode.toLowerCase().includes(query) : false) ||
    matchesShortField(material.unit, query) ||
    matchesShortField(location.blokDisplay, query, 'blok') ||
    matchesShortField(location.rakDisplay, query, 'rak') ||
    matchesShortField(location.subRakDisplay, query, 'sub rak') ||
    matchesShortField(material.status || '', query)
  );
};
