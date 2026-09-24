import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroBannerSlide {
  id: number;
  image: string;
  alt: string;
  action: 'shop-handmade' | 'shop-creators' | 'explore-all';
}

const HERO_BANNER_SLIDES: HeroBannerSlide[] = [
  {
    id: 0,
    image: '/hero-1.jpg',
    alt: 'Curowit: Made by Hand. Made with Heart. Discover unique handmade products created by independent artists and makers.',
    action: 'shop-handmade',
  },
  {
    id: 1,
    image: '/hero-2.jpg',
    alt: 'Curowit: Meet the Creators Behind the Magic. Discover unique work from independent creators and support creativity directly.',
    action: 'shop-creators',
  },
  {
    id: 2,
    image: '/hero-3.jpg',
    alt: 'Curowit: Everything Creative. All in One Place. Shop Curowit products and discover curated creative tools, supplies, DIY kits.',
    action: 'explore-all',
  },
];

export const HeroCarousel: React.FC = () => {
  const { setActiveView, setSelectedCategory } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_BANNER_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_BANNER_SLIDES.length) % HERO_BANNER_SLIDES.length);
  }, []);

  // Autoplay 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 40;
    if (isSwipe) {
      if (distance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleSlideClick = (action: string) => {
    if (action === 'shop-handmade') {
      setSelectedCategory('crochet');
      setActiveView('shop');
    } else if (action === 'shop-creators') {
      setActiveView('creators');
    } else {
      setSelectedCategory('all');
      setActiveView('shop');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#F7EBD7] py-3 sm:py-5 lg:py-6 select-none"
      aria-label="Campaign Hero Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Banner Frame with smooth rounded corners and subtle shadow */}
        <div className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#07545A]/10 bg-[#FFF8EA]">
          {HERO_BANNER_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <div
                key={slide.id}
                onClick={() => handleSlideClick(slide.action)}
                className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${HERO_BANNER_SLIDES.length}`}
              >
                {/* Exact full-resolution banner image without alterations or text overlays */}
                <img
                  src={slide.image}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center select-none"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}

          {/* Navigation Controls: Previous Slide */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Banner"
            className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#FFF8EA]/85 backdrop-blur-md border border-[#07545A]/15 text-[#07545A] flex items-center justify-center hover:bg-[#FFF8EA] shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Navigation Controls: Next Slide */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Banner"
            className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#FFF8EA]/85 backdrop-blur-md border border-[#07545A]/15 text-[#07545A] flex items-center justify-center hover:bg-[#FFF8EA] shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Pagination Indicators Inside Banner Bottom */}
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-[#FFF8EA]/80 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#07545A]/10 shadow-xs">
            {HERO_BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 sm:h-2 transition-all duration-300 rounded-full cursor-pointer ${
                  i === currentSlide
                    ? 'w-5 sm:w-7 bg-[#07545A]'
                    : 'w-1.5 sm:w-2 bg-[#07545A]/30 hover:bg-[#07545A]/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
