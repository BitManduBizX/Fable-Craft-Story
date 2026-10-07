export interface GenieChatMessage {
  role: 'user' | 'assistant';
  content: string;
  source?: 'gemini' | 'curated_genie';
  timestamp?: string;
}

export interface GeneratedStory {
  title: string;
  author: string;
  ageGroup: string;
  readTimeMinutes: number;
  moral: string;
  synopsis: string;
  paragraphs: string[];
}

const STORAGE_KEY = 'fablecraft_gemini_api_key';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to save API key to localStorage', err);
  }
}

export async function askStoryGenie(
  message: string,
  storyContext?: { title: string; moral: string; author: string }
): Promise<{ reply: string; source: 'gemini' | 'curated_genie' }> {
  const apiKey = getStoredApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['x-gemini-key'] = apiKey;
  }

  try {
    const res = await fetch('/api/storygenie/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, storyContext }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || 'StoryGenie is dreaming softly. Please ask again!',
      source: data.source || 'curated_genie',
    };
  } catch (error: any) {
    console.warn('StoryGenie Chat API failed, using client fallback:', error);
    return {
      reply: `StoryGenie whispers: In the world of fairy tales, every mystery leads to wisdom! Feel free to explore our 33 timeless stories in the library.`,
      source: 'curated_genie',
    };
  }
}

export async function generateCustomBedtimeStory(params: {
  childName?: string;
  theme?: string;
  ageGroup?: string;
  moral?: string;
  storyLength?: string;
}): Promise<{ story: GeneratedStory; source: 'gemini' | 'curated_genie' }> {
  const apiKey = getStoredApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['x-gemini-key'] = apiKey;
  }

  try {
    const res = await fetch('/api/storygenie/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      story: data.story,
      source: data.source || 'curated_genie',
    };
  } catch (error: any) {
    console.warn('Story generation API error, using curated fallback:', error);
    const name = params.childName || 'Little Dreamer';
    return {
      story: {
        title: `The Starlit Lantern of ${name}`,
        author: 'StoryGenie Enchanted Quill',
        ageGroup: params.ageGroup || '4-8',
        readTimeMinutes: 4,
        moral: params.moral || 'Patience and gentle kindness brighten every twilight path.',
        synopsis: `A soothing bedtime journey where ${name} carries a little lantern of fireflies to help friends find their dreamland.`,
        paragraphs: [
          `Once upon a soft blue evening, ${name} looked out the cottage window. The silver moon was rising like a porcelain saucer above the sleeping hills.`,
          `Near the garden lavender bushes, a tiny creature with velvety wings hovered gently. "Hello, ${name}," said the little moth. "Would you help me light the garden lanterns before the stars go to sleep?"`,
          `Together, they tiptoed across the dewy grass. With each kind word, another warm lantern sparkled with amber light, guiding the sleepy bumblebees back into their cozy clover blossoms.`,
          `"Thank you, ${name}," whispered the forest friends as gentle night fell. "Your sweet heart is the brightest lantern of all." And with a contented sigh, ${name} drifted into magical dreams.`
        ]
      },
      source: 'curated_genie',
    };
  }
}
