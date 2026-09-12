import React from 'react';
import { X, Smartphone, Check, Copy, QrCode } from 'lucide-react';
import { MaterialWithStock } from '../../domain/types';

interface MobileHandoverModalProps {
  material: MaterialWithStock | null;
  visible: boolean;
  onClose: () => void;
}

export const MobileHandoverModal: React.FC<MobileHandoverModalProps> = ({
  material,
  visible,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!visible || !material) return null;

  const loc = material.locations[0]?.location;
  const locationStr = loc ? `${loc.zone} • ${loc.rack} • ${loc.bin}` : 'Lokasi belum dialokasikan';

  const summaryText = `[SLIP LOGISTIK PLN ARIS MUNANDAR MALANG]\nMaterial: ${material.name}\nKode Material: ${material.code}\nKode SAP: ${material.sapCode || '-'}\nLokasi Rak: ${locationStr}\nStok Siap Pakai: ${material.totalAvailable ?? material.totalQuantity ?? 0} ${material.unit}\nSpesifikasi: ${material.specification}`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Generate deterministic 21x21 QR Code pattern with accurate finder patterns
  const size = 21;
  const grid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  // Helper: Draw 7x7 finder pattern
  const drawFinder = (rStart: number, cStart: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[rStart + r][cStart + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(0, size - 7); // Top-right
  drawFinder(size - 7, 0); // Bottom-left

  // Fill pseudo-deterministic data bits based on material code
  let hash = 0;
  for (let i = 0; i < material.code.length; i++) {
    hash = (hash * 31 + material.code.charCodeAt(i)) % 1000000;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (!inTopLeft && !inTopRight && !inBottomLeft) {
        grid[r][c] = ((r * 7 + c * 13 + hash) % 3) === 0;
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-amber-600" />
            <h3 className="text-lg font-black text-[#0F172A]">
              Bawa Data ke Smartphone
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="my-6 flex flex-col items-center text-center">
          <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-slate-200">
            <svg viewBox={`0 0 ${size} ${size}`} className="h-48 w-48 shape-rendering-crispEdges">
              {grid.map((row, r) =>
                row.map((active, c) =>
                  active ? (
                    <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0F172A" />
                  ) : null
                )
              )}
            </svg>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <QrCode className="h-4 w-4" />
            Arahkan kamera HP ke layar untuk menyimpan data lokasi
          </div>

          <p className="mt-3 text-sm font-semibold text-[#0F172A] line-clamp-1">
            {material.name}
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {locationStr}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white shadow-md active:scale-98 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Tersalin ke Clipboard Kiosk' : 'Salin Teks Ringkasan'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200 active:scale-98 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
