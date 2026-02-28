/**
 * Retry single sample with stricter JSON parsing
 * Run: source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /') && npx tsx scripts/gen-single.ts
 */
import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const filePath = '/Users/devin/Downloads/sample-04.m4a';
const num = '04';

// Read prompt directly
const promptFile = readFileSync(resolve(__dirname, '../lib/prompts/analysis.ts'), 'utf-8');
const ANALYSIS_PROMPT = promptFile.match(/`([\s\S]*?)`/)?.[1] ?? '';

async function main() {
  console.log(`[sample-${num}] Analyzing...`);

  const audioData = readFileSync(filePath);
  const audioBase64 = audioData.toString('base64');

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
  // Strip markdown code fences
  if (rawText.startsWith('```')) {
    rawText = rawText.split('\n').slice(1).join('\n');
    if (rawText.endsWith('```')) rawText = rawText.slice(0, -3).trim();
  }
  // Strip trailing commas before } or ]
  rawText = rawText.replace(/,\s*([\]}])/g, '$1');

  console.log('Raw response (first 500 chars):');
  console.log(rawText.slice(0, 500));
  console.log('---');

  try {
    const analysis = JSON.parse(rawText);
    console.log(`coreEmotion: ${analysis.coreEmotion}`);

    writeFileSync(
      resolve(__dirname, `../public/demo/sample-${num}.json`),
      JSON.stringify(analysis, null, 2),
    );

    // Image generation
    console.log('Generating image...');
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
          writeFileSync(resolve(__dirname, `../public/demo/sample-${num}.png`), buf);
          console.log(`Image saved (${buf.length} bytes)`);
          break;
        }
      }
    }

    // Print the analysis for manual addition to samples.ts
    console.log('\n--- Add to DEMO_BUNDLES ---');
    console.log(JSON.stringify({ analysis, imageUrl: `/demo/sample-${num}.png` }, null, 2));
  } catch (e: any) {
    console.error('JSON parse failed:', e.message);
    console.log('Full raw text:');
    console.log(rawText);
  }
}

main();
