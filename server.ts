import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper to get Gemini client
function getGenAIClient(clientKey?: string) {
  const apiKey =
    clientKey?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.VITE_GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback response generator for StoryGenie Chat
function generateFallbackChatResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('three little pigs') || q.includes('wolf')) {
    return "In 'The Three Little Pigs', the third pig succeeds because of dedication, planning, and hard work! Building a brick house took patience, but it provided safety when the big bad wolf blew hard. The story teaches children that taking time to do things properly pays off in the long run.";
  }
  if (q.includes('tortoise') || q.includes('hare')) {
    return "Aesop's 'The Tortoise and the Hare' illustrates that 'slow and steady wins the race.' Overconfidence and boasting can lead to complacency, while consistency and perseverance triumph over sheer natural speed.";
  }
  if (q.includes('boy who cried wolf') || q.includes('honesty')) {
    return "The moral of 'The Boy Who Cried Wolf' is that nobody believes a liar, even when they tell the truth. Trust is easy to lose and hard to rebuild, making honesty one of the most sacred virtues.";
  }
  if (q.includes('recommend') || q.includes('bedtime') || q.includes('sleep')) {
    return "For bedtime tonight, I highly recommend 'The Velveteen Rabbit' or 'The Tale of Peter Rabbit' for warm coziness, or 'The Lion and the Mouse' if you'd like a quick 3-minute tale about how even the smallest friend can be a mighty helper!";
  }
  if (q.includes('moral') || q.includes('lesson')) {
    return "Fables and fairy tales have helped humanity pass down essential wisdom for thousands of years. Whether it's the kindness in Cinderella, the humility in The Ugly Duckling, or the industriousness of the Ant and the Grasshopper, each story is a gentle compass for young hearts.";
  }
  return `Welcome to FableCraft! As StoryGenie, I am delighted to explore the enchanting realm of classic fairy tales, Aesop fables, and bedtime folklore with you. Feel free to ask about any character, explore story morals, or request tailored bedtime story recommendations for any age!`;
}

// Fallback custom bedtime story generator
function generateFallbackStory(theme: {
  childName?: string;
  theme?: string;
  ageGroup?: string;
  moral?: string;
}) {
  const name = theme.childName?.trim() || 'Pip';
  const moral = theme.moral?.trim() || 'Kindness always finds its way back to you';
  const topic = theme.theme?.trim() || 'a magical silver owl in the whispering woods';

  return {
    title: `The Little Journey of ${name} and the Whispering Woods`,
    author: 'StoryGenie Magic Quill',
    ageGroup: theme.ageGroup || '4-8',
    readTimeMinutes: 4,
    moral,
    synopsis: `A gentle bedtime tale where young ${name} discovers that even quiet deeds of gentle warmth can illuminate the deepest starlit forest.`,
    paragraphs: [
      `Once upon a twilight, when the lavender sky began dusting the hilltops with silver stars, little ${name} sat near the mossy garden gate. In the distance, between two ancient oak trees, a faint blue luminescence flickered like a lantern in the wind. It was the enchanted presence of ${topic}.`,
      `"Good evening, little one," chirped a voice as soft as velvet petals. A gentle creature stepped onto the path, holding a thimble filled with golden firefly dust. The creature was lost and weary from a long day across the whispering valleys.`,
      `Without hesitation, ${name} offered a handful of sweet dried berries and softly guided the little traveler along the moonbeam trail. Step by gentle step, they walked through the quiet glade where sleepy bluebells bowed their heads in dreamful slumber.`,
      `"Thank you, ${name}," smiled the magical friend as they reached the heart of the forest. The silver owl spread its wings, and everywhere its gentle feathers touched, sweet lullaby melodies echoed through the trees.`,
      `Remember, dear listener: ${moral}. And with that thought tucked safely into heart and mind, ${name} drifted into the coziest, sweetest dreams beneath the smiling moon.`
    ]
  };
}

