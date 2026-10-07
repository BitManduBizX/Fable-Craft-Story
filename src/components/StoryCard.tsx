import React from 'react';
import {
  BookOpen,
  Clock,
  Star,
  Bookmark,
  Volume2,
  Sparkles,
  Award
} from 'lucide-react';
import { Story } from '../types/story';

interface StoryCardProps {
  story: Story;
  isBookmarked: boolean;
  onToggleBookmark: (storyId: string) => void;
  onReadStory: (story: Story) => void;
  onListenStory: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isBookmarked,
  onToggleBookmark,
  onReadStory,
  onListenStory,
}) => {
  return (
    <div className="group relative bg-white/95 rounded-3xl border border-amber-900/10 hover:border-amber-900/25 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Banner & Bookmark */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Category Chip */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80">
            {story.category}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Star Rating */}
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{story.rating.toFixed(1)}</span>
            </div>

            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(story.id);
              }}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-rose-100 text-[#E63946]'
                  : 'bg-stone-100 text-stone-400 hover:text-stone-700'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cover Medallion + Title */}
        <div
          onClick={() => onReadStory(story)}
          className="cursor-pointer group-hover:translate-x-0.5 transition-transform"
        >
          <div className="flex items-center gap-3.5 mb-2.5">
            <div className="w-14 h-14 rounded-2xl bg-[#FFFDF5] border border-amber-900/15 flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
              {story.coverEmoji}
            </div>
            <div>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#1D3557] group-hover:text-[#E63946] transition-colors line-clamp-1">
                {story.title}
              </h3>
              <p className="text-xs text-stone-500 font-serif italic truncate">
                {story.originalAuthor}
              </p>
            </div>
          </div>

          {/* Synopsis */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {story.summary}
          </p>
        </div>

        {/* Moral Snippet */}
        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50 flex items-start gap-2 mb-3">
          <Award className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 font-serif italic line-clamp-2">
            <span className="font-sans font-bold not-italic">Moral:</span> {story.moral}
          </p>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
          <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-stone-400" />
            {story.readTimeMinutes} min read
          </span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
            Age {story.ageGroup}
          </span>
          {story.storyOfTheDay && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              Today's Pick
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 pt-2 border-t border-stone-100 bg-[#FFFDF5]/50 flex items-center gap-2">
        <button
          onClick={() => onReadStory(story)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#E63946] hover:bg-[#d02c39] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Read Online</span>
        </button>

        <button
          onClick={() => onListenStory(story)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-stone-50 border border-amber-900/15 text-[#1D3557] hover:text-[#2A9D8F] text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          title="Listen with Audio Read-Aloud"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
          <span>Listen</span>
        </button>
      </div>
    </div>
  );
};
