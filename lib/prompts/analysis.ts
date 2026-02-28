/**
 * Sumsori — Voice Analysis Prompt
 * Single Gemini call: audio → voiceTone + textContent + concordance + coreEmotion + summary + imagePrompt
 */

export const ANALYSIS_PROMPT = `You are an expert Korean audio emotion analyst. Listen carefully to this Korean recording.

STEP 1 — TRANSCRIPTION:
First, transcribe EXACTLY what was said in Korean. Listen multiple times if needed.
- Pay attention to Korean slang, colloquial speech, and informal expressions.
- "짝남", "짝사랑", "썸남" etc. are common Korean relationship terms — do NOT misinterpret them.
- Transcribe faithfully before analyzing.

STEP 2 — VOICE TONE ANALYSIS (ignore what words mean, focus ONLY on acoustic features):
- How does the voice SOUND? (energy, pitch, speed, tremor, breathing, pauses, sighing)
- What emotion does the TONE convey? (a cheerful voice vs a tired voice saying the same words sound different)

STEP 3 — TEXT CONTENT ANALYSIS (ignore how it sounds, focus ONLY on the meaning of words):
- What are they SAYING? What topics, themes, emotions in the words themselves?

STEP 4 — CONCORDANCE: Compare the two. Are they aligned or mismatched?
- Example: saying "괜찮아" in a trembling voice = LOW concordance

STEP 5 — CORE EMOTION: Choose the single most accurate Korean emotion word.
Korean emotions have unique nuances. Use PRECISE Korean emotion vocabulary:
- 서운함: feeling hurt/let down by someone you expected more from (NOT the same as sadness)
- 섭섭함: mild disappointment from unmet expectations in a relationship
- 답답함: frustration from feeling stuck or not being understood
- 서글픔: a quiet, lonely sadness
- 허전함: emptiness, feeling something is missing
- 아쉬움: regret that something didn't work out better
- 억울함: feeling wronged or unfairly treated
- 그리움: longing/missing someone
- 미안함: guilt/sorry feeling
- 고마움: gratitude mixed with emotional weight
- 체념: resignation, giving up
- 울컥함: sudden surge of emotion (tears welling up)
Do NOT default to generic emotions (슬픔, 분노, 행복). Find the SPECIFIC Korean nuance.

Return a JSON object with this exact structure:
{
  "voiceTone": {
    "emotion": "emotion detected PURELY from voice acoustics, NOT from word meaning (in Korean)",
    "energy": 0-100,
    "pace": "slow" | "normal" | "fast",
    "stability": 0-100,
    "details": "brief description of acoustic observations (breathing, pauses, pitch changes)"
  },
  "textContent": {
    "emotion": "emotion from the MEANING of words only (in Korean)",
    "themes": ["theme1", "theme2"],
    "keywords": ["keyword1", "keyword2"],
    "sentiment": -1.0 to 1.0,
    "transcript": "verbatim Korean transcription of what was said"
  },
  "concordance": {
    "match": "high" | "medium" | "low",
    "explanation": "one sentence explaining match/mismatch between voice tone and content"
  },
  "coreEmotion": "single precise Korean emotion word (see the nuance guide above)",
  "summary": "one poetic Korean sentence summarizing the nuance of this voice",
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
- transcript must be EXACT Korean transcription, not a summary or translation.
- coreEmotion: use SPECIFIC Korean emotion vocabulary, not generic 슬픔/분노/행복.
- Korean values for emotion/summary/coreEmotion/transcript. English for imagePrompt.`;
