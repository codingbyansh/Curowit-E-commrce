import React from 'react';
import { HeartHandshake, Sparkles, Palette, Users } from 'lucide-react';

export const WhyCurowit: React.FC = () => {
  const benefits = [
    {
      title: 'HANDMADE',
      desc: 'Thoughtfully created by independent makers with natural materials and human devotion.',
      icon: HeartHandshake,
      accent: 'text-[#07545A]',
      bg: 'bg-[#07545A]/10',
    },
    {
      title: 'UNIQUE',
      desc: 'Discover authentic, small-batch pieces and custom keepsakes you won’t find in retail malls.',
      icon: Sparkles,
      accent: 'text-[#E69A16]',
      bg: 'bg-[#F2A900]/15',
    },
    {
      title: 'CREATIVE',
      desc: 'Products, craft kits, and interactive workshops inspired by freeform imagination.',
      icon: Palette,
      accent: 'text-[#3F704B]',
      bg: 'bg-[#3F704B]/10',
    },
    {
      title: 'CREATOR-FIRST',
      desc: 'A platform engineered from day one to empower independent artisans and makers to thrive.',
      icon: Users,
      accent: 'text-[#E97868]',
      bg: 'bg-[#E97868]/15',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#FFF8EA] border-t border-[#07545A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3F704B] block mb-1">
            Our Core Promise
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#07545A] font-display">
            Why Shop on Curowit?
          </h2>
          <p className="text-sm text-[#173B3D]/70 mt-1.5">
            Every choice on our platform champions slow, meaningful craftsmanship over factory mass-production.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-[#F7EBD7] p-5 sm:p-6 rounded-2xl border border-[#07545A]/10 flex flex-col items-start"
              >
                <div className={`w-10 h-10 rounded-xl ${b.bg} ${b.accent} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-sm tracking-wider text-[#07545A] mb-1.5">
                  {b.title}
                </h3>
                <p className="text-xs text-[#173B3D]/75 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
