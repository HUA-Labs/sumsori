/**
 * Sumsori — Type Definitions
 * Gemini 3 Seoul Hackathon (2026-02-28)
 */

// ============================================================
// Gemini Analysis Response (from /api/analyze)
// ============================================================

export interface VoiceTone {
  /** Emotion detected PURELY from voice acoustics (Korean) */
  emotion: string;
  /** Energy level 0-100 */
  energy: number;
  /** Speech pace */
  pace: 'slow' | 'normal' | 'fast';
  /** Voice stability 0-100 */
  stability: number;
  /** Acoustic observations (breathing, pauses, pitch changes) */
  details: string;
}

export interface TextContent {
  /** Emotion from word meaning only (Korean) */
  emotion: string;
  /** Topic themes */
  themes: string[];
  /** Notable keywords */
  keywords: string[];
  /** Sentiment score -1.0 to 1.0 */
  sentiment: number;
  /** Verbatim Korean transcription */
  transcript: string;
}

export interface Concordance {
  /** Alignment between voice tone and text content */
  match: 'high' | 'medium' | 'low';
  /** One sentence explaining match/mismatch */
  explanation: string;
}

export interface ImagePrompt {
  format: string;
  character: string;
  angle: string;
  style: string;
  scene: string;
  catPose: string;
  colorPalette: string;
  lighting: string;
  forbidden: string;
}

/** Full Gemini analysis result */
export interface EmotionAnalysis {
  voiceTone: VoiceTone;
  textContent: TextContent;
  concordance: Concordance;
  /** Single precise Korean emotion word (e.g. 서운함, 그리움, 체념) */
  coreEmotion: string;
  /** One poetic Korean sentence summarizing the nuance */
  summary: string;
  /** Structured image generation prompt */
  imagePrompt: ImagePrompt;
}

// ============================================================
// API: POST /api/analyze
// ============================================================

export interface AnalyzeResponse {
  success: boolean;
  data?: {
    cardId: string;
    voiceTone: VoiceTone;
    textContent: TextContent;
    concordance: Concordance;
    coreEmotion: string;
    summary: string;
    image: {
      url: string;
    };
  };
  error?: string;
}

// ============================================================
// API: POST /api/card/message
// ============================================================

export interface CardMessageRequest {
  cardId: string;
  message: string;
}

export interface CardMessageResponse {
  success: boolean;
}

// ============================================================
// Card (DB row / share page)
// ============================================================

export interface Card {
  id: string;
  user_id: string | null;
  nickname: string | null;
  voice_tone: VoiceTone;
  text_content: TextContent;
  concordance: Concordance;
  core_emotion: string;
  /** Visible to sender only — NOT shown on shared card */
  summary: string;
  image_url: string;
  image_prompt: ImagePrompt | null;
  personal_message: string | null;
  created_at: string;
}

/** Subset of Card visible on /card/[id] public share page */
export interface SharedCard {
  id: string;
  image_url: string;
  core_emotion: string;
  personal_message: string | null;
  created_at: string;
}

// ============================================================
// Demo fallback
// ============================================================

export interface DemoBundle {
  analysis: EmotionAnalysis;
  imageUrl: string;
}
