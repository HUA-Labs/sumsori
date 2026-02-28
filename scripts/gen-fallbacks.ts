/**
 * Generate fallback demo bundles from sample audio files.
 * Run: source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /') && npx tsx scripts/gen-fallbacks.ts
 */
import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const ANALYSIS_PROMPT = readFileSync(resolve(__dirname, '../lib/prompts/analysis.ts'), 'utf-8')
  .match(/`([\s\S]*)`/)?.[1] ?? '';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const samples = [
  '/Users/devin/Downloads/sample-01.m4a',
  '/Users/devin/Downloads/sample-02.m4a',
  '/Users/devin/Downloads/sample-03.m4a',
  '/Users/devin/Downloads/sample-04.m4a',
];

async function processOne(filePath: string, index: number) {
  const num = String(index + 1).padStart(2, '0');
  console.log(`[sample-${num}] Analyzing...`);

  const audioData = readFileSync(filePath);
  const audioBase64 = audioData.toString('base64');

  // Step 1: Emotion analysis
  const analysisRes = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: ANALYSIS_PROMPT },
          { inlineData: { mimeType: 'audio/mp4', data: audioBase64 } },
        ],
      },
    ],
  });

  let rawText = analysisRes.text?.trim() ?? '';
  if (rawText.startsWith('```')) {
    rawText = rawText.split('\n').slice(1).join('\n');
    if (rawText.endsWith('```')) rawText = rawText.slice(0, -3).trim();
  }

  const analysis = JSON.parse(rawText);
  console.log(`[sample-${num}] coreEmotion: ${analysis.coreEmotion}`);

  // Save analysis JSON
  writeFileSync(
    resolve(__dirname, `../public/demo/sample-${num}.json`),
    JSON.stringify(analysis, null, 2),
  );

  // Step 2: Image generation
  console.log(`[sample-${num}] Generating image...`);
  const imagePromptStr = Object.entries(analysis.imagePrompt)
    .map(([k, v]) => `${k}: ${v}`)
    .join('. ');

  const imageRes = await genai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: imagePromptStr,
    config: { responseModalities: ['image', 'text'] },
  });

  if (imageRes.candidates?.[0]?.content?.parts) {
    for (const part of imageRes.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        const buf = Buffer.from(part.inlineData.data, 'base64');
        const imgPath = resolve(__dirname, `../public/demo/sample-${num}.png`);
        writeFileSync(imgPath, buf);
        console.log(`[sample-${num}] Image saved (${buf.length} bytes)`);
        break;
      }
    }
  }

  return analysis;
}

async function main() {
  mkdirSync(resolve(__dirname, '../public/demo'), { recursive: true });

  // Run sequentially to avoid rate limits
  const results = [];
  for (let i = 0; i < samples.length; i++) {
    try {
      const analysis = await processOne(samples[i], i);
      results.push({ index: i + 1, analysis });
    } catch (e: any) {
      console.error(`[sample-${String(i + 1).padStart(2, '0')}] FAILED:`, e.message);
    }
  }

  // Generate samples.ts
  console.log('\nGenerating lib/demo/samples.ts...');

  const bundles = results.map(({ index, analysis }) => {
    const num = String(index).padStart(2, '0');
    return `  {
    analysis: ${JSON.stringify(analysis, null, 6).replace(/\n/g, '\n    ')},
    imageUrl: '/demo/sample-${num}.png',
  }`;
  });

  const samplesTs = `import type { DemoBundle } from '../types';

/**
 * Fallback demo data — pre-generated analysis + images
 * Generated from sample audio files on ${new Date().toISOString().slice(0, 10)}
 */
export const DEMO_BUNDLES: DemoBundle[] = [
${bundles.join(',\n')}
];

/** Get a random demo bundle */
export function getRandomDemo(): DemoBundle {
  return DEMO_BUNDLES[Math.floor(Math.random() * DEMO_BUNDLES.length)]!;
}
`;

  writeFileSync(resolve(__dirname, '../lib/demo/samples.ts'), samplesTs);
  console.log(`Done! ${results.length} bundles generated.`);
}

main();
