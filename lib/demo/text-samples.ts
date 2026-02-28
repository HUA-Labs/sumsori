import type { TextEmotionAnalysis } from '../types';

export interface TextDemoBundle {
  analysis: TextEmotionAnalysis;
  imageUrl: string;
  audioUrl: string;
}

/**
 * Fallback demo data for text mode — pre-generated analysis
 * Reuses existing demo images (no audio in demo mode)
 */
export const TEXT_DEMO_BUNDLES: TextDemoBundle[] = [
  {
    analysis: {
      surfaceEmotion: {
        emotion: '안심',
        themes: ['자기 위안', '일상', '괜찮음'],
        keywords: ['괜찮아', '잘 지내', '밥', '진짜'],
        sentiment: 0.7,
      },
      hiddenEmotion: {
        emotion: '외로움',
        reasoning: '"진짜"와 "정말"을 반복하며 자신을 납득시키려는 패턴에서 실제로는 괜찮지 않음이 드러남.',
      },
      concordance: {
        match: 'low',
        explanation: '표면은 괜찮다고 강조하지만, 반복과 과장이 오히려 외로움을 드러내고 있다.',
      },
      coreEmotion: '서글픔',
      summary: '애써 괜찮다고 쓰는 글자 사이로, 홀로 감내하는 쓸쓸함이 배어 나온다.',
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
        style: 'oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children\'s picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital',
        scene: 'cafe corner by foggy window',
        catPose: 'sitting with tail wrapped around body',
        colorPalette: 'cool blues/lavender',
        lighting: 'warm interior lamp',
        forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
      },
    },
    imageUrl: '/demo/text-ko-01.png',
    audioUrl: '/demo/text-ko-01.wav',
  },
  {
    analysis: {
      surfaceEmotion: {
        emotion: '그리움',
        themes: ['모녀 관계', '후회', '보고 싶음'],
        keywords: ['엄마', '보고 싶어', '잔소리', '미안'],
        sentiment: -0.3,
      },
      hiddenEmotion: {
        emotion: '미안함',
        reasoning: '잔소리만 했다는 자책이 그리움 뒤에 숨어있으며, 더 잘하지 못한 것에 대한 후회가 깔려있다.',
      },
      concordance: {
        match: 'high',
        explanation: '그리움을 직접적으로 표현하면서 동시에 후회의 마음도 솔직하게 드러내고 있어 표면과 이면이 잘 맞닿아 있다.',
      },
      coreEmotion: '그리움',
      summary: '잔소리하던 딸의 마음 한켠에, 엄마의 빈자리가 아려온다.',
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
        style: 'oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children\'s picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital',
        scene: 'empty bus stop at dusk',
        catPose: 'sitting still looking away',
        colorPalette: 'warm peach/amber/gold',
        lighting: 'twilight gradient sky',
        forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
      },
    },
    imageUrl: '/demo/text-ko-02.png',
    audioUrl: '/demo/text-ko-02.wav',
  },
  {
    analysis: {
      surfaceEmotion: {
        emotion: '분노',
        themes: ['배신감', '서운함', '원망'],
        keywords: ['너무하다', '어떻게', '밉다'],
        sentiment: -0.9,
      },
      hiddenEmotion: {
        emotion: '서운함',
        reasoning: '강한 부정의 말 아래에는 기대했던 사람에게 받은 깊은 상처가 있다.',
      },
      concordance: {
        match: 'medium',
        explanation: '표면의 분노 아래 서운함이 있지만, 말의 강도가 높아 표면의 마음도 진실의 일부이다.',
      },
      coreEmotion: '억울함',
      summary: '미움의 말들 사이로 스며드는 억울함, 미워할수록 더 아픈 마음.',
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
        style: 'oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children\'s picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital',
        scene: 'rainy alley with puddles',
        catPose: 'huddled against wall',
        colorPalette: 'deep indigo/purple',
        lighting: 'single streetlamp glow',
        forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
      },
    },
    imageUrl: '/demo/text-ko-03.png',
    audioUrl: '/demo/text-ko-03.wav',
  },
];

