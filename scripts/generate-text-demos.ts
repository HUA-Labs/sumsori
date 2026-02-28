/**
 * Generate demo assets (TTS audio + images) for text mode demos.
 *
 * Usage:
 *   npx tsx scripts/generate-text-demos.ts
 *
 * Requires GEMINI_API_KEY in .env
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// ── PCM → WAV (copied from lib/audio-utils.ts) ──
function pcmToWav(
  pcmData: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16,
): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;
  const wav = Buffer.alloc(fileSize);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(fileSize - 8, 4);
  wav.write('WAVE', 8);
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(numChannels, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(byteRate, 28);
  wav.writeUInt16LE(blockAlign, 32);
  wav.writeUInt16LE(bitsPerSample, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataSize, 40);
  pcmData.copy(wav, headerSize);
  return wav;
}

// ── Config ──
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const IMAGE_MODEL = 'gemini-3.1-flash-image-preview';
const DEMO_DIR = path.resolve(__dirname, '../public/demo');

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ── Demo definitions ──
// Original text that the user "wrote" + TTS direction + image prompt

interface DemoDef {
  id: string;          // output filename prefix
  text: string;        // the user's text input
  voice: string;       // Gemini voice name
  ttsDirection: {
    tone: string;
    pace: string;
    emotion: string;
    voiceCharacter: string;
  };
  imagePrompt: Record<string, string>;
  locale: 'ko' | 'en';
}

const DEMOS: DemoDef[] = [
  // ── Korean demos ──
  {
    id: 'text-ko-01',
    text: '나 진짜 괜찮아. 밥도 잘 챙겨 먹고 있고, 요새 잘 지내. 진짜야, 걱정 안 해도 돼.',
    voice: 'Sulafat',
    ttsDirection: {
      tone: '떨리는',
      pace: '느리게',
      emotion: '서글픔',
      voiceCharacter: '조용히 울먹이는',
    },
    imagePrompt: {
      format: 'SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette',
      character: 'one small, round, simple white cat (NOT human-like, NOT realistic cat)',
      angle: 'THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)',
      style: "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
      scene: 'cafe corner by foggy window',
      catPose: 'sitting with tail wrapped around body',
      colorPalette: 'cool blues/lavender',
      lighting: 'warm interior lamp',
      forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
    },
    locale: 'ko',
  },
  {
    id: 'text-ko-02',
    text: '엄마, 맨날 잔소리만 해서 미안해. 요즘 따라 엄마가 너무 보고 싶어.',
    voice: 'Kore',
    ttsDirection: {
      tone: '차분한',
      pace: '느리게',
      emotion: '그리움',
      voiceCharacter: '담담하지만 울먹이는',
    },
    imagePrompt: {
      format: 'SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette',
      character: 'one small, round, simple white cat (NOT human-like, NOT realistic cat)',
      angle: 'BEHIND or THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)',
      style: "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
      scene: 'empty bus stop at dusk',
      catPose: 'sitting still looking away',
      colorPalette: 'warm peach/amber/gold',
      lighting: 'twilight gradient sky',
      forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
    },
    locale: 'ko',
  },
  {
    id: 'text-ko-03',
    text: '너 진짜 너무하다. 나한테 어떻게 그럴 수 있어? 진짜 밉다.',
    voice: 'Enceladus',
    ttsDirection: {
      tone: '힘없는',
      pace: '느리게',
      emotion: '억울함',
      voiceCharacter: '지쳐서 힘없이 토해내는',
    },
    imagePrompt: {
      format: 'SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette',
      character: 'one small, round, simple white cat',
      angle: 'THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)',
      style: "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
      scene: 'rainy alley with puddles',
      catPose: 'huddled against wall',
      colorPalette: 'deep indigo/purple',
      lighting: 'single streetlamp glow',
      forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
    },
    locale: 'ko',
  },

  // ── English demos ──
  {
    id: 'text-en-01',
    text: "Honestly, I'm fine. I've got my coffee, my playlists, my routines. Who needs anyone to come home to? I'm doing great. Really.",
    voice: 'Sulafat',
    ttsDirection: {
      tone: 'strained cheerful',
      pace: 'normal',
      emotion: 'wistfulness',
      voiceCharacter: 'forced brightness masking sadness',
    },
    imagePrompt: {
      format: 'SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette',
      character: 'one small, round, simple white cat (NOT human-like, NOT realistic cat)',
      angle: 'BEHIND or THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)',
      style: "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
      scene: 'beach shore at sunset',
      catPose: 'sitting still looking away',
      colorPalette: 'warm peach/amber/gold',
      lighting: 'twilight gradient sky',
      forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
    },
    locale: 'en',
  },
  {
    id: 'text-en-02',
    text: "I'm not mad. Why would I be mad? It's fine. Do what you want, you always do. It's completely fine.",
    voice: 'Kore',
    ttsDirection: {
      tone: 'flat',
      pace: 'normal',
      emotion: 'resignation',
      voiceCharacter: 'weary sarcasm masking deep hurt',
    },
    imagePrompt: {
      format: 'SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette',
      character: 'one small, round, simple white cat (NOT human-like, NOT realistic cat)',
      angle: 'THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)',
      style: "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
      scene: 'train platform alone',
      catPose: 'lying flat',
      colorPalette: 'muted grays/beige',
      lighting: 'diffused overcast',
      forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
    },
    locale: 'en',
  },
  {
    id: 'text-en-03',
    text: "Dad, I finally understand. Those Saturday mornings at the park, the talks about saving money — now that I have my own kid, it all makes sense. Thank you.",
    voice: 'Puck',
    ttsDirection: {
      tone: 'warm',
      pace: 'slow',
      emotion: 'gratitude',
      voiceCharacter: 'sincere and reflective',
    },
    imagePrompt: {
      format: 'SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette',
      character: 'one small, round, simple white cat (NOT human-like, NOT realistic cat)',
      angle: 'THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)',
      style: "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
      scene: 'beach shore at sunset',
      catPose: 'looking up at sky',
      colorPalette: 'warm peach/amber/gold',
      lighting: 'twilight gradient sky',
      forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
    },
    locale: 'en',
  },
];

async function generateTTS(demo: DemoDef): Promise<Buffer> {
  const ttsPrompt =
    demo.locale === 'ko'
      ? `${demo.ttsDirection.emotion}한 톤으로, ${demo.ttsDirection.pace} 속도로, ${demo.ttsDirection.voiceCharacter} 느낌으로 말해줘: "${demo.text}"`
      : `Speak with a ${demo.ttsDirection.emotion} tone, at a ${demo.ttsDirection.pace} pace, with a ${demo.ttsDirection.voiceCharacter} voice: "${demo.text}"`;

  console.log(`  🎙️  Generating TTS for ${demo.id}...`);

  const response = await genai.models.generateContent({
    model: TTS_MODEL,
    contents: ttsPrompt,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: demo.voice },
        },
      },
    },
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        const pcmBuffer = Buffer.from(part.inlineData.data, 'base64');
        return pcmToWav(pcmBuffer);
      }
    }
  }

  throw new Error(`TTS returned no audio for ${demo.id}`);
}

async function generateImage(demo: DemoDef): Promise<Buffer> {
  const promptStr = Object.entries(demo.imagePrompt)
    .map(([k, v]) => `${k}: ${v}`)
    .join('. ');

  console.log(`  🎨  Generating image for ${demo.id}...`);

  const response = await genai.models.generateContent({
    model: IMAGE_MODEL,
    contents: promptStr,
    config: {
      responseModalities: ['image', 'text'],
    },
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }
  }

  throw new Error(`Image generation returned no data for ${demo.id}`);
}

async function main() {
  console.log('🚀 Generating text mode demo assets...\n');

  // Ensure demo directory exists
  if (!fs.existsSync(DEMO_DIR)) {
    fs.mkdirSync(DEMO_DIR, { recursive: true });
  }

  for (const demo of DEMOS) {
    console.log(`\n📦 Processing ${demo.id} (${demo.locale})...`);

    try {
      // Generate TTS and image in parallel
      const [wavBuf, imgBuf] = await Promise.all([
        generateTTS(demo),
        generateImage(demo),
      ]);

      // Write files
      const audioPath = path.join(DEMO_DIR, `${demo.id}.wav`);
      const imagePath = path.join(DEMO_DIR, `${demo.id}.png`);

      fs.writeFileSync(audioPath, wavBuf);
      fs.writeFileSync(imagePath, imgBuf);

      console.log(`  ✅ ${demo.id}.wav (${(wavBuf.length / 1024).toFixed(0)} KB)`);
      console.log(`  ✅ ${demo.id}.png (${(imgBuf.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`  ❌ Failed for ${demo.id}:`, err);
    }
  }

  console.log('\n🎉 Done! Update lib/demo/text-samples.ts to reference the new assets.');
}

main().catch(console.error);
