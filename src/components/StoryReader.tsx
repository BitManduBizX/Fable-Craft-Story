import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Printer,
  Bookmark,
  Share2,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  CheckCircle,
  Award,
  Sliders,
  Type,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Story, ReaderTheme, ReaderFontSize, ReaderFontFamily } from '../types/story';

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (storyId: string) => void;
  onAskGenieAboutStory: (story: Story) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  autoPlayAudio?: boolean;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onAskGenieAboutStory,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
  autoPlayAudio = false,
}) => {
  // Reader display settings
  const [theme, setTheme] = useState<ReaderTheme>('parchment');
  const [fontSize, setFontSize] = useState<ReaderFontSize>('md');
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>('serif');
  const [showSettings, setShowSettings] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Audio Speech Synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(-1);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Filter pleasant English voices if available
        const enVoices = voices.filter((v) => v.lang.startsWith('en'));
        const voicesToUse = enVoices.length > 0 ? enVoices : voices;
        setAvailableVoices(voicesToUse);
        if (voicesToUse.length > 0 && !selectedVoice) {
          // Prefer natural or female voices often preferred for storybooks
          const gentleVoice = voicesToUse.find(
            (v) =>
              v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Serena') ||
              v.name.includes('Victoria')
          );
          setSelectedVoice(gentleVoice || voicesToUse[0]);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Handle Autoplay if requested
  useEffect(() => {
    if (autoPlayAudio) {
      startAudioNarration();
    }
  }, [autoPlayAudio, story.id]);

  // Clean up speech when switching stories or closing
  useEffect(() => {
    stopAudioNarration();
    setCompleted(false);
    setCurrentParagraphIndex(-1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [story.id]);

  const startAudioNarration = (startIdx = 0) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const fullStoryText = story.fullText;
    if (startIdx >= fullStoryText.length) {
      setIsPlayingAudio(false);
      setCurrentParagraphIndex(-1);
      return;
    }

    setCurrentParagraphIndex(startIdx);
    setIsPlayingAudio(true);
    setIsPausedAudio(false);

    // Scroll active paragraph into view
    paragraphRefs.current[startIdx]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    const utterance = new SpeechSynthesisUtterance(fullStoryText[startIdx]);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onend = () => {
      if (startIdx + 1 < fullStoryText.length) {
        startAudioNarration(startIdx + 1);
      } else {
        setIsPlayingAudio(false);
        setCurrentParagraphIndex(-1);
        setCompleted(true);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      setIsPlayingAudio(false);
    };

    synthRef.current.speak(utterance);
  };

  const pauseAudioNarration = () => {
    if (!synthRef.current) return;
    synthRef.current.pause();
    setIsPausedAudio(true);
  };

  const resumeAudioNarration = () => {
    if (!synthRef.current) return;
    synthRef.current.resume();
    setIsPausedAudio(false);
  };

  const stopAudioNarration = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setCurrentParagraphIndex(-1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${story.title} on FableCraft: ${url}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Font size mapping classes
  const fontSizes = {
    sm: 'text-sm sm:text-base leading-relaxed sm:leading-loose',
    md: 'text-base sm:text-lg leading-relaxed sm:leading-loose',
    lg: 'text-lg sm:text-xl leading-relaxed sm:leading-loose',
    xl: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose',
  };

  // Theme mapping classes
  const themeClasses = {
    parchment: 'bg-[#FFFDF5] text-[#1D3557]',
    midnight: 'bg-[#0F172A] text-[#F1F5F9]',
    daylight: 'bg-[#FFFFFF] text-[#111827]',
  };

  const cardThemeClasses = {
    parchment: 'bg-[#FCF9EE] border-amber-900/10 text-[#1D3557]',
    midnight: 'bg-[#1E293B] border-slate-700 text-slate-200',
    daylight: 'bg-stone-50 border-stone-200 text-stone-900',
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${themeClasses[theme]} transition-colors duration-300`}>
      {/* Printable Header - hidden on screen, appears in print preview */}
      <div className="hidden print-only p-8 text-center border-b border-black mb-6">
        <h1 className="text-3xl font-bold font-serif mb-1">{story.title}</h1>
        <p className="text-sm italic">
          Retold by FableCraft • Original Author: {story.originalAuthor} • Moral: {story.moral}
        </p>
      </div>

      {/* Sticky Reader Top Navigation Bar */}
      <div className="no-print sticky top-0 z-20 backdrop-blur-md bg-inherit/90 border-b border-stone-200/40 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Close & Story Title snippet */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-500/10 transition-colors cursor-pointer"
            title="Close Story Reader"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-serif-title font-bold text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
              {story.title}
            </h2>
            <span className="text-xs text-stone-400 font-serif italic hidden sm:block">
              {story.category} • {story.readTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Center: Audio Player Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isPlayingAudio ? (
            <button
              onClick={() => startAudioNarration(0)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2A9D8F] hover:bg-[#238276] text-white text-xs font-semibold shadow-xs cursor-pointer"
              title="Play Audio Read-Aloud"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Read Aloud</span>
            </button>
          ) : isPausedAudio ? (
            <button
              onClick={resumeAudioNarration}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={pauseAudioNarration}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {isPlayingAudio && (
            <button
              onClick={stopAudioNarration}
              className="p-1.5 rounded-full hover:bg-stone-500/10 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              title="Stop Narration"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Customization Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ask StoryGenie */}
          <button
            onClick={() => onAskGenieAboutStory(story)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30 hover:bg-amber-400/30 transition-colors cursor-pointer"
            title="Ask StoryGenie about this story"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Ask Genie</span>
          </button>

          {/* Reader Preferences Gear / Sliders */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showSettings ? 'bg-amber-500/20 text-amber-600' : 'hover:bg-stone-500/10'
            }`}
            title="Reader Display Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Printable Layout View */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-full hover:bg-stone-500/10 transition-colors cursor-pointer"
            title="Print Story Page"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(story.id)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isBookmarked ? 'text-[#E63946]' : 'hover:bg-stone-500/10'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this story'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-500/10 transition-colors cursor-pointer ml-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reader Settings Drawer / Flyout */}
      {showSettings && (
        <div className="no-print max-w-3xl mx-auto px-4 sm:px-8 pt-4 pb-2">
          <div className={`p-4 rounded-2xl border shadow-lg ${cardThemeClasses[theme]} space-y-4`}>
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/30">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Reader Customization
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Theme Selector */}
              <div>
                <label className="block font-semibold mb-1.5 text-stone-500">Theme Palette</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setTheme('parchment')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border font-medium cursor-pointer ${
                      theme === 'parchment'
                        ? 'border-amber-600 bg-[#FFFDF5] text-amber-900 font-bold'
                        : 'border-stone-300'
                    }`}
                  >
                    Parchment
                  </button>
                  <button
                    onClick={() => setTheme('midnight')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border font-medium cursor-pointer ${
                      theme === 'midnight'
                        ? 'border-indigo-400 bg-slate-900 text-slate-100 font-bold'
                        : 'border-stone-300'
                    }`}
                  >
                    Midnight
                  </button>
                  <button
                    onClick={() => setTheme('daylight')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border font-medium cursor-pointer ${
                      theme === 'daylight'
                        ? 'border-blue-600 bg-white text-stone-900 font-bold'
                        : 'border-stone-300'
                    }`}
                  >
                    Daylight
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block font-semibold mb-1.5 text-stone-500">Text Size</label>
                <div className="flex gap-1">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`flex-1 py-1.5 rounded-lg border text-center font-bold cursor-pointer ${
                        fontSize === sz ? 'bg-[#1D3557] text-white border-[#1D3557]' : 'border-stone-300'
                      }`}
                    >
                      {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : sz === 'lg' ? 'A+' : 'A++'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block font-semibold mb-1.5 text-stone-500">Book Typography</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setFontFamily('serif')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border font-serif cursor-pointer ${
                      fontFamily === 'serif'
                        ? 'bg-[#1D3557] text-white border-[#1D3557]'
                        : 'border-stone-300'
                    }`}
                  >
                    Classic Serif
                  </button>
                  <button
                    onClick={() => setFontFamily('sans')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border font-sans cursor-pointer ${
                      fontFamily === 'sans'
                        ? 'bg-[#1D3557] text-white border-[#1D3557]'
                        : 'border-stone-300'
                    }`}
                  >
                    Clean Sans
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Settings */}
            <div className="pt-2 border-t border-stone-200/30 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-500">Narration Speed:</span>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-24 accent-[#2A9D8F]"
                />
                <span className="text-[11px] font-mono">{speechRate}x</span>
              </div>

              {availableVoices.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-500">Voice:</span>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const v = availableVoices.find((voice) => voice.name === e.target.value);
                      if (v) setSelectedVoice(v);
                    }}
                    className="py-1 px-2 rounded-lg border border-stone-300 bg-inherit text-xs"
                  >
                    {availableVoices.slice(0, 8).map((v) => (
                      <option key={v.name} value={v.name} className="text-black">
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Story Content Container */}
      <main className="max-w-3xl mx-auto px-6 sm:px-12 py-10 sm:py-16 printable-story">
        {/* Story Title & Metadata */}
        <header className="text-center mb-10 pb-8 border-b border-amber-900/10">
          <div className="w-20 h-20 rounded-3xl bg-amber-100/50 border border-amber-300/40 flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm">
            {story.coverEmoji}
          </div>

          <span className="inline-block text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 mb-2">
            {story.category} • Classic Treasury
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif-title tracking-tight mb-3">
            {story.title}
          </h1>

          <p className="text-sm sm:text-base font-serif italic text-stone-500 dark:text-stone-400">
            Recorded & Retold from {story.originalAuthor}
          </p>

          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-stone-500">
            <span>{story.readTimeMinutes} min reading time</span>
            <span>•</span>
            <span>Age: {story.ageGroup}</span>
            <span>•</span>
            <span className="text-amber-500 font-bold">★ {story.rating.toFixed(1)}</span>
          </div>
        </header>

        {/* Guiding Moral Callout Box */}
        <div className={`p-5 rounded-2xl mb-10 border ${cardThemeClasses[theme]} shadow-xs`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                The Core Moral Lesson
              </h4>
              <p className="text-sm sm:text-base font-serif italic leading-relaxed">
                "{story.moral}"
              </p>
            </div>
          </div>
        </div>

        {/* Story Text Paragraphs */}
        <article
          className={`space-y-6 ${fontSizes[fontSize]} ${
            fontFamily === 'serif' ? 'font-storybook' : 'font-sans-friendly'
          }`}
        >
          {story.fullText.map((paragraph, index) => {
            const isHighlighted = currentParagraphIndex === index;
            const isFirst = index === 0;

            return (
              <p
                key={index}
                ref={(el) => {
                  paragraphRefs.current[index] = el;
                }}
                onClick={() => {
                  if (isPlayingAudio) {
                    startAudioNarration(index);
                  }
                }}
                className={`transition-all duration-300 rounded-xl p-2 -mx-2 cursor-pointer ${
                  isFirst ? 'drop-cap' : ''
                } ${
                  isHighlighted
                    ? 'bg-amber-200/40 dark:bg-amber-900/30 ring-2 ring-amber-400/50 shadow-sm'
                    : 'hover:bg-amber-500/5'
                }`}
              >
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Story Completed Badge & Celebration */}
        <div className="no-print mt-12 pt-8 border-t border-stone-200/40 text-center">
          {!completed ? (
            <button
              onClick={() => setCompleted(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2A9D8F] hover:bg-[#238276] text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>I Finished Reading!</span>
            </button>
          ) : (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-slate-800 dark:to-slate-900 border border-amber-300/50 max-w-lg mx-auto shadow-md">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
              <h3 className="font-serif-title text-xl font-bold text-[#1D3557] dark:text-amber-200 mb-1">
                Story Completed!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mb-4">
                You've completed "{story.title}". Hold its gentle wisdom close to your heart as you dream tonight!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => onAskGenieAboutStory(story)}
                  className="px-4 py-2 rounded-xl bg-[#1D3557] hover:bg-[#2a4d7d] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Discuss with StoryGenie
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 text-[#1D3557] dark:text-slate-100 border border-stone-200 dark:border-slate-600 text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShare ? 'Copied Link!' : 'Share Story'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Previous & Next Navigation */}
        <div className="no-print mt-8 flex items-center justify-between pt-6 border-t border-stone-200/30 text-xs font-semibold">
          {hasPrev && onNavigatePrev ? (
            <button
              onClick={onNavigatePrev}
              className="flex items-center gap-1 text-stone-500 hover:text-[#1D3557] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Story
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            Back to Library
          </button>

          {hasNext && onNavigateNext ? (
            <button
              onClick={onNavigateNext}
              className="flex items-center gap-1 text-stone-500 hover:text-[#1D3557] cursor-pointer"
            >
              Next Story <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  );
};