export const TEXT_DEMO_BUNDLES_EN: TextDemoBundle[] = [
  {
    analysis: {
      surfaceEmotion: {
        emotion: 'contentment',
        themes: ['self-sufficiency', 'denial', 'routine'],
        keywords: ['fine', 'great', 'coffee', 'playlist', 'routines'],
        sentiment: 0.8,
      },
      hiddenEmotion: {
        emotion: 'loneliness',
        reasoning: 'The excessive repetition of "really great" and "totally fine" reveals an attempt to convince oneself, masking an underlying loneliness.',
      },
      concordance: {
        match: 'low',
        explanation: 'The words project strong self-sufficiency, but the over-insistence betrays a yearning for connection.',
      },
      coreEmotion: 'wistfulness',
      summary: 'Behind the repeated assurances of being fine, a quiet heart yearns for the warmth of connection.',
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
        style: 'oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children\'s picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital',
        scene: 'beach shore at sunset',
        catPose: 'sitting still looking away',
        colorPalette: 'warm peach/amber/gold',
        lighting: 'twilight gradient sky',
        forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
      },
    },
    imageUrl: '/demo/text-en-01.png',
    audioUrl: '/demo/text-en-01.wav',
  },
  {
    analysis: {
      surfaceEmotion: {
        emotion: 'anger',
        themes: ['denial', 'permission', 'resignation'],
        keywords: ['mad', 'fine', 'completely', 'always do'],
        sentiment: 0.1,
      },
      hiddenEmotion: {
        emotion: 'hurt',
        reasoning: 'The sarcastic repetition of "fine" and "you always do" reveals deep disappointment and a feeling of being consistently let down.',
      },
      concordance: {
        match: 'low',
        explanation: 'The words claim everything is fine, but the pattern of sarcastic repetition clearly conveys suppressed frustration and hurt.',
      },
      coreEmotion: 'resignation',
      summary: 'A weary heart wraps its hurt in layers of "fine", accepting a familiar defeat with quiet exhaustion.',
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
        style: 'oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children\'s picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital',
        scene: 'train platform alone',
        catPose: 'lying flat',
        colorPalette: 'muted grays/beige',
        lighting: 'diffused overcast',
        forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
      },
    },
    imageUrl: '/demo/text-en-02.png',
    audioUrl: '/demo/text-en-02.wav',
  },
  {
    analysis: {
      surfaceEmotion: {
        emotion: 'appreciation',
        themes: ['parental wisdom', 'maturation', 'gratitude'],
        keywords: ['Dad', 'understand', 'Saturday mornings', 'Thank you'],
        sentiment: 0.9,
      },
      hiddenEmotion: {
        emotion: 'tenderness',
        reasoning: 'Beyond the stated gratitude lies a deep tenderness — realizing the love that was always there but never recognized until now.',
      },
      concordance: {
        match: 'high',
        explanation: 'Both surface and hidden emotions align — the explicit gratitude is genuine and runs deep, though enriched by unspoken tenderness.',
      },
      coreEmotion: 'gratitude',
      summary: 'A heart finally understands that every seemingly ordinary moment was an act of quiet, steadfast love.',
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
        style: 'oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children\'s picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital',
        scene: 'beach shore at sunset',
        catPose: 'looking up at sky',
        colorPalette: 'warm peach/amber/gold',
        lighting: 'twilight gradient sky',
        forbidden: 'NO text, NO words, NO letters, NO human faces, NO other animals',
      },
    },
    imageUrl: '/demo/text-en-03.png',
    audioUrl: '/demo/text-en-03.wav',
  },
];

/** Get a random text demo bundle */
export function getRandomTextDemo(locale?: string): TextDemoBundle {
  const bundles = locale === 'en' ? TEXT_DEMO_BUNDLES_EN : TEXT_DEMO_BUNDLES;
  return bundles[Math.floor(Math.random() * bundles.length)]!;
}
