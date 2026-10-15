import React, { useState, useEffect } from 'react';
import { WORKSHOPS, Workshop } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { openRazorpayCheckout } from '../../utils/razorpay';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const WorkshopsPage: React.FC = () => {
  const {
    showToast,
    workshops,
    user,
    requireAuthForAction,
    bookWorkshop,
    isWorkshopBooked,
    setActiveView,
  } = useStore();
  const allWorkshops = workshops && workshops.length > 0 ? workshops : WORKSHOPS;

  const [highlightedWorkshopId, setHighlightedWorkshopId] = useState<string | null>(null);
  const [selectedWorkshopForModal, setSelectedWorkshopForModal] = useState<Workshop | null>(null);
  const [copiedLinkMap, setCopiedLinkMap] = useState<Record<string, boolean>>({});

  // Deep-link detection on mount (e.g. buyer arrives via /?view=workshops&workshop=ws-101)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const wsId = params.get('workshop');
      if (wsId) {
        setHighlightedWorkshopId(wsId);
        const match = allWorkshops.find((w) => w.id === wsId);
        if (match) {
          setSelectedWorkshopForModal(match);
          setTimeout(() => {
            const cardEl = document.getElementById(`workshop-card-${wsId}`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 350);
        }
      }
    } catch {}
  }, [allWorkshops]);

  const handleCopyWorkshopLink = async (ws: Workshop, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/?view=workshops&workshop=${ws.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedLinkMap((prev) => ({ ...prev, [ws.id]: true }));
      setTimeout(() => {
        setCopiedLinkMap((prev) => ({ ...prev, [ws.id]: false }));
      }, 2500);
      showToast('Workshop Link Copied!', `Share this link with fellow craft lovers: ${url}`, 'success');
    } catch {
      showToast('Link Ready', url);
    }
  };

  const handleBookSpot = async (ws: Workshop) => {
    if (!user.isLoggedIn) {
      requireAuthForAction({
        targetView: 'workshops',
        reason: 'workshop',
        productName: ws.title,
      });
      return;
    }

    if (isWorkshopBooked(ws.id)) {
      showToast('Seat Already Booked', `You already have a reserved seat for "${ws.title}". View in your profile.`);
      setActiveView('account');
      return;
    }

    await openRazorpayCheckout({
      amountInRupees: ws.price,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      description: `Workshop Spot: ${ws.title}`,
      notes: {
        workshopId: ws.id,
        creator: ws.creatorName,
      },
      onSuccess: (payment) => {
        bookWorkshop(ws, { paymentId: payment.razorpay_payment_id });
      },
      onDismiss: () => {
        showToast('Workshop Booking Paused', 'You can complete payment anytime.', 'info');
      },
      onError: (errMsg) => {
        showToast('Payment Failed', errMsg, 'error');
      },
    });
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Clean, direct title */}
        <div className="mb-8 border-b border-[#07545A]/10 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5 bg-[#FFF8EA] px-3 py-1 rounded-full border border-[#07545A]/10 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Creative Experiences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
            Artisan Craft Workshops
          </h1>
          <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-xl">
            Intimate hands-on workshops hosted by our featured makers. Discover craft firsthand.
          </p>
        </div>

        {/* ========================================================
            Static Workshop Listing Grid (No Moving Marquee)
            ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {allWorkshops.map((ws) => {
            const isHighlighted = highlightedWorkshopId === ws.id;
            const isCopied = Boolean(copiedLinkMap[ws.id]);
            return (
              <div
                key={ws.id}
                id={`workshop-card-${ws.id}`}
                className={`bg-[#FFF8EA] rounded-2xl sm:rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 ${
                  isHighlighted
                    ? 'border-[#07545A] ring-4 ring-[#F2A900] shadow-xl scale-[1.01]'
                    : 'border-[#07545A]/12 shadow-xs hover:shadow-lg'
                }`}
              >
                {/* Workshop Photo Frame */}
                <div
                  className="relative aspect-16/10 overflow-hidden bg-[#EADCC8] cursor-pointer"
                  onClick={() => setSelectedWorkshopForModal(ws)}
                >
                  <img
                    src={ws.image}
                    alt={ws.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Format Badge */}
                  <div className="absolute top-3 left-3 bg-[#FFF8EA]/95 backdrop-blur-xs text-[#07545A] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#07545A]/15 flex items-center gap-1 shadow-2xs">
                    {ws.format === 'Live Online' ? (
                      <>
                        <Video className="w-3 h-3 text-[#3F704B]" />
                        <span>Live Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3 text-[#E97868]" />
                        <span>{ws.location || 'Studio Offline'}</span>
                      </>
                    )}
                  </div>

                  {/* Seats Left Pill */}
                  <div className="absolute top-3 right-3 bg-[#07545A] text-[#FFF8EA] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    {ws.seatsLeft} seats left
                  </div>
                </div>

                {/* Minimal Text Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#687778] mb-1.5 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#07545A]" />
                          {ws.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#07545A]" />
                          {ws.duration}
                        </span>
                      </div>

                      {/* Share link button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyWorkshopLink(ws, e)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-[#07545A] hover:bg-[#07545A]/10 border-[#07545A]/20'
                        }`}
                        title="Copy link to invite friends"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <h2
                      onClick={() => setSelectedWorkshopForModal(ws)}
                      className="font-bold text-base text-[#173B3D] group-hover:text-[#07545A] transition-colors leading-snug font-display line-clamp-1 cursor-pointer"
                    >
                      {ws.title}
                    </h2>

                    <div className="text-xs text-[#07545A] font-semibold mt-1 truncate">
                      Hosted by {ws.creatorName}
                    </div>

                    <p className="text-xs text-[#173B3D]/70 line-clamp-2 mt-1.5 leading-relaxed">
                      {ws.description}
                    </p>
                  </div>

                  {/* Bottom Spot Fee & Book Action */}
                  <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#687778] uppercase font-medium block">Spot Fee</span>
                      <span className="text-base sm:text-lg font-bold text-[#07545A] tabular-nums font-display">
                        ₹{ws.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedWorkshopForModal(ws)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#07545A]/20 bg-white hover:bg-[#07545A]/10 text-[#07545A] text-xs font-semibold transition-all cursor-pointer"
                      >
                        Details
                      </button>

                      {isWorkshopBooked(ws.id) ? (
                        <button
                          onClick={() => {
                            setActiveView('account');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-[#FFF8EA] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title="You already have a reserved seat for this workshop. View details and meet link in your profile."
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F2A900]" />
                          <span>Booked ✓</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBookSpot(ws)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                          aria-label={`Book spot for ${ws.title}`}
                        >
                          <span>Book Spot</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BUYER WORKSHOP FULL DETAILS & BOOKING MODAL */}
      {selectedWorkshopForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FFFDF7] rounded-3xl border-2 border-[#07545A]/25 p-5 sm:p-7 max-w-xl w-full shadow-2xl my-8 space-y-4 text-xs max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#07545A]/10 gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F704B] bg-[#FFF8EA] px-2.5 py-0.5 rounded-full border border-[#07545A]/15 inline-flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-[#F2A900]" />
                  <span>{selectedWorkshopForModal.format} Experience</span>
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#07545A] font-display leading-snug">
                  {selectedWorkshopForModal.title}
                </h3>
                <p className="text-xs text-[#687778] mt-0.5">
                  Taught by artisan master <span className="font-semibold text-[#07545A]">{selectedWorkshopForModal.creatorName}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedWorkshopForModal(null)}
                className="p-1.5 text-[#173B3D]/60 hover:text-[#07545A] rounded-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="rounded-2xl overflow-hidden aspect-16/9 bg-stone-100 border border-[#07545A]/15 relative">
                <img
                  src={selectedWorkshopForModal.image}
                  alt={selectedWorkshopForModal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-[#07545A] text-[#FFF8EA] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {selectedWorkshopForModal.seatsLeft} seats remaining
                </div>
              </div>

              {/* Schedule Info Bar */}
              <div className="grid grid-cols-2 gap-3 bg-[#FFF8EA] p-3.5 rounded-2xl border border-[#07545A]/12">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#07545A]/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#07545A]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#687778] uppercase font-bold block">Date & Time</span>
                    <span className="font-bold text-[#07545A] text-xs">
                      {selectedWorkshopForModal.date}
                    </span>
                    <span className="text-[10px] text-[#173B3D]/70 block">{selectedWorkshopForModal.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#07545A]/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#07545A]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#687778] uppercase font-bold block">Duration</span>
                    <span className="font-bold text-[#07545A] text-xs">
                      {selectedWorkshopForModal.duration}
                    </span>
                    <span className="text-[10px] text-[#173B3D]/70 block">Interactive Live Session</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="font-bold text-[#07545A] block mb-1 text-xs">About this Workshop:</span>
                <p className="p-3.5 bg-white border border-[#07545A]/15 rounded-xl text-[#173B3D]/85 leading-relaxed text-xs select-text">
                  {selectedWorkshopForModal.description}
                </p>
              </div>

              {/* Materials & Guarantee */}
              <div className="p-3 bg-[#FFF8EA]/60 rounded-xl border border-[#07545A]/10 flex items-center gap-2.5 text-[11px] text-[#173B3D]/80">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>
                  All booking fees go directly to the artisan under Curowit's 70/30 creator-first model. Meeting credentials will appear in your patron dashboard.
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#687778] uppercase block">Workshop Fee</span>
                <span className="text-xl font-bold text-[#07545A] font-display">
                  ₹{selectedWorkshopForModal.price}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCopyWorkshopLink(selectedWorkshopForModal, e)}
                  className="px-3 py-2 bg-white text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/25 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                {isWorkshopBooked(selectedWorkshopForModal.id) ? (
                  <button
                    onClick={() => {
                      setSelectedWorkshopForModal(null);
                      setActiveView('account');
                    }}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-[#FFF8EA] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#F2A900]" />
                    <span>View In Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const ws = selectedWorkshopForModal;
                      setSelectedWorkshopForModal(null);
                      handleBookSpot(ws);
                    }}
                    className="px-5 py-2.5 bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
                  >
                    <span>Reserve Spot Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
