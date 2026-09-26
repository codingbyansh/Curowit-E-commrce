import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';

interface TickerItem {
  id: number;
  shortText: string;
  longText: string;
  icon: string;
  bgGradient: string;
  sparkleColor: string;
  highlightTag?: string;
}

const ROTATING_MESSAGES: TickerItem[] = [
  {
    id: 0,
    shortText: 'Discover Something Creative',
    longText: 'Discover Something Creative — 1,200+ Handcrafted Pieces from India’s Top Artisan Studios',
    icon: '✨',
    bgGradient: 'from-[#07545A] via-[#0A6B74] to-[#159BB5]',
    sparkleColor: '#FFC83D',
    highlightTag: 'Direct Studio Support',
  },
  {
    id: 1,
    shortText: 'Made by Independent Creators',
    longText: 'Made by Independent Creators — 100% Verified Makers · Thoughtful Slow-Crafted Quality',
    icon: '🎨',
    bgGradient: 'from-[#8C3A19] via-[#B85324] to-[#D97706]',
    sparkleColor: '#FDE68A',
    highlightTag: 'Artisan Verified',
  },
  {
    id: 2,
    shortText: 'Handmade. Unique. Yours.',
    longText: 'Handmade. Unique. Yours. — Every Creation Has a Face, a Name, and a Personal Story',
    icon: '💛',
    bgGradient: 'from-[#144233] via-[#1E5C46] to-[#2D7A5C]',
    sparkleColor: '#FEF08A',
    highlightTag: 'Eco Conscious',
  },
  {
    id: 3,
    shortText: 'Explore Handmade & Creative Finds',
    longText: 'Explore Handmade & Creative Finds — Heirloom Crochet, Botanical Candles, Resin Jewellery & Art',
    icon: '🧵',
    bgGradient: 'from-[#0E3547] via-[#095273] to-[#0284C7]',
    sparkleColor: '#93C5FD',
    highlightTag: 'New Arrivals',
  },
  {
    id: 4,
    shortText: 'New Creative Finds Are Here',
    longText: 'New Creative Finds Are Here — Fresh Weekly Bench Drops Direct from Maker Workspaces',
    icon: '✨',
    bgGradient: 'from-[#431D4A] via-[#632770] to-[#86198F]',
    sparkleColor: '#F5D0FE',
    highlightTag: 'Weekly Drops',
  },
  {
    id: 5,
    shortText: 'Find Something Worth Gifting',
    longText: 'Find Something Worth Gifting — Free Handwritten Gift Notes & Plastic-Free Kraft Packaging',
    icon: '🎁',
    bgGradient: 'from-[#6E2E10] via-[#92400E] to-[#B45309]',
    sparkleColor: '#FED7AA',
    highlightTag: 'Gift Ready',
  },
  {
    id: 6,
    shortText: 'Creativity, Curated for You',
    longText: 'Creativity, Curated for You — Transparent Maker Ethics, Small-Batch Goods & Free Shipping > ₹499',
    icon: '🌈',
    bgGradient: 'from-[#064E3B] via-[#0F766E] to-[#0D9488]',
    sparkleColor: '#A7F3D0',
    highlightTag: 'Curated Goods',
  },
  {
    id: 7,
    shortText: 'Shop. Discover. Create.',
    longText: 'Shop. Discover. Create. — Welcome to Curowit · Use "CUROWIT10" for 10% Off Your First Craft Order',
    icon: '🛍️',
    bgGradient: 'from-[#0E2841] via-[#075985] to-[#159BB5]',
    sparkleColor: '#FDE047',
    highlightTag: 'Use CUROWIT10',
  },
];

