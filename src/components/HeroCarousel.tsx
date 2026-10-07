import React from 'react';
import {
  Sparkles,
  BookOpen,
  Volume2,
  Printer,
  Compass,
  Star,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Story, StoryCategory } from '../types/story';
import { CURATED_COLLECTIONS } from '../data/stories';

interface HeroCarouselProps {
  storyOfTheDay: Story;
  onReadStory: (story: Story) => void;
  onSelectCollection: (category?: StoryCategory, author?: string) => void;
  onOpenGenieGenerator: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  storyOfTheDay,
  onReadStory,
  onSelectCollection,
  onOpenGenieGenerator,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-100/50 via-[#FFFDF5]/20 to-transparent pointer-events-none rounded-b-[4rem] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Story of the Day Hero Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#1D3557] via-[#162740] to-[#0D1B2A] text-white p-6 sm:p-10 shadow-2xl overflow-hidden border border-amber-400/20">
          {/* Subtle star constellations */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#E63946]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 animate-spin-once" />
                <span>Story of the Day</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-title tracking-tight text-white leading-tight">
                {storyOfTheDay.title}
              </h1>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed line-clamp-3 max-w-2xl">
                {storyOfTheDay.summary}
              </p>

              {/* Moral Takeaway Quote */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-2xl">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/90 block">
                      Guiding Moral
                    </span>
                    <p className="text-xs sm:text-sm text-stone-200 font-serif italic">
                      "{storyOfTheDay.moral}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges & Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onReadStory(storyOfTheDay)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#E63946] hover:bg-[#d02c39] text-white font-medium text-sm shadow-lg shadow-[#E63946]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read Story Now</span>
                </button>

                <button
                  onClick={() => onReadStory(storyOfTheDay)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-medium text-sm backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-300" />
                  <span>Listen Aloud</span>
                </button>

                <button
                  onClick={onOpenGenieGenerator}
                  className="flex items-center gap-2 px-4 py-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium text-xs border border-amber-400/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create with StoryGenie</span>
                </button>
              </div>
            </div>

            {/* Right Side Visual Badge */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative group cursor-pointer" onClick={() => onReadStory(storyOfTheDay)}>
                <div className="w-48 h-60 sm:w-56 sm:h-72 rounded-2xl bg-gradient-to-b from-[#2A9D8F] to-[#1D3557] p-1 shadow-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-300 border-2 border-amber-300/30 flex flex-col items-center justify-between p-6 text-center">
                  <div className="w-full flex items-center justify-between text-xs text-amber-200">
                    <span>{storyOfTheDay.category}</span>
                    <span className="flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {storyOfTheDay.rating}
                    </span>
                  </div>

                  <div className="text-6xl sm:text-7xl filter drop-shadow-md my-auto group-hover:scale-110 transition-transform">
                    {storyOfTheDay.coverEmoji}
                  </div>

                  <div className="w-full text-center">
                    <p className="text-xs font-semibold text-amber-100 font-serif truncate">
                      {storyOfTheDay.title}
                    </p>
                    <p className="text-[11px] text-stone-300">
                      {storyOfTheDay.readTimeMinutes} min • Age {storyOfTheDay.ageGroup}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 p-4 rounded-2xl border border-amber-900/10 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1D3557]">33+ Masterpieces</p>
              <p className="text-[11px] text-stone-500">Fairy tales, fables & folklore</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-amber-900/10 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1D3557]">Audio Read-Aloud</p>
              <p className="text-[11px] text-stone-500">Web narration & highlights</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-amber-900/10 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1D3557]">StoryGenie AI</p>
              <p className="text-[11px] text-stone-500">Gemini-powered companion</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-amber-900/10 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1D3557]">Printable PDF</p>
              <p className="text-[11px] text-stone-500">Clean bedtime sheets</p>
            </div>
          </div>
        </div>

        {/* Curated Collections Interactive Shelf */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold font-serif-title text-[#1D3557]">
                Featured Story Collections
              </h2>
              <p className="text-xs text-stone-500">
                Explore handpicked anthologies curated by literary lineage
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURATED_COLLECTIONS.map((col) => (
              <div
                key={col.id}
                onClick={() =>
                  onSelectCollection(
                    col.filterCategory as StoryCategory | undefined,
                    col.author
                  )
                }
                className="group relative p-5 rounded-2xl bg-white/90 hover:bg-white border border-amber-900/10 hover:border-amber-900/20 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-xl bg-amber-50 group-hover:scale-110 transition-transform">
                      {col.emoji}
                    </span>
                    <span className="text-xs font-semibold text-stone-400 group-hover:text-[#E63946] flex items-center gap-0.5">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1D3557] group-hover:text-[#E63946] transition-colors font-serif">
                    {col.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {col.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-stone-400">
                  <Compass className="w-3 h-3 text-[#2A9D8F]" />
                  <span>Curated Anthology</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
