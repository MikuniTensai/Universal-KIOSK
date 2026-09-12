import React from 'react';
import { Home, ShieldCheck, Accessibility, Wifi, Power } from 'lucide-react';
import { KioskConfig } from '../../domain/types';
import { DanantaraLogo } from './DanantaraLogo';
import { PlnLogo } from './PlnLogo';

interface HeaderProps {
  config: KioskConfig;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAdmin: () => void;
  onOpenNetwork?: () => void;
  onOpenShutdown?: () => void;
  showShutdownButton?: boolean;
  lowReachMode?: boolean;
  onToggleLowReach?: () => void;
  showAdminButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentRoute,
  onNavigate,
  onOpenAdmin,
  onOpenNetwork,
  onOpenShutdown,
  showShutdownButton = true,
  lowReachMode = false,
  onToggleLowReach,
  showAdminButton = false,
}) => {
  const secretTapCountRef = React.useRef<number>(0);
  const secretTapTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlnLogoTap = () => {
    secretTapCountRef.current += 1;
    if (secretTapCountRef.current >= 5) {
      if (secretTapTimerRef.current) clearTimeout(secretTapTimerRef.current);
      secretTapCountRef.current = 0;
      onOpenAdmin();
      return;
    }

    if (secretTapTimerRef.current) clearTimeout(secretTapTimerRef.current);
    secretTapTimerRef.current = setTimeout(() => {
      secretTapCountRef.current = 0;
    }, 3000);
  };

  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-kiosk-border bg-white px-6 shadow-sm z-20">
      {/* Pojok Kiri: Logo Danantara */}
      <div className="flex items-center gap-3 shrink-0">
        <DanantaraLogo variant="light" />
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200">
          <span className="rounded-md bg-amber-100/80 border border-amber-300 px-2 py-0.5 text-xs font-bold text-amber-900">
            {config.warehouseCode}
          </span>
        </div>
      </div>

      {/* Pojok Kanan: Logo PLN & Navigasi / Kontrol */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Navigation & Accessibility Buttons */}
        <div className="flex items-center gap-2">
          {currentRoute !== 'home' && currentRoute !== 'idle' && (
            <button
              onClick={() => onNavigate('home')}
              className="flex h-12 min-w-[115px] items-center justify-center gap-2 rounded-control bg-[#FACC15] px-4 text-sm font-bold text-[#0F172A] shadow-sm transition active:scale-95 hover:bg-amber-400"
            >
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </button>
          )}

          {onToggleLowReach && (
            <button
              onClick={onToggleLowReach}
              title="Mode Jangkauan Rendah (Aksesibilitas Kursi Roda)"
              className={`flex h-12 items-center gap-2 rounded-control border px-3.5 font-bold text-xs shadow-xs transition active:scale-95 ${
                lowReachMode
                  ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Accessibility className="h-4 w-4 text-amber-600" />
              <span className="hidden xl:inline">{lowReachMode ? 'Jangkauan Bawah' : 'Aksesibel'}</span>
            </button>
          )}

          {onOpenNetwork && (
            <button
              onClick={onOpenNetwork}
              title="Informasi Akses WiFi & Panel Admin (IP Dinamis)"
              className="flex h-12 w-12 items-center justify-center rounded-control border border-slate-200 bg-white text-slate-600 shadow-xs transition active:scale-95 hover:bg-slate-50 hover:text-[#0369a1] hover:border-sky-300"
            >
              <Wifi className="h-5 w-5" />
            </button>
          )}

          {showAdminButton && (
            <button
              onClick={onOpenAdmin}
              title="Akses Petugas Gudang"
              className="flex h-12 w-12 items-center justify-center rounded-control border border-slate-200 bg-white text-slate-600 shadow-xs transition active:scale-95 hover:bg-slate-50"
            >
              <ShieldCheck className="h-5 w-5" />
            </button>
          )}

          {onOpenShutdown && showShutdownButton && (
            <button
              onClick={onOpenShutdown}
              title="Menu Daya & Matikan Komputer (Shutdown)"
              aria-label="Menu Daya & Matikan Komputer"
              className="flex h-12 w-12 items-center justify-center rounded-control border border-red-200 bg-red-50 text-red-600 shadow-xs transition active:scale-95 hover:bg-red-100 hover:border-red-300"
            >
              <Power className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Official PLN Logo di Pojok Kanan (Ketuk 5x cepat untuk akses darurat jika tombol admin disembunyikan) */}
        <div
          onClick={handlePlnLogoTap}
          title="PT PLN (Persero)"
          className="pl-3 border-l border-slate-200 cursor-pointer select-none"
        >
          <PlnLogo variant="light" />
        </div>
      </div>
    </header>
  );
};
