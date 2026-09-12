import React from 'react';
import { MaterialWithStock } from '../../domain/types';
import { MapPin, AlertTriangle, PackageCheck, PackageX, HelpCircle } from 'lucide-react';
import { ContentService } from '../programs/contentService';
import { getCategoryIcon } from '../../shared/utils/categoryIcons';

interface MaterialCardProps {
  material: MaterialWithStock;
  onClick: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onClick }) => {
  const CatIcon = getCategoryIcon(material.categoryId || material.categoryName);
  const primaryLocation = material.locations[0]?.location;

  let cleanBlok = '-';
  if (primaryLocation?.zone) {
    const rawZone = primaryLocation.zone.replace(/\s*\(.*?\)/g, '').trim();
    cleanBlok = rawZone.replace(/^Blok\s+/i, '').trim() || rawZone;
  }

  let cleanRak = '-';
  if (primaryLocation?.rack) {
    const rawRack = primaryLocation.rack.trim();
    if (rawRack && rawRack !== '-' && !rawRack.toLowerCase().includes('area terbuka')) {
      cleanRak = rawRack.replace(/^Rak\s+/i, '').trim();
    }
  }

  let cleanSubRak = '-';
  if (primaryLocation?.bin) {
    const rawBin = primaryLocation.bin.trim();
    if (rawBin && rawBin !== '-' && rawBin !== 'Luar Rak' && rawBin !== 'Tanpa Rak') {
      cleanSubRak = rawBin.replace(/^Sub\s*Rak\s+/i, '').trim();
    }
  }

  const locString = `BLOK ${cleanBlok} • RAK ${cleanRak}${cleanSubRak !== '-' ? ` • SUB RAK ${cleanSubRak}` : ''}`;

  return (
    <div
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-material border border-slate-200 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98] cursor-pointer"
    >
      {/* Photo with category badge */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={material.photoPath || ContentService.getFallbackImage()}
          alt={material.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = ContentService.getFallbackImage();
          }}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 backdrop-blur-sm shadow-sm border border-slate-200/50">
            <CatIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>{material.categoryName}</span>
          </span>
        </div>

        {/* Stale Warning Badge if applicable */}
        {material.isStale && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Data Lama</span>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Material Codes */}
          <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              Normalisasi: <strong>{material.code}</strong>
            </span>
          </div>

          {/* Name */}
          <h4
            onClick={onClick}
            className="text-base font-black text-[#0F172A] line-clamp-2 leading-snug cursor-pointer"
          >
            {material.name}
          </h4>

          {/* Prominent Blok, Rak & Sub Rak Badges - Persis master Excel SAP */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100/90 border border-amber-300 px-2.5 py-1 text-xs font-black text-amber-950">
              <MapPin className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span>BLOK {cleanBlok}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-[#FACC15]">
              <span>RAK {cleanRak}</span>
            </span>
            {cleanSubRak !== '-' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-sky-100 border border-sky-300 px-2 py-1 text-xs font-mono font-bold text-sky-900">
                <span>SUB RAK {cleanSubRak}</span>
              </span>
            )}
          </div>
        </div>

        {/* Location & Stock Bottom Status */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{locString}</span>
          </div>

          {/* Stock Status Badge */}
          <div>
            {material.totalQuantity === null ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                <HelpCircle className="h-3.5 w-3.5" />
                Data stok belum tersedia
              </span>
            ) : material.totalQuantity === 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                <PackageX className="h-3.5 w-3.5" />
                Stok Habis (0 {material.unit})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <PackageCheck className="h-3.5 w-3.5" />
                Tersedia: {material.totalAvailable ?? material.totalQuantity} {material.unit}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