export const TopAnnouncementBar: React.FC = () => {
  const { setActiveView, announcements } = useStore();
  const messages = announcements && announcements.length > 0 ? announcements : ROTATING_MESSAGES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animationState, setAnimationState] = useState<'entering' | 'visible' | 'exiting'>('visible');

  // Rotate smoothly every 3.8 seconds
  useEffect(() => {
    if (isPaused) return;

    const displayDuration = 3800; // Stay visible
    const exitDuration = 400;     // Slide/fade transition

    const timer = setTimeout(() => {
      setAnimationState('exiting');

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setAnimationState('entering');

        requestAnimationFrame(() => {
          setTimeout(() => {
            setAnimationState('visible');
          }, 50);
        });
      }, exitDuration);
    }, displayDuration);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, messages.length]);

  const activeMessage = messages[currentIndex % messages.length];

  const handleClick = () => {
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      role="region"
      aria-label="Announcement Ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-30 w-full overflow-hidden select-none text-white shadow-2xs border-b border-white/10"
    >
      {/* Dynamic Rotating Background Color Gradient Layer */}
      {messages.map((msg, idx) => (
        <div
          key={msg.id ?? idx}
          className={`absolute inset-0 bg-gradient-to-r ${msg.bgGradient} transition-opacity duration-700 ease-in-out ${
            idx === currentIndex % messages.length ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      ))}

      {/* Subtle Craft Paper Stardust Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 sm:h-9 md:h-10 flex items-center justify-center">
        {/* Left Side: Subtle Brand Monogram (Laptop View) */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-medium tracking-wider text-white/90 shrink-0 whitespace-nowrap mr-4">
          <span className="font-semibold text-white tracking-wide">CUROWIT</span>
          <span style={{ color: activeMessage.sparkleColor }}>✦</span>
          <span className="text-white/80">Home of creatives</span>
        </div>

        {/* Center: Single-Line Animated Vertical Slide + Fade Carousel */}
        <div
          onClick={handleClick}
          className="flex-1 flex items-center justify-center cursor-pointer group min-w-0 overflow-hidden"
          title="Click to explore collection"
        >
          <div className="relative h-6 sm:h-7 overflow-hidden flex items-center justify-center w-full">
            <div
              className={`flex items-center justify-center gap-2 text-xs sm:text-[13px] font-medium tracking-wide text-white whitespace-nowrap min-w-0 transition-all duration-400 ease-out transform ${
                animationState === 'entering'
                  ? 'opacity-0 translate-y-2'
                  : animationState === 'visible'
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-2'
              }`}
            >
              {/* Message Emoji Icon */}
              <span className="text-sm select-none shrink-0" role="img" aria-hidden="true">
                {activeMessage.icon}
              </span>

              {/* Decorative Miniature Sparkle Left */}
              <span
                style={{ color: activeMessage.sparkleColor }}
                className="text-[10px] hidden md:inline shrink-0"
                aria-hidden="true"
              >
                ✦
              </span>

              {/* Mobile View: Single-Line Concise Text */}
              <span className="md:hidden text-center font-medium whitespace-nowrap truncate">
                {activeMessage.shortText}
              </span>

              {/* Laptop/Desktop View: Single-Line Expressive Text */}
              <span className="hidden md:inline text-center font-medium whitespace-nowrap truncate group-hover:text-amber-100 transition-colors">
                {activeMessage.longText}
              </span>

              {/* Decorative Miniature Sparkle Right */}
              <span
                style={{ color: activeMessage.sparkleColor }}
                className="text-[10px] hidden md:inline shrink-0"
                aria-hidden="true"
              >
                ✦
              </span>

              {/* Highlight Tag (Laptop View) */}
              {activeMessage.highlightTag && (
                <span
                  style={{ backgroundColor: `${activeMessage.sparkleColor}25`, borderColor: `${activeMessage.sparkleColor}60` }}
                  className="hidden xl:inline-flex items-center text-[10px] font-bold text-white px-2 py-0.5 rounded-full border shadow-2xs ml-1.5 shrink-0 whitespace-nowrap"
                >
                  {activeMessage.highlightTag}
                </span>
              )}

              {/* Hover Indicator Arrow */}
              <span
                style={{ color: activeMessage.sparkleColor }}
                className="hidden md:inline-block text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-1 transform group-hover:translate-x-0.5 shrink-0"
                aria-hidden="true"
              >
                →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
