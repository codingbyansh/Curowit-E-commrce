import React from 'react';

interface CurowitLogoProps {
  variant?: 'full' | 'horizontal' | 'emblem' | 'wordmark';
  theme?: 'dark' | 'light'; // dark = teal on light background; light = cream on dark teal background
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CurowitLogo: React.FC<CurowitLogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  className = '',
  size = 'md',
}) => {
  const isLight = theme === 'light';
  const textColor = isLight ? '#FFF8EA' : '#07545A';
  const taglineColor = isLight ? '#F7EBD7' : '#063F45';

  const config = {
    sm: {
      emblemPx: 32,
      emblemClass: 'w-8 h-8',
      fontSize: 'text-[17px] sm:text-[18px]',
      taglineSize: 'text-[9.5px]',
      gap: 'gap-2',
    },
    md: {
      emblemPx: 40,
      emblemClass: 'w-10 h-10',
      fontSize: 'text-[19px] sm:text-[22px]',
      taglineSize: 'text-[10px] sm:text-[11px]',
      gap: 'gap-2.5',
    },
    lg: {
      emblemPx: 52,
      emblemClass: 'w-13 h-13',
      fontSize: 'text-[24px] sm:text-[28px]',
      taglineSize: 'text-[12px]',
      gap: 'gap-3',
    },
    xl: {
      emblemPx: 72,
      emblemClass: 'w-18 h-18',
      fontSize: 'text-[32px] sm:text-[38px]',
      taglineSize: 'text-[14px]',
      gap: 'gap-4',
    },
  }[size];

  // The official Curowit circular emblem image
  const officialLogoImage = (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105 ${config.emblemClass} ${
        isLight
          ? 'border border-[#FFF8EA]/30 shadow-xs ring-1 ring-[#F2A900]/30'
          : 'border border-[#07545A]/15 shadow-2xs'
      }`}
      style={{
        width: `${config.emblemPx}px`,
        height: `${config.emblemPx}px`,
        minWidth: `${config.emblemPx}px`,
        minHeight: `${config.emblemPx}px`,
      }}
    >
      <img
        src="/curowit-logo.jpg"
        alt="Curowit Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center select-none"
      />
    </div>
  );

  // The official "Curowit" Wordmark with signature double petal dot over 'i'
  const officialWordmark = (
    <div className="flex flex-col leading-none select-none justify-center">
      <div
        className={`flex items-center font-bold tracking-tight ${config.fontSize}`}
        style={{
          fontFamily: "'Comfortaa', cursive, sans-serif",
          color: textColor,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        <span>Curow</span>
        {/* The 'i' with signature coral and mustard double petal dot */}
        <span className="relative inline-block">
          <span>i</span>
          <span
            className="absolute -top-[5px] sm:-top-[6px] left-1/2 -translate-x-1/2 w-3 sm:w-3.5 h-3 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" className="w-full h-full overflow-visible" fill="none">
              {/* Top coral petal */}
              <path
                d="M 6 3 C 4 0.5, 9.5 0, 10.5 2.5 C 11.5 4.5, 8.5 6, 6 3 Z"
                fill="#E97868"
              />
              {/* Bottom mustard petal */}
              <path
                d="M 8 5 C 10 3, 13 5.5, 10.5 8 C 8.5 8.5, 7.5 6.5, 8 5 Z"
                fill="#F2A900"
              />
            </svg>
          </span>
        </span>
        <span>t</span>
      </div>

      <span
        className={`tracking-wider font-semibold mt-0.5 select-none ${config.taglineSize}`}
        style={{
          color: taglineColor,
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 600,
          fontStyle: 'normal',
        }}
      >
        Home of Creatives.
      </span>
    </div>
  );

  if (variant === 'emblem') {
    return <div className={`inline-flex items-center ${className}`}>{officialLogoImage}</div>;
  }

  if (variant === 'wordmark') {
    return <div className={`inline-flex flex-col ${className}`}>{officialWordmark}</div>;
  }

  // Default 'horizontal' or 'full'
  return (
    <div className={`inline-flex items-center ${config.gap} group cursor-pointer ${className}`}>
      {officialLogoImage}
      {officialWordmark}
    </div>
  );
};
