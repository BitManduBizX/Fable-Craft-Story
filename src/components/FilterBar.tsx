import React from 'react';
import {
  Filter,
  RotateCcw,
  Clock,
  Sparkles,
  Users,
  Compass,
  ArrowUpDown
} from 'lucide-react';
import { StoryCategory, AgeGroup } from '../types/story';

export type ReadTimeFilter = 'all' | 'quick' | 'medium' | 'deep';
export type SortOption = 'rating' | 'title' | 'shortest' | 'longest';

interface FilterBarProps {
  categories: StoryCategory[];
  selectedCategory: StoryCategory | 'All';
  onSelectCategory: (cat: StoryCategory | 'All') => void;
  selectedAgeGroup: AgeGroup | 'All';
  onSelectAgeGroup: (age: AgeGroup | 'All') => void;
  selectedReadTime: ReadTimeFilter;
  onSelectReadTime: (time: ReadTimeFilter) => void;
  selectedMoralTag: string | null;
  onSelectMoralTag: (tag: string | null) => void;
  availableMoralTags: string[];
  sortBy: SortOption;
  onSelectSortBy: (sort: SortOption) => void;
  totalResults: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedAgeGroup,
  onSelectAgeGroup,
  selectedReadTime,
  onSelectReadTime,
  selectedMoralTag,
  onSelectMoralTag,
  availableMoralTags,
  sortBy,
  onSelectSortBy,
  totalResults,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white/90 rounded-3xl p-5 border border-amber-900/10 shadow-xs mb-8 space-y-4">
      {/* Top Row: Category Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#1D3557] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Stories ({totalResults})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1D3557] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Reset button if active filters */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-[#E63946] hover:underline font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Second Row: Age Group, Read Time, and Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
        {/* Age Filter */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <div className="flex items-center gap-1 w-full overflow-x-auto">
            {(['All', '0-3', '4-8', '9+'] as const).map((age) => (
              <button
                key={age}
                onClick={() => onSelectAgeGroup(age)}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-medium text-center whitespace-nowrap transition-colors cursor-pointer ${
                  selectedAgeGroup === age
                    ? 'bg-[#2A9D8F] text-white'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60'
                }`}
              >
                {age === 'All'
                  ? 'All Ages'
                  : age === '0-3'
                  ? 'Babies (0-3)'
                  : age === '4-8'
                  ? 'Kids (4-8)'
                  : 'Youth (9+)'}
              </button>
            ))}
          </div>
        </div>

        {/* Read Time Filter */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <div className="flex items-center gap-1 w-full overflow-x-auto">
            <button
              onClick={() => onSelectReadTime('all')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                selectedReadTime === 'all'
                  ? 'bg-[#457B9D] text-white'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60'
              }`}
            >
              Any Time
            </button>
            <button
              onClick={() => onSelectReadTime('quick')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                selectedReadTime === 'quick'
                  ? 'bg-[#457B9D] text-white'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60'
              }`}
              title="3 minutes or less"
            >
              ≤ 3 min
            </button>
            <button
              onClick={() => onSelectReadTime('medium')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                selectedReadTime === 'medium'
                  ? 'bg-[#457B9D] text-white'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60'
              }`}
              title="4 to 7 minutes"
            >
              4-7 min
            </button>
            <button
              onClick={() => onSelectReadTime('deep')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                selectedReadTime === 'deep'
                  ? 'bg-[#457B9D] text-white'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60'
              }`}
              title="8 minutes and more"
            >
              8+ min
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 sm:justify-end">
          <ArrowUpDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSelectSortBy(e.target.value as SortOption)}
            className="w-full sm:w-auto py-1 px-3 rounded-lg text-xs font-medium bg-stone-50 border border-stone-200 text-[#1D3557] focus:outline-none focus:ring-1 focus:ring-[#1D3557] cursor-pointer"
          >
            <option value="rating">Top Rated & Loved</option>
            <option value="title">Alphabetical (A - Z)</option>
            <option value="shortest">Shortest First (Quick Read)</option>
            <option value="longest">Longest First (Deep Tale)</option>
          </select>
        </div>
      </div>

      {/* Third Row: Moral Lesson Tag Cloud */}
      <div className="pt-2 border-t border-stone-100">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Moral Lessons:</span>
          </div>
          {availableMoralTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectMoralTag(selectedMoralTag === tag ? null : tag)}
              className={`text-[11px] px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                selectedMoralTag === tag
                  ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                  : 'bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200/60'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
