import React, { useState, useEffect } from 'react';
import { Home, Zap, ShieldCheck, Clock, Accessibility } from 'lucide-react';
import { KioskConfig } from '../../domain/types';

interface HeaderProps {
  config: KioskConfig;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAdmin: () => void;
  lowReachMode?: boolean;
  onToggleLowReach?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentRoute,
  onNavigate,
  onOpenAdmin,
  lowReachMode = false,
  onToggleLowReach,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat('id-ID', {
          timeZone: config.timezone || 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        const dateFormatter = new Intl.DateTimeFormat('id-ID', {
          timeZone: config.timezone || 'Asia/Jakarta',
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        setTimeStr(timeFormatter.format(now));
        setDateStr(dateFormatter.format(now));
      } catch {
        setTimeStr(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [config.timezone]);

  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-kiosk-border bg-white px-6 shadow-sm">
      {/* Brand & Organization */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-control bg-[#FACC15] text-[#0F172A] shadow-md shrink-0">
          <Zap className="h-7 w-7 fill-current stroke-1" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
              PLN LOGISTIK & GUDANG
            </span>
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 shrink-0">
              {config.warehouseCode}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 line-clamp-1 max-w-[280px] lg:max-w-md">
            {config.organizationName}
          </p>
        </div>
      </div>

      {/* Center Clock */}
      <div className="hidden lg:flex items-center gap-2 rounded-control bg-slate-50 px-4 py-2 border border-slate-200 shrink-0">
        <Clock className="h-4 w-4 text-slate-500" />
        <span className="text-xs text-slate-500 font-medium">{dateStr}</span>
        <span className="text-sm font-bold text-slate-800 font-mono">{timeStr} WIB</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        {currentRoute !== 'home' && currentRoute !== 'idle' && (
          <button
            onClick={() => onNavigate('home')}
            className="flex h-14 min-w-[130px] items-center justify-center gap-2 rounded-control bg-[#FACC15] px-5 text-base font-bold text-[#0F172A] shadow-md transition active:scale-95 active:bg-[#EAB308]"
          >
            <Home className="h-5 w-5" />
            <span>Beranda</span>
          </button>
        )}

        {onToggleLowReach && (
          <button
            onClick={onToggleLowReach}
            title="Mode Jangkauan Rendah (Aksesibilitas Kursi Roda)"
            className={`flex h-14 items-center gap-2 rounded-control border px-4 font-bold text-sm shadow-sm transition active:scale-95 ${
              lowReachMode
                ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-400'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Accessibility className="h-5 w-5 text-amber-600" />
            <span className="hidden lg:inline">{lowReachMode ? 'Jangkauan Bawah' : 'Aksesibel'}</span>
          </button>
        )}

        <button
          onClick={onOpenAdmin}
          title="Akses Petugas Gudang"
          className="flex h-14 w-14 items-center justify-center rounded-control border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95 active:bg-slate-100"
        >
          <ShieldCheck className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};
