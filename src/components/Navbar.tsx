import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Bookmark,
  Key,
  Moon,
  Sun,
  X,
  Compass,
  Headphones
} from 'lucide-react';
import { StoryCategory } from '../types/story';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: StoryCategory | 'All';
  onSelectCategory: (cat: StoryCategory | 'All') => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenGenie: () => void;
  onOpenSettings: () => void;
  hasCustomKey: boolean;
  onJumpToStoryOfDay: () => void;
  onFilterAudioOnly: () => void;
  isBedtimeTheme: boolean;
  onToggleBedtimeTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  favoritesCount,
  onOpenFavorites,
  onOpenGenie,
  onOpenSettings,
  hasCustomKey,
  onJumpToStoryOfDay,
  onFilterAudioOnly,
  isBedtimeTheme,
  onToggleBedtimeTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FFFDF5]/95 border-b border-amber-900/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              onSelectCategory('All');
              onSearchChange('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E63946] to-[#D90429] flex items-center justify-center text-white shadow-md shadow-[#E63946]/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading-royal text-2xl font-bold tracking-tight text-[#1D3557]">
                  FableCraft
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  Library
                </span>
              </div>
              <p className="text-xs text-stone-500 font-serif italic -mt-0.5 hidden sm:block">
                Timeless Stories, Magical Moments
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md relative items-center">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by title, Aesop, moral, animal..."
                className="w-full pl-10 pr-9 py-2 rounded-full bg-white/90 border border-amber-900/15 text-sm text-[#1D3557] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E63946]/30 focus:border-[#E63946] transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Story of the Day jump */}
            <button
              onClick={onJumpToStoryOfDay}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#1D3557] bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
              title="Jump to Story of the Day"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Today's Tale</span>
            </button>

            {/* Audio filter shortcut */}
            <button
              onClick={onFilterAudioOnly}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#2A9D8F] bg-[#2A9D8F]/10 hover:bg-[#2A9D8F]/20 border border-[#2A9D8F]/25 transition-colors cursor-pointer"
              title="Audio Read-Aloud Stories"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Read Aloud</span>
            </button>

            {/* StoryGenie Assistant Button */}
            <button
              onClick={onOpenGenie}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#1D3557] to-[#457B9D] hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>StoryGenie AI</span>
            </button>

            {/* Bookmarks */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 rounded-full text-stone-600 hover:text-[#E63946] hover:bg-amber-100/60 transition-colors cursor-pointer"
              title="Saved Story Bookmarks"
            >
              <Bookmark className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E63946] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Key / API Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-amber-100/60 transition-colors relative cursor-pointer"
              title="StoryGenie AI API Settings"
            >
              <Key className="w-5 h-5" />
              {hasCustomKey ? (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              ) : (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Night / Bedtime Mode Toggle */}
            <button
              onClick={onToggleBedtimeTheme}
              className="p-2 rounded-full text-stone-600 hover:text-indigo-600 hover:bg-amber-100/60 transition-colors cursor-pointer"
              title={isBedtimeTheme ? 'Switch to Bright Parchment Mode' : 'Switch to Cozy Bedtime Mode'}
            >
              {isBedtimeTheme ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search stories, fables, morals..."
              className="w-full pl-9 pr-8 py-2 rounded-full bg-white/95 border border-amber-900/15 text-sm text-[#1D3557] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E63946]/30"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
