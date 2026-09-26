import React from 'react';
import { STORIES, Story } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { BookOpen, Clock, ArrowRight, Sparkles, Feather } from 'lucide-react';

export const CreativeStories: React.FC = () => {
  const { showToast, setActiveView, stories } = useStore();
  const allStories = stories && stories.length > 0 ? stories : STORIES;

  const handleReadStory = (story: Story) => {
    showToast(`Opening "${story.title}"`, 'Full editorial article loaded in Journal');
  };

  return (
    <section className="relative py-12 sm:py-20 bg-[#F7EBD7] overflow-hidden select-none border-t border-[#07545A]/10" aria-label="Studio Journal Stories">
      {/* ========================================================
          Aesthetic Textured Background with Curved Lines & Sparks
          ======================================================== */}
      {/* Ambient Radial Craft Light */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#FFF8EA]/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#E97868]/5 blur-3xl pointer-events-none" />

      {/* Flowing Organic Line Wave SVG in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
        <svg
          viewBox="0 0 1440 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#07545A]"
          preserveAspectRatio="none"
        >
          <path
            d="M-50,150 C250,50 600,280 950,140 C1250,30 1420,180 1550,120"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <path
            d="M-30,280 C320,190 680,350 1080,240 C1300,180 1450,290 1520,260"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Floating Little Sparks Accents */}
      <div className="absolute top-8 left-16 text-[#F2A900]/70 text-sm select-none pointer-events-none animate-pulse">✨</div>
      <div className="absolute top-12 right-24 text-[#C46843]/60 text-xs select-none pointer-events-none">✦</div>
      <div className="absolute bottom-12 left-1/4 text-[#3F704B]/60 text-xs select-none pointer-events-none">✧</div>
      <div className="absolute bottom-8 right-16 text-[#F2A900]/60 text-sm select-none pointer-events-none animate-pulse">✦</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-2 bg-[#FFF8EA] px-3.5 py-1 rounded-full border border-[#07545A]/10 shadow-2xs">
              <Feather className="w-3.5 h-3.5 text-[#C46843]" />
              <span>Studio Journal</span>
              <span className="text-[#07545A]/40">·</span>
              <span className="text-[#07545A] font-bold">Maker Reflections</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Little Sparks of Creativity
            </h2>

            <p className="text-xs sm:text-sm text-[#173B3D]/75 mt-1 max-w-xl leading-relaxed">
              Behind the workbench: artist journals, slow living reflections, and creative DIY sparks.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveView('stories');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#07545A] hover:text-[#E69A16] transition-colors cursor-pointer group self-start sm:self-end"
          >
            <span>Read All Stories</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* ========================================================
            Creative Editorial Story Cards
            ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7">
          {allStories.map((story) => (
            <article
              key={story.id}
              onClick={() => handleReadStory(story)}
              className="bg-[#FFF8EA] rounded-[28px] border border-[#07545A]/12 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1.5"
            >
              {/* Image Frame with Delicate Curved Arched Top & Tags */}
              <div className="relative aspect-16/10 overflow-hidden bg-[#EADCC8]">
                <img
                  src={story.image}
                  alt={story.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Craft Category Fluid Pill */}
                <div className="absolute top-3 left-3 bg-[#FFF8EA]/95 backdrop-blur-md text-[#07545A] text-[10px] font-bold px-3 py-1 rounded-full border border-[#07545A]/15 shadow-2xs flex items-center gap-1">
                  <span>{story.tag}</span>
                </div>

                {/* Read time pill */}
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F2A900]" />
                  <span>{story.readTime}</span>
                </div>

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* Story Content */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <div className="text-[11px] text-[#687778] mb-1 font-medium">
                    {story.date}
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-[#173B3D] group-hover:text-[#07545A] transition-colors leading-snug font-display line-clamp-2">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#173B3D]/75 mt-2 line-clamp-2 leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>

                {/* Bottom Bar with Fluid Pill Button */}
                <div className="pt-3.5 border-t border-[#07545A]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#07545A]/10 text-[#07545A] flex items-center justify-center font-bold text-[10px]">
                      {story.author.charAt(0)}
                    </div>
                    <span className="text-xs text-[#687778] font-medium">
                      By {story.author}
                    </span>
                  </div>

                  {/* Fluid Type Button */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#07545A]/8 text-[#07545A] group-hover:bg-[#07545A] group-hover:text-[#FFF8EA] text-xs font-semibold transition-all duration-200 shadow-2xs">
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
