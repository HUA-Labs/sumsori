/**
 * Generate English demo bundles using macOS TTS → Gemini pipeline
 *
 * Run:
 *   source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /') && npx tsx scripts/gen-en-demos.ts
 *
 * Creates 2 English demo bundles designed for concordance mismatch:
 *   sample-en-01: Cheerful voice saying sad content (LOW concordance)
 *   sample-en-02: Calm, flat voice with angry/frustrated words (LOW concordance)
 */
import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// English analysis prompt
const promptFile = readFileSync(resolve(__dirname, '../lib/prompts/analysis-en.ts'), 'utf-8');
const match = promptFile.match(/`([\s\S]*?)`/);
const ANALYSIS_PROMPT_EN = match?.[1] ?? '';

if (!ANALYSIS_PROMPT_EN) {
  console.error('Failed to extract English analysis prompt');
  process.exit(1);
}

interface DemoScenario {
  num: string;
  voice: string;
  rate: number; // words per minute
  text: string;
  description: string;
}

const scenarios: DemoScenario[] = [
  {
    num: 'en-01',
    voice: 'Samantha',
    rate: 180, // fast, upbeat
    text: `Oh it's totally fine, honestly! I mean, who needs someone to come home to, right? I've got my coffee and my playlist and my little routines. It's great actually. I'm doing really great. Yeah. Really great.`,
    description: 'Cheerful/upbeat voice, lonely/sad content → LOW concordance',
  },
  {
    num: 'en-02',
    voice: 'Daniel',
    rate: 120, // slow, calm
    text: `I just think it's interesting, you know, how you can give everything you have to someone, every single day for years, and they just... decide it wasn't enough. They just walk away like none of it mattered. But hey, that's life I guess.`,
    description: 'Calm/flat voice, resentful/angry content → LOW concordance',
  },
];

const tmpDir = resolve(__dirname, '../tmp');
const demoDir = resolve(__dirname, '../public/demo');

async function generateDemo(scenario: DemoScenario) {
  console.log(`\n[${'='.repeat(50)}]`);
  console.log(`[sample-${scenario.num}] ${scenario.description}`);
  console.log(`Voice: ${scenario.voice}, Rate: ${scenario.rate}`);

  // 1. Generate TTS audio
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
  const aiffPath = resolve(tmpDir, `${scenario.num}.aiff`);
  const m4aPath = resolve(tmpDir, `${scenario.num}.m4a`);

  console.log('Generating TTS audio...');
  execSync(`say -v "${scenario.voice}" -r ${scenario.rate} -o "${aiffPath}" "${scenario.text.replace(/"/g, '\\"')}"`);

  // Convert AIFF to M4A (smaller, compatible)
  execSync(`afconvert -d aac -f m4af "${aiffPath}" "${m4aPath}"`);
  console.log(`Audio: ${m4aPath}`);

  // 2. Send to Gemini for analysis
  console.log('Analyzing with Gemini...');
  const audioData = readFileSync(m4aPath);
  const audioBase64 = audioData.toString('base64');

  const analysisRes = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: ANALYSIS_PROMPT_EN },
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
  rawText = rawText.replace(/,\s*([\]}])/g, '$1');

  const analysis = JSON.parse(rawText);
  console.log(`coreEmotion: ${analysis.coreEmotion}`);
  console.log(`concordance: ${analysis.concordance.match} — ${analysis.concordance.explanation}`);

  // Save analysis JSON
  writeFileSync(resolve(demoDir, `sample-${scenario.num}.json`), JSON.stringify(analysis, null, 2));

  // 3. Generate image
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
        writeFileSync(resolve(demoDir, `sample-${scenario.num}.png`), buf);
        console.log(`Image saved (${(buf.length / 1024).toFixed(0)}KB)`);
        break;
      }
    }
  }

  console.log('\n--- Demo bundle for samples.ts ---');
  console.log(JSON.stringify({
    analysis,
    imageUrl: `/demo/sample-${scenario.num}.png`,
  }, null, 2));

  return analysis;
}

async function main() {
  console.log('Generating English demo bundles...\n');

  for (const scenario of scenarios) {
    try {
      await generateDemo(scenario);
    } catch (e: any) {
      console.error(`[sample-${scenario.num}] Failed:`, e.message);
    }
  }

  console.log('\n\nDone! Check public/demo/ for the generated files.');
  console.log('Next: copy the analysis JSON into lib/demo/samples.ts');
}

main();
