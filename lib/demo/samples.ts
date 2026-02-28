import type { DemoBundle } from '../types';

/**
 * Fallback demo data — pre-generated analysis + images
 * Generated from sample audio files on 2026-02-28
 */
export const DEMO_BUNDLES: DemoBundle[] = [
  {
    analysis: {
          "voiceTone": {
                "emotion": "쓸쓸함",
                "energy": 30,
                "pace": "normal",
                "stability": 80,
                "details": "낮은 톤으로 차분하게 말하며, 말 끝이 약간 내려가 전체적으로 고요하고 사색적인 분위기를 풍깁니다."
          },
          "textContent": {
                "emotion": "그리움",
                "themes": [
                      "모녀 관계",
                      "후회",
                      "그리움"
                ],
                "keywords": [
                      "엄마",
                      "잔소리",
                      "딸",
                      "보고 싶다"
                ],
                "sentiment": -0.4,
                "transcript": "매번 엄마한테 잔소리만 하는 딸이지만 다시 엄마 많이 보고 싶다."
          },
          "concordance": {
                "match": "high",
                "explanation": "차분하고 약간 쓸쓸함이 깃든 목소리 톤이 엄마를 그리워하고 지난 행동을 후회하는 내용과 잘 어우러집니다."
          },
          "coreEmotion": "그리움",
          "summary": "잔소리만 하던 딸이 이제는 엄마의 빈자리를 쓸쓸히 그리워하는 마음.",
          "imagePrompt": {
                "format": "SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette",
                "character": "one small, round, simple white cat (NOT human-like, NOT realistic cat)",
                "angle": "BEHIND or THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)",
                "style": "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
                "scene": "empty bus stop at dusk",
                "catPose": "sitting still looking away",
                "colorPalette": "warm peach/amber/gold",
                "lighting": "twilight gradient sky",
                "forbidden": "NO text, NO words, NO letters, NO human faces, NO other animals"
          }
    },
    imageUrl: '/demo/sample-01.png',
  },
  {
    analysis: {
          "voiceTone": {
                "emotion": "서글픔",
                "energy": 30,
                "pace": "slow",
                "stability": 20,
                "details": "The voice is noticeably tremulous and wavering, especially on longer syllables and at the end of phrases, suggesting a difficulty in maintaining a steady vocal flow. There are short, slightly shaky breaths between phrases, and the overall pitch is a little higher than average, contributing to a fragile, on-the-verge-of-tears quality."
          },
          "textContent": {
                "emotion": "억울함",
                "themes": [
                      "dislike",
                      "hurt",
                      "unfairness",
                      "emotional distress"
                ],
                "keywords": [
                      "미워",
                      "너무",
                      "너무해"
                ],
                "sentiment": -0.9,
                "transcript": "조시 진짜 미워 너무 미워 근데 진짜 밉다고 너무 해 너무 한데 진짜 너무 해"
          },
          "concordance": {
                "match": "high",
                "explanation": "The fragile, tearful voice tone perfectly amplifies the deep hurt and accusation expressed by the words, indicating a strong emotional pain underlying the stated dislike and feeling of being wronged."
          },
          "coreEmotion": "억울함",
          "summary": "깊이 박힌 서운함과 불공평한 현실에 대한 억울함이 가느다란 목소리에 서려 울려 퍼진다.",
          "imagePrompt": {
                "format": "SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette",
                "character": "one small, round, simple white cat",
                "angle": "THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)",
                "style": "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
                "scene": "rainy alley with puddles",
                "catPose": "huddled against wall",
                "colorPalette": "deep indigo/purple",
                "lighting": "single streetlamp glow",
                "forbidden": "NO text, NO words, NO letters, NO human faces, NO other animals"
          }
    },
    imageUrl: '/demo/sample-02.png',
  },
  {
    analysis: {
          "voiceTone": {
                "emotion": "차분함",
                "energy": 40,
                "pace": "normal",
                "stability": 70,
                "details": "차분하고 담담한 음성이지만, 미세한 떨림과 깊은 숨소리가 섞여 있어 어딘가 불안정한 느낌을 준다. 말끝을 올리며 자신을 납득시키려는 듯한 뉘앙스가 있다."
          },
          "textContent": {
                "emotion": "긍정",
                "themes": [
                      "안심",
                      "자신감 표현",
                      "현재 상태 긍정"
                ],
                "keywords": [
                      "괜찮아",
                      "잘 먹고",
                      "잘 지내",
                      "진짜",
                      "정말"
                ],
                "sentiment": 0.8,
                "transcript": "괜찮아. 요새 밥도 잘 먹고 있고 아주 잘 지내. 진짜 잘 지낸다니까? 정말이야."
          },
          "concordance": {
                "match": "low",
                "explanation": "내용은 긍정적이고 자신감 있는 상태를 강하게 어필하지만, 목소리 톤은 이를 온전히 뒷받침하지 못하고 미묘한 불안감과 담담함을 내포하고 있어 불일치한다."
          },
          "coreEmotion": "서글픔",
          "summary": "애써 괜찮다고 말하는 목소리 너머로, 홀로 감내하는 쓸쓸하고 조용한 슬픔이 짙게 배어 나온다.",
          "imagePrompt": {
                "format": "SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette",
                "character": "one small, round, simple white cat (NOT human-like, NOT realistic cat)",
                "angle": "THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)",
                "style": "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
                "scene": "rainy alley with puddles",
                "catPose": "sitting still looking away",
                "colorPalette": "cool blues/lavender",
                "lighting": "single streetlamp glow",
                "forbidden": "NO text, NO words, NO letters, NO human faces, NO other animals"
          }
    },
    imageUrl: '/demo/sample-03.png',
  },
  {
    analysis: {
          "voiceTone": {
                "emotion": "체념",
                "energy": 30,
                "pace": "slow",
                "stability": 80,
                "details": "저음의 느리고 단조로운 어조로, 말끝이 흐려지고 짧은 휴지가 잦아 전체적으로 힘이 없고 지쳐 보인다."
          },
          "textContent": {
                "emotion": "짜증",
                "themes": [
                      "거부",
                      "혐오",
                      "반감"
                ],
                "keywords": [
                      "안 보고 싶어",
                      "꼴도 보기 싫어",
                      "알아"
                ],
                "sentiment": -0.9,
                "transcript": "너 하나도 안 보고 싶어. 알아? 진짜 꼴도 보기 싫어. 꼴도 보기 싫다고."
          },
          "concordance": {
                "match": "low",
                "explanation": "강한 부정적 의미의 발화 내용이 낮은 에너지와 느린 어조로 전달되어, 내용과 음색 간의 불일치가 크다."
          },
          "coreEmotion": "체념",
          "summary": "강한 부정적 감정을 힘없이 토해내는, 지쳐버린 마음의 체념.",
          "imagePrompt": {
                "format": "SQUARE 1:1, fills entire canvas edge to edge, NO margins/borders/vignette",
                "character": "one small, round, simple white cat (NOT human-like, NOT realistic cat)",
                "angle": "BEHIND or THREE-QUARTER BACK VIEW only (hint of one eye OK, never fully front-facing)",
                "style": "oil pastel and crayon on thick textured paper. Visible rough strokes and paper grain. NO black outlines — shapes defined by color contrast only. Edges soft and rough like real crayon. Simple, minimal, children's picture book. NOT photorealistic, NOT 3D, NOT anime, NOT smooth digital",
                "scene": "train platform alone",
                "catPose": "lying flat",
                "colorPalette": "muted grays/beige",
                "lighting": "single streetlamp glow",
                "forbidden": "NO text, NO words, NO letters, NO human faces, NO other animals"
          }
    },
    imageUrl: '/demo/sample-04.png',
  }
];

/** Get a random demo bundle */
export function getRandomDemo(): DemoBundle {
  return DEMO_BUNDLES[Math.floor(Math.random() * DEMO_BUNDLES.length)]!;
}
