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
// Text Emotion Analysis (from /api/text-analyze)
// ============================================================

export interface SurfaceEmotion {
  /** Emotion detected from the literal text (what the words say) */
  emotion: string;
  /** Topic themes */
  themes: string[];
  /** Notable keywords */
  keywords: string[];
  /** Sentiment score -1.0 to 1.0 */
  sentiment: number;
}

export interface HiddenEmotion {
  /** The real emotion beneath the surface */
  emotion: string;
  /** Reasoning for why this is the hidden emotion */
  reasoning: string;
}

export interface TtsDirection {
  /** Tone for TTS delivery */
  tone: string;
  /** Pace for TTS delivery */
  pace: string;
  /** Emotion for TTS delivery */
  emotion: string;
  /** Voice character description */
  voiceCharacter: string;
}

/** Full text emotion analysis result */
export interface TextEmotionAnalysis {
  surfaceEmotion: SurfaceEmotion;
  hiddenEmotion: HiddenEmotion;
  concordance: Concordance;
  coreEmotion: string;
  summary: string;
  ttsDirection: TtsDirection;
  imagePrompt: ImagePrompt;
}

// ============================================================
// API: POST /api/text-analyze
// ============================================================

export interface TextAnalyzeResponse {
  success: boolean;
  data?: {
    cardId: string;
    surfaceEmotion: SurfaceEmotion;
    hiddenEmotion: HiddenEmotion;
    concordance: Concordance;
    coreEmotion: string;
    summary: string;
    image: { url: string };
    audio: { url: string };
  };
  error?: string;
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
  /** Surface emotion label (from voice_tone or surface_emotion) */
  surface_label: string | null;
  personal_message: string | null;
  show_transcript: boolean | null;
  text_content: TextContent | null;
  created_at: string;
}

// ============================================================
// Demo fallback
// ============================================================

export interface DemoBundle {
  analysis: EmotionAnalysis;
  imageUrl: string;
}
