import type { DemoBundle } from '../types';

/**
 * Fallback demo data — pre-generated analysis + image
 * Used when network fails or for stage demo safety
 */
export const DEMO_BUNDLES: DemoBundle[] = [
  {
    analysis: {
      voiceTone: {
        emotion: '피로감',
        energy: 35,
        pace: 'slow',
        stability: 42,
        details: '잦은 한숨, 문장 끝 처짐, 낮은 에너지',
      },
      textContent: {
        emotion: '괜찮음',
        themes: ['일상', '안부'],
        keywords: ['괜찮아', '잘 지내'],
        sentiment: 0.8,
        transcript: '아 그냥 괜찮아 잘 지내고 있어...',
      },
      concordance: {
        match: 'low',
        explanation:
          '말은 괜찮다고 하지만 목소리에서는 깊은 피로가 느껴진다',
      },
      coreEmotion: '서글픔',
      summary: '괜찮다는 말 뒤에 숨어 있는, 말하지 못한 피로의 그림자',
      imagePrompt: {
        format: 'SQUARE 1:1, fills entire canvas',
        character: 'one small round white cat',
        angle: 'THREE-QUARTER BACK VIEW',
        style: 'oil pastel and crayon on thick textured paper, lineless',
        scene: 'empty bus stop at dusk',
        catPose: 'sitting still looking away',
        colorPalette: 'muted grays and beige with hints of dusty blue',
        lighting: 'single streetlamp glow',
        forbidden: 'NO text, NO words, NO human faces',
      },
    },
    // placeholder — replace with actual pre-generated image URL
    imageUrl: '/demo/sample-1.png',
  },
  {
    analysis: {
      voiceTone: {
        emotion: '떨림',
        energy: 55,
        pace: 'slow',
        stability: 30,
        details: '목소리 떨림, 중간중간 멈춤, 감정 억누르는 호흡',
      },
      textContent: {
        emotion: '고마움',
        themes: ['가족', '감사'],
        keywords: ['엄마', '고마워', '미안해'],
        sentiment: 0.6,
        transcript: '엄마... 항상 고마웠어. 말로 잘 못했는데...',
      },
      concordance: {
        match: 'high',
        explanation:
          '말과 목소리 모두 깊은 감정을 담고 있다',
      },
      coreEmotion: '울컥함',
      summary: '차마 꺼내지 못했던 고마움이, 떨리는 목소리로 흘러나오는 순간',
      imagePrompt: {
        format: 'SQUARE 1:1, fills entire canvas',
        character: 'one small round white cat',
        angle: 'BEHIND VIEW',
        style: 'oil pastel and crayon on thick textured paper, lineless',
        scene: 'moonlit balcony',
        catPose: 'looking up at sky',
        colorPalette: 'warm peach and amber with gold highlights',
        lighting: 'soft moonlight',
        forbidden: 'NO text, NO words, NO human faces',
      },
    },
    imageUrl: '/demo/sample-2.png',
  },
];

/** Get a random demo bundle */
export function getRandomDemo(): DemoBundle {
  return DEMO_BUNDLES[Math.floor(Math.random() * DEMO_BUNDLES.length)]!;
}
