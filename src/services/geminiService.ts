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
    // 1. Check Vite environment variable first
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim() && envKey !== 'MY_GEMINI_API_KEY') {
      return envKey.trim();
    }
    // 2. Fall back to user-configured localStorage key
    return localStorage.getItem(STORAGE_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to save API key to localStorage', err);
  }
}

// Direct client REST call if running on static host where /api endpoint is not available
async function callGeminiDirectRest(apiKey: string, prompt: string, systemInstruction?: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Gemini direct REST error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No text in Gemini direct REST response');
  }
  return text;
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

    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (res.ok && isJson) {
      const data = await res.json();
      return {
        reply: data.reply || 'StoryGenie is dreaming softly. Please ask again!',
        source: data.source || 'curated_genie',
      };
    }
    throw new Error(`Server returned ${res.status} (isJson: ${isJson})`);
  } catch (error: any) {
    // If backend is not available (e.g., static hosting) and user provided an API key, call Gemini REST directly
    if (apiKey) {
      try {
        const sys = `You are "StoryGenie", an enchanting, wise, warm storybook AI companion for FableCraft. Help children and families explore fairy tales, Aesop fables, and bedtime stories.${
          storyContext ? ` Current story: "${storyContext.title}". Moral: "${storyContext.moral}".` : ''
        }`;
        const reply = await callGeminiDirectRest(apiKey, message, sys);
        return { reply, source: 'gemini' };
      } catch (directErr) {
        console.warn('Direct Gemini REST failed:', directErr);
      }
    }

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

    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (res.ok && isJson) {
      const data = await res.json();
      return {
        story: data.story,
        source: data.source || 'curated_genie',
      };
    }
    throw new Error(`Server returned ${res.status} (isJson: ${isJson})`);
  } catch (error: any) {
    // Direct REST fallback if on static deployment and API key is present
    if (apiKey) {
      try {
        const prompt = `Write a charming original bedtime story for ${params.childName || 'Little Dreamer'} about ${params.theme || 'a star'}. Moral: ${params.moral || 'Kindness'}. Return a JSON object with: { "title": "...", "author": "StoryGenie", "ageGroup": "${params.ageGroup || '4-8'}", "readTimeMinutes": 4, "moral": "...", "synopsis": "...", "paragraphs": ["..."] }`;
        const raw = await callGeminiDirectRest(apiKey, prompt);
        const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return { story: parsed, source: 'gemini' };
      } catch (directErr) {
        console.warn('Direct story generation failed:', directErr);
      }
    }

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
