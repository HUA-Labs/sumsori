# 2026-02-28 — Sumsori Hackathon Build

## Goal

Build a complete voice-emotion-to-art pipeline for the Gemini 3 Seoul Hackathon:
1-minute voice recording → Gemini emotion analysis → AI image generation → KakaoTalk sharing.

---

## Work Completed

### 1. Project Scaffolding (Phase 0)

- Scaffolded with `npx create-hua sumsori-temp --non-interactive --lang ko`
- Copied scaffold output into existing git repo at `/Users/devin/sumsori`
- Installed additional dependencies: `@google/genai`, `@supabase/supabase-js`, `next-auth@beta`
- Configured `next.config.ts` with Supabase + Kakao CDN image domains
- Configured `hua.config.ts` with `preset: 'product'`, ko-only, Sumsori branding

**Files**: `package.json`, `next.config.ts`, `hua.config.ts`, `tsconfig.json`, `postcss.config.js`

### 2. Theming & Fonts (Phase 0 + 6)

- Applied Sum Diary "Paper" theme colors (light: cream #FDF6EA, dark: purple night #232433)
- Light mode: cyan primary, warm coral accent
- Dark mode: purple primary, vivid purple accent
- Loaded **Gowun Batang** (고운바탕) serif for emotional text via Google Fonts CDN
- Loaded **Pretendard Variable** sans-serif for UI via jsDelivr dynamic subset
- Added custom CSS: `recording-pulse`, `waveform`, `shimmer`, `fade-in`, `spin-slow`, `emotion-tag`, `glass`

**Files**: `app/globals.css`, `app/layout.tsx`

### 3. Auth — Kakao OAuth (Phase 1)

- NextAuth v5 with custom Kakao OAuth provider (not using `@auth/kakao`)
- JWT strategy, no DB sessions — Kakao `providerAccountId` as `user_id`
- Only collects nickname (minimal scope: `profile_nickname`)
- Session type extension via `types/next-auth.d.ts`
- `SessionProvider` wrapper in `app/providers.tsx`

**Files**: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`, `app/providers.tsx`

### 4. Core Infrastructure (Phase 2)

- **Supabase client** (`lib/supabase.ts`): service_role key, server-side only
- **Gemini client** (`lib/gemini.ts`): lazy-init pattern to avoid build-time errors when key missing
  - `gemini-2.5-flash` for analysis, `gemini-2.5-flash-image` for image generation
- **Analysis prompt** (`lib/prompts/analysis.ts`): 5-step Korean emotion analysis
  - Transcription → Voice Tone → Text Content → Concordance → Core Emotion
  - Outputs structured JSON including `imagePrompt` for generation
- **Type definitions** (`lib/types.ts`): Full type system matching Supabase schema
- **Audio recorder hook** (`hooks/useAudioRecorder.ts`):
  - MediaRecorder API with WebM/Opus codec
  - 60-second max duration with auto-stop
  - Real-time waveform data via AnalyserNode (32 frequency bins)
  - State machine: `idle` → `recording` → `stopped`

**Files**: `lib/supabase.ts`, `lib/gemini.ts`, `lib/prompts/analysis.ts`, `lib/types.ts`, `hooks/useAudioRecorder.ts`

### 5. Main Page — State Machine UI (Phase 3)

Single-page app with 4 states:

| State | UI |
|-------|-----|
| LANDING | Logo + tagline + "녹음 시작하기" + "데모로 체험하기" + Kakao login |
| RECORDING | Timer (MM:SS) + live waveform + pulsing stop button |
| ANALYZING | Spinner + shimmer skeleton + "당신의 목소리를 듣고 있어요..." |
| RESULT | Generated image + emotion tag + AI summary + concordance + transcript + message input + share |

- Anonymous recording supported (login optional)
- Auto-submits audio blob when recording stops
- Demo mode returns cached fallback data

**Files**: `app/page.tsx`

### 6. API Pipeline (Phase 3)

**POST /api/analyze** — Single endpoint, full pipeline:
1. Receive audio blob (FormData)
2. Convert to base64
3. Gemini 2.5 Flash: audio → emotion analysis JSON
4. Parse analysis, extract `imagePrompt`
5. Gemini 2.5 Flash Image: structured prompt → PNG
6. Upload PNG to Supabase Storage (`card-images` bucket)
7. Insert card row to Supabase DB
8. Return analysis + image URL + card ID

- `maxDuration = 60` for Vercel
- Demo mode fallback on error
- Auth session read for user attribution (optional)

**POST /api/card/message** — Save personal message to card

**GET /api/cards** — Fetch user's card history (auth required)

**Files**: `app/api/analyze/route.ts`, `app/api/card/message/route.ts`, `app/api/cards/route.ts`

### 7. Share Page — SSR with OG Meta (Phase 4)

- `/card/[id]` — Server-rendered public page
- `generateMetadata()` sets OG title, description, and image for KakaoTalk/social preview
- Shows: image + emotion tag + personal message + date
- AI summary intentionally NOT shown on shared page (sender-only)
- Sharing via `navigator.share()` → native share sheet (KakaoTalk selectable)
- Fallback: clipboard copy

**Files**: `app/card/[id]/page.tsx`

### 8. My Cards (Phase 5)

- `/my` — Card history grid (2-column)
- Auth-gated with redirect prompt
- Each card links to `/card/[id]`
- Shimmer loading skeleton

**Files**: `app/my/page.tsx`

### 9. Demo Mode (Phase 5)

- 2 pre-generated demo bundles with realistic Korean emotion analysis
- Bundle 1: "서글픔" — saying "I'm fine" with tired voice (low concordance)
- Bundle 2: "울컥함" — expressing gratitude to mom with trembling voice (high concordance)
- Random selection, returned as `cardId: 'demo'` (share disabled)

**Files**: `lib/demo/samples.ts`

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| No Prisma | Supabase JS direct — hackathon speed, no migration overhead |
| JWT only | No DB sessions — Kakao providerAccountId as user_id |
| Anonymous recording | Lower barrier — login only needed for /my history |
| Single API call | /api/analyze handles analysis → image → save in one request |
| navigator.share() | No KakaoTalk SDK needed — OG meta handles previews |
| Lazy Gemini init | Prevents build failure when API key not yet set |
| Paper theme colors | Shared with Sum Diary for brand consistency |

---

## Tech Stack (All Open Source)

| Package | License | Purpose |
|---------|---------|---------|
| Next.js 16 | MIT | Framework |
| React 19 | MIT | UI |
| TypeScript 5.9 | Apache-2.0 | Type safety |
| Tailwind CSS 4 | MIT | Styling |
| NextAuth v5 (beta) | ISC | Kakao OAuth |
| @google/genai | Apache-2.0 | Gemini API client |
| @supabase/supabase-js | MIT | DB + Storage |
| @hua-labs/hua | MIT | HUA Framework |
| @hua-labs/ui | MIT | Component library |
| Zustand | MIT | State management |
| Pretendard | OFL | UI font |
| Gowun Batang | OFL | Emotional text font |

**All dependencies are open source (MIT / Apache-2.0 / ISC / OFL). No proprietary packages.**

---

## Build Result

```
✓ Compiled successfully in 2.6s
✓ Generating static pages (7/7) in 148ms

Routes:
  ○ /                    (Static)  — Main app
  ○ /my                  (Static)  — Card history
  ƒ /api/analyze         (Dynamic) — Analysis pipeline
  ƒ /api/auth/[...]      (Dynamic) — Kakao OAuth
  ƒ /api/card/message    (Dynamic) — Save message
  ƒ /api/cards           (Dynamic) — Card list
  ƒ /card/[id]           (Dynamic) — Share page SSR
```

---

## Next Steps

- [ ] Add `GEMINI_API_KEY` to `.env`
- [ ] Test full pipeline: record → analyze → image → share
- [ ] Deploy to Vercel with environment variables
- [ ] Generate demo images for `public/demo/*.png`
- [ ] Add loading progress indicator during analysis (~24s)

---

`#hackathon` `#gemini-3-seoul` `#sumsori` `#voice-emotion` `#ai-art`
