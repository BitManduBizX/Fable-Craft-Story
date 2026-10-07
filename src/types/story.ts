export type StoryCategory =
  | 'Fairy Tales'
  | 'Fables & Morals'
  | 'Bedtime & Cozy'
  | 'World Folklore'
  | 'Rhymes & Lullabies';

export type AgeGroup = '0-3' | '4-8' | '9+';

export interface Story {
  id: string;
  title: string;
  originalAuthor: string;
  category: StoryCategory;
  ageGroup: AgeGroup;
  readTimeMinutes: number;
  moral: string;
  themeColor: string;
  coverEmoji: string;
  summary: string;
  fullText: string[];
  tags: string[];
  collection: string;
  rating: number;
  featured?: boolean;
  storyOfTheDay?: boolean;
}

export type ReaderTheme = 'parchment' | 'midnight' | 'daylight';
export type ReaderFontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ReaderFontFamily = 'serif' | 'sans';