// Helper to race promise against timeout
function withTimeout<T>(promise: Promise<T>, ms = 4500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), ms)
    ),
  ]);
}

// POST /api/storygenie/chat
app.post('/api/storygenie/chat', async (req, res) => {
  const { message, storyContext } = req.body;
  const clientKey = req.headers['x-gemini-key'] as string | undefined;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const ai = getGenAIClient(clientKey);

  if (!ai) {
    // Graceful fallback when no key is set
    const fallbackAnswer = generateFallbackChatResponse(message);
    return res.json({
      reply: fallbackAnswer,
      source: 'curated_genie',
      note: 'Using curated response. Add a Gemini API Key in Settings for live dynamic dialogue.'
    });
  }

  try {
    const systemPrompt = `You are "StoryGenie", an enchanting, wise, warm, and comforting storybook AI companion for the digital library FableCraft.
Your mission is to help children, parents, teachers, and story lovers explore classic fairy tales, Aesop fables, bedtime stories, and folklore.
Always be encouraging, gentle, respectful of childhood innocence, and insightful regarding morals and storytelling traditions.
Keep answers engaging, warm, and concise (2-4 paragraphs max).
${storyContext ? `Current Story Context: Title: "${storyContext.title}", Moral: "${storyContext.moral}", Author: "${storyContext.author}"` : ''}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      }),
      4500
    );

    const reply = response.text || generateFallbackChatResponse(message);
    return res.json({
      reply,
      source: 'gemini',
    });
  } catch (error: any) {
    console.warn('Gemini API chat fallback triggered:', error?.message || error);
    const fallbackAnswer = generateFallbackChatResponse(message);
    return res.json({
      reply: fallbackAnswer,
      source: 'curated_genie',
      warning: 'Live AI request had an issue; served through StoryGenie enchanted fallback.'
    });
  }
});

// POST /api/storygenie/generate
app.post('/api/storygenie/generate', async (req, res) => {
  const { childName, theme, ageGroup, moral, storyLength } = req.body;
  const clientKey = req.headers['x-gemini-key'] as string | undefined;

  const ai = getGenAIClient(clientKey);

  if (!ai) {
    const fallbackStory = generateFallbackStory({ childName, theme, ageGroup, moral });
    return res.json({
      story: fallbackStory,
      source: 'curated_genie',
    });
  }

  try {
    const prompt = `Write a charming, original bedtime story or fable for children.
Child's Name: ${childName || 'Little Wanderer'}
Theme / Animal / Setting: ${theme || 'A friendly dragon who loves stargazing'}
Target Age Group: ${ageGroup || '4-8'}
Target Moral Lesson: ${moral || 'True friendship is about sharing and listening'}
Length: ${storyLength || 'Medium (~4 paragraphs)'}

Format your response as a valid JSON object matching this schema:
{
  "title": "Title of the Story",
  "author": "StoryGenie & " + child's name,
  "ageGroup": "${ageGroup || '4-8'}",
  "readTimeMinutes": 4,
  "moral": "The core moral lesson in 1 sentence",
  "synopsis": "A 1-2 sentence preview",
  "paragraphs": ["Paragraph 1", "Paragraph 2", "Paragraph 3", "Paragraph 4"]
}
Return only JSON.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      }),
      5500
    );

    const text = response.text?.trim() || '';
    let parsedStory;
    try {
      parsedStory = JSON.parse(text);
    } catch {
      // Clean possible markdown code fences
      const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedStory = JSON.parse(clean);
    }

    return res.json({
      story: parsedStory,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini API story generation error:', error?.message || error);
    const fallbackStory = generateFallbackStory({ childName, theme, ageGroup, moral });
    return res.json({
      story: fallbackStory,
      source: 'curated_genie',
    });
  }
});

// Production static assets or Vite middleware in dev
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : (isProduction ? 8080 : 3000);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FableCraft Server listening on http://0.0.0.0:${port} (Env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
