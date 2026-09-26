import React, { useState } from 'react';
import { STORIES, Story } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { Clock, Feather, ArrowRight, Sparkles } from 'lucide-react';

export const StoriesPage: React.FC = () => {
  const { showToast } = useStore();
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const tags = ['all', 'Craft Journey', 'Studio Secrets', 'Creative Philosophy'];

  const filteredStories = STORIES.filter((s) => {
    if (selectedTag === 'all') return true;
    return s.tag === selectedTag;
  });

  const handleReadStory = (story: Story) => {
    showToast(`Reading "${story.title}"`, `By ${story.author} · Full article ready in reader`);
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single, Non-Duplicated Clean Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-[#07545A]/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5 bg-[#FFF8EA] px-3 py-1 rounded-full border border-[#07545A]/10 shadow-2xs">
              <Feather className="w-3.5 h-3.5 text-[#C46843]" />
              <span>Studio Journal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Little Sparks of Creativity
            </h1>
            <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-xl">
              Behind the workbench: artist reflections, slow living essays, and maker studio journals.
            </p>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-[#07545A] text-[#FFF8EA] shadow-2xs'
                    : 'bg-[#FFF8EA] text-[#173B3D] border border-[#07545A]/15 hover:bg-[#F2E4CE]'
                }`}
              >
                {tag === 'all' ? 'All Stories' : tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              onClick={() => handleReadStory(story)}
              className="bg-[#FFF8EA] rounded-2xl sm:rounded-3xl border border-[#07545A]/12 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-[#EADCC8]">
                <img
                  src={story.image}
                  alt={story.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="absolute top-3 left-3 bg-[#FFF8EA]/95 backdrop-blur-md text-[#07545A] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#07545A]/15 shadow-2xs">
                  {story.tag}
                </div>

                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F2A900]" />
                  <span>{story.readTime}</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="text-[11px] text-[#687778] mb-1 font-medium">
                    {story.date}
                  </div>

                  <h2 className="font-bold text-base sm:text-lg text-[#173B3D] group-hover:text-[#07545A] transition-colors leading-snug font-display line-clamp-2">
                    {story.title}
                  </h2>

                  <p className="text-xs text-[#173B3D]/75 mt-2 line-clamp-2 leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between">
                  <span className="text-xs text-[#687778] font-medium">
                    By {story.author}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#07545A] group-hover:text-[#063F45]">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
