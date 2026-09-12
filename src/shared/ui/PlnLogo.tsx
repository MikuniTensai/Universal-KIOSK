import React from 'react';
import plnLogoImg from '../../assets/pln_logo.webp';

interface PlnLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showSubtitle?: boolean;
}

export const PlnLogo: React.FC<PlnLogoProps> = ({
  variant = 'light',
  className = '',
  showSubtitle = true,
}) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
      aria-label="Logo PT PLN (Persero)"
    >
      {/* Official PLN Brand Asset from Client */}
      <div
        className={`flex items-center h-11 lg:h-12 px-3.5 py-1.5 rounded-xl border transition-all ${
          isDark
            ? 'bg-white/95 border-white/40 shadow-md ring-1 ring-white/20'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        <img
          src={plnLogoImg}
          alt="Logo PT PLN (Persero)"
          className="h-7 lg:h-8 w-auto object-contain"
        />
      </div>

      {/* Subtitle tag for Warehouse / Unit */}
      {showSubtitle && (
        <div className="hidden sm:flex flex-col text-left">
          <span
            className={`font-black tracking-wider text-xs lg:text-sm font-sans ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}
          >
            PT PLN (PERSERO)
          </span>
          <span
            className={`text-[10px] font-bold tracking-[0.16em] uppercase ${
              isDark ? 'text-amber-300/80' : 'text-slate-500'
            }`}
          >
            UP3 MALANG
          </span>
        </div>
      )}

      {/* Semantic text for accessibility & tests */}
      <span className="sr-only">PT PLN (PERSERO)</span>
    </div>
  );
};

