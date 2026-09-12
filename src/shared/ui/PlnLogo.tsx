import React from 'react';

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
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* PLN Official Symbol: Yellow Shield with Red Lightning & Blue Waves */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FACC15] p-1 shadow-md ring-1 ring-amber-400/50">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          aria-label="Logo PT PLN (Persero)"
        >
          {/* Yellow Shield / Base Container */}
          <rect width="100" height="100" rx="16" fill="#FACC15" />
          
          {/* 3 Blue Waves */}
          <path
            d="M16 68 C 28 62, 42 74, 54 68 C 66 62, 74 72, 84 68"
            stroke="#0284C7"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M16 78 C 28 72, 42 84, 54 78 C 66 72, 74 82, 84 78"
            stroke="#0284C7"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M16 88 C 28 82, 42 94, 54 88 C 66 82, 74 92, 84 88"
            stroke="#0284C7"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Red Lightning Bolt */}
          <path
            d="M58 8 L32 46 L50 46 L40 84 L72 38 L54 38 Z"
            fill="#DC2626"
            stroke="#B91C1C"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black tracking-wider text-sm lg:text-base font-sans ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}
          >
            PT PLN (PERSERO)
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[10px] font-bold tracking-[0.16em] uppercase mt-0.5 ${
              isDark ? 'text-amber-300/80' : 'text-slate-500'
            }`}
          >
            LOGISTIK &amp; GUDANG
          </span>
        )}
      </div>
    </div>
  );
};
