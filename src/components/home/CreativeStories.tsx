import React from 'react';
import { STORIES, Story } from '../../data/mockData';
import { useStore } from '../../context/StoreContext';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export const CreativeStories: React.FC = () => {
  const { showToast } = useStore();

  const handleReadStory = (story: Story) => {
    showToast(`Opening "${story.title}"`, 'Full editorial article loaded');
  };

  return (
    <section className="py-12 sm:py-16 bg-[#F7EBD7] border-t border-[#07545A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3F704B] mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Studio Journal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#07545A] font-display">
              Little Sparks of Creativity
            </h2>
            <p className="text-sm text-[#173B3D]/70 mt-1 max-w-xl">
              Behind the workbench: artist journals, slow living reflections, and creative DIY sparks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {STORIES.map((story) => (
            <article
              key={story.id}
              onClick={() => handleReadStory(story)}
              className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group hover:-translate-y-1"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-[#EADCC8]">
                <img
                  src={story.image}
                  alt={story.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#FFF8EA]/90 backdrop-blur-xs text-[#07545A] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {story.tag}
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-[#687778] mb-1.5">
                    <span>{story.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {story.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#173B3D] group-hover:text-[#07545A] transition-colors leading-snug line-clamp-2">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#173B3D]/75 mt-1.5 line-clamp-2">
                    {story.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#07545A]/10 flex items-center justify-between text-xs">
                  <span className="text-[#687778] font-medium">By {story.author}</span>
                  <span className="font-semibold text-[#07545A] group-hover:text-[#E69A16] flex items-center gap-1">
                    Read Story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
