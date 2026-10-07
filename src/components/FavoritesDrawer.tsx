import React from 'react';
import { X, Bookmark, BookOpen, Trash2 } from 'lucide-react';
import { Story } from '../types/story';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteStories: Story[];
  onReadStory: (story: Story) => void;
  onRemoveFavorite: (storyId: string) => void;
  onClearAll: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favoriteStories,
  onReadStory,
  onRemoveFavorite,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#FFFDF5] text-[#1D3557] h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-amber-900/10 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#E63946] fill-current" />
            <h3 className="font-serif-title font-bold text-lg text-[#1D3557]">
              Saved Bookmarks ({favoriteStories.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favoriteStories.length === 0 ? (
            <div className="text-center py-16 px-4 text-stone-400">
              <Bookmark className="w-12 h-12 mx-auto mb-3 stroke-[1.5] text-stone-300" />
              <p className="font-serif text-base text-stone-600 mb-1">No bookmarked tales yet</p>
              <p className="text-xs">
                Click the bookmark icon on any story card to save it for bedtime reading!
              </p>
            </div>
          ) : (
            favoriteStories.map((story) => (
              <div
                key={story.id}
                className="bg-white p-3.5 rounded-2xl border border-amber-900/10 shadow-xs flex items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    onReadStory(story);
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <span className="text-2xl p-2 bg-amber-50 rounded-xl flex-shrink-0">
                    {story.coverEmoji}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm text-[#1D3557] truncate group-hover:text-[#E63946]">
                      {story.title}
                    </h4>
                    <p className="text-xs text-stone-400 truncate">
                      {story.category} • {story.readTimeMinutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onReadStory(story);
                      onClose();
                    }}
                    className="p-2 text-stone-400 hover:text-[#1D3557] hover:bg-stone-100 rounded-lg cursor-pointer"
                    title="Read Story"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveFavorite(story.id)}
                    className="p-2 text-stone-400 hover:text-[#E63946] hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {favoriteStories.length > 0 && (
          <div className="p-4 border-t border-amber-900/10 bg-amber-50/40 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs text-stone-400 hover:text-[#E63946] font-medium cursor-pointer"
            >
              Clear All Bookmarks
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-[#1D3557] text-white text-xs font-semibold hover:bg-[#2a4d7d] cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
