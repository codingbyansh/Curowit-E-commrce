import React from 'react';
import { CATEGORIES, Category } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Sparkles } from 'lucide-react';

interface CategoryFrameProps {
  type: 'flower' | 'embroidery' | 'pottery' | 'artisan';
}

const CategoryArtisanalFrame: React.FC<CategoryFrameProps> = ({ type }) => {
  if (type === 'flower') {
    // Delicate Botanical Flower Garland Frame
    return (
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-700 ease-out group-hover:scale-103 group-hover:rotate-6 select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer and Inner Vine Circles */}
        <circle cx="100" cy="100" r="82" stroke="#07545A" strokeWidth="1.5" strokeOpacity="0.35" />
        <circle cx="100" cy="100" r="77" stroke="#F2A900" strokeWidth="2" strokeDasharray="18 4" />

        {/* 8 Flower Blossoms with Leaves at perimeter angles */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 100 + 82 * Math.cos(rad);
          const cy = 100 + 82 * Math.sin(rad);
          const isCoral = i % 2 === 0;
          const petalColor = isCoral ? '#E97868' : '#F2A900';

          return (
            <g key={angle} transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
              {/* Green leaf pair */}
              <path
                d="M -7 -4 C -11 -7, -13 -3, -7 0 Z"
                fill="#3F704B"
                opacity="0.85"
              />
              <path
                d="M -7 4 C -11 7, -13 3, -7 0 Z"
                fill="#3F704B"
                opacity="0.85"
              />
              {/* 5-petal flower blossom */}
              <circle cx="-3" cy="-3" r="2.4" fill={petalColor} />
              <circle cx="3" cy="-3" r="2.4" fill={petalColor} />
              <circle cx="-3" cy="3" r="2.4" fill={petalColor} />
              <circle cx="3" cy="3" r="2.4" fill={petalColor} />
              <circle cx="0" cy="-4" r="2.4" fill={petalColor} />
              {/* Flower Center */}
              <circle cx="0" cy="0" r="2" fill="#FFF8EA" stroke="#07545A" strokeWidth="0.6" />
            </g>
          );
        })}
      </svg>
    );
  }

  if (type === 'embroidery') {
    // Wooden Embroidery Craft Hoop Frame with Needlework Stitches
    return (
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-700 ease-out group-hover:scale-103 group-hover:-rotate-3 select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Wooden Hoop */}
        <circle cx="100" cy="100" r="85" stroke="#BA7B3A" strokeWidth="4.5" />
        <circle cx="100" cy="100" r="83" stroke="#9A6127" strokeWidth="1" />

        {/* Inner Hoop Ring */}
        <circle cx="100" cy="100" r="77" stroke="#87531E" strokeWidth="2.5" />

        {/* Running needlework stitches */}
        <circle
          cx="100"
          cy="100"
          r="81"
          stroke="#FFF8EA"
          strokeWidth="1.6"
          strokeDasharray="4 4"
        />

        {/* Top Metallic Brass Tightening Bracket & Screw */}
        <rect
          x="94"
          y="7"
          width="12"
          height="11"
          rx="2"
          fill="#F2A900"
          stroke="#07545A"
          strokeWidth="1.2"
        />
        <line x1="91" y1="12.5" x2="109" y2="12.5" stroke="#07545A" strokeWidth="1.5" />
        <circle cx="94" cy="12.5" r="2" fill="#BA7B3A" />
        <circle cx="106" cy="12.5" r="2" fill="#BA7B3A" />

        {/* Dangling loose craft yarn thread curl */}
        <path
          d="M 158 158 C 175 175, 162 192, 142 188 C 132 186, 126 195, 128 200"
          stroke="#E97868"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 'pottery') {
    // Terracotta Clay Wheel Scalloped Handcrafted Rim Frame
    return (
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-700 ease-out group-hover:scale-103 group-hover:rotate-4 select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Scalloped terracotta rim */}
        <circle cx="100" cy="100" r="85" stroke="#C4623C" strokeWidth="3" />
        <circle cx="100" cy="100" r="77" stroke="#A84F2B" strokeWidth="2" />

        {/* 16 hand-stamped decorative clay dots */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          const rad = (angle * Math.PI) / 180;
          const cx = 100 + 81 * Math.cos(rad);
          const cy = 100 + 81 * Math.sin(rad);

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="2.5"
              fill="#F2A900"
              stroke="#A84F2B"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Ceramic sunburst notch accents */}
        {[45, 135, 225, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 86 * Math.cos(rad);
          const y1 = 100 + 86 * Math.sin(rad);
          const x2 = 100 + 91 * Math.cos(rad);
          const y2 = 100 + 91 * Math.sin(rad);

          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#C4623C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  // Artisan Painter's Craft Ring Frame with Droplets & Petals
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-700 ease-out group-hover:scale-103 group-hover:-rotate-4 select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="83" stroke="#07545A" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="77" stroke="#F2A900" strokeWidth="1.5" strokeDasharray="12 6" />

      {/* Handcrafted paint splash droplets on perimeter */}
      <circle cx="168" cy="70" r="3.5" fill="#07545A" />
      <circle cx="178" cy="85" r="2.5" fill="#F2A900" />
      <circle cx="172" cy="100" r="3" fill="#E97868" />

      {/* Botanical sprout at top left */}
      <path
        d="M 40 40 C 32 30, 42 22, 50 32 C 48 38, 44 42, 40 40 Z"
        fill="#3F704B"
      />
      <path
        d="M 32 48 C 22 42, 28 32, 38 38 C 38 45, 35 48, 32 48 Z"
        fill="#3F704B"
        opacity="0.8"
      />
    </svg>
  );
};

export const CategorySection: React.FC = () => {
  const { setSelectedCategory, setActiveView } = useStore();

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.id);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine handcrafted or flower frame type per category
  const getCategoryFrameType = (catId: string): 'flower' | 'embroidery' | 'pottery' | 'artisan' => {
    switch (catId) {
      case 'jewellery':
      case 'candles':
      case 'gifts':
        return 'flower'; // Floral botanical wreath
      case 'crochet':
      case 'accessories':
      case 'diy':
        return 'embroidery'; // Handcrafted embroidery hoop with stitches
      case 'home':
        return 'pottery'; // Terracotta artisan pottery rim
      case 'art':
      default:
        return 'artisan'; // Painter's craft ring with droplets
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#F7EBD7] border-b border-[#07545A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3 text-center sm:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Curated Disciplines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-xl">
              Explore handmade creations framed by craft discipline, crafted with patient hands and natural materials.
            </p>
          </div>
        </div>

        {/* Single-Row Categories: Finger-swipeable on phone/tablet (no arrows), full 8-column single row on desktop */}
        <div
          className="flex flex-nowrap lg:grid lg:grid-cols-8 items-start gap-4 sm:gap-5 lg:gap-3 overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0 pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {CATEGORIES.map((cat) => {
            const frameType = getCategoryFrameType(cat.id);

            return (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className="group flex flex-col items-center cursor-pointer select-none shrink-0 snap-start w-[104px] sm:w-[124px] lg:w-auto"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCategorySelect(cat);
                }}
              >
                {/* Circular Framed Artwork Medallion */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 xl:w-35 xl:h-35 flex items-center justify-center">
                  {/* Inner Circular Image Aperture */}
                  <div className="w-[74%] h-[74%] rounded-full overflow-hidden bg-[#FFF8EA] shadow-md border-2 border-[#FFF8EA] z-10 transition-transform duration-500 group-hover:scale-105">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-112"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-[#07545A]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Artisanal Handicraft / Flower Decorative Frame SVG */}
                  <CategoryArtisanalFrame type={frameType} />
                </div>

                {/* Category Title */}
                <div className="mt-2.5 text-center flex flex-col items-center px-1">
                  <h3 className="font-bold text-xs sm:text-sm text-[#173B3D] group-hover:text-[#07545A] transition-colors font-display leading-snug whitespace-nowrap">
                    {cat.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
