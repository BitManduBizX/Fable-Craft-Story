import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  BookOpen,
  Key,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Wand2,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Star
} from 'lucide-react';
import {
  askStoryGenie,
  generateCustomBedtimeStory,
  getStoredApiKey,
  setStoredApiKey,
  GenieChatMessage,
  GeneratedStory
} from '../services/geminiService';
import { Story } from '../types/story';

interface StoryGenieModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStoryContext?: Story | null;
  onReadGeneratedStory: (story: Story) => void;
  defaultTab?: 'chat' | 'generator' | 'settings';
}

export const StoryGenieModal: React.FC<StoryGenieModalProps> = ({
  isOpen,
  onClose,
  activeStoryContext,
  onReadGeneratedStory,
  defaultTab = 'chat',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'generator' | 'settings'>(defaultTab);

  // Chat State
  const [chatMessages, setChatMessages] = useState<GenieChatMessage[]>([
    {
      role: 'assistant',
      content: activeStoryContext
        ? `Greetings, young scholar and story lover! I am StoryGenie. We are currently looking at "${activeStoryContext.title}". Would you like to delve into its moral, ask about its characters, or hear how it compares to other fables?`
        : `Greetings! I am StoryGenie, your enchanted storybook companion. Ask me any question about our classic fairy tales, explore the deep morals of Aesop, or ask for personalized bedtime story recommendations!`,
      source: 'curated_genie',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Generator State
  const [childName, setChildName] = useState('');
  const [themePrompt, setThemePrompt] = useState('a little silver dragon who loves counting fireflies');
  const [targetAge, setTargetAge] = useState<'0-3' | '4-8' | '9+'>('4-8');
  const [selectedMoral, setSelectedMoral] = useState('Kindness always returns like a gentle song');
  const [storyLength, setStoryLength] = useState('Medium (~4 paragraphs)');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatedStoryResult, setGeneratedStoryResult] = useState<GeneratedStory | null>(null);

  // Settings State
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [keySavedNotification, setKeySavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsChatLoading(true);

    const context = activeStoryContext
      ? {
          title: activeStoryContext.title,
          moral: activeStoryContext.moral,
          author: activeStoryContext.originalAuthor,
        }
      : undefined;

    try {
      const response = await askStoryGenie(userText, context);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          source: response.source,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'A gentle breeze fluttered the enchanted pages. Every classic fable reminds us: patience and gentle kindness always light our way forward!',
          source: 'curated_genie',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingStory(true);
    setGeneratedStoryResult(null);

    try {
      const res = await generateCustomBedtimeStory({
        childName,
        theme: themePrompt,
        ageGroup: targetAge,
        moral: selectedMoral,
        storyLength,
      });
      setGeneratedStoryResult(res.story);
    } catch (err) {
      console.error('Failed to generate story:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKeyInput);
    setKeySavedNotification(true);
    setTimeout(() => setKeySavedNotification(false), 3000);
  };

  const handleLaunchGeneratedStory = () => {
    if (!generatedStoryResult) return;
    const newStory: Story = {
      id: `custom-${Date.now()}`,
      title: generatedStoryResult.title,
      originalAuthor: generatedStoryResult.author,
      category: 'Bedtime & Cozy',
      ageGroup: (generatedStoryResult.ageGroup as any) || '4-8',
      readTimeMinutes: generatedStoryResult.readTimeMinutes || 4,
      moral: generatedStoryResult.moral,
      themeColor: '#FFB703',
      coverEmoji: '✨',
      summary: generatedStoryResult.synopsis,
      fullText: generatedStoryResult.paragraphs,
      tags: ['Custom', 'StoryGenie', 'Bedtime', 'Magic'],
      collection: 'Bedtime Favorites',
      rating: 5.0,
      featured: true,
    };
    onReadGeneratedStory(newStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-[#FFFDF5] text-[#1D3557] rounded-3xl shadow-2xl border-2 border-amber-900/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#1D3557] via-[#2A4D7D] to-[#1D3557] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading-royal text-lg sm:text-xl font-bold tracking-wide">
                  StoryGenie AI
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  {getStoredApiKey() ? 'Gemini 3.8 Flash' : 'Curated Magic'}
                </span>
              </div>
              <p className="text-xs text-amber-100/80 font-serif italic">
                Your wise, gentle companion for classic tales & bedtime dreams
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-amber-900/10 bg-amber-50/60 px-4 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-[#FFFDF5] text-[#1D3557] border-t-2 border-x-2 border-amber-900/10 shadow-xs'
                : 'text-stone-500 hover:text-[#1D3557]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask StoryGenie</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-[#FFFDF5] text-[#1D3557] border-t-2 border-x-2 border-amber-900/10 shadow-xs'
                : 'text-stone-500 hover:text-[#1D3557]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Story Generator Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#FFFDF5] text-[#1D3557] border-t-2 border-x-2 border-amber-900/10 shadow-xs'
                : 'text-stone-500 hover:text-[#1D3557]'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>API Settings</span>
          </button>
        </div>

        {/* Tab 1: Chat & Q&A */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#FFFDF5]">
            {/* Quick Context Banner if reading a story */}
            {activeStoryContext && (
              <div className="px-4 py-2 bg-amber-100/50 border-b border-amber-200/60 text-xs flex items-center justify-between text-amber-900">
                <span className="truncate">
                  Talking about: <strong className="font-serif">{activeStoryContext.title}</strong>
                </span>
                <span className="text-[11px] text-amber-700 italic flex-shrink-0 ml-2">
                  Moral: {activeStoryContext.moral}
                </span>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1D3557] text-white shadow-xs'
                        : 'bg-white border border-amber-900/10 shadow-xs text-stone-800'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>StoryGenie</span>
                        {msg.source === 'curated_genie' && (
                          <span className="text-[10px] text-stone-400 font-normal ml-1">
                            (Curated)
                          </span>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-amber-900/10 rounded-2xl p-4 text-sm flex items-center gap-2 text-stone-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                    <span className="italic font-serif">StoryGenie is weaving a thoughtful response...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 bg-amber-50/40 border-t border-amber-900/10 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-stone-400 flex-shrink-0 text-[11px] font-semibold">Try:</span>
              <button
                onClick={() => {
                  setChatInput('What is the true moral of The Boy Who Cried Wolf?');
                }}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 whitespace-nowrap cursor-pointer"
              >
                Moral of Boy Who Cried Wolf?
              </button>
              <button
                onClick={() => {
                  setChatInput('Recommend a soothing 3-minute bedtime story for a 4-year-old.');
                }}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 whitespace-nowrap cursor-pointer"
              >
                Bedtime recommendation for 4yo?
              </button>
              <button
                onClick={() => {
                  setChatInput('Why does the tortoise beat the hare in Aesop fables?');
                }}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 whitespace-nowrap cursor-pointer"
              >
                Why Tortoise beats Hare?
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-amber-900/10 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask StoryGenie about morals, characters, bedtime ideas..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D3557]/30 focus:border-[#1D3557]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2.5 rounded-xl bg-[#E63946] hover:bg-[#d02c39] text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Bedtime Story Generator Studio */}
        {activeTab === 'generator' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FFFDF5] space-y-6">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80">
              <h4 className="font-serif-title font-bold text-base text-[#1D3557] mb-1 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-amber-600" />
                Custom Bedtime Story Weaver
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Personalize an enchanting bedtime story or moral fable tailored to your little listener. StoryGenie weaves a unique tale ready to read or listen aloud.
              </p>
            </div>

            {!generatedStoryResult ? (
              <form onSubmit={handleGenerateStory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Child Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">
                      Child / Hero's Name
                    </label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Leo, Maya, Oliver..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#E63946]/30"
                    />
                  </div>

                  {/* Target Age Group */}
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">
                      Age Group
                    </label>
                    <select
                      value={targetAge}
                      onChange={(e) => setTargetAge(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#E63946]/30 cursor-pointer"
                    >
                      <option value="0-3">Toddler / Baby (0-3 yrs - rhythmic & soothing)</option>
                      <option value="4-8">Kids (4-8 yrs - adventurous & imaginative)</option>
                      <option value="9+">Young Reader (9+ yrs - rich vocabulary & wisdom)</option>
                    </select>
                  </div>
                </div>

                {/* Theme / Setting */}
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Favorite Animal, Creature or Setting
                  </label>
                  <input
                    type="text"
                    value={themePrompt}
                    onChange={(e) => setThemePrompt(e.target.value)}
                    placeholder="e.g. A sleepy baby badger searching for moonbeams"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#E63946]/30"
                  />
                </div>

                {/* Moral Lesson */}
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Guiding Moral Lesson
                  </label>
                  <select
                    value={selectedMoral}
                    onChange={(e) => setSelectedMoral(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#E63946]/30 cursor-pointer"
                  >
                    <option value="Kindness always returns like a gentle song">Kindness & Generosity</option>
                    <option value="Patience and steady steps overcome any steep mountain">Patience & Persistence</option>
                    <option value="Sharing brings far greater joy than keeping treasures to oneself">Sharing & Friendship</option>
                    <option value="Honesty builds trust that shields us in storms">Honesty & Truthfulness</option>
                    <option value="Courage means taking small steps even when your paws tremble">Courage & Bravery</option>
                    <option value="Gratitude turns what we have into enough">Gratitude & Contentment</option>
                  </select>
                </div>

                {/* Story Length */}
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Story Length
                  </label>
                  <select
                    value={storyLength}
                    onChange={(e) => setStoryLength(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-[#E63946]/30 cursor-pointer"
                  >
                    <option value="Short (~2-3 paragraphs)">Short & Sweet Bedtime (~3 min)</option>
                    <option value="Medium (~4 paragraphs)">Standard Chapter Tale (~5 min)</option>
                    <option value="Deep (~6 paragraphs)">Deep Starlit Adventure (~8 min)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingStory}
                  className="w-full py-3 rounded-2xl bg-[#E63946] hover:bg-[#d02c39] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingStory ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Weaving Story with Magic...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Weave My Custom Bedtime Story</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-amber-300 shadow-md space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">
                      Generated Masterpiece
                    </span>
                    <h3 className="text-2xl font-bold font-serif-title text-[#1D3557] mt-1">
                      {generatedStoryResult.title}
                    </h3>
                    <p className="text-xs italic text-stone-500 font-serif">
                      By {generatedStoryResult.author}
                    </p>
                  </div>
                  <button
                    onClick={() => setGeneratedStoryResult(null)}
                    className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Create Another</span>
                  </button>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                  <strong>Moral:</strong> "{generatedStoryResult.moral}"
                </div>

                <div className="space-y-3 text-sm text-stone-700 max-h-56 overflow-y-auto pr-2">
                  {generatedStoryResult.paragraphs.map((p, i) => (
                    <p key={i} className="leading-relaxed font-serif">
                      {p}
                    </p>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                  <button
                    onClick={handleLaunchGeneratedStory}
                    className="flex-1 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#238276] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open in Full Story Reader & Audio</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: API Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FFFDF5] space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1D3557]">
                    Google Gemini AI Key Management
                  </h4>
                  <p className="text-xs text-stone-500">
                    Power live dynamic story dialogue and real-time tale generation
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-stone-700 leading-relaxed space-y-2">
                <p>
                  <strong>No Cost, No Credit Card Required:</strong> You can use FableCraft with the built-in enchanted fallback mode immediately. To activate unlimited dynamic responses directly from Gemini 3.8 Flash, you can optionally provide a free Google Gemini API key.
                </p>
                <div className="pt-1">
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-[#E63946] hover:underline"
                  >
                    <span>Get a free Google Gemini API Key at Google AI Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1.5">
                  Your Gemini API Key (stored locally in browser localStorage)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D3557]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSaveApiKey}
                  className="py-2.5 px-6 rounded-xl bg-[#1D3557] hover:bg-[#2A4D7D] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Save API Key
                </button>

                {apiKeyInput && (
                  <button
                    onClick={() => {
                      setApiKeyInput('');
                      setStoredApiKey('');
                    }}
                    className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    Clear Key
                  </button>
                )}
              </div>

              {keySavedNotification && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>API Key configuration saved securely!</span>
                </div>
              )}
            </div>

            {/* Child Safety & Privacy Assurance */}
            <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#1D3557]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Parental Privacy & Child Safety Guardrails</span>
              </div>
              <p className="leading-relaxed">
                StoryGenie adheres strictly to child-safe moral guidelines: no external ads, zero telemetry tracking of children, and family-first content moderation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
