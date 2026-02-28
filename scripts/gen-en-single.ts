/**
 * Generate a single English demo bundle
 * Run: source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /') && npx tsx scripts/gen-en-single.ts
 */
import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const promptFile = readFileSync(resolve(__dirname, '../lib/prompts/analysis-en.ts'), 'utf-8');
const match = promptFile.match(/`([\s\S]*?)`/);
const ANALYSIS_PROMPT_EN = match?.[1] ?? '';

const num = 'en-05';
const voice = 'Samantha';
const rate = 150;
const text = `I was cleaning out my phone yesterday and found this video of us from college. We were just laughing about nothing in the parking lot at like 2 AM. And I realized, you're the only person who's been there through everything. The messy stuff, the good stuff, all of it. I don't say it enough, but you're my person.`;

const tmpDir = resolve(__dirname, '../tmp');
const demoDir = resolve(__dirname, '../public/demo');

async function main() {
  console.log(`[sample-${num}] Warm friend appreciation — bright/emotional`);

  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
  const aiffPath = resolve(tmpDir, `${num}.aiff`);
  const m4aPath = resolve(tmpDir, `${num}.m4a`);

  console.log('Generating TTS audio...');
  execSync(`say -v "${voice}" -r ${rate} -o "${aiffPath}" "${text.replace(/"/g, '\\"')}"`);
  execSync(`afconvert -d aac -f m4af "${aiffPath}" "${m4aPath}"`);

  console.log('Analyzing with Gemini...');
  const audioData = readFileSync(m4aPath);
  const audioBase64 = audioData.toString('base64');

  const analysisRes = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [
        { text: ANALYSIS_PROMPT_EN },
        { inlineData: { mimeType: 'audio/mp4', data: audioBase64 } },
      ],
    }],
  });

  let rawText = analysisRes.text?.trim() ?? '';
  if (rawText.startsWith('```')) {
    rawText = rawText.split('\n').slice(1).join('\n');
    if (rawText.endsWith('```')) rawText = rawText.slice(0, -3).trim();
  }
  rawText = rawText.replace(/,\s*([\]}])/g, '$1');

  const analysis = JSON.parse(rawText);
  console.log(`coreEmotion: ${analysis.coreEmotion}`);
  console.log(`concordance: ${analysis.concordance.match}`);

  writeFileSync(resolve(demoDir, `sample-${num}.json`), JSON.stringify(analysis, null, 2));

  console.log('Generating image...');
  const imagePromptStr = Object.entries(analysis.imagePrompt).map(([k, v]) => `${k}: ${v}`).join('. ');

  const imageRes = await genai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: imagePromptStr,
    config: { responseModalities: ['image', 'text'] },
  });

  if (imageRes.candidates?.[0]?.content?.parts) {
    for (const part of imageRes.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        const buf = Buffer.from(part.inlineData.data, 'base64');
        writeFileSync(resolve(demoDir, `sample-${num}.png`), buf);
        console.log(`Image saved (${(buf.length / 1024).toFixed(0)}KB)`);
        break;
      }
    }
  }

  console.log('\n--- Add to DEMO_BUNDLES_EN ---');
  console.log(JSON.stringify({ analysis, imageUrl: `/demo/sample-${num}.png` }, null, 2));
}

main();
