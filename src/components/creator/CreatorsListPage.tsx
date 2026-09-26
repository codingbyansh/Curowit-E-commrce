import React, { useState, useRef } from 'react';
import { CREATORS, Creator } from '../../data/mockData';
import { Sparkles, MapPin, Star, Rotate3d, Layers } from 'lucide-react';

export const CreatorsListPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const isDragActionRef = useRef(false);

  const activeCreator = CREATORS[currentIndex % CREATORS.length];
  const nextCreator = CREATORS[(currentIndex + 1) % CREATORS.length];
  const thirdCreator = CREATORS[(currentIndex + 2) % CREATORS.length];

  const handleNextCard = (direction: 'left' | 'right') => {
    if (swipeDirection) return;
    setSwipeDirection(direction);
    setIsFlipped(false);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % CREATORS.length);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 280);
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    isDragActionRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      isDragActionRef.current = true;
    }
    setDragOffset({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // If it was a tap/click (not a significant drag), flip the card
    if (!isDragActionRef.current || Math.abs(dragOffset.x) < 10) {
      setIsFlipped((prev) => !prev);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    // If dragged enough, swipe to next
    if (dragOffset.x > 70) {
      handleNextCard('right');
    } else if (dragOffset.x < -70) {
      handleNextCard('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    isDragActionRef.current = false;
    startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - startPosRef.current.x;
    const dy = e.touches[0].clientY - startPosRef.current.y;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      isDragActionRef.current = true;
    }
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // If it was a quick tap, toggle flip
    if (!isDragActionRef.current || Math.abs(dragOffset.x) < 10) {
      setIsFlipped((prev) => !prev);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    if (dragOffset.x > 60) {
      handleNextCard('right');
    } else if (dragOffset.x < -60) {
      handleNextCard('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Drag transform calculation
  let dragTransform = '';
  const dragTransition = isDragging ? 'none' : 'transform 0.28s ease-out, opacity 0.28s ease-out';

  if (swipeDirection === 'right') {
    dragTransform = 'translateX(450px) rotate(22deg)';
  } else if (swipeDirection === 'left') {
    dragTransform = 'translateX(-450px) rotate(-22deg)';
  } else if (isDragging) {
    const rotation = dragOffset.x * 0.08;
    dragTransform = `translate(${dragOffset.x}px, ${dragOffset.y * 0.3}px) rotate(${rotation}deg)`;
  }

  return (
    <div className="bg-[#F7EBD7] min-h-[calc(100vh-64px)] py-6 sm:py-10 pb-28 md:pb-16 select-none flex flex-col items-center justify-center overflow-hidden">
      <div className="max-w-md w-full px-4 flex flex-col items-center">
        {/* ========================================================
            Visual Stacked Deck Container
            Shows it's swipeable visually through overlapping cards
            ======================================================== */}
        <div className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-3/4 perspective-1000 mb-6">
          {/* Card Layer 3 (Deepest in stack, visual cue) */}
          {thirdCreator && (
            <div
              className="absolute inset-0 rounded-[32px] overflow-hidden bg-[#EADCC8] border border-[#07545A]/10 shadow-xs scale-90 translate-y-6 opacity-40 pointer-events-none"
              aria-hidden="true"
            >
              <img
                src={thirdCreator.avatar}
                alt=""
                className="w-full h-full object-cover opacity-60"
              />
            </div>
          )}

          {/* Card Layer 2 (Next in stack with slight tilt, visual cue) */}
          {nextCreator && (
            <div
              className="absolute inset-0 rounded-[32px] overflow-hidden bg-[#FFF8EA] border border-[#07545A]/15 shadow-md scale-95 translate-y-3 rotate-[1.5deg] opacity-75 pointer-events-none"
              aria-hidden="true"
            >
              <img
                src={nextCreator.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-xl font-bold font-display">{nextCreator.name}</h3>
                <p className="text-xs text-white/80 mt-0.5">{nextCreator.specialty}</p>
              </div>
            </div>
          )}

          {/* Active Card Layer (Swipeable & 3D Flippable) */}
          <div
            style={{
              transform: dragTransform,
              transition: dragTransition,
              opacity: swipeDirection ? 0 : 1,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 touch-none select-none z-20"
          >
            {/* 3D Flipping Element */}
            <div
              className={`w-full h-full transition-transform duration-500 transform-style-3d relative rounded-[32px] shadow-xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* ========================================================
                  FRONT FACE: Photo, Only Name and What They Made
                  ======================================================== */}
              <div className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#FFF8EA] border-2 border-[#07545A]/20 backface-hidden flex flex-col justify-end">
                <img
                  src={activeCreator.avatar}
                  alt={activeCreator.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  draggable={false}
                />

                {/* Subtle Gradient Shadow for clean readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07545A]/95 via-[#07545A]/30 to-transparent pointer-events-none" />

                {/* Visual Flip Indicator Icon Badge (Corner visual cue) */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white/90 flex items-center justify-center border border-white/20 shadow-xs pointer-events-none">
                  <Rotate3d className="w-4 h-4" />
                </div>

                {/* Front Info: ONLY NAME AND WHAT THEY MADE */}
                <div className="relative z-10 p-6 sm:p-7 text-white pointer-events-none">
                  <h2 className="text-2xl sm:text-3xl font-bold font-display leading-tight drop-shadow-sm">
                    {activeCreator.name}
                  </h2>
                  <p className="text-sm sm:text-base text-[#F7EBD7] font-medium mt-1.5 drop-shadow-xs line-clamp-2">
                    {activeCreator.specialty}
                  </p>
                </div>
              </div>

              {/* ========================================================
                  BACK FACE: Details about creator (No follow, clean layout)
                  ======================================================== */}
              <div className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-b from-[#FFFDF7] to-[#F7EBD7] border-2 border-[#07545A]/20 backface-hidden rotate-y-180 p-6 sm:p-7 flex flex-col justify-between">
                {/* Header Lockup on Back */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3F704B] bg-[#FFF8EA] px-3 py-1 rounded-full border border-[#07545A]/10 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
                      <span>{activeCreator.badge || 'Verified Artisan'}</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#07545A]/10 text-[#07545A] flex items-center justify-center">
                      <Rotate3d className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-[#07545A] font-display leading-tight">
                    {activeCreator.name}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-[#07545A] font-semibold mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E97868] shrink-0" />
                    <span>{activeCreator.location}</span>
                  </div>

                  {/* Creator Bio / Story */}
                  <div className="mt-4 pt-4 border-t border-[#07545A]/10">
                    <p className="text-xs sm:text-sm text-[#173B3D]/85 leading-relaxed font-serif italic">
                      "{activeCreator.story || activeCreator.bio}"
                    </p>
                  </div>
                </div>

                {/* Creator Stats / Details */}
                <div>
                  <div className="grid grid-cols-2 gap-2.5 my-4 bg-[#FFF8EA] p-3 rounded-2xl border border-[#07545A]/10">
                    <div>
                      <span className="text-[10px] text-[#687778] uppercase font-bold block">Artisan Craft</span>
                      <span className="text-xs font-semibold text-[#07545A] truncate block mt-0.5">
                        {activeCreator.specialty.split('•')[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#687778] uppercase font-bold block">Handmade Pieces</span>
                      <span className="text-xs font-semibold text-[#07545A] block mt-0.5">
                        {activeCreator.salesCount}+ pieces
                      </span>
                    </div>
                  </div>

                  {/* Rating & Heritage */}
                  <div className="flex items-center justify-between text-xs text-[#07545A] font-medium pt-2 border-t border-[#07545A]/10">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#F2A900] text-[#F2A900]" />
                      <span className="font-bold">{activeCreator.rating} Rating</span>
                    </div>
                    <span className="text-[#173B3D]/60 text-[11px]">Since {activeCreator.joinedYear}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            Visual Swipe Indicator Cue (Purely Visual - No Words)
            ======================================================== */}
        <div className="flex items-center justify-center gap-3 py-2 text-[#07545A]/50 pointer-events-none select-none">
          {/* Subtle directional visual indicator arrows & dots */}
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#07545A]/40">‹</span>
            <span className="w-3 h-0.5 rounded-full bg-[#07545A]/30" />
          </div>

          <div className="flex items-center gap-1.5">
            {CREATORS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex % CREATORS.length
                    ? 'w-6 bg-[#07545A]'
                    : 'w-1.5 bg-[#07545A]/25'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded-full bg-[#07545A]/30" />
            <span className="text-sm font-bold text-[#07545A]/40">›</span>
          </div>
        </div>
      </div>
    </div>
  );
};
