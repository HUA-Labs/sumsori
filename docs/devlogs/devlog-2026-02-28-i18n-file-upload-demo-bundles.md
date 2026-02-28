# Devlog 2026-02-28: i18n + File Upload + Demo Bundles

## Summary

Added full Korean/English internationalization across all UI pages, built a file upload analysis pipeline (beyond mic-only recording), and generated 4 real demo bundles from actual voice samples. This makes Sumsori presentable to English-speaking hackathon judges while keeping the Korean experience intact.

## Changes

### 1. i18n — Korean/English Support

**Why:** Gemini 3 Seoul is an English-speaking hackathon. The app needed to work in both languages without losing the emotional nuance that makes Sumsori unique.

**Files:**
- `translations/ko/common.json`
- `translations/en/common.json`
- `hua.config.ts`
- `app/page.tsx`
- `app/my/page.tsx`

**Before:**
```tsx
// Hardcoded Korean everywhere
<h1>숨소리</h1>
<p>말하지 못한 마음을 그림으로</p>
<button>녹음 시작하기</button>
setError('마이크 권한을 허용해주세요.');
```

**After:**
```tsx
// useTranslation from hua framework
const { t, currentLanguage } = useTranslation();
<h1>{t('common:app.name')}</h1>
<p>{t('common:app.tagline')}</p>
<button>{t('common:landing.startRecording')}</button>
setError(t('common:error.micPermission'));
```

Translation JSON covers 7 sections: app, landing, recording, analyzing, result, my, nav, auth, error, offline. Both ko and en have identical key structures.

`hua.config.ts` updated: `supportedLanguages: ['ko']` → `['ko', 'en']`

### 2. English Analysis Prompt

**Why:** When the UI is in English, the Gemini emotion analysis should also respond in English. But the emotion vocabulary needs to be equally nuanced — not just "sad" or "happy" but "wistfulness", "resignation", "exasperation".

**Files:**
- `lib/prompts/analysis-en.ts`
- `app/api/analyze/route.ts`

**Before:**
```ts
// Only Korean prompt, no locale awareness
const analysisResponse = await getGenAI().models.generateContent({
  contents: [{ parts: [{ text: ANALYSIS_PROMPT }, ...] }],
});
```

**After:**
```ts
// Client sends locale
formData.append('locale', currentLanguage);

// API switches prompts
const locale = formData.get('locale')?.toString() || 'ko';
const analysisResponse = await getGenAI().models.generateContent({
  contents: [{
    parts: [
      { text: locale === 'en' ? ANALYSIS_PROMPT_EN : ANALYSIS_PROMPT },
      { inlineData: { mimeType, data: audioBase64 } },
    ],
  }],
});
```

English prompt includes 12 specific emotion words: wistfulness, resentment, resignation, yearning, remorse, exasperation, tenderness, hollowness, bittersweet, overwhelmed, dejection, gratitude.

### 3. File Upload Pipeline

**Why:** Users should be able to analyze pre-recorded audio files (m4a from iPhone, mp3, wav, etc.), not just live mic recordings. Essential for demos where live recording isn't practical.

**Files:**
- `app/page.tsx`
- `app/api/analyze/route.ts`

**Before:**
```tsx
// Only mic recording, no file upload
<button onClick={handleStart}>녹음 시작하기</button>
<button onClick={handleDemo}>데모로 체험하기</button>
```

**After:**
```tsx
// Added file upload between record and demo buttons
<button onClick={() => fileInputRef.current?.click()}>
  {t('common:landing.uploadFile')}
</button>
<input
  ref={fileInputRef}
  type="file"
  accept={ACCEPTED_AUDIO_TYPES}
  onChange={handleFileUpload}
  className="hidden"
/>
```

MIME type fallback in API route handles iPhone uploads where browser sends `application/octet-stream`:
```ts
const mimeMap: Record<string, string> = {
  webm: 'audio/webm', m4a: 'audio/mp4', mp4: 'audio/mp4',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  aac: 'audio/aac', caf: 'audio/x-caf',
};
```

### 4. Real Demo Bundles (4 samples)

**Why:** Previous demo data was placeholder. Generated 4 bundles from actual Korean voice recordings to showcase the full emotion spectrum and concordance detection during hackathon demo.

**Files:**
- `lib/demo/samples.ts`
- `public/demo/sample-01.{png,json}` through `sample-04.{png,json}`
- `scripts/gen-fallbacks.ts`
- `scripts/gen-single.ts`

| Sample | Core Emotion | Concordance | Description |
|--------|-------------|-------------|-------------|
| 01 | 그리움 (longing) | HIGH | Mom missing her child |
| 02 | 억울함 (resentment) | HIGH | Feeling wronged by someone |
| 03 | 서글픔 (quiet sadness) | LOW | Says "I'm fine" but voice betrays exhaustion |
| 04 | 체념 (resignation) | LOW | Harsh words but defeated voice |

Samples 03 and 04 are the **killing point** — they demonstrate concordance mismatch, where voice tells a different story than words. This is Sumsori's core differentiator.

## Testing

| Test | Result |
|------|--------|
| Build | ✅ Clean, no TS errors |
| Korean UI strings | ✅ All t() keys resolve |
| English UI strings | ✅ Matching key structure |
| File upload (m4a) | ✅ MIME fallback works |
| Demo mode | ✅ 4 bundles rotate randomly |
| Locale → API | ✅ formData.append('locale', currentLanguage) |

## Rollback

If issues arise:
1. Revert the PR commit — all changes are in a single commit on `feat/i18n-demo-pipeline`
2. i18n: `t()` calls will fall back to key strings if translation loading fails (graceful degradation)
3. File upload: removing the upload button doesn't affect existing mic recording flow
4. Demo bundles: old 2-sample fallback can be restored from git history

## Next Steps

- [ ] Apply i18n to components created by other agent (Header.tsx, BottomNav.tsx, LoginSheet.tsx)
- [ ] Add LanguageToggle component to settings or header
- [ ] card/[id] share page — locale-aware footer text and date formatting
- [ ] Vercel deployment with production env vars
- [ ] End-to-end test: record → analyze → share → open shared link
