import React, { useState } from 'react';
import { MaterialWithStock } from '../../domain/types';
import { X, MapPin, AlertTriangle, Scan, CheckCircle2, Clock, Smartphone } from 'lucide-react';
import { ContentService } from '../programs/contentService';
import { WarehouseMiniMap } from '../../shared/ui/WarehouseMiniMap';
import { MobileHandoverModal } from '../../shared/ui/MobileHandoverModal';
import { getCategoryIcon } from '../../shared/utils/categoryIcons';

interface MaterialDetailModalProps {
  material: MaterialWithStock | null;
  onClose: () => void;
  onScanAnother: () => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  onClose,
  onScanAnother,
}) => {
  const [mobileModalVisible, setMobileModalVisible] = useState(false);

  if (!material) return null;

  const primaryLoc = material.locations[0]?.location;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-card bg-white shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#FACC15] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#0F172A] px-2 py-0.5 font-mono text-xs font-bold text-white">
              KODE: {material.code}
            </span>
            {material.sapCode && (
              <span className="text-xs font-semibold text-[#0F172A]">
                SAP: {material.sapCode}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-control bg-white/30 text-[#0F172A] transition active:scale-95 active:bg-white/50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Main Info with Photo */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-56 rounded-material overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={material.photoPath || ContentService.getFallbackImage()}
                alt={material.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ContentService.getFallbackImage();
                }}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="md:col-span-2 flex flex-col justify-between">
              <div>
                {(() => {
                  const CatIcon = getCategoryIcon(material.categoryId || material.categoryName);
                  return (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200 mb-2">
                      <CatIcon className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{material.categoryName}</span>
                    </span>
                  );
                })()}
                <h3 className="text-2xl font-extrabold text-[#0F172A] leading-tight">
                  {material.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {material.specification || 'Spesifikasi teknis belum ditambahkan ke database.'}
                </p>
              </div>

              {/* Timestamp & Freshness Warning */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>
                    Sumber: {material.latestSourceAt ? new Date(material.latestSourceAt).toLocaleString('id-ID') : 'Tidak diketahui'}
                  </span>
                </div>
                {material.isStale && (
                  <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5" /> Data Lama
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Locations & Stock Breakdown Table */}
          <div>
            <h4 className="text-base font-bold text-[#0F172A] mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-600" />
              <span>Lokasi Rak & Rincian Persediaan</span>
            </h4>

            {material.locations.length === 0 ? (
              <div className="rounded-control bg-slate-50 p-4 text-center text-sm text-slate-500 border border-slate-200">
                Data lokasi dan stok belum tersedia untuk material ini.
              </div>
            ) : (
              <div className="overflow-hidden rounded-control border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Gudang / Zona</th>
                      <th className="p-3">Rak / Bin</th>
                      <th className="p-3 text-right">Stok Fisik</th>
                      <th className="p-3 text-right">Teralokasi</th>
                      <th className="p-3 text-right">Tersedia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {material.locations.map((loc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900">
                          {loc.location.zone || loc.location.warehouseCode}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {loc.location.rack || '-'} / {loc.location.bin || '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {loc.stock.quantity !== null ? `${loc.stock.quantity} ${material.unit}` : 'Belum tercatat'}
                        </td>
                        <td className="p-3 text-right text-slate-500">
                          {loc.stock.reserved !== null ? `${loc.stock.reserved} ${material.unit}` : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          {loc.stock.available !== null ? `${loc.stock.available} ${material.unit}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Visual Warehouse Mini-Map */}
          <div className="pt-2">
            <WarehouseMiniMap
              activeZone={primaryLoc?.zone}
              rack={primaryLoc?.rack}
              bin={primaryLoc?.bin}
            />
          </div>

          {/* Serial Assets if available */}
          {material.locations.some(l => l.assets.length > 0) && (
            <div>
              <h4 className="text-sm font-bold text-[#0F172A] mb-2">
                Nomor Seri Unit Fisik Terdaftar:
              </h4>
              <div className="flex flex-wrap gap-2">
                {material.locations.flatMap(l => l.assets).map(asset => (
                  <span
                    key={asset.id}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800 border border-slate-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    {asset.serialNumber}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Min 56px touch target) */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4">
          <div className="flex gap-3">
            <button
              onClick={onScanAnother}
              className="flex h-14 items-center gap-2 rounded-control bg-[#FACC15] px-6 text-base font-bold text-[#0F172A] shadow-md transition active:scale-95 active:bg-[#EAB308]"
            >
              <Scan className="h-5 w-5" />
              <span>Scan Material Lain</span>
            </button>

            <button
              onClick={() => setMobileModalVisible(true)}
              className="flex h-14 items-center gap-2 rounded-control bg-sky-700 text-white px-5 text-base font-bold shadow-md transition active:scale-95 hover:bg-sky-800"
            >
              <Smartphone className="h-5 w-5 text-sky-200" />
              <span>Bawa ke HP</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex h-14 items-center justify-center rounded-control bg-white border border-slate-300 px-8 text-base font-bold text-slate-700 shadow-sm transition active:scale-95 active:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Mobile Handover Modal (QR Code) */}
      <MobileHandoverModal
        material={material}
        visible={mobileModalVisible}
        onClose={() => setMobileModalVisible(false)}
      />
    </div>
  );
};
