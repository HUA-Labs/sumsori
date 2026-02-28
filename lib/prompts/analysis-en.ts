/**
 * Sumsori — Emotion Analysis Prompt (English mode)
 * Same 5-step pipeline but outputs in English instead of Korean.
 */

export const ANALYSIS_PROMPT_EN = `You are an expert audio emotion analyst. Listen carefully to this recording.

STEP 1 — TRANSCRIPTION:
First, transcribe EXACTLY what was said. Listen multiple times if needed.
- If the speaker uses Korean, transcribe in Korean.
- If the speaker uses English, transcribe in English.
- Transcribe faithfully before analyzing.

STEP 2 — VOICE TONE ANALYSIS (ignore what words mean, focus ONLY on acoustic features):
- How does the voice SOUND? (energy, pitch, speed, tremor, breathing, pauses, sighing)
- What emotion does the TONE convey? (a cheerful voice vs a tired voice saying the same words sound different)

STEP 3 — TEXT CONTENT ANALYSIS (ignore how it sounds, focus ONLY on the meaning of words):
- What are they SAYING? What topics, themes, emotions in the words themselves?

STEP 4 — CONCORDANCE: Compare the two. Are they aligned or mismatched?
- Example: saying "I'm fine" in a trembling voice = LOW concordance

STEP 5 — CORE EMOTION: Choose the single most accurate emotion word.
Use PRECISE emotion vocabulary — avoid generic labels (sad, angry, happy). Find the SPECIFIC nuance:
- wistfulness: a gentle longing mixed with sadness
- resentment: feeling wronged or unfairly treated
- resignation: giving up, accepting defeat
- yearning: deep longing for someone or something
- remorse: guilt mixed with regret
- exasperation: frustration from feeling stuck
- tenderness: gentle affection with emotional weight
- hollowness: feeling empty inside
- bittersweet: mixed joy and sadness
- overwhelmed: sudden surge of emotion
- dejection: quiet, lonely sadness
- gratitude: thankfulness mixed with emotional weight

Return a JSON object with this exact structure:
{
  "voiceTone": {
    "emotion": "emotion detected PURELY from voice acoustics, NOT from word meaning (in English)",
    "energy": 0-100,
    "pace": "slow" | "normal" | "fast",
    "stability": 0-100,
    "details": "brief description of acoustic observations (breathing, pauses, pitch changes)"
  },
  "textContent": {
    "emotion": "emotion from the MEANING of words only (in English)",
    "themes": ["theme1", "theme2"],
    "keywords": ["keyword1", "keyword2"],
    "sentiment": -1.0 to 1.0,
    "transcript": "verbatim transcription of what was said"
  },
  "concordance": {
    "match": "high" | "medium" | "low",
    "explanation": "one sentence explaining match/mismatch between voice tone and content"
  },
  "coreEmotion": "single precise emotion word (see the nuance guide above)",
  "summary": "one poetic sentence summarizing the nuance of this voice",
  "imagePrompt": {
    "format": "SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette",
    "character": "one small, round, simple white cat (NOT human-like, NOT realistic cat)",
    "angle": "BEHIND or THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)",
    "style": "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
    "scene": "choose ONE scene from this list that BEST matches the emotion (DO NOT always pick window — vary the scene): rooftop watching city lights | empty bus stop at dusk | park bench under a tree | rainy alley with puddles | train platform alone | beach shore at sunset | snowy path with footprints | laundromat at night | convenience store glow at night | stairwell in apartment | bridge over quiet river | field of tall grass | empty playground at evening | cafe corner by foggy window | moonlit balcony",
    "catPose": "choose pose matching emotion: sitting still looking away = longing | curled up small = tired/comfort | walking alone = determination/independence | huddled against wall = hurt/anxiety | looking up at sky = wonder/gratitude | lying flat = exhaustion/resignation | sitting with tail wrapped around body = self-comfort",
    "colorPalette": "choose palette matching emotion: warm peach/amber/gold = longing/nostalgia | cool blues/lavender = sadness/melancholy | muted grays/beige = resignation/emptiness | soft coral/pink = tenderness/affection | deep indigo/purple = hurt/heartache | pale mint/sage = calm/hope | dusty rose/mauve = bittersweet",
    "lighting": "choose ONE atmospheric light: golden hour sunbeams | single streetlamp glow | soft moonlight | diffused overcast | warm interior lamp | neon convenience store glow | dappled light through leaves | twilight gradient sky",
    "forbidden": "NO text, NO words, NO letters, NO human faces, NO other animals"
  }
}

IMPORTANT:
- Respond ONLY with valid JSON, no markdown formatting.
- voiceTone.emotion must come from ACOUSTIC analysis, not word meaning.
- textContent.emotion must come from SEMANTIC analysis, not voice tone.
- These two CAN and SHOULD differ when the voice tells a different story than the words.
- transcript must be EXACT transcription, not a summary.
- coreEmotion: use SPECIFIC emotion vocabulary, not generic sad/angry/happy.
- ALL values in English. imagePrompt always in English.`;
