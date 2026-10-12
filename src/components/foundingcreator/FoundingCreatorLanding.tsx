import React, { useState } from 'react';
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
} from 'lucide-react';
import { CurowitLogo } from '../common/CurowitLogo';

interface FoundingCreatorLandingProps {
  onNavigate: (view: string) => void;
}

export const FoundingCreatorLanding: React.FC<FoundingCreatorLandingProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [statusQuery, setStatusQuery] = useState('');

  const benefits = [
    {
      icon: TrendingUp,
      title: '70% Creator Revenue Share',
      desc: 'Transparent 70/30 split. You keep 70% of every sale with no hidden listing fees or shelf charges.',
    },
    {
      icon: Package,
      title: 'Showcase on Curowit Storefront',
      desc: 'Feature your slow-crafted items in front of conscious shoppers looking for authentic, handmade quality.',
    },
    {
      icon: CreditCard,
      title: 'Reliable 7-Day Payout Cycle',
      desc: 'Automated settlement eligibility 7 calendar days post confirmed delivery directly to your UPI or Bank Account.',
    },
    {
      icon: Truck,
      title: 'Integrated Eco-Logistics Support',
      desc: 'Standardized plastic-free honeycomb packaging guidelines, courier pickup support, and real-time tracking.',
    },
    {
      icon: Layers,
      title: 'All-In-One Creator Dashboard',
      desc: 'Manage product inventory, track incoming orders, monitor shipments, and download earnings statements in one place.',
    },
    {
      icon: HeartHandshake,
      title: 'Artisan Rights & Independence',
      desc: 'You retain 100% intellectual property ownership of your craft, designs, and personal brand.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Register Creator Account',
      desc: 'Fill your artisan bio, studio location, and craft category in our simple 4-step wizard.',
    },
    {
      step: '02',
      title: 'Submit Craft Portfolio',
      desc: 'Upload high-resolution photographs of your handmade pieces and share your Instagram or studio links.',
    },
    {
      step: '03',
      title: 'Curation Review',
      desc: 'Curowit’s creative team audits your application for handmade authenticity and slow-craft standards within 48 hours.',
    },
    {
      step: '04',
      title: 'Approval & Onboarding',
      desc: 'Receive your Founding Creator badge and unlock access to the private creator portal.',
    },
    {
      step: '05',
      title: 'Publish Products',
      desc: 'Add product listings with descriptions, lead times, pricing, and Firebase-hosted images.',
    },
    {
      step: '06',
      title: 'Receive & Prepare Orders',
      desc: 'When customers purchase, you get immediate notifications with dispatch deadlines.',
    },
    {
      step: '07',
      title: 'Ship with Tracking',
      desc: 'Pack in eco-friendly protective packaging, enter courier AWB, and dispatch on time.',
    },
    {
      step: '08',
      title: 'Receive Payouts',
      desc: 'Funds enter your eligible balance 7 days post-delivery. Request payout directly to your bank account or UPI.',
    },
  ];

  const categories = [
    { name: 'Handmade Jewellery', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Crochet & Yarn Crafts', img: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=600&q=80' },
    { name: 'Studio Ceramics & Pottery', img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
    { name: 'Soy Candles & Home Scents', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80' },
    { name: 'Handbags & Accessories', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
    { name: 'Paintings & Art Prints', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80' },
  ];

  const faqs = [
    {
      q: 'Who is eligible to become a Founding Creator?',
      a: 'We welcome independent artisans, hobbyists, students, small craft studios, and traditional makers who design and handcraft their own products in India. Mass-produced, factory drop-shipped, or imported plastic goods are strictly not eligible.',
    },
    {
      q: 'What is the commercial model and commission split?',
      a: 'The Founding Creator program offers a favorable 70/30 commercial split: 70% of the item selling price goes directly to the creator, while 30% is Curowit’s platform commission covering marketing, payment gateway handling, customer support, and hosting.',
    },
    {
      q: 'How does the 7-day payout timeline work?',
      a: 'Following delivery confirmation, an order item enters a 7 calendar-day inspection and dispute grace period. On day 7, the net amount is moved to your Eligible Balance. You can request a payout anytime to your verified UPI ID or Bank Account.',
    },
    {
      q: 'Who handles shipping and packaging?',
      a: 'Creators package their own products using Curowit-approved plastic-free materials (paper honeycomb wrap and corrugated boxes). You can dispatch via your local courier (such as Delhivery, Bluedart, or India Post) and enter the tracking number into your dashboard.',
    },
    {
      q: 'Can I sell customized or personalized creations?',
      a: 'Yes! In your product submission and application, you can specify made-to-order lead times and define personalized fields (such as baby initials, custom names, or color variations).',
    },
    {
      q: 'Do I keep ownership of my brand and designs?',
      a: 'Absolutely. You retain 100% intellectual property ownership. Curowit merely acts as your authorized marketplace and storytelling partner.',
    },
  ];

  const handleStatusSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusQuery.trim()) {
      onNavigate(`foundingcreator-status?id=${encodeURIComponent(statusQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#173B3D]">
      {/* Top Banner */}
      <div className="bg-[#07545A] text-[#FFF8EA] text-xs py-2.5 px-4 text-center font-medium">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#F2A900] animate-pulse" />
          <span>Founding Creator Cohort 2026 is officially open for admissions. Limited to 150 select indie makers.</span>
          <button
            onClick={() => onNavigate('foundingcreator-apply')}
            className="underline font-bold hover:text-[#F2A900] ml-1 cursor-pointer"
          >
            Apply Now →
          </button>
        </span>
      </div>

      {/* Program Navigation Header */}
      <header className="border-b border-[#07545A]/10 bg-[#FFFDF7]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title="Return to Curowit Home"
            >
              <CurowitLogo variant="horizontal" size="md" />
            </button>
            <span className="hidden sm:inline-block text-[#07545A]/30 font-light">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#07545A]/10 text-[#07545A] text-[11px] font-bold uppercase tracking-wider">
              Founding Creator Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => onNavigate('foundingcreator-status')}
              className="text-xs font-bold text-[#173B3D]/70 hover:text-[#07545A] transition-colors cursor-pointer hidden md:inline-flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Application</span>
            </button>
            <button
              onClick={() => onNavigate('foundingcreator-login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#07545A] hover:bg-[#07545A]/10 transition-colors cursor-pointer"
            >
              Creator Login
            </button>
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Apply to Join</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#07545A]/10 bg-gradient-to-b from-[#FFF8EA]/60 to-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E97868]/15 border border-[#E97868]/30 text-[#E97868] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Handmade · Slow-Craft · Authentic Makers</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#07545A] font-display tracking-tight leading-[1.15]">
                Your Creativity Deserves the Spotlight.
              </h1>

              <p className="text-base sm:text-lg text-[#173B3D]/80 leading-relaxed max-w-2xl">
                Join Curowit's Founding Creator community. Showcase your handmade products, reach new customers, and grow your creative business with transparent sales reports and guaranteed 7-day payouts.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('foundingcreator-apply')}
                  className="px-7 py-3.5 rounded-2xl bg-[#07545A] hover:bg-[#063F45] text-[#FFF8EA] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Apply to Become a Founding Creator</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => onNavigate('foundingcreator-login')}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFF8EA] text-[#07545A] border-2 border-[#07545A]/20 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Already Approved? Login</span>
                </button>
              </div>

              {/* Status Tracking Bar */}
              <form
                onSubmit={handleStatusSearch}
                className="pt-4 max-w-md flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#173B3D]/40" />
                  <input
                    type="text"
                    value={statusQuery}
                    onChange={(e) => setStatusQuery(e.target.value)}
                    placeholder="Check application by Reference ID or Email..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#07545A]/20 rounded-xl outline-none focus:border-[#07545A]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-[#07545A]/10 hover:bg-[#07545A] text-[#07545A] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>

              {/* Badges Row */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-[#173B3D]/70">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>No Upfront Listing Fees</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <CreditCard className="w-4 h-4 text-[#07545A]" />
                  <span>70% Creator Share</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#E97868]" />
                  <span>7-Day Payout SLA</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Product Gallery Collage */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-3.5">
                    <div className="overflow-hidden rounded-2xl shadow-md border border-[#07545A]/10 group">
                      <img
                        src="https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=600&q=80"
                        alt="Crochet Craft"
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="overflow-hidden rounded-2xl shadow-md border border-[#07545A]/10 group">
                      <img
                        src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80"
                        alt="Studio Pottery"
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-6">
                    <div className="overflow-hidden rounded-2xl shadow-md border border-[#07545A]/10 group">
                      <img
                        src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80"
                        alt="Botanical Candles"
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="overflow-hidden rounded-2xl shadow-md border border-[#07545A]/10 group">
                      <img
                        src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
                        alt="Handmade Jewellery"
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 left-6 bg-[#FFF8EA] border border-[#07545A]/20 shadow-lg rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#07545A] text-[#FFF8EA] flex items-center justify-center font-bold font-display text-lg">
                    70%
                  </div>
                  <div>
                    <span className="font-bold text-[#07545A] block text-xs">Direct Creator Share</span>
                    <span className="text-[10px] text-[#173B3D]/70">7-Day Post-Delivery Settlement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-16 sm:py-20 border-b border-[#07545A]/10 bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-full">
              Why Partner with Curowit
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mt-3 mb-2">
              Designed for Creators Who Value Craft over Mass-Production
            </h2>
            <p className="text-xs sm:text-sm text-[#173B3D]/70">
              We handle the platform mechanics, storefront SEO, payment infrastructure, and logistics coordination so you can focus on making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFF8EA]/70 hover:bg-[#FFF8EA] border border-[#07545A]/15 rounded-3xl p-6 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#07545A] text-[#FFF8EA] flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-[#07545A] text-base mb-2 font-display">{b.title}</h3>
                    <p className="text-xs text-[#173B3D]/75 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories We Welcome */}
      <section className="py-16 sm:py-20 border-b border-[#07545A]/10 bg-[#FFF8EA]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#07545A]">Categories We Discover & Nurture</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mt-1">
                Handmade & Creative Craft Domains
              </h2>
            </div>
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="text-xs font-bold text-[#07545A] hover:underline flex items-center gap-1"
            >
              <span>Explore all 10 categories in application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c, i) => (
              <div
                key={i}
                className="group rounded-2xl overflow-hidden border border-[#07545A]/15 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col cursor-pointer"
                onClick={() => onNavigate('foundingcreator-apply')}
              >
                <div className="h-28 overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 text-center">
                  <h4 className="font-bold text-xs text-[#07545A]">{c.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (8 Steps) */}
      <section className="py-16 sm:py-20 border-b border-[#07545A]/10 bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#07545A] bg-[#07545A]/10 px-3 py-1 rounded-full">
              The Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mt-3 mb-2">
              From Application to 7-Day Settlement
            </h2>
            <p className="text-xs sm:text-sm text-[#173B3D]/70">
              Clear, step-by-step workflow with zero ambiguity on reviews, orders, dispatch, and payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((st) => (
              <div
                key={st.step}
                className="bg-[#FFF8EA]/50 border border-[#07545A]/12 rounded-2xl p-5 hover:bg-[#FFF8EA] transition-colors relative"
              >
                <span className="text-2xl font-black font-display text-[#07545A]/20 block mb-2">
                  {st.step}
                </span>
                <h3 className="font-bold text-sm text-[#07545A] mb-1.5">{st.title}</h3>
                <p className="text-xs text-[#173B3D]/70 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 sm:py-20 border-b border-[#07545A]/10 bg-[#FFF8EA]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#173B3D]/70">
              Everything you need to know about the Founding Creator program terms, commercial split, and policies.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
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

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-[#07545A] text-[#FFF8EA] text-center px-4">
        <div className="max-w-3xl mx-auto space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider bg-[#FFF8EA]/15 px-3 py-1 rounded-full text-[#FFF8EA]">
            Cohort Admission Active
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Ready to Take Your Craft to Dedicated Patrons?
          </h2>
          <p className="text-sm text-[#FFF8EA]/80 leading-relaxed max-w-xl mx-auto">
            Submit your application in less than 5 minutes. No upfront fee, no mandatory subscription, 70% direct creator share.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('foundingcreator-apply')}
              className="px-8 py-3.5 rounded-2xl bg-[#FFF8EA] hover:bg-[#F2A900] text-[#07545A] hover:text-[#173B3D] font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Apply to Become a Founding Creator
            </button>
            <button
              onClick={() => onNavigate('foundingcreator-login')}
              className="px-6 py-3.5 rounded-2xl bg-transparent hover:bg-white/10 text-[#FFF8EA] border border-white/20 font-bold text-sm transition-all cursor-pointer"
            >
              Sign In to Creator Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
