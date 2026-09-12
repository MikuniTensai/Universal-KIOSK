import React from 'react';

interface DanantaraLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showSubtitle?: boolean;
}

export const DanantaraLogo: React.FC<DanantaraLogoProps> = ({
  variant = 'light',
  className = '',
  showSubtitle = true,
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Danantara Emblem: Golden Geometric Octagonal Star Crest */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 p-0.5 shadow-md ring-1 ring-amber-400/40">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-9 w-9"
          aria-label="Logo Danantara Indonesia"
        >
          {/* Outer Ring & Golden Facets */}
          <circle cx="24" cy="24" r="22" stroke="#FDE047" strokeWidth="1.5" strokeOpacity="0.8" />
          
          {/* 8-Pointed Star / Diamond Geometry */}
          <polygon
            points="24,4 29,18 44,24 29,30 24,44 19,30 4,24 19,18"
            fill="url(#goldGradient)"
            stroke="#FEF08A"
            strokeWidth="1"
          />
          {/* Inner Facet Star */}
          <polygon
            points="24,10 27,20 38,24 27,28 24,38 21,28 10,24 21,20"
            fill="#78350F"
            fillOpacity="0.35"
          />
          {/* Center Jewel / Core */}
          <circle cx="24" cy="24" r="4.5" fill="#FEF08A" />
          <circle cx="24" cy="24" r="2.5" fill="#B45309" />

          {/* Gradients */}
          <defs>
            <linearGradient id="goldGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF08A" />
              <stop offset="0.4" stopColor="#F59E0B" />
              <stop offset="0.8" stopColor="#D97706" />
              <stop offset="1" stopColor="#92400E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-wider text-base lg:text-lg font-sans ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}
          >
            DANANTARA
          </span>
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 border border-amber-500/30">
            BUMN
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[10px] font-bold tracking-[0.22em] uppercase mt-0.5 ${
              isDark ? 'text-amber-300/80' : 'text-slate-500'
            }`}
          >
            INDONESIA
          </span>
        )}
      </div>
    </div>
  );
};
