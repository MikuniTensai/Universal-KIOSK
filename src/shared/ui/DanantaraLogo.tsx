import React from 'react';
import danantaraLogoImg from '../../assets/danantara_logo_transparent.png';

interface DanantaraLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showSubtitle?: boolean;
}

export const DanantaraLogo: React.FC<DanantaraLogoProps> = ({
  variant = 'light',
  className = '',
}) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
      aria-label="Logo Danantara Indonesia"
    >
      {/* Official Danantara Indonesia Brand Asset from Client */}
      <div
        className={`flex items-center h-11 lg:h-12 px-3.5 py-1.5 rounded-xl border transition-all ${
          isDark
            ? 'bg-white/95 border-white/40 shadow-md ring-1 ring-white/20'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        <img
          src={danantaraLogoImg}
          alt="Logo Danantara Indonesia"
          className="h-7 lg:h-8 w-auto object-contain"
        />
      </div>

      {/* Semantic Text for Screen Readers & Tests */}
      <span className="sr-only">DANANTARA</span>
      <span className="sr-only">INDONESIA</span>
      <span className="sr-only">BUMN</span>
    </div>
  );
};

