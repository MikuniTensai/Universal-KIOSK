import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  Globe,
  Shield,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Info,
  Laptop,
  CheckCircle2,
  Server,
  Network,
} from 'lucide-react';
import { NetworkService, NetworkInfoResponse } from './networkService';
import { NetworkQrCode } from './NetworkQrCode';

interface NetworkAccessModalProps {
  visible: boolean;
  onClose: () => void;
  warehouseCode?: string;
}

export const NetworkAccessModal: React.FC<NetworkAccessModalProps> = ({
  visible,
  onClose,
  warehouseCode = 'GUD-PLN-MLG-AM01',
}) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoResponse>(() =>
    NetworkService.getCachedInfo()
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');

  useEffect(() => {
    if (!visible) return;

    // Ambil data terbaru saat modal dibuka
    handleRefresh();

    // Berlangganan event perubahan jaringan
    const unsubscribe = NetworkService.subscribe((info) => {
      setNetworkInfo(info);
      setLastRefreshedTime(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    });

    return () => unsubscribe();
  }, [visible]);

  if (!visible) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await NetworkService.fetchNetworkInfo();
      setNetworkInfo(updated);
      setLastRefreshedTime(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (err) {
      console.error('Failed to refresh network info:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleCopy = (url: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const primaryIp = networkInfo.primaryIp || 'localhost';
  const adminUrl = networkInfo.adminUrl || `http://${primaryIp}:5001`;
  const kioskUrl = networkInfo.kioskUrl || `http://${primaryIp}:5000`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="network-modal-title"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border-2 border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#0369a1] to-slate-900 px-6 py-5 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-[#facc15] shadow-inner">
              <Wifi className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#facc15] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0f172a]">
                  Koneksi WiFi &amp; LAN Lokal
                </span>
                <span className="text-xs text-white/80 font-mono hidden sm:inline">
                  {warehouseCode}
                </span>
              </div>
              <h2 id="network-modal-title" className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Panduan Akses Panel Admin &amp; Kiosk via WiFi
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Jendela"
            className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800">
          {/* Dynamic IP Active Notification Banner */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="relative flex h-3 w-3 mt-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    Alamat IP WiFi Aktif (Terdeteksi Real-Time):
                  </span>
                  <span className="rounded-lg bg-emerald-700 px-2.5 py-0.5 font-mono text-sm font-black text-white shadow-xs">
                    {primaryIp}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-medium mt-1 leading-relaxed">
                  Mesin Kiosk mendukung <strong>IP Dinamis (DHCP)</strong>. Jika IP WiFi berganti otomatis oleh router (contoh: dari <code className="font-bold">192.168.0.29</code> menjadi <code className="font-bold">192.168.0.43</code>), seluruh URL dan QR Code di bawah akan otomatis diperbarui.
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex h-11 items-center gap-2 rounded-xl bg-white border border-emerald-300 px-4 text-xs font-bold text-emerald-900 shadow-xs hover:bg-emerald-100 active:scale-95 transition shrink-0 self-stretch sm:self-auto justify-center"
              title="Periksa ulang IP jaringan sekarang"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Mengecek...' : 'Deteksi Ulang IP'}</span>
            </button>
          </div>

          {/* 2 Primary Access Cards: Admin (5001) & Kiosk (5000) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Admin Portal LAN (Port 5001) */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-[#0369a1] bg-gradient-to-b from-sky-50/50 to-white p-5 sm:p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#0369a1] text-white px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider">
                Khusus Operator &bull; Port 5001
              </div>

              <div>
                <div className="flex items-center gap-2 text-[#0369a1] mb-2">
                  <Shield className="h-5 w-5" />
                  <h3 className="text-base font-black text-slate-900">
                    Portal Administrator Mandiri
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Buka dari HP atau Laptop petugas untuk kelola stok, tambah rak baru (A-Z), upload paket SAP, dan ubah pengaturan Kiosk.
                </p>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-sky-200 shadow-inner mb-4">
                  <NetworkQrCode url={adminUrl} size={160} darkColor="#0369a1" />
                  <span className="text-[11px] font-bold text-sky-900 mt-2 flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5 text-sky-600" />
                    Pindai dengan Kamera HP Petugas
                  </span>
                </div>

                {/* URL Display */}
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-[#facc15] font-bold flex items-center justify-between gap-2 mb-3">
                  <span className="truncate">{adminUrl}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleCopy(adminUrl, 'admin')}
                  className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-xl bg-[#0369a1] text-white text-xs font-bold shadow-md hover:bg-sky-800 active:scale-95 transition"
                >
                  {copiedKey === 'admin' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Salin Alamat Admin</span>
                    </>
                  )}
                </button>
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-3.5 flex items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                  title="Buka langsung di tab baru browser ini"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Card 2: Kiosk Display (Port 5000) */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-gradient-to-b from-amber-50/30 to-white p-5 sm:p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#facc15] text-[#0f172a] px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider">
                Layar Publik &bull; Port 5000
              </div>

              <div>
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <Globe className="h-5 w-5" />
                  <h3 className="text-base font-black text-slate-900">
                    Layar Kiosk Publik
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Tampilan antarmuka mandiri pengunjung untuk cek spesifikasi material, peta denah gudang, dan infografis SOP SPLN.
                </p>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-amber-200 shadow-inner mb-4">
                  <NetworkQrCode url={kioskUrl} size={160} darkColor="#0f172a" />
                  <span className="text-[11px] font-bold text-amber-900 mt-2 flex items-center gap-1">
                    <Laptop className="h-3.5 w-3.5 text-amber-600" />
                    Pindai untuk Pratinjau Kiosk di HP
                  </span>
                </div>

                {/* URL Display */}
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 font-bold flex items-center justify-between gap-2 mb-3">
                  <span className="truncate">{kioskUrl}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleCopy(kioskUrl, 'kiosk')}
                  className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 active:scale-95 transition"
                >
                  {copiedKey === 'kiosk' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Salin Alamat Kiosk</span>
                    </>
                  )}
                </button>
                <a
                  href={kioskUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-3.5 flex items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                  title="Buka langsung di tab baru browser ini"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Step-by-Step Practical Instructions */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#0369a1]" />
              <span>Cara Menghubungkan Perangkat Petugas ke Mesin Kiosk:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-[#0369a1]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[11px]">1</span>
                  <span>WiFi Harus Sama</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hubungkan HP atau Laptop Anda ke nama WiFi / SSID yang sama dengan mesin Kiosk (misal: WiFi Kantor/Gudang PLN).
                </p>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-[#0369a1]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[11px]">2</span>
                  <span>Buka Browser / Scan</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka Chrome, Safari, atau Edge di HP Anda lalu ketik <code className="font-bold text-slate-800">{adminUrl}</code> atau scan QR Code di atas.
                </p>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-[#0369a1]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[11px]">3</span>
                  <span>IP Dinamis Otomatis</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika router merubah IP mesin (misal .29 ke .43), cukup refresh modal info ini untuk melihat alamat IP yang baru.
                </p>
              </div>
            </div>
          </div>

          {/* Network Interfaces List (If multiple adapters are present) */}
          {networkInfo.interfaces && networkInfo.interfaces.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Network className="h-3.5 w-3.5 text-slate-400" />
                  Daftar Adapter Jaringan Terdeteksi ({networkInfo.interfaces.length}):
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Host: {networkInfo.hostname || 'Kassen-Kiosk'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {networkInfo.interfaces.map((iface) => (
                  <div
                    key={iface.name}
                    className={`flex items-center justify-between rounded-xl p-3 border text-xs ${
                      iface.isPrimary
                        ? 'bg-sky-50/80 border-sky-300 text-sky-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {iface.type === 'wifi' ? (
                        <Wifi className="h-4 w-4 text-sky-600 shrink-0" />
                      ) : (
                        <Server className="h-4 w-4 text-slate-500 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-bold">{iface.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({iface.type.toUpperCase()})</span>
                        <div className="font-mono text-xs">{iface.address}</div>
                      </div>
                    </div>

                    {iface.isPrimary && (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 shrink-0 border border-emerald-200">
                        Utama
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-center sm:text-left">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Server Dual-Port Aktif &bull; Terakhir dicek:{' '}
              <strong className="font-mono text-slate-700">{lastRefreshedTime || 'Baru saja'}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-full sm:w-auto items-center justify-center rounded-xl bg-slate-900 px-6 font-bold text-white shadow-md active:scale-95 hover:bg-slate-800 transition"
          >
            Tutup Informasi
          </button>
        </div>
      </div>
    </div>
  );
};
