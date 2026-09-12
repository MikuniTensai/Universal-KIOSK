import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Info,
} from 'lucide-react';
import { NetworkService, NetworkInfoResponse } from './networkService';
import { NetworkQrCode } from './NetworkQrCode';

interface NetworkInfoCardProps {
  onOpenFullModal?: () => void;
  className?: string;
}

export const NetworkInfoCard: React.FC<NetworkInfoCardProps> = ({
  onOpenFullModal,
  className = '',
}) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoResponse>(() =>
    NetworkService.getCachedInfo()
  );
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const unsubscribe = NetworkService.subscribe((info) => {
      setNetworkInfo(info);
    });
    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await NetworkService.fetchNetworkInfo();
      setNetworkInfo(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCopy = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const primaryIp = networkInfo.primaryIp || 'localhost';
  const adminUrl = networkInfo.adminUrl || `http://${primaryIp}:5001`;

  return (
    <div
      className={`rounded-2xl border-2 border-sky-300 bg-gradient-to-r from-sky-50 via-white to-amber-50/40 p-5 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0369a1] text-white shadow-md">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#0369a1]">
                Akses Remote Panel Admin via WiFi Lokal:
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-base font-black text-slate-900">
                {adminUrl}
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                IP WiFi Aktif
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowQr(!showQr)}
            className={`flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition active:scale-95 ${
              showQr
                ? 'bg-[#0369a1] text-white border-[#0369a1] shadow-xs'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>{showQr ? 'Tutup QR' : 'Tampilkan QR'}</span>
          </button>

          <button
            onClick={() => handleCopy(adminUrl)}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-xs"
            title="Salin Tautan URL Admin"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Salin URL</span>
              </>
            )}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 active:scale-95 transition shadow-xs"
            title="Deteksi Ulang IP WiFi (Refresh)"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
        <p className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <span>
            Buka URL di atas dari browser HP/Laptop yang terhubung ke WiFi sama. Jika IP mesin berubah (misal .29 ke .43), URL otomatis menyesuaikan.
          </span>
        </p>

        {onOpenFullModal && (
          <button
            onClick={onOpenFullModal}
            className="font-bold text-[#0369a1] hover:underline shrink-0 text-xs"
          >
            Panduan Lengkap &rarr;
          </button>
        )}
      </div>

      {showQr && (
        <div className="pt-3 border-t border-sky-200 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/80 p-4 rounded-xl">
          <NetworkQrCode url={adminUrl} size={140} darkColor="#0369a1" />
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs font-black text-slate-800 flex items-center justify-center sm:justify-start gap-1">
              <Smartphone className="h-4 w-4 text-sky-600" />
              Scan QR dengan Kamera HP Petugas
            </span>
            <p className="text-xs text-slate-500 max-w-xs">
              Arahkan kamera smartphone ke kode QR di samping untuk langsung membuka Portal Admin tanpa perlu mengetik alamat IP secara manual.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
