import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Truck,
  CreditCard,
  HeartHandshake,
  ChevronDown,
  CheckCircle2,
  Package,
  Layers,
  Search,
  Sliders,
  Award,
  Check,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  HelpCircle,
  FileText,
  AlertCircle,
  Sparkle,
  Compass,
  LogIn,
} from 'lucide-react';
import { CurowitLogo } from '../common/CurowitLogo';
import { foundingCreatorSyncService } from '../../lib/foundingCreatorSync';
import potteryArtisanImg from '../../assets/images/artisan_pottery_ceramic_1792071874114.jpg';
import crochetArtisanImg from '../../assets/images/artisan_crochet_yarn_1792071815219.jpg';
import candleArtisanImg from '../../assets/images/artisan_soy_candle_1792071897745.jpg';
import jewelleryArtisanImg from '../../assets/images/artisan_wire_jewellery_1792071924885.jpg';

interface FoundingCreatorLandingProps {
  onNavigate: (view: string) => void;
}

export const FoundingCreatorLanding: React.FC<FoundingCreatorLandingProps> = ({ onNavigate }) => {
  // Navigation & Lookups
  const [statusQuery, setStatusQuery] = useState('');
  const [searchedStatusResult, setSearchedStatusResult] = useState<any | null>(null);
  const [isSearchingStatus, setIsSearchingStatus] = useState(false);
  const [statusSearchError, setStatusSearchError] = useState('');

  // Interactive 70/30 Revenue Calculator State
  const [calcPrice, setCalcPrice] = useState<number>(1850);
  const [calcVolume, setCalcVolume] = useState<number>(30);
  const [calcCategory, setCalcCategory] = useState<string>('Ceramics & Stoneware');

  // Interactive Roadmap Step
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Craft Category Filter in Lookbook
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // FAQ Accordion & Search Filter
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<'all' | 'earnings' | 'logistics' | 'rights'>('all');

  // Calculation Math
  const grossMonthlySales = calcPrice * calcVolume;
  const creatorMonthlyTakeHome = Math.round(grossMonthlySales * 0.7);
  const platformCareShare = Math.round(grossMonthlySales * 0.3);
  const annualProjectedRevenue = creatorMonthlyTakeHome * 12;

  // Category Presets for Calculator
  const categoryPresets: Record<string, { price: number; volume: number; description: string }> = {
    'Ceramics & Stoneware': { price: 2200, volume: 25, description: 'Hand-thrown mugs, ramen bowls & reduction planters' },
    'Heirloom Crochet & Knits': { price: 1450, volume: 35, description: 'Botanical plushies, granny-square tote bags & cardigans' },
    'Studio Jewellery': { price: 1950, volume: 40, description: 'Polymer clay studs, brass wire weaves & baroque pearls' },
    'Soy Candle Atelier': { price: 850, volume: 60, description: 'Hand-poured coconut wax candles with dried floral rims' },
    'Original Art & Block Prints': { price: 3400, volume: 15, description: 'Botanical gouache prints, hand-carved woodblocks' },
  };

  const handleSelectPreset = (catName: string) => {
    setCalcCategory(catName);
    const preset = categoryPresets[catName];
    if (preset) {
      setCalcPrice(preset.price);
      setCalcVolume(preset.volume);
    }
  };

  // 8-Step Cohort Journey Data
  const roadmapSteps = [
    {
      num: '01',
      title: 'Artisan Application',
      headline: 'Register your studio in 4 minutes',
      timeframe: '5 minutes',
      summary: 'Provide your personal details, studio location, craft discipline, and photos or Instagram handle. No application charges or upfront onboarding fees.',
      deliverables: ['Studio details & bio', 'Primary craft category', 'Contact verification'],
      proTip: 'Share high-contrast natural light photos that show your making process.',
    },
    {
      num: '02',
      title: 'Portfolio & Store Documents',
      headline: 'Upload craft lookbook & certifications',
      timeframe: 'Instant sync',
      summary: 'Upload craft photographs, artisan cards, or studio credentials. All files are synchronized directly to our persistent secure document archive.',
      deliverables: ['High-res finished piece photos', 'Craft method verification', 'Optional GST / Artisan ID'],
      proTip: 'Independent hobbyists and student creators do not require GST registration.',
    },
    {
      num: '03',
      title: 'Slow-Craft Audit',
      headline: 'Authenticity & slow-craft review',
      timeframe: '24–48 hours SLA',
      summary: 'Our curation committee reviews your pieces for handmade integrity, non-industrial sourcing, and quality consistency.',
      deliverables: ['Authenticity review score', 'Curation feedback report', 'Cohort admission status'],
      proTip: 'We prioritize products with soul, tactile finish, and personal design language.',
    },
    {
      num: '04',
      title: 'Cohort Onboarding',
      headline: 'Unlock your Atelier Creator Portal',
      timeframe: 'Immediate upon approval',
      summary: 'Receive your verified Founding Creator badge, set your payout UPI or Bank Account details, and access real-time order tracking.',
      deliverables: ['Founding Creator Badge', 'Atelier Portal credentials', 'Commercial split lock-in'],
      proTip: 'Add your UPI ID or bank account details right away to ensure smooth settlements.',
    },
    {
      num: '05',
      title: 'Publish Product Catalog',
      headline: 'Showcase pieces on Curowit storefront',
      timeframe: 'Self-paced',
      summary: 'Create listings with preparation lead times, personalized options, and studio stories. Listings go live to mindful conscious patrons across India.',
      deliverables: ['Product spec sheets', 'Inventory counts', 'Lead time definition'],
      proTip: 'Highlight whether you accept personalized baby initials or custom colorways.',
    },
    {
      num: '06',
      title: 'Order Allocation & Alert',
      headline: 'Customer purchases trigger real-time alert',
      timeframe: 'Real-time push',
      summary: 'Receive order specifications, customer city, and dispatch deadlines immediately in your portal and email notifications.',
      deliverables: ['Customer order specifications', 'Dispatch target deadline', 'Order packing manifest'],
      proTip: 'Begin studio crafting immediately so you beat the preparation deadline.',
    },
    {
      num: '07',
      title: 'Plastic-Free Dispatch',
      headline: 'Pack with eco honeycomb & dispatch',
      timeframe: 'Within your lead time',
      summary: 'Package your creation in plastic-free paper honeycomb wrap and paper tape. Input courier AWB tracking to trigger automated buyer tracking.',
      deliverables: ['Courier AWB entry', 'Eco transit verification', 'Live parcel milestone tracking'],
      proTip: 'Include a handwritten artisan thank-you card to cultivate lifetime patrons.',
    },
    {
      num: '08',
      title: 'Guaranteed 7-Day Settlement',
      headline: 'Funds move to eligible balance post delivery',
      timeframe: '7 calendar days post delivery',
      summary: 'Once courier confirms delivery, funds mature in 7 days to cover transit dispute grace. Request instant payout directly to your UPI or Bank IMPS.',
      deliverables: ['70% net creator share', 'Settlement UTR confirmation', 'Downloadable earnings ledger'],
      proTip: 'View full transaction history with downloadable PDF invoices anytime.',
    },
  ];

  // Craft Lookbook Showcase Data
  const lookbookShowcase = [
    {
      id: 'c1',
      category: 'ceramics',
      title: 'Wabi-Sabi Stoneware Mug',
      artisan: 'Mitti & Fire Studio',
      location: 'Ahmedabad, Gujarat',
      price: '₹1,850',
      leadTime: '3-5 days',
      image: potteryArtisanImg,
      technique: 'Wheel-thrown & gas kiln fired at 1220°C',
    },
    {
      id: 'c2',
      category: 'crochet',
      title: 'Botanical Woodland Plushie',
      artisan: 'Studio Dhaga',
      location: 'Jaipur, Rajasthan',
      price: '₹1,250',
      leadTime: '2-4 days',
      image: crochetArtisanImg,
      technique: 'Vegetable-dyed organic cotton yarn',
    },
    {
      id: 'c3',
      category: 'jewellery',
      title: 'Raw Terracotta & Brass Drops',
      artisan: 'Ananya Studio',
      location: 'Pondicherry',
      price: '₹2,100',
      leadTime: '3 days',
      image: jewelleryArtisanImg,
      technique: 'Hand-sculpted clay with hypoallergenic wire',
    },
    {
      id: 'c4',
      category: 'candles',
      title: 'Wild Jasmine & Marigold Soy Jar',
      artisan: 'Scent & Petal Atelier',
      location: 'Dehradun, Uttarakhand',
      price: '₹950',
      leadTime: '2 days',
      image: candleArtisanImg,
      technique: 'Hand-poured 100% natural soy with wooden wick',
    },
    {
      id: 'c5',
      category: 'art',
      title: 'Monsoon Foliage Gouache Study',
      artisan: 'Kala Vriksha',
      location: 'Kochi, Kerala',
      price: '₹3,200',
      leadTime: '4 days',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=700&q=80',
      technique: 'Heavyweight archival handmade paper',
    },
    {
      id: 'c6',
      category: 'textiles',
      title: 'Heritage Indigo Canvas Tote',
      artisan: 'Bagh Weaves',
      location: 'Dhar, Madhya Pradesh',
      price: '₹1,650',
      leadTime: '3 days',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80',
      technique: 'Traditional wooden block resist printing',
    },
  ];

  const filteredLookbook = useMemo(() => {
    if (activeCategoryFilter === 'all') return lookbookShowcase;
    return lookbookShowcase.filter((item) => item.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // Frequently Asked Questions
  const allFaqs = [
    {
      q: 'Who is eligible to become a Founding Creator?',
      a: 'We welcome independent artisans, hobbyists, students, small craft studios, and traditional makers based in India who design and handcraft their own pieces. Mass-produced, drop-shipped, or imported plastic goods are strictly ineligible.',
      category: 'rights',
    },
    {
      q: 'What is the commercial model and commission split?',
      a: 'The Founding Creator program offers a clear 70/30 commercial split: 70% of the item selling price goes directly to you. Curowit’s 30% platform commission covers zero-ad buyer discovery, payment processing fees, customer support, and packaging standards.',
      category: 'earnings',
    },
    {
      q: 'How does the 7-day post-delivery settlement rule work?',
      a: 'Following courier delivery confirmation, an order item enters a 7 calendar-day inspection and transit grace period. On day 7, the net amount is moved to your Eligible Balance. You can request a payout anytime directly to your UPI ID or Bank Account.',
      category: 'earnings',
    },
    {
      q: 'Do I need GST registration to sell on Curowit?',
      a: 'No! Sole individual artisans, student makers, and home craft studios generating under the statutory GST threshold do not require GST registration to join the Founding Creator cohort and list handmade products.',
      category: 'earnings',
    },
    {
      q: 'Who handles shipping, packaging, and courier pickup?',
      a: 'Creators package their own products using Curowit’s standardized plastic-free guidelines (paper honeycomb wrap and corrugated kraft boxes). You can dispatch via your preferred courier partner (Delhivery, Bluedart, DTDC, India Post) and enter tracking into your dashboard.',
      category: 'logistics',
    },
    {
      q: 'Can I sell custom or personalized creations?',
      a: 'Yes! You can specify made-to-order preparation lead times (e.g. 3–5 days or 1–2 weeks) and define custom fields (such as embroidered names, baby initials, or personalized inscriptions) directly on your listings.',
      category: 'rights',
    },
    {
      q: 'Do I keep intellectual property ownership of my designs?',
      a: '100% yes. You retain full copyright and intellectual property rights over your artwork, studio name, designs, and brand voice. Curowit never claims exclusivity or ownership over your creative output.',
      category: 'rights',
    },
  ];

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((f) => {
      const matchesSearch =
        f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        f.a.toLowerCase().includes(faqSearchQuery.toLowerCase());
      const matchesCategory =
        faqCategoryFilter === 'all' || f.category === faqCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [faqSearchQuery, faqCategoryFilter]);

  // Live Application Reference Check
  const handleLiveStatusLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusQuery.trim()) return;

    setIsSearchingStatus(true);
    setStatusSearchError('');
    setSearchedStatusResult(null);

    try {
      const app = await foundingCreatorSyncService.fetchCreatorApplication(statusQuery.trim());
      if (app) {
        setSearchedStatusResult(app);
      } else {
        setStatusSearchError('No application found with this reference code or email address.');
      }
    } catch {
      setStatusSearchError('Unable to query database. Please verify your reference ID.');
    } finally {
      setIsSearchingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#192B2C] selection:bg-[#07545A] selection:text-[#FFF8EA] w-full max-w-full overflow-x-hidden">
      {/* =========================================================================
          PROGRAM HEADER (STANDALONE CLEAN PORTAL BRANDING)
          ========================================================================= */}
      <header className="border-b border-[#07545A]/12 bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
          {/* Brand Logo & Store Return Link */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => onNavigate('home')}
              className="cursor-pointer hover:opacity-85 transition-opacity shrink-0 flex items-center"
              title="Return to Curowit Storefront"
            >
              <CurowitLogo variant="horizontal" size="md" responsiveTagline />
            </button>
            <span className="hidden sm:inline-block text-[#07545A]/30">·</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-[#07474C] tracking-wider uppercase font-sans">
              Founding Creator Atelier
            </span>
            <button
              onClick={() => onNavigate('home')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#07474C] bg-[#07545A]/8 hover:bg-[#07545A]/15 border border-[#07545A]/15 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 ml-1"
              title="Return to Curowit Storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          </div>

          {/* Action Buttons: Desktop shows Login & Apply. Mobile view shows ONLY the Apply button to eliminate crowding and side sliding */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Track Application: Hidden on mobile, visible on desktop */}
            <button
              onClick={() => {
                const element = document.getElementById('status-tracker-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold text-[#192B2C]/75 hover:text-[#07474C] transition-colors cursor-pointer hidden md:inline-flex items-center gap-1.5 px-3 py-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Application</span>
            </button>

            {/* Login Button: Hidden on mobile (< sm), visible on sm and up */}
            <button
              onClick={() => onNavigate('foundingcreator-login')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-[#07474C] border border-[#07545A]/25 hover:bg-[#07545A]/8 transition-colors cursor-pointer shrink-0"
              title="Creator Login"
            >
              <LogIn className="w-3.5 h-3.5 text-[#07545A]" />
              <span>Log in as Artisan</span>
            </button>

            {/* Apply Button: ONLY button visible on mobile view */}
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-[#07545A] hover:bg-[#053B40] text-[#FFF8EA] text-xs font-semibold shadow-[0_2px_8px_-1px_rgba(7,84,90,0.25)] hover:shadow-[0_4px_14px_-2px_rgba(7,84,90,0.35)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <span>Apply<span className="hidden sm:inline"> for Cohort</span></span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO EDITORIAL SHOWCASE (WARM, AUTHENTIC, IMPACTFUL)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-18 lg:pt-20 lg:pb-24 border-b border-[#07545A]/10 bg-gradient-to-b from-[#F5EFE6] via-[#FAF7F2] to-[#FAF7F2] w-full max-w-full">
        {/* Ambient Radiant Warm Glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-[900px] h-[450px] opacity-60 z-0 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(245, 158, 11, 0.14), rgba(7, 84, 90, 0.08) 50%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        {/* Tactile Handcrafted Stippled Paper Grain Texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-30 mix-blend-multiply"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(23, 59, 61, 0.18) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* Artisanal Heritage Drafting Lines & Potter's Wheel Geometry */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-25 select-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Top subtle horizontal guideline */}
          <line x1="0" y1="24" x2="100%" y2="24" stroke="#07545A" strokeWidth="0.75" strokeDasharray="3 6" strokeOpacity="0.5" />
          
          {/* Potter's wheel concentric lathe rings */}
          <circle cx="88%" cy="160" r="110" fill="none" stroke="#07545A" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.4" />
          <circle cx="88%" cy="160" r="145" fill="none" stroke="#D4A373" strokeWidth="0.8" strokeDasharray="6 6" strokeOpacity="0.5" />
          <circle cx="88%" cy="160" r="185" fill="none" stroke="#07545A" strokeWidth="0.6" strokeDasharray="1 5" strokeOpacity="0.3" />

          {/* Weaver's warp cross-guide on left */}
          <line x1="8%" y1="0" x2="8%" y2="100%" stroke="#07545A" strokeWidth="0.5" strokeDasharray="4 8" strokeOpacity="0.25" />
          <line x1="2%" y1="85%" x2="40%" y2="85%" stroke="#D4A373" strokeWidth="0.75" strokeDasharray="5 7" strokeOpacity="0.3" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#07474C] tracking-wide">
                <span>Artisan Atelier Cohort 2026</span>
                <span aria-hidden="true" className="text-[#D4A373]">·</span>
                <span>Handmade Independence</span>
                <span aria-hidden="true" className="text-[#D4A373]">·</span>
                <span>Guaranteed 70/30 Model</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-semibold text-[#07474C] font-display tracking-tight leading-[1.14]">
                Your Craft Deserves{' '}
                <span className="font-serif italic font-normal text-[#B45309]">
                  True Patrons
                </span>
                , Not Algorithmic Advertising Taxes.
              </h1>

              <p className="text-base sm:text-lg text-[#233837] leading-relaxed max-w-2xl font-normal">
                Join India’s premier slow-craft atelier marketplace. You retain 100% design ownership,
                receive a dedicated brand storefront, and earn a transparent 70% direct share with automated
                7-day settlements post delivery.
              </p>

              {/* Action Buttons: Apply, Login, Simulate */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('foundingcreator-apply')}
                  className="px-7 py-3.5 rounded-2xl bg-[#07545A] hover:bg-[#053B40] text-[#FFF8EA] font-semibold text-sm shadow-[0_4px_16px_-2px_rgba(7,84,90,0.3)] hover:shadow-[0_8px_24px_-4px_rgba(7,84,90,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-[0.99]"
                >
                  <span>Apply for Founding Creator Cohort</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Primary Login Option on Founding Page */}
                <button
                  onClick={() => onNavigate('foundingcreator-login')}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FCFBF8] text-[#07474C] border border-[#07545A]/25 hover:border-[#07545A]/50 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
                  title="Artisan & Creator Portal Login"
                >
                  <LogIn className="w-4 h-4 text-[#07545A]" />
                  <span>Artisan Portal Login</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('calculator-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-[#07545A]/5 hover:bg-[#07545A]/10 text-[#07474C] border border-[#07545A]/15 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#07545A]" />
                  <span>Simulate 70% Earnings</span>
                </button>
              </div>

              {/* Dedicated High-Visibility Artisan Login Banner */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF7] border border-[#07545A]/15 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#07545A]/10 flex items-center justify-center text-[#07545A] shrink-0">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#07474C]">Already an approved Founding Creator?</p>
                    <p className="text-[11px] text-[#233837]/75">Access your orders, product catalog, and weekly payouts</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('foundingcreator-login')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#07545A] hover:bg-[#053B40] text-[#FFF8EA] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0 active:scale-95"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Program Guarantees */}
              <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-[#233837]/80 border-t border-[#07545A]/10">
                <div className="flex items-center gap-1.5 font-medium text-[#07474C]">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Zero Upfront Listing Fees</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[#07474C]">
                  <CreditCard className="w-4 h-4 text-[#07545A]" />
                  <span>7-Day Payout SLA</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[#07474C]">
                  <Truck className="w-4 h-4 text-[#C86D51]" />
                  <span>Plastic-Free Eco Packaging</span>
                </div>
              </div>
            </div>

            {/* Right Visual Collage with Real Crafts */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-3.5">
                    <div className="overflow-hidden rounded-3xl shadow-sm border border-[#07545A]/12 group relative bg-[#F5EFE6]">
                      <img
                        src={potteryArtisanImg}
                        alt="Aarav Patel Handcrafted Pottery Studio"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-3.5 text-white text-[11px]">
                        <div>
                          <p className="font-semibold text-white">Aarav Patel · Pottery</p>
                          <p className="text-white/80 text-[10px]">Ahmedabad Studio</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl shadow-sm border border-[#07545A]/12 group relative bg-[#F5EFE6]">
                      <img
                        src={crochetArtisanImg}
                        alt="Meera Sharma Botanical Crochet & Handwoven Crafts"
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-3.5 text-white text-[11px]">
                        <div>
                          <p className="font-semibold text-white">Meera Sharma · Crochet</p>
                          <p className="text-white/80 text-[10px]">Jaipur Studio</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-6">
                    <div className="overflow-hidden rounded-3xl shadow-sm border border-[#07545A]/12 group relative bg-[#F5EFE6]">
                      <img
                        src={candleArtisanImg}
                        alt="Divya K. Soy Wax Candle Atelier"
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-3.5 text-white text-[11px]">
                        <div>
                          <p className="font-semibold text-white">Divya K. · Soy Atelier</p>
                          <p className="text-white/80 text-[10px]">Dehradun, UK</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl shadow-sm border border-[#07545A]/12 group relative bg-[#F5EFE6]">
                      <img
                        src={jewelleryArtisanImg}
                        alt="Tara Sen Handcrafted Silver & Pearl Jewellery"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-3.5 text-white text-[11px]">
                        <div>
                          <p className="font-semibold text-white">Tara Sen · Silver Wire</p>
                          <p className="text-white/80 text-[10px]">Pondicherry</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Badge */}
                <div className="absolute -bottom-5 left-4 right-4 bg-white/95 backdrop-blur-md border border-[#07545A]/15 shadow-[0_12px_28px_-6px_rgba(7,84,90,0.15)] rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#07474C] block font-sans">
                      Direct Creator Share
                    </span>
                    <span className="text-2xl font-semibold font-display text-[#07474C] tabular-nums">
                      70% Net Payout
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#233837]/70 block font-medium">Settlement SLA</span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full inline-block">
                      Day 7 Post Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. INTERACTIVE 70/30 REVENUE & SETTLEMENT CALCULATOR
          ========================================================================= */}
      <section id="calculator-section" className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-gradient-to-b from-[#FAF7F2] via-[#F4ECE1]/40 to-[#FAF7F2] relative overflow-hidden">
        {/* Subtle Ambient Light Spot */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] opacity-40 z-0 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.1) 0%, rgba(7, 84, 90, 0.05) 50%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        {/* Blueprint guidelines */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-20 select-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="12%" cy="60%" r="180" fill="none" stroke="#07545A" strokeWidth="0.8" strokeDasharray="3 6" strokeOpacity="0.4" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#07545A" strokeWidth="0.5" strokeDasharray="6 8" strokeOpacity="0.25" />
        </svg>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#07474C] bg-[#07545A]/8 border border-[#07545A]/12 px-3.5 py-1 rounded-full inline-block font-sans">
              Interactive Revenue Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#07474C] font-display mt-3 mb-2 tracking-tight">
              Calculate Your Real Creator Take-Home
            </h2>
            <p className="text-xs sm:text-sm text-[#233837]/75 font-normal max-w-lg mx-auto">
              No hidden listing fees, no pay-to-play shelf taxes. Slide your crafted piece pricing and monthly volume
              to preview guaranteed earnings.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-white/95 rounded-3xl border border-[#07545A]/15 shadow-[0_12px_32px_-6px_rgba(7,84,90,0.08)] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center backdrop-blur-xs">
            {/* Left Inputs Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Quick Presets */}
              <div>
                <label className="text-xs font-semibold text-[#07474C] block mb-2.5 font-sans">
                  Select Your Craft Medium Benchmark:
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(categoryPresets).map((catName) => {
                    const isSelected = calcCategory === catName;
                    return (
                      <button
                        key={catName}
                        onClick={() => handleSelectPreset(catName)}
                        className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#07545A] text-[#FFF8EA] shadow-xs font-semibold'
                            : 'bg-[#F5EFE6] text-[#07474C] hover:bg-[#07545A]/10 border border-[#07545A]/12'
                        }`}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider 1: Average Selling Price */}
              <div className="space-y-2 bg-[#F9F6F0] p-4.5 rounded-2xl border border-[#07545A]/10">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#07474C]">Average Piece Retail Price</span>
                  <span className="text-lg text-[#07474C] font-display font-semibold tabular-nums">
                    ₹{calcPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={12000}
                  step={50}
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="w-full accent-[#07545A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#233837]/60 tabular-nums">
                  <span>₹400 (Small Keepsake)</span>
                  <span>₹5,000</span>
                  <span>₹12,000 (Heirloom Masterpiece)</span>
                </div>
              </div>

              {/* Slider 2: Monthly Output Volume */}
              <div className="space-y-2 bg-[#F9F6F0] p-4.5 rounded-2xl border border-[#07545A]/10">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#07474C]">Estimated Monthly Handmade Sales</span>
                  <span className="text-lg text-[#07474C] font-display font-semibold tabular-nums">
                    {calcVolume} Orders / mo
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={150}
                  step={5}
                  value={calcVolume}
                  onChange={(e) => setCalcVolume(Number(e.target.value))}
                  className="w-full accent-[#07545A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#233837]/60">
                  <span>5 pieces (Weekend Studio)</span>
                  <span>50 pieces</span>
                  <span>150 pieces (Full Atelier)</span>
                </div>
              </div>

              {/* Real-time comparison note */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#07545A]/12 text-[11px] text-[#233837]/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#07474C]">The Curowit Difference:</strong> Traditional ecommerce platforms charge 35–50% in blended commissions, paid ads, and packaging fees. With Curowit, your 70% share is protected and guaranteed.
                </span>
              </div>
            </div>

            {/* Right Output Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#07474C] via-[#053A3E] to-[#022124] text-[#FFF8EA] p-6 sm:p-8 rounded-3xl shadow-[0_16px_36px_-6px_rgba(7,84,90,0.35)] border border-amber-400/20 space-y-6 relative overflow-hidden">
              {/* Subtle top right golden ambient halo */}
              <div
                className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-400/15 blur-2xl"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F59E0B] block mb-1 font-sans">
                  Your Net Projected Revenue
                </span>
                <div className="text-3xl sm:text-4xl font-semibold font-display text-white tracking-tight tabular-nums">
                  ₹{creatorMonthlyTakeHome.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-[#FFF8EA]/75 block mt-1 font-sans">per month (Direct 70% Share)</span>
                </div>
              </div>

              <div className="relative z-10 divide-y divide-white/10 text-xs space-y-3 pt-2">
                <div className="flex justify-between pt-3">
                  <span className="text-[#FFF8EA]/75">Total Customer GMV:</span>
                  <span className="font-semibold tabular-nums">₹{grossMonthlySales.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-[#FFF8EA]/75">Curowit Platform Care (30%):</span>
                  <span className="font-semibold text-[#F59E0B] tabular-nums">₹{platformCareShare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-[#FFF8EA]/75">Annual Creator Earnings:</span>
                  <span className="font-semibold text-emerald-300 tabular-nums">₹{annualProjectedRevenue.toLocaleString('en-IN')} / yr</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-[#FFF8EA]/75">Settlement Window:</span>
                  <span className="font-semibold text-white">7 Calendar Days post delivery</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('foundingcreator-apply')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#192827] text-xs font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 relative z-10 active:scale-[0.99]"
              >
                <span>Apply to Lock-in 70% Commercial Split</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE 8-STEP COHORT ROADMAP
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-[#FAF7F2] relative overflow-hidden">
        {/* Subtle lathe rings background */}
        <svg
          className="pointer-events-none absolute right-0 top-0 h-full w-96 opacity-15 select-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="280" cy="180" r="160" fill="none" stroke="#07545A" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx="280" cy="180" r="220" fill="none" stroke="#D4A373" strokeWidth="0.8" strokeDasharray="5 7" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#07474C] bg-[#07545A]/8 border border-[#07545A]/12 px-3.5 py-1 rounded-full inline-block font-sans">
              Transparent Maker Journey
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#07474C] font-display mt-3 mb-2 tracking-tight">
              The 8-Step Path to 7-Day Settlement
            </h2>
            <p className="text-xs sm:text-sm text-[#233837]/75 max-w-lg mx-auto">
              Click any step to inspect the audit checklist, turnaround SLA, and dashboard workflow.
            </p>
          </div>

          {/* Stepper Interactive Tab Bar */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-8">
            {roadmapSteps.map((st, idx) => {
              const isSelected = activeStepIndex === idx;
              return (
                <button
                  key={st.num}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-3 rounded-2xl text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#07545A] text-[#FFF8EA] border-[#07545A] shadow-md -translate-y-1'
                      : 'bg-white hover:bg-[#FAF6EE] text-[#192B2C] border-[#07545A]/14 shadow-2xs'
                  }`}
                >
                  <span className="text-[10px] uppercase font-medium block opacity-75 font-sans">Step</span>
                  <span className="text-lg font-semibold font-display block tabular-nums">{st.num}</span>
                  <span className="text-[10px] font-medium truncate block mt-0.5">{st.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Deep-Dive Card */}
          {(() => {
            const current = roadmapSteps[activeStepIndex];
            return (
              <div className="bg-white/95 rounded-3xl border border-[#07545A]/15 p-6 sm:p-10 shadow-[0_8px_24px_-4px_rgba(7,84,90,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in-50 duration-200">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#07474C]">
                    <span className="bg-[#FAF6EE] border border-[#07545A]/14 px-3 py-1 rounded-full">
                      Step {current.num} of 08
                    </span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{current.timeframe}</span>
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold font-display text-[#07474C] tracking-tight">
                    {current.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#233837]/80 leading-relaxed">
                    {current.summary}
                  </p>

                  <div className="pt-2">
                    <span className="text-xs font-semibold text-[#07474C] block mb-2 font-sans">
                      Key Deliverables & Verification:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {current.deliverables.map((deliv, i) => (
                        <div
                          key={i}
                          className="bg-[#FAF7F2] border border-[#07545A]/12 p-2.5 rounded-xl text-xs flex items-center gap-2"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="font-medium text-[#192B2C]">{deliv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pro-Tip Box */}
                <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] border border-[#D4A373]/40 p-6 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#07474C]">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                    <span>Curator’s Pro-Tip for Artisans:</span>
                  </div>
                  <p className="text-xs text-[#233837]/85 leading-relaxed font-serif italic text-sm">
                    "{current.proTip}"
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveStepIndex((prev) => (prev + 1) % roadmapSteps.length)}
                      className="text-[#07474C] font-semibold hover:underline cursor-pointer"
                    >
                      Next Step: {roadmapSteps[(activeStepIndex + 1) % roadmapSteps.length].title} →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* =========================================================================
          6. INTERACTIVE CRAFT CATEGORIES LOOKBOOK
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-gradient-to-b from-[#FAF7F2] to-[#F5EFE6]/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#07474C] bg-[#07545A]/8 border border-[#07545A]/12 px-3 py-1 rounded-full inline-block font-sans">
                Craft Disciplines
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#07474C] font-display mt-2 tracking-tight">
                Handmade & Atelier Lookbook
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Disciplines' },
                { id: 'ceramics', label: 'Ceramics' },
                { id: 'crochet', label: 'Crochet & Yarn' },
                { id: 'jewellery', label: 'Jewellery' },
                { id: 'candles', label: 'Soy Candles' },
                { id: 'art', label: 'Art Prints' },
                { id: 'textiles', label: 'Textiles' },
              ].map((f) => {
                const isActive = activeCategoryFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveCategoryFilter(f.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#07545A] text-[#FFF8EA] shadow-xs font-semibold'
                        : 'bg-white text-[#07474C] hover:bg-[#FAF6EE] border border-[#07545A]/12'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lookbook Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLookbook.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#07545A]/12 overflow-hidden shadow-[0_4px_16px_-2px_rgba(7,84,90,0.06)] hover:shadow-[0_12px_28px_-4px_rgba(7,84,90,0.12)] transition-all group flex flex-col justify-between hover:border-[#07545A]/25"
              >
                <div>
                  <div className="h-60 overflow-hidden relative bg-stone-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3.5 right-3.5 text-[10px] font-semibold text-[#07474C] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#07545A]/10 shadow-2xs font-sans">
                      {item.leadTime}
                    </span>
                  </div>

                  <div className="p-5.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#07474C]/80 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#07545A]" />
                      <span>{item.location}</span>
                    </div>

                    <h3 className="font-semibold text-lg text-[#07474C] font-display tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-[#233837]/75">
                      By {item.artisan}
                    </p>
                    <p className="text-[11px] text-[#233837]/70 italic font-serif">
                      Technique: {item.technique}
                    </p>
                  </div>
                </div>

                <div className="p-5.5 pt-0 border-t border-[#07545A]/10 mt-2 flex items-center justify-between">
                  <span className="text-lg font-semibold font-display text-[#07474C] tabular-nums">
                    {item.price}
                  </span>
                  <button
                    onClick={() => onNavigate('foundingcreator-apply')}
                    className="text-xs font-semibold text-[#07474C] hover:text-[#B45309] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <span>Sell Similar Craft →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. LIVE STATUS QUERY & DATABASE SYNC PANEL
          ========================================================================= */}
      <section id="status-tracker-section" className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-gradient-to-b from-[#F5EFE6]/70 via-[#FAF7F2] to-[#FAF7F2] relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#07474C] bg-[#07545A]/8 border border-[#07545A]/12 px-3.5 py-1 rounded-full inline-block font-sans">
            Real-Time Database Query
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#07474C] font-display tracking-tight">
            Check Your Application Status
          </h2>
          <p className="text-xs sm:text-sm text-[#233837]/75 max-w-lg mx-auto font-normal">
            Already submitted your artisan profile? Enter your application reference ID or email to check real-time audit progress.
          </p>

          <form onSubmit={handleLiveStatusLookup} className="max-w-md mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233837]/45" />
              <input
                type="text"
                required
                value={statusQuery}
                onChange={(e) => setStatusQuery(e.target.value)}
                placeholder="APP-FC-XXXXX or your email..."
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border border-[#07545A]/20 rounded-xl outline-none focus:border-[#07545A] focus:ring-1 focus:ring-[#07545A]/20 transition-all shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingStatus}
              className="px-5 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#053B40] text-[#FFF8EA] text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-xs active:scale-[0.98]"
            >
              {isSearchingStatus ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {/* Quick Login Helper in Status Section */}
          <div className="text-xs text-[#233837]/75 flex items-center justify-center gap-1.5 flex-wrap">
            <span>Already have an active artisan account?</span>
            <button
              onClick={() => onNavigate('foundingcreator-login')}
              className="font-bold text-[#07545A] hover:text-[#B45309] hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In to Artisan Dashboard →</span>
            </button>
          </div>

          {statusSearchError && (
            <div className="p-3 bg-amber-50 border border-amber-200/80 text-amber-900 text-xs rounded-xl max-w-md mx-auto flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>{statusSearchError}</span>
            </div>
          )}

          {searchedStatusResult && (
            <div className="p-6 bg-white border border-[#07545A]/15 rounded-3xl max-w-lg mx-auto text-left space-y-3 shadow-md animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#687778] uppercase block font-sans">
                    Applicant Name
                  </span>
                  <span className="text-sm font-semibold text-[#07474C]">
                    {searchedStatusResult.applicantName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase font-sans ${
                    searchedStatusResult.applicationStatus === 'approved'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : searchedStatusResult.applicationStatus === 'rejected'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {searchedStatusResult.applicationStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-[#233837]/80 space-y-1">
                <p><strong>Application ID:</strong> <span className="font-mono">{searchedStatusResult.applicationId}</span></p>
                <p><strong>Craft Discipline:</strong> {searchedStatusResult.categories?.join(', ')}</p>
                <p><strong>Submitted:</strong> {new Date(searchedStatusResult.submittedAt).toLocaleDateString('en-GB')}</p>
              </div>

              <div className="pt-2 border-t border-[#07545A]/10 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`foundingcreator-status?id=${encodeURIComponent(searchedStatusResult.applicationId)}`)}
                  className="text-xs font-semibold text-[#07474C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Status Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          8. FREQUENTLY ASKED QUESTIONS WITH SEARCH
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#07474C] bg-[#07545A]/8 border border-[#07545A]/12 px-3.5 py-1 rounded-full inline-block font-sans mb-2">
              Artisan Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#07474C] font-display tracking-tight mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#233837]/75 max-w-md mx-auto">
              Clear policies on revenue splits, 7-day payouts, intellectual property, and shipping logistics.
            </p>
          </div>

          {/* FAQ Search & Category Filter */}
          <div className="mb-8 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#233837]/45" />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. GST, Payout, Packaging, Customization)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#07545A]/20 rounded-2xl outline-none focus:border-[#07545A] focus:ring-1 focus:ring-[#07545A]/20 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All Topics' },
                { id: 'earnings', label: '70% Earnings & Settlements' },
                { id: 'logistics', label: 'Eco Packaging & Shipping' },
                { id: 'rights', label: 'Artisan Rights & GST' },
              ].map((fc) => (
                <button
                  key={fc.id}
                  onClick={() => setFaqCategoryFilter(fc.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-medium cursor-pointer transition-colors ${
                    faqCategoryFilter === fc.id
                      ? 'bg-[#07545A] text-[#FFF8EA] font-semibold'
                      : 'bg-white text-[#192B2C] border border-[#07545A]/14 hover:bg-[#FAF6EE]'
                  }`}
                >
                  {fc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#07545A]/14 overflow-hidden transition-all shadow-2xs hover:border-[#07545A]/25"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4.5 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#07474C] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#07545A] transition-transform shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#233837]/80 leading-relaxed border-t border-[#07545A]/10 bg-[#FAF7F2]/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. BOTTOM IMPACT CTA BANNER
          ========================================================================= */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-[#07474C] via-[#05383D] to-[#021F22] text-[#FFF8EA] text-center px-4 relative overflow-hidden">
        {/* Radiant Ambient Warm Golden Flare */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-50"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245, 158, 11, 0.18), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Blueprint Lines in Dark Background */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-15 select-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="50%" cy="100%" r="320" fill="none" stroke="#FFF8EA" strokeWidth="0.8" strokeDasharray="4 8" />
          <circle cx="50%" cy="100%" r="420" fill="none" stroke="#F59E0B" strokeWidth="0.6" strokeDasharray="6 10" />
        </svg>

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 border border-white/15 px-3.5 py-1 rounded-full text-[#F59E0B] inline-block font-sans">
            Limited Admissions · Cohort 2026
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-display tracking-tight leading-tight">
            Ready to Share Your Slow Craft with Conscious Patrons?
          </h2>
          <p className="text-sm sm:text-base text-[#FAF6EE]/80 leading-relaxed max-w-xl mx-auto font-normal">
            Submit your application in less than 5 minutes. No upfront fees, zero algorithmic ad taxes,
            and guaranteed 7-day post-delivery settlements.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-[#192827] font-semibold text-sm shadow-[0_8px_24px_-4px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-[0.99]"
            >
              Apply to Join Founding Creator Cohort →
            </button>
            <button
              onClick={() => onNavigate('foundingcreator-login')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/18 text-[#FFF8EA] border border-white/20 font-semibold text-sm transition-all cursor-pointer"
            >
              Artisan Atelier Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
