import React from 'react';
import { HeartHandshake, Sparkles, Palette, Users, PackageCheck, ShieldCheck } from 'lucide-react';

export const WhyCurowit: React.FC = () => {
  const benefits = [
    {
      title: 'Handmade with Love',
      desc: 'Small-batch creations',
      icon: HeartHandshake,
      accent: 'text-[#07545A]',
      bg: 'bg-[#07545A]/10 border-[#07545A]/15',
    },
    {
      title: 'Rare & Unique',
      desc: 'Never mass-produced',
      icon: Sparkles,
      accent: 'text-[#C46843]',
      bg: 'bg-[#C46843]/10 border-[#C46843]/15',
    },
    {
      title: 'Creative Spirit',
      desc: 'Mindful slow craft',
      icon: Palette,
      accent: 'text-[#3F704B]',
      bg: 'bg-[#3F704B]/10 border-[#3F704B]/15',
    },
    {
      title: 'Direct to Maker',
      desc: '100% fair artisan income',
      icon: Users,
      accent: 'text-[#E69A16]',
      bg: 'bg-[#F2A900]/15 border-[#F2A900]/20',
    },
    {
      title: 'Plastic-Free Transit',
      desc: 'Eco-conscious packaging',
      icon: PackageCheck,
      accent: 'text-[#07545A]',
      bg: 'bg-[#07545A]/10 border-[#07545A]/15',
    },
    {
      title: 'Verified Artisans',
      desc: 'Direct studio quality',
      icon: ShieldCheck,
      accent: 'text-[#3F704B]',
      bg: 'bg-[#3F704B]/10 border-[#3F704B]/15',
    },
  ];

  return (
    <section className="py-6 sm:py-8 bg-[#FFF8EA] border-t border-[#07545A]/10 select-none" aria-label="Why Shop on Curowit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simple Minimal Header - No Swipe Word or Arrow Controls */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-[#F2A900]">✦</span>
          <h2 className="text-lg sm:text-xl font-bold text-[#07545A] font-display">
            Why Shop on Curowit?
          </h2>
        </div>

        {/* Simple Static Responsive Grid - No Swipe, Clean & Direct */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-[#F7EBD7] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-[#07545A]/10 flex flex-col justify-between shadow-2xs transition-all duration-200 hover:border-[#07545A]/25"
              >
                <div className={`w-8 h-8 rounded-lg ${b.bg} ${b.accent} border flex items-center justify-center mb-2.5`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>

                <div>
                  <h3 className="font-bold text-xs text-[#07545A] leading-tight">
                    {b.title}
                  </h3>
                  <p className="text-[10px] text-[#173B3D]/70 font-medium mt-0.5 line-clamp-1">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
