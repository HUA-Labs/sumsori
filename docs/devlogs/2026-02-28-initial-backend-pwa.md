# 2026-02-28 Initial Backend Pipeline + Auth + PWA

## Summary

Built the complete backend pipeline, authentication layer, and PWA support for Sumsori hackathon project. All work was done in parallel with frontend scaffolding by another agent.

## What was done

### Backend Pipeline (lib + API routes)

- `lib/types.ts` — Full type definitions matching PoC output format (VoiceTone, TextContent, Concordance, ImagePrompt, EmotionAnalysis, Card, SharedCard, DemoBundle)
- `lib/gemini.ts` — Gemini client with lazy initialization to avoid build-time errors when API key is missing. Updated image model from `gemini-2.5-flash-image` to `gemini-3.1-flash-image-preview` (Nano Banana 2, released 2026-02-26)
- `lib/supabase.ts` — Server-side Supabase client using service_role key (bypasses RLS)
- `lib/prompts/analysis.ts` — 5-step emotion analysis prompt (PoC-validated). Covers transcription, voice tone analysis, text content analysis, concordance check, and core emotion extraction with 12 Korean emotion nuance types
- `lib/demo/samples.ts` — Two fallback demo bundles for network failure / stage safety
- `app/api/analyze/route.ts` — Core pipeline: receive audio blob, Gemini analysis (single call), image generation, Supabase Storage upload, DB insert, return result. 60s Vercel function timeout. Falls back to demo data on any error
- `app/api/card/message/route.ts` — Save personal message to existing card
- `app/api/cards/route.ts` — Fetch authenticated user's card list (ordered by date desc, limit 50)
- `app/card/[id]/page.tsx` — Public share page with SSR, OG meta (image + core emotion for KakaoTalk preview), AI summary intentionally hidden from recipient

### Authentication (NextAuth v5 + Kakao OAuth)

- `lib/auth.ts` — Custom Kakao OAuth provider config (not using built-in Kakao provider to control profile extraction). JWT strategy, extracts Kakao providerAccountId as user_id and nickname from profile
- `auth.d.ts` — Session and JWT type extensions for userId and nickname
- `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `app/providers.tsx` — Client-side SessionProvider wrapper
- Auth integrated into analyze API (user_id + nickname saved with cards) and cards API (filtered by authenticated user)
- Kakao redirect URI: `http://localhost:3000/api/auth/callback/kakao`

### PWA Support

- `app/api/manifest/route.ts` — Dynamic web app manifest (standalone, portrait, dark theme, 8 icon sizes from 72x72 to 512x512)
- `public/sw.js` — Service worker with network-first navigation (offline.html fallback), cache-first for static assets (icons, demo images), precaching of essential resources
- `public/offline.html` — Minimal offline fallback page in Korean
- `app/sw-register.tsx` — Client component for SW registration
- Icons copied from sum-diary (`public/icons/` — 16 files, PNG + SVG at all required sizes)
- Layout updated with manifest link, apple-touch-icon, appleWebApp meta

### Fallback Demo Images

- Generated 2 fallback images using Gemini API (`gemini-2.5-flash-image`):
  - `public/demo/sample-1.png` (1.8MB) — bus stop at dusk, muted gray palette
  - `public/demo/sample-2.png` (1.9MB) — moonlit balcony, warm peach palette

### Model Update

- Switched image generation model from `gemini-2.5-flash-image` to `gemini-3.1-flash-image-preview` (Nano Banana 2). Faster generation, 4K resolution support, better text rendering, character consistency improvements.

## Build Status

Clean build. No TypeScript errors. All routes registered:
- Static: `/`, `/_not-found`, `/my`
- Dynamic: `/api/analyze`, `/api/auth/[...nextauth]`, `/api/card/message`, `/api/cards`, `/api/manifest`, `/api/translations/[language]/[namespace]`, `/card/[id]`

## Files Created/Modified

### Created (14 files)
- `lib/types.ts`
- `lib/gemini.ts`
- `lib/supabase.ts`
- `lib/prompts/analysis.ts`
- `lib/demo/samples.ts`
- `app/api/analyze/route.ts`
- `app/api/card/message/route.ts`
- `app/api/cards/route.ts`
- `app/card/[id]/page.tsx`
- `app/providers.tsx`
- `app/sw-register.tsx`
- `app/api/manifest/route.ts`
- `public/sw.js`
- `public/offline.html`

### Modified (3 files)
- `app/layout.tsx` — SessionProvider, SWRegister, manifest meta, apple-touch-icon
- `next.config.ts` — Added kakaocdn.net to image remote patterns
- `auth.d.ts` — Aligned with lib/auth.ts JWT token shape

### Assets (18 files)
- `public/icons/` — 16 icon files (8 PNG + 8 SVG, 72px to 512px)
- `public/demo/sample-1.png`, `public/demo/sample-2.png` — Gemini-generated fallback images
- `public/logo.svg` — Copied from sum-diary

## Remaining Work

- Frontend: Main page recording UI (MediaRecorder + waveform)
- Frontend: Result card UI (image + emotion tag + summary + message input + share button)
- Frontend: `/my` page card history grid
- Vercel deployment + production env vars
