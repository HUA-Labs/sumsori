import { GoogleGenAI } from '@google/genai';

let _genai: GoogleGenAI | null = null;

/** Lazy-init Gemini client (avoids build-time error when key is missing) */
export function getGenAI(): GoogleGenAI {
  if (!_genai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    _genai = new GoogleGenAI({ apiKey });
  }
  return _genai;
}

/** Analysis model — fast, supports audio input */
export const ANALYSIS_MODEL = 'gemini-2.5-flash';

/** Image generation model — Gemini 2.0 Flash (native image gen) */
export const IMAGE_MODEL = 'gemini-2.0-flash-exp';

/** TTS model — Gemini TTS preview */
export const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
