import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { FilterBar, ReadTimeFilter, SortOption } from './components/FilterBar';
import { StoryCard } from './components/StoryCard';
import { StoryReader } from './components/StoryReader';
import { StoryGenieModal } from './components/StoryGenieModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { ParentalConsentModal } from './components/ParentalConsentModal';
import { STORIES } from './data/stories';
import { Story, StoryCategory, AgeGroup } from './types/story';
import { getStoredApiKey } from './services/geminiService';
import {
  Sparkles,
  BookOpen,
  Heart,
  Moon,
  Search,
  Award,
  Compass,
  ArrowUp
} from 'lucide-react';

const BOOKMARKS_STORAGE_KEY = 'fablecraft_bookmarks_v1';
const BEDTIME_THEME_KEY = 'fablecraft_bedtime_theme_v1';

export default function App() {
  // Story catalog state (pre-loaded 33 stories + any user-created tales)
  const [stories, setStories] = useState<Story[]>(STORIES);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'All'>('All');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | 'All'>('All');
  const [selectedReadTime, setSelectedReadTime] = useState<ReadTimeFilter>('all');
  const [selectedMoralTag, setSelectedMoralTag] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [filterAudioOnly, setFilterAudioOnly] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['three-little-pigs', 'tortoise-and-the-hare', 'velveteen-rabbit'];
    } catch {
      return ['three-little-pigs', 'tortoise-and-the-hare'];
    }
  });

  // UI Drawers & Modals
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [activeStoryForReading, setActiveStoryForReading] = useState<Story | null>(null);
  const [autoPlayAudioForReader, setAutoPlayAudioForReader] = useState(false);

  const [isGenieModalOpen, setIsGenieModalOpen] = useState(false);
  const [genieDefaultTab, setGenieDefaultTab] = useState<'chat' | 'generator' | 'settings'>('chat');
  const [genieStoryContext, setGenieStoryContext] = useState<Story | null>(null);

  // Theme (Parchment vs Bedtime Night)
  const [isBedtimeTheme, setIsBedtimeTheme] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BEDTIME_THEME_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [hasCustomKey, setHasCustomKey] = useState<boolean>(() => !!getStoredApiKey());

  const librarySectionRef = useRef<HTMLDivElement | null>(null);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to persist bookmarks:', e);
    }
  }, [bookmarks]);

  // Sync Bedtime theme
  const handleToggleBedtimeTheme = () => {
    setIsBedtimeTheme((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(BEDTIME_THEME_KEY, next.toString());
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const handleToggleBookmark = (storyId: string) => {
    setBookmarks((prev) =>
      prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [...prev, storyId]
    );
  };

  const handleClearAllBookmarks = () => {
    setBookmarks([]);
  };

  // Find Story of the Day
  const storyOfTheDay = useMemo(() => {
    return stories.find((s) => s.storyOfTheDay) || stories[0];
  }, [stories]);

  // Extract available moral tags from all stories
  const availableMoralTags = useMemo(() => {
    const set = new Set<string>();
    stories.forEach((s) => {
      s.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).slice(0, 10);
  }, [stories]);

  // Categories list
  const categoriesList: StoryCategory[] = [
    'Fairy Tales',
    'Fables & Morals',
    'Bedtime & Cozy',
    'World Folklore',
    'Rhymes & Lullabies',
  ];

  // Filtering & Sorting logic
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Category filter
      if (selectedCategory !== 'All' && story.category !== selectedCategory) {
        return false;
      }

      // Age group filter
      if (selectedAgeGroup !== 'All' && story.ageGroup !== selectedAgeGroup) {
        return false;
      }

      // Author filter (from collections)
      if (selectedAuthor && !story.originalAuthor.toLowerCase().includes(selectedAuthor.toLowerCase())) {
        return false;
      }

      // Read time filter
      if (selectedReadTime === 'quick' && story.readTimeMinutes > 3) {
        return false;
      }
      if (
        selectedReadTime === 'medium' &&
        (story.readTimeMinutes < 4 || story.readTimeMinutes > 7)
      ) {
        return false;
      }
      if (selectedReadTime === 'deep' && story.readTimeMinutes < 8) {
        return false;
      }

      // Moral tag filter
      if (selectedMoralTag && !story.tags.includes(selectedMoralTag)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = story.title.toLowerCase().includes(q);
        const matchesAuthor = story.originalAuthor.toLowerCase().includes(q);
        const matchesMoral = story.moral.toLowerCase().includes(q);
        const matchesSummary = story.summary.toLowerCase().includes(q);
        const matchesTag = story.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAuthor && !matchesMoral && !matchesSummary && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [
    stories,
    searchQuery,
    selectedCategory,
    selectedAgeGroup,
    selectedReadTime,
    selectedMoralTag,
    selectedAuthor,
  ]);

  // Sort filtered results
  const sortedStories = useMemo(() => {
    const list = [...filteredStories];
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'shortest') {
      list.sort((a, b) => a.readTimeMinutes - b.readTimeMinutes);
    } else if (sortBy === 'longest') {
      list.sort((a, b) => b.readTimeMinutes - a.readTimeMinutes);
    }
    return list;
  }, [filteredStories, sortBy]);

  // Bookmarked stories full objects
  const bookmarkedStoriesList = useMemo(() => {
    return stories.filter((s) => bookmarks.includes(s.id));
  }, [stories, bookmarks]);

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAgeGroup('All');
    setSelectedReadTime('all');
    setSelectedMoralTag(null);
    setSelectedAuthor(null);
    setSortBy('rating');
    setFilterAudioOnly(false);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedCategory !== 'All' ||
      selectedAgeGroup !== 'All' ||
      selectedReadTime !== 'all' ||
      selectedMoralTag !== null ||
      selectedAuthor !== null ||
      sortBy !== 'rating'
  );

  // Handlers for Reader Navigation
  const currentReaderIndex = useMemo(() => {
    if (!activeStoryForReading) return -1;
    return sortedStories.findIndex((s) => s.id === activeStoryForReading.id);
  }, [activeStoryForReading, sortedStories]);

  const handleReaderPrev = () => {
    if (currentReaderIndex > 0) {
      setActiveStoryForReading(sortedStories[currentReaderIndex - 1]);
    }
  };

  const handleReaderNext = () => {
    if (currentReaderIndex >= 0 && currentReaderIndex < sortedStories.length - 1) {
      setActiveStoryForReading(sortedStories[currentReaderIndex + 1]);
    }
  };

  const handleOpenReader = (story: Story, autoPlay = false) => {
    setActiveStoryForReading(story);
    setAutoPlayAudioForReader(autoPlay);
  };

  const handleAskGenieAboutStory = (story: Story) => {
    setGenieStoryContext(story);
    setGenieDefaultTab('chat');
    setIsGenieModalOpen(true);
  };

  const handleAddGeneratedStory = (story: Story) => {
    setStories((prev) => [story, ...prev]);
    setActiveStoryForReading(story);
    handleToggleBookmark(story.id);
  };

  const handleJumpToStoryOfDay = () => {
    handleOpenReader(storyOfTheDay);
  };

  const handleSelectCollection = (cat?: StoryCategory, author?: string) => {
    handleResetFilters();
    if (cat) setSelectedCategory(cat);
    if (author) setSelectedAuthor(author);
    if (librarySectionRef.current) {
      librarySectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isBedtimeTheme ? 'bg-[#0F172A] text-slate-100' : 'bg-[#FFFDF5] text-[#1D3557]'
        }`}
      >
        {/* Navigation Bar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedAuthor(null);
          }}
          favoritesCount={bookmarks.length}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenGenie={() => {
            setGenieStoryContext(null);
            setGenieDefaultTab('chat');
            setIsGenieModalOpen(true);
          }}
          onOpenSettings={() => {
            setGenieDefaultTab('settings');
            setIsGenieModalOpen(true);
          }}
          hasCustomKey={hasCustomKey}
          onJumpToStoryOfDay={handleJumpToStoryOfDay}
          onFilterAudioOnly={() => {
            if (librarySectionRef.current) {
              librarySectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          isBedtimeTheme={isBedtimeTheme}
          onToggleBedtimeTheme={handleToggleBedtimeTheme}
        />

        {/* Hero Banner & Curated Anthologies */}
        <HeroCarousel
          storyOfTheDay={storyOfTheDay}
          onReadStory={(story) => handleOpenReader(story, false)}
          onSelectCollection={handleSelectCollection}
          onOpenGenieGenerator={() => {
            setGenieDefaultTab('generator');
            setIsGenieModalOpen(true);
          }}
        />

        {/* Main Treasury Section */}
        <div ref={librarySectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                <h2 className="font-heading-royal text-2xl sm:text-3xl font-bold tracking-tight">
                  The Story Treasury
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 font-serif">
                Showing {sortedStories.length} of {stories.length} magical classics and moral fables
              </p>
            </div>

            {selectedAuthor && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold">
                <span>Collection: {selectedAuthor}</span>
                <button
                  onClick={() => setSelectedAuthor(null)}
                  className="hover:text-[#E63946] font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Filters & Sorting */}
          <FilterBar
            categories={categoriesList}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedAuthor(null);
            }}
            selectedAgeGroup={selectedAgeGroup}
            onSelectAgeGroup={setSelectedAgeGroup}
            selectedReadTime={selectedReadTime}
            onSelectReadTime={setSelectedReadTime}
            selectedMoralTag={selectedMoralTag}
            onSelectMoralTag={setSelectedMoralTag}
            availableMoralTags={availableMoralTags}
            sortBy={sortBy}
            onSelectSortBy={setSortBy}
            totalResults={sortedStories.length}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Stories Grid */}
          {sortedStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {sortedStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  isBookmarked={bookmarks.includes(story.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onReadStory={(s) => handleOpenReader(s, false)}
                  onListenStory={(s) => handleOpenReader(s, true)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 bg-white/70 rounded-3xl border border-stone-200">
              <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif-title text-xl font-bold text-stone-700 mb-1">
                No stories matched your magical criteria
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm mb-4">
                Try loosening your filters or resetting to view the complete catalog.
              </p>
              <button
                onClick={handleResetFilters}
                className="py-2.5 px-6 rounded-full bg-[#E63946] hover:bg-[#d02c39] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Story Reader Full-Screen Modal */}
        {activeStoryForReading && (
          <StoryReader
            story={activeStoryForReading}
            onClose={() => setActiveStoryForReading(null)}
            isBookmarked={bookmarks.includes(activeStoryForReading.id)}
            onToggleBookmark={handleToggleBookmark}
            onAskGenieAboutStory={handleAskGenieAboutStory}
            onNavigatePrev={handleReaderPrev}
            onNavigateNext={handleReaderNext}
            hasPrev={currentReaderIndex > 0}
            hasNext={currentReaderIndex < sortedStories.length - 1}
            autoPlayAudio={autoPlayAudioForReader}
          />
        )}

        {/* StoryGenie AI Modal */}
        <StoryGenieModal
          isOpen={isGenieModalOpen}
          onClose={() => setIsGenieModalOpen(false)}
          activeStoryContext={genieStoryContext}
          onReadGeneratedStory={handleAddGeneratedStory}
          defaultTab={genieDefaultTab}
        />

        {/* Favorites Drawer */}
        <FavoritesDrawer
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favoriteStories={bookmarkedStoriesList}
          onReadStory={(story) => handleOpenReader(story, false)}
          onRemoveFavorite={handleToggleBookmark}
          onClearAll={handleClearAllBookmarks}
        />

        {/* Parental Consent & Safety First Modal */}
        <ParentalConsentModal onAccept={() => {}} />

        {/* Footer */}
        <footer className="mt-20 border-t border-amber-900/10 bg-white/60 py-12 text-stone-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand column */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E63946] text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-heading-royal text-xl font-bold text-[#1D3557]">
                    FableCraft
                  </span>
                </div>
                <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                  A digital enchanted library dedicated to preserving classic folklore, Aesop fables, and gentle bedtime stories. Built for curious young minds and bedtime bonding.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Timeless Stories, Magical Moments</span>
                </div>
              </div>

              {/* Literary Roots */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1D3557] mb-3">
                  Literary Lineage
                </h4>
                <ul className="text-xs space-y-2 text-stone-500">
                  <li>Aesop’s Moral Fables (6th Century BC)</li>
                  <li>Brothers Grimm Kinder- und Hausmärchen</li>
                  <li>Hans Christian Andersen Eventyr</li>
                  <li>Mother Goose English Nursery Rhymes</li>
                  <li>Global Folktales & Arabian Nights</li>
                </ul>
              </div>

              {/* Child Safety & Privacy */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1D3557] mb-3">
                  Safety & Accessibility
                </h4>
                <ul className="text-xs space-y-2 text-stone-500">
                  <li>Web Speech Audio Read-Aloud</li>
                  <li>Printable Paper Storybook Mode</li>
                  <li>Zero Behavioral Advertising</li>
                  <li>Family-Safe Gemini 3.8 AI Assistant</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
              <p>© {new Date().getFullYear()} FableCraft. Dedicated to story lovers of all ages.</p>
              <div className="flex items-center gap-1 text-xs">
                <span>Handcrafted with</span>
                <Heart className="w-3.5 h-3.5 text-[#E63946] fill-current" />
                <span>for magical bedtime moments</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
