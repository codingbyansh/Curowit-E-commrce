import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { CREATORS, Creator, PRODUCTS, WORKSHOPS } from '../../data/mockData';
import {
  Sparkles,
  MapPin,
  Star,
  Rotate3d,
  Layers,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Heart,
  Calendar,
  Compass,
  CheckCircle2,
  X,
  Share2,
} from 'lucide-react';
import { ArtisanCraftBackground } from './ArtisanCraftBackground';

export const CreatorsListPage: React.FC = () => {
  const { creators, navigateToProduct, navigateToCreator, setActiveView, showToast } = useStore();
  const makerList = creators && creators.length > 0 ? creators : CREATORS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showRightDetails, setShowRightDetails] = useState(true);

  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const isDragActionRef = useRef(false);

  const activeCreator = makerList[currentIndex % makerList.length];
  const nextCreator = makerList[(currentIndex + 1) % makerList.length];
  const thirdCreator = makerList[(currentIndex + 2) % makerList.length];

  // Fetch creations and workshops for active creator
  const creatorProducts = PRODUCTS.filter(
    (p) =>
      p.creatorId === activeCreator.id ||
      p.creatorName?.toLowerCase().includes(activeCreator.name.toLowerCase()) ||
      activeCreator.name?.toLowerCase().includes(p.creatorName?.toLowerCase() || '')
  ).slice(0, 3);

  const creatorWorkshops = WORKSHOPS.filter(
    (w) =>
      w.creatorName?.toLowerCase().includes(activeCreator.name.toLowerCase()) ||
      activeCreator.name?.toLowerCase().includes(w.creatorName?.toLowerCase() || '')
  ).slice(0, 1);

  const handleNextCard = (direction: 'left' | 'right') => {
    if (swipeDirection) return;
    setSwipeDirection(direction);
    setIsFlipped(false);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % makerList.length);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 280);
  };

  const handlePrevCard = () => {
    if (swipeDirection) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + makerList.length) % makerList.length);
  };

  const toggleFlip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFlipped((prev) => !prev);
    setShowRightDetails(true);
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

    // If it was a tap/click (not a significant drag), flip the card and show details
    if (!isDragActionRef.current || Math.abs(dragOffset.x) < 10) {
      setIsFlipped((prev) => !prev);
      setShowRightDetails(true);
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

    // If it was a quick tap, toggle flip and ensure details are visible
    if (!isDragActionRef.current || Math.abs(dragOffset.x) < 10) {
      setIsFlipped((prev) => !prev);
      setShowRightDetails(true);
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

  const handleShareCreator = () => {
    const shareText = `Discover ${activeCreator.name} on Curowit: ${activeCreator.specialty}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/?creator=${activeCreator.id}`);
      showToast('Link Copied', `Artisan link for ${activeCreator.name} copied to clipboard!`);
    }
  };

  return (
    <ArtisanCraftBackground
      theme="warm-paper"
      className="min-h-[calc(100vh-64px)] py-6 sm:py-10 pb-28 md:pb-16 select-none flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Top Drafting Matrix Header Banner */}
      <div className="max-w-6xl w-full px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07545A]/10 text-[#07545A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span className="font-mono uppercase tracking-wider text-[11px]">Craft Drafting Matrix · Verified Ateliers</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#07545A] font-display tracking-tight">
            Meet Independent Creators
          </h1>
          <p className="text-xs sm:text-sm text-[#173B3D]/75 max-w-xl mt-1">
            Click on cards to flip and inspect full artisan dossiers, studio tools, and handcrafted collections filling the drafting space.
          </p>
        </div>

        {/* Quick Deck Controls */}
        <div className="flex items-center justify-center sm:justify-end gap-2 text-xs font-bold">
          <button
            onClick={handlePrevCard}
            className="px-3 py-2 bg-white/80 hover:bg-white text-[#07545A] rounded-xl border border-[#07545A]/15 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Previous maker"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <span className="px-3 py-2 bg-[#07545A]/10 text-[#07545A] rounded-xl font-mono text-[11px]">
            {((currentIndex % makerList.length) + 1).toString().padStart(2, '0')} / {makerList.length.toString().padStart(2, '0')}
          </span>
          <button
            onClick={() => handleNextCard('right')}
            className="px-3 py-2 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Next maker"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Card Deck + Right Details Atelier Showcase */}
      <div className="max-w-6xl w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT COLUMN (lg:col-span-5): 3D FLIPPABLE STACKED CARD DECK
            ======================================================== */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-3/4 perspective-1000 mb-4">
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
              className="absolute inset-0 touch-none select-none z-20 group"
              title="Click card to flip and view details on the right side"
            >
              {/* 3D Flipping Element */}
              <div
                className={`w-full h-full transition-transform duration-500 transform-style-3d relative rounded-[32px] shadow-2xl ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* ========================================================
                    FRONT FACE: Photo, Name, Specialty, and Flip Visual Prompt
                    ======================================================== */}
                <div className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#FFF8EA] border-2 border-[#07545A]/25 backface-hidden flex flex-col justify-end">
                  <img
                    src={activeCreator.avatar}
                    alt={activeCreator.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    draggable={false}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07545A]/95 via-[#07545A]/35 to-transparent pointer-events-none" />

                  {/* Visual Flip Indicator Icon Badge */}
                  <div
                    onClick={toggleFlip}
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center gap-1.5 border border-white/25 shadow-xs cursor-pointer hover:bg-black/60 transition-all z-30"
                  >
                    <Rotate3d className="w-3.5 h-3.5 text-[#F2A900]" />
                    <span className="text-[11px] font-bold tracking-wide">Click to Flip</span>
                  </div>

                  {/* Front Info */}
                  <div className="relative z-10 p-6 sm:p-7 text-white pointer-events-none">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold text-[#FFF8EA] mb-2 uppercase tracking-wider">
                      <span>{activeCreator.badge || 'Verified Artisan'}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-display leading-tight drop-shadow-sm">
                      {activeCreator.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#F7EBD7] font-medium mt-1 line-clamp-2">
                      {activeCreator.specialty}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/20">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F2A900]" />
                        {activeCreator.location}
                      </span>
                      <span className="text-[11px] text-[#F2A900] font-bold flex items-center gap-1">
                        <span>Details on Right</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    BACK FACE: Detailed Summary & Flip Back Control
                    ======================================================== */}
                <div className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFF8EA] to-[#F7EBD7] border-2 border-[#07545A]/30 backface-hidden rotate-y-180 p-6 sm:p-7 flex flex-col justify-between shadow-xl">
                  {/* Header Lockup on Back */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3F704B] bg-white px-3 py-1 rounded-full border border-[#07545A]/15 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
                        <span>{activeCreator.badge || 'Verified Artisan'}</span>
                      </div>

                      <button
                        onClick={toggleFlip}
                        className="p-1.5 rounded-full bg-[#07545A]/10 hover:bg-[#07545A]/20 text-[#07545A] cursor-pointer transition-colors"
                        title="Flip back to front"
                      >
                        <Rotate3d className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-[#07545A] font-display leading-tight">
                      {activeCreator.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[#07545A]/70">{activeCreator.handle}</p>

                    <div className="flex items-center gap-1 text-xs text-[#07545A] font-semibold mt-2">
                      <MapPin className="w-3.5 h-3.5 text-[#E97868] shrink-0" />
                      <span>{activeCreator.location}</span>
                    </div>

                    {/* Creator Bio / Story */}
                    <div className="mt-3 pt-3 border-t border-[#07545A]/15">
                      <p className="text-xs sm:text-sm text-[#173B3D]/85 leading-relaxed font-serif italic line-clamp-4">
                        "{activeCreator.story || activeCreator.bio}"
                      </p>
                    </div>
                  </div>

                  {/* Creator Stats */}
                  <div>
                    <div className="grid grid-cols-2 gap-2 my-3 bg-white/80 p-3 rounded-2xl border border-[#07545A]/10 text-xs">
                      <div>
                        <span className="text-[10px] text-[#687778] uppercase font-bold block">Artisan Craft</span>
                        <span className="text-xs font-bold text-[#07545A] truncate block mt-0.5">
                          {activeCreator.specialty.split('•')[0]}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#687778] uppercase font-bold block">Handmade Pieces</span>
                        <span className="text-xs font-bold text-[#07545A] block mt-0.5">
                          {activeCreator.salesCount}+ pieces
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#07545A] font-medium pt-2 border-t border-[#07545A]/10">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#F2A900] text-[#F2A900]" />
                        <span className="font-bold">{activeCreator.rating} Rating</span>
                      </div>
                      <span className="text-[#173B3D]/70 text-[11px] font-mono">Since {activeCreator.joinedYear}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Swipe Indicator Dots */}
          <div className="flex items-center justify-center gap-3 py-2 text-[#07545A]/50 select-none">
            <button
              onClick={handlePrevCard}
              className="text-sm font-bold text-[#07545A]/50 hover:text-[#07545A] cursor-pointer"
            >
              ‹
            </button>
            <div className="flex items-center gap-1.5">
              {makerList.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex % makerList.length
                      ? 'w-6 bg-[#07545A]'
                      : 'w-1.5 bg-[#07545A]/25 hover:bg-[#07545A]/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => handleNextCard('right')}
              className="text-sm font-bold text-[#07545A]/50 hover:text-[#07545A] cursor-pointer"
            >
              ›
            </button>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (lg:col-span-7): CREATOR DETAILS SHOWCASE
            Fills the empty space with full artisan dossier and creations
            ======================================================== */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-[#FFFDF7]/95 backdrop-blur-md rounded-[32px] border-2 border-[#07545A]/20 shadow-xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500">
            {/* Technical Craft Blueprint Accent Marks */}
            <div className="absolute top-3 left-4 text-[9px] font-mono text-[#07545A]/40 uppercase tracking-widest pointer-events-none">
              ┌ ATELIER DOSSIER : {activeCreator.id.toUpperCase()} ┐
            </div>
            <div className="absolute top-3 right-4 text-[9px] font-mono text-[#07545A]/40 uppercase tracking-widest pointer-events-none">
              SCALE 1:1
            </div>

            {/* Header: Avatar, Name, Specialty, Badges */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mt-2 border-b border-[#07545A]/15">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={activeCreator.avatar}
                    alt={activeCreator.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#07545A]/20 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#07545A] text-white flex items-center justify-center border-2 border-white text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F2A900]" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl sm:text-2xl font-black text-[#07545A] font-display">
                      {activeCreator.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#07545A]/10 text-[#07545A] font-bold text-[10px] uppercase tracking-wide">
                      {activeCreator.badge || 'Master Artisan'}
                    </span>
                  </div>

                  <p className="text-xs text-[#687778] font-mono">{activeCreator.handle}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#07545A]">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#E97868]" />
                      {activeCreator.location}
                    </span>
                    <span className="text-[#07545A]/30">·</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-[#F2A900] text-[#F2A900]" />
                      {activeCreator.rating} ({activeCreator.salesCount}+ pieces)
                    </span>
                    <span className="text-[#07545A]/30">·</span>
                    <span className="text-[11px] text-[#687778]">Atelier since {activeCreator.joinedYear}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  onClick={toggleFlip}
                  className="px-3.5 py-2 rounded-xl bg-[#07545A]/10 hover:bg-[#07545A]/20 text-[#07545A] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Toggle 3D card flip on left"
                >
                  <Rotate3d className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Show Front' : 'Flip Card'}</span>
                </button>
                <button
                  onClick={handleShareCreator}
                  className="p-2 rounded-xl bg-white hover:bg-[#FFF8EA] text-[#07545A] border border-[#07545A]/20 transition-all cursor-pointer shadow-2xs"
                  title="Share creator profile"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Story & Philosophy Section */}
            <div className="py-6 border-b border-[#07545A]/15">
              <h3 className="text-xs font-bold text-[#687778] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#07545A]" />
                <span>Artisan Heritage & Atelier Philosophy</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#173B3D]/90 leading-relaxed font-serif italic bg-[#FFF8EA] p-4 rounded-2xl border border-[#07545A]/10">
                "{activeCreator.story || activeCreator.bio}"
              </p>

              {/* Craft Specialization Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {activeCreator.specialty.split('•').map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-white text-[#07545A] border border-[#07545A]/15 text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#3F704B]" />
                    <span>{spec.trim()}</span>
                  </span>
                ))}
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#F2A900]" />
                  <span>100% Plastic-Free Packaging</span>
                </span>
              </div>
            </div>

            {/* Handcrafted Creations by this Creator */}
            <div className="py-6 border-b border-[#07545A]/15">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#687778] uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#07545A]" />
                  <span>Curated Works by {activeCreator.name} ({creatorProducts.length})</span>
                </h3>
                <button
                  onClick={() => setActiveView('shop')}
                  className="text-xs font-bold text-[#07545A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Browse All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {creatorProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {creatorProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => navigateToProduct(prod.id)}
                      className="group bg-white rounded-2xl p-2.5 border border-[#07545A]/12 hover:border-[#07545A]/40 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-[#F7EBD7]">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {prod.discountBadge && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#E97868] text-white text-[9px] font-bold">
                            {prod.discountBadge}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#07545A] truncate group-hover:underline">
                          {prod.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-bold text-[#173B3D]">₹{prod.price}</span>
                          <span className="text-[10px] text-[#687778] flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-[#F2A900] text-[#F2A900]" />
                            {prod.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white/60 rounded-2xl border border-dashed border-[#07545A]/20 text-center text-xs text-[#687778]">
                  <span>New studio batch is currently being hand-cured. Check back soon!</span>
                </div>
              )}
            </div>

            {/* Atelier Workshop or Studio Experience (if available) */}
            {creatorWorkshops.length > 0 && (
              <div className="py-4 border-b border-[#07545A]/15 flex items-center justify-between gap-4 bg-[#07545A]/5 p-3.5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#07545A] text-white flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#F2A900]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#07545A] uppercase tracking-wide block">
                      Live Atelier Masterclass
                    </span>
                    <h4 className="text-xs font-bold text-[#173B3D]">
                      {creatorWorkshops[0].title}
                    </h4>
                    <span className="text-[10px] text-[#687778]">
                      {creatorWorkshops[0].date} · {creatorWorkshops[0].format}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('workshops')}
                  className="px-3 py-1.5 bg-[#07545A] text-[#FFF8EA] text-xs font-bold rounded-xl hover:bg-[#063F45] cursor-pointer shrink-0"
                >
                  View Workshop
                </button>
              </div>
            )}

            {/* Footer Navigation & Call to Actions */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-[#687778] font-mono">
                Atelier Location: <span className="text-[#07545A] font-bold">{activeCreator.location}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => navigateToCreator(activeCreator.id)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Visit Full Atelier Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleNextCard('right')}
                  className="px-4 py-2.5 bg-white hover:bg-[#F7EBD7] text-[#07545A] border border-[#07545A]/20 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Next Artisan"
                >
                  <span>Next Maker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ArtisanCraftBackground>
  );
};
