import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
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
} from 'lucide-react';
import { CurowitLogo } from '../common/CurowitLogo';
import { foundingCreatorSyncService } from '../../lib/foundingCreatorSync';

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
      summary: 'Upload craft photographs, artisan cards, or studio credentials. All files are synchronized directly to our persistent Supabase document archive.',
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
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&q=80',
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
      image: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=700&q=80',
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
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80',
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
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80',
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
    <div className="min-h-screen bg-[#FFFDF7] text-[#173B3D] selection:bg-[#07545A] selection:text-[#FFF8EA]">
      {/* =========================================================================
          1. COHORT ADMISSION LIVE NOTIFICATION STRIP
          ========================================================================= */}
      <div className="bg-[#07545A] text-[#FFF8EA] text-xs py-2 px-4 border-b border-[#063F45]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium">
              Founding Creator Cohort 2026 Admissions Active:
            </span>
            <span className="text-[#F2A900] font-bold">
              118 of 150 Master Artisan Seats Claimed
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline text-[#FFF8EA]/70">
              Avg. Review Turnaround: 28 hrs · 7-Day Settlement SLA
            </span>
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="text-[#F2A900] font-bold underline hover:text-white transition-colors cursor-pointer"
            >
              Apply in 5 mins →
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. PROGRAM HEADER (STANDALONE CLEAN PORTAL BRANDING)
          ========================================================================= */}
      <header className="border-b border-[#07545A]/10 bg-[#FFFDF7]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="cursor-pointer hover:opacity-85 transition-opacity"
              title="Return to Curowit Storefront"
            >
              <CurowitLogo variant="horizontal" size="md" responsiveTagline />
            </button>
            <span className="hidden sm:inline-block text-[#07545A]/30">·</span>
            <span className="hidden sm:inline-block text-xs font-bold text-[#07545A] tracking-wide uppercase">
              Founding Creator Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                const element = document.getElementById('status-tracker-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-[#173B3D]/70 hover:text-[#07545A] transition-colors cursor-pointer hidden md:inline-flex items-center gap-1.5 px-3 py-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Application</span>
            </button>

            <button
              onClick={() => onNavigate('foundingcreator-login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#07545A] border border-[#07545A]/20 hover:bg-[#07545A]/5 transition-colors cursor-pointer"
            >
              Artisan Login
            </button>

            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Apply for Cohort</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3. HERO EDITORIAL SHOWCASE (WARM, AUTHENTIC, IMPACTFUL)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#07545A]/10 bg-gradient-to-b from-[#FFF8EA]/50 via-[#FFFDF7] to-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#07545A]">
                <span>Artisan Atelier Cohort 2026</span>
                <span aria-hidden="true">·</span>
                <span>Handmade Independence</span>
                <span aria-hidden="true">·</span>
                <span>Guaranteed 70/30 Model</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#07545A] font-display tracking-tight leading-[1.12]">
                Your Craft Deserves True Patrons, Not Algorithmic Advertising Taxes.
              </h1>

              <p className="text-base sm:text-lg text-[#173B3D]/80 leading-relaxed max-w-2xl">
                Join India’s premier slow-craft atelier marketplace. You retain 100% design ownership,
                receive a dedicated brand storefront, and earn a transparent 70% direct share with automated
                7-day settlements post delivery.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('foundingcreator-apply')}
                  className="px-7 py-3.5 rounded-2xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Apply for Founding Creator Cohort</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('calculator-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFF8EA] text-[#07545A] border-2 border-[#07545A]/20 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#07545A]" />
                  <span>Simulate 70% Earnings</span>
                </button>
              </div>

              {/* Live Program Guarantees */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[#173B3D]/70 border-t border-[#07545A]/10">
                <div className="flex items-center gap-1.5 font-semibold text-[#07545A]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Zero Upfront Listing Fees</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-[#07545A]">
                  <CreditCard className="w-4 h-4 text-[#07545A]" />
                  <span>7-Day Payout SLA</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-[#07545A]">
                  <Truck className="w-4 h-4 text-[#E97868]" />
                  <span>Plastic-Free Eco Packaging</span>
                </div>
              </div>
            </div>

            {/* Right Visual Collage with Real Crafts */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-3.5">
                    <div className="overflow-hidden rounded-3xl shadow-sm border border-[#07545A]/10 group relative">
                      <img
                        src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80"
                        alt="Pottery Studio"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white text-[11px]">
                        <div>
                          <p className="font-bold">Aarav Patel · Pottery</p>
                          <p className="opacity-80">Ahmedabad Studio</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl shadow-sm border border-[#07545A]/10 group relative">
                      <img
                        src="https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=600&q=80"
                        alt="Textile Weaving"
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white text-[11px]">
                        <div>
                          <p className="font-bold">Meera Sharma · Crochet</p>
                          <p className="opacity-80">Jaipur Studio</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-6">
                    <div className="overflow-hidden rounded-3xl shadow-sm border border-[#07545A]/10 group relative">
                      <img
                        src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
                        alt="Botanical Candles"
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white text-[11px]">
                        <div>
                          <p className="font-bold">Divya K. · Soy Atelier</p>
                          <p className="opacity-80">Dehradun, UK</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl shadow-sm border border-[#07545A]/10 group relative">
                      <img
                        src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
                        alt="Handcrafted Jewellery"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white text-[11px]">
                        <div>
                          <p className="font-bold">Tara Sen · Silver Wire</p>
                          <p className="opacity-80">Pondicherry</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Badge */}
                <div className="absolute -bottom-5 left-4 right-4 bg-[#FFF8EA] border-2 border-[#07545A]/15 shadow-xl rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#07545A] block">
                      Direct Creator Share
                    </span>
                    <span className="text-2xl font-bold font-display text-[#07545A]">
                      70% Net Payout
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#173B3D]/70 block">Settlement SLA</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full inline-block">
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
      <section id="calculator-section" className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-[#FFFDF7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-full">
              Interactive Revenue Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mt-3 mb-2">
              Calculate Your Real Creator Take-Home
            </h2>
            <p className="text-xs sm:text-sm text-[#173B3D]/70">
              No hidden listing fees, no shelf taxes. Slide your crafted piece pricing and monthly volume
              to preview guaranteed earnings.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-3xl border-2 border-[#07545A]/15 shadow-sm p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Inputs Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Quick Presets */}
              <div>
                <label className="text-xs font-bold text-[#07545A] block mb-2">
                  Select Your Craft Medium Benchmark:
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(categoryPresets).map((catName) => {
                    const isSelected = calcCategory === catName;
                    return (
                      <button
                        key={catName}
                        onClick={() => handleSelectPreset(catName)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#07545A] text-[#FFF8EA] shadow-xs'
                            : 'bg-[#FFF8EA] text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/10'
                        }`}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider 1: Average Selling Price */}
              <div className="space-y-2 bg-[#FFF8EA]/50 p-4 rounded-2xl border border-[#07545A]/10">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#07545A]">Average Piece Retail Price</span>
                  <span className="text-base text-[#07545A] font-display">₹{calcPrice.toLocaleString('en-IN')}</span>
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
                <div className="flex justify-between text-[10px] text-[#173B3D]/60">
                  <span>₹400 (Small Keepsake)</span>
                  <span>₹5,000</span>
                  <span>₹12,000 (Heirloom Masterpiece)</span>
                </div>
              </div>

              {/* Slider 2: Monthly Output Volume */}
              <div className="space-y-2 bg-[#FFF8EA]/50 p-4 rounded-2xl border border-[#07545A]/10">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#07545A]">Estimated Monthly Handmade Sales</span>
                  <span className="text-base text-[#07545A] font-display">{calcVolume} Orders / mo</span>
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
                <div className="flex justify-between text-[10px] text-[#173B3D]/60">
                  <span>5 pieces (Weekend Artisan)</span>
                  <span>50 pieces</span>
                  <span>150 pieces (Full Studio)</span>
                </div>
              </div>

              {/* Real-time comparison note */}
              <div className="p-3 bg-[#FFFDF7] rounded-xl border border-[#07545A]/15 text-[11px] text-[#173B3D]/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>The Curowit Difference:</strong> Traditional ecommerce platforms charge 35–50% in blended commissions, paid ads, and packaging fees. With Curowit, your 70% share is protected and guaranteed.
                </span>
              </div>
            </div>

            {/* Right Output Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#07545A] to-[#042B30] text-[#FFF8EA] p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2A900] block mb-1">
                  Your Net Projected Revenue
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                  ₹{creatorMonthlyTakeHome.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-[#FFF8EA]/70 block mt-1">per month (Direct 70% Share)</span>
                </div>
              </div>

              <div className="divide-y divide-white/10 text-xs space-y-3 pt-2">
                <div className="flex justify-between pt-3">
                  <span className="text-[#FFF8EA]/75">Total Customer GMV:</span>
                  <span className="font-bold">₹{grossMonthlySales.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-[#FFF8EA]/75">Curowit Platform Care (30%):</span>
                  <span className="font-bold text-[#F2A900]">₹{platformCareShare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-[#FFF8EA]/75">Annual Creator Earnings:</span>
                  <span className="font-bold text-emerald-300">₹{annualProjectedRevenue.toLocaleString('en-IN')} / yr</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-[#FFF8EA]/75">Settlement Window:</span>
                  <span className="font-bold text-white">7 Calendar Days post delivery</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('foundingcreator-apply')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F2A900] hover:bg-[#E69A16] text-[#173B3D] text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
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
      <section className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-[#FFF8EA]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-full">
              Transparent Maker Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mt-3 mb-2">
              The 8-Step Path to 7-Day Settlement
            </h2>
            <p className="text-xs sm:text-sm text-[#173B3D]/70">
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
                      : 'bg-white hover:bg-[#FFF8EA] text-[#173B3D] border-[#07545A]/15'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold block opacity-70">Step</span>
                  <span className="text-lg font-extrabold font-display block">{st.num}</span>
                  <span className="text-[10px] font-semibold truncate block mt-0.5">{st.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Deep-Dive Card */}
          {(() => {
            const current = roadmapSteps[activeStepIndex];
            return (
              <div className="bg-white rounded-3xl border-2 border-[#07545A]/15 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in-50 duration-200">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#07545A]">
                    <span className="bg-[#FFF8EA] px-2.5 py-1 rounded-full border border-[#07545A]/15">
                      Step {current.num} of 08
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{current.timeframe}</span>
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold font-display text-[#07545A]">
                    {current.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#173B3D]/80 leading-relaxed">
                    {current.summary}
                  </p>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-[#07545A] block mb-2">
                      Key Deliverables & Verification:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {current.deliverables.map((deliv, i) => (
                        <div
                          key={i}
                          className="bg-[#FFFDF7] border border-[#07545A]/15 p-2.5 rounded-xl text-xs flex items-center gap-2"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium text-[#173B3D]">{deliv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pro-Tip Box */}
                <div className="lg:col-span-5 bg-[#FFF8EA] border-2 border-[#07545A]/20 p-6 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#07545A]">
                    <Sparkles className="w-4 h-4 text-[#F2A900]" />
                    <span>Curator’s Pro-Tip for Artisans:</span>
                  </div>
                  <p className="text-xs text-[#173B3D]/85 leading-relaxed italic">
                    "{current.proTip}"
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveStepIndex((prev) => (prev + 1) % roadmapSteps.length)}
                      className="text-[#07545A] font-bold hover:underline cursor-pointer"
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
      <section className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#07545A]">Craft Disciplines</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mt-1">
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
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#07545A] text-[#FFF8EA]'
                        : 'bg-[#FFF8EA] text-[#07545A] hover:bg-[#07545A]/10 border border-[#07545A]/10'
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
                className="bg-white rounded-3xl border border-[#07545A]/15 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-[#07545A] bg-[#FFF8EA] px-2.5 py-1 rounded-full shadow-xs">
                      {item.leadTime}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#07545A]/80">
                      <MapPin className="w-3.5 h-3.5 text-[#07545A]" />
                      <span>{item.location}</span>
                    </div>

                    <h3 className="font-bold text-base text-[#07545A] font-display">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#173B3D]/70">
                      By {item.artisan}
                    </p>
                    <p className="text-[11px] text-[#173B3D]/70 italic">
                      Technique: {item.technique}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-[#07545A]/10 mt-2 flex items-center justify-between">
                  <span className="text-base font-bold font-display text-[#07545A]">
                    {item.price}
                  </span>
                  <button
                    onClick={() => onNavigate('foundingcreator-apply')}
                    className="text-xs font-bold text-[#07545A] hover:underline cursor-pointer flex items-center gap-1"
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
          7. LIVE STATUS QUERY & SUPABASE DATABASE SYNC PANEL
          ========================================================================= */}
      <section id="status-tracker-section" className="py-16 sm:py-20 border-b border-[#07545A]/10 bg-[#FFF8EA]/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-full">
            Real-Time Database Query
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display">
            Check Your Application Status
          </h2>
          <p className="text-xs sm:text-sm text-[#173B3D]/70 max-w-lg mx-auto">
            Already submitted your artisan profile? Enter your application reference ID or email to check real-time Supabase audit progress.
          </p>

          <form onSubmit={handleLiveStatusLookup} className="max-w-md mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#173B3D]/40" />
              <input
                type="text"
                required
                value={statusQuery}
                onChange={(e) => setStatusQuery(e.target.value)}
                placeholder="APP-FC-XXXXX or your email..."
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#07545A]/20 rounded-xl outline-none focus:border-[#07545A]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingStatus}
              className="px-5 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-xs"
            >
              {isSearchingStatus ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {statusSearchError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl max-w-md mx-auto flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusSearchError}</span>
            </div>
          )}

          {searchedStatusResult && (
            <div className="p-6 bg-white border-2 border-[#07545A]/20 rounded-3xl max-w-lg mx-auto text-left space-y-3 shadow-md animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#687778] uppercase block">
                    Applicant Name
                  </span>
                  <span className="text-sm font-bold text-[#07545A]">
                    {searchedStatusResult.applicantName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    searchedStatusResult.applicationStatus === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : searchedStatusResult.applicationStatus === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {searchedStatusResult.applicationStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-[#173B3D]/75 space-y-1">
                <p><strong>Application ID:</strong> {searchedStatusResult.applicationId}</p>
                <p><strong>Craft Discipline:</strong> {searchedStatusResult.categories?.join(', ')}</p>
                <p><strong>Submitted:</strong> {new Date(searchedStatusResult.submittedAt).toLocaleDateString('en-GB')}</p>
              </div>

              <div className="pt-2 border-t border-[#07545A]/10 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`foundingcreator-status?id=${encodeURIComponent(searchedStatusResult.applicationId)}`)}
                  className="text-xs font-bold text-[#07545A] hover:underline flex items-center gap-1 cursor-pointer"
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
      <section className="py-16 sm:py-24 border-b border-[#07545A]/10 bg-[#FFFDF7]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#173B3D]/70 max-w-md mx-auto">
              Clear policies on revenue splits, 7-day payouts, intellectual property, and shipping logistics.
            </p>
          </div>

          {/* FAQ Search & Category Filter */}
          <div className="mb-8 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#173B3D]/40" />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. GST, Payout, Packaging, Customization)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FFF8EA]/50 border border-[#07545A]/20 rounded-2xl outline-none focus:border-[#07545A]"
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
                  className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                    faqCategoryFilter === fc.id
                      ? 'bg-[#07545A] text-[#FFF8EA]'
                      : 'bg-white text-[#173B3D] border border-[#07545A]/15 hover:bg-[#FFF8EA]'
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
                  className="bg-white rounded-2xl border border-[#07545A]/15 overflow-hidden transition-shadow shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#07545A] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#07545A] transition-transform shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#173B3D]/80 leading-relaxed border-t border-[#07545A]/10 bg-[#FFFDF7]">
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
      <section className="py-20 bg-gradient-to-b from-[#07545A] to-[#042B30] text-[#FFF8EA] text-center px-4 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3.5 py-1 rounded-full text-[#F2A900]">
            Limited Admissions · Cohort 2026
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Ready to Share Your Slow Craft with Conscious Patrons?
          </h2>
          <p className="text-sm text-[#FFF8EA]/80 leading-relaxed max-w-xl mx-auto">
            Submit your application in less than 5 minutes. No upfront fees, zero algorithmic ad taxes,
            and guaranteed 7-day post-delivery settlements.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#F2A900] hover:bg-[#E69A16] text-[#173B3D] font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              Apply to Join Founding Creator Cohort →
            </button>
            <button
              onClick={() => onNavigate('foundingcreator-login')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-[#FFF8EA] border border-white/25 font-bold text-sm transition-all cursor-pointer"
            >
              Artisan Atelier Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
