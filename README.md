# Sumsori (숨소리)

**A communication bridge that reads between the lines — turning unspoken feelings into shareable art.**

Sumsori analyzes what you say (or write) and uncovers what you _really_ mean. It transforms the gap between spoken words and hidden feelings into expressive illustrations, helping people communicate emotions they struggle to put into words.

> Built for the **Google DeepMind Gemini 3 Seoul Hackathon** (Feb 28, 2026)

---

## What It Does

Sumsori serves as a **communication assistant** — not an emotion analyzer, but a tool that helps people deliver the feelings they can't express directly.

### Voice Mode

Record a short voice message (2–30 seconds). Sumsori listens to _how_ you speak (tone, pace, tremor, pauses) alongside _what_ you say (words, themes, sentiment), then reveals the real feeling underneath.

**Example:**
- You say: _"I'm fine, really. Eating well, doing great."_
- Your voice says: Trembling, slow, fragile
- What's really inside: **Loneliness**
- Result: `#contentment → #loneliness` with an illustration of quiet solitude

### Text Mode (Accessibility)

Designed with **deaf and hard-of-hearing users** in mind. Type what you want to say, choose a voice persona, and Sumsori will:

1. Analyze the surface meaning vs. hidden feeling in your words
2. Generate a **spoken audio version** (TTS) with emotional delivery
3. Create an illustration that captures the true feeling

This gives people who communicate primarily through text a way to convey emotional nuance that written words alone can't carry.

### Shareable Cards

Every analysis produces a card you can send to someone:

- An AI-generated illustration (oil pastel style, featuring a small white cat)
- Emotion tags showing the gap: `#surface → #core`
- Your personal message to the recipient
- Optional: include your original transcript

The recipient sees the art, feels the emotion, and reads your words — without raw analysis data getting in the way.

---

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                    USER INPUT                        │
│                                                     │
│   Voice Recording      OR      Written Text          │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────┐
│   Gemini 2.5 Flash   │  │    Gemini 2.5 Flash      │
│                      │  │                          │
│ • Transcribe audio   │  │ • Analyze surface meaning│
│ • Analyze voice tone │  │ • Uncover hidden feeling │
│ • Analyze word meaning│  │ • Generate TTS audio     │
│ • Find concordance   │  │   (with emotional tone)  │
│ • Identify core      │  │ • Find concordance       │
│   emotion            │  │ • Identify core emotion  │
└──────────┬───────────┘  └────────────┬─────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────────────────────────────────────┐
│              Nano Banana 2 (Image Gen)               │
│                                                     │
│  Structured prompt → oil pastel illustration        │
│  Small white cat in emotion-matched scene           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                 SHAREABLE CARD                       │
│                                                     │
│  Illustration + #tags + personal message              │
│  Stored in Supabase, shared via unique URL          │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 with CSS variables |
| AI Models | Gemini 2.5 Flash (analysis), Nano Banana 2 (image gen), Gemini TTS Preview |
| Database | Supabase (PostgreSQL + Storage) |
| Auth | NextAuth v5 with Kakao OAuth |
| State | Zustand |
| i18n | HUA Framework (@hua-labs/hua) — Korean & English |
| UI Kit | @hua-labs/ui, Phosphor Icons |
| Fonts | Gowun Batang (KR serif), Lora (EN serif), Pretendard (sans) |
| Deploy | Google Cloud Run (Docker, Seoul region) |
| PWA | Standalone web app with offline detection |

---

## Features

### Core
- **Voice analysis** — acoustic tone + word meaning + concordance detection
- **Text analysis** — surface vs. hidden emotion with reasoning
- **AI illustration** — emotion-driven oil pastel art (cat character, never front-facing)
- **TTS synthesis** — emotionally directed text-to-speech with 4 voice personas
- **Shareable cards** — public URLs with OG metadata for social previews

### Accessibility
- **Text mode for deaf/HoH users** — full analysis pipeline without audio input
- **Generated voice output** — hear your written words spoken with emotional nuance
- **Bilingual** — full Korean and English support with one-tap switching

### UX
- **Recording preview** — listen before sending (stop → preview → submit)
- **Demo mode** — try with pre-generated samples, no API calls needed
- **PWA** — installable on mobile, standalone display
- **Dark mode** — warm chocolate brown theme, auto-detected
- **Pill buttons, serif typography** — warm, approachable design language

---

## Project Structure

```
sumsori/
├── app/
│   ├── page.tsx                 # Voice recording + analysis
│   ├── text/page.tsx            # Text input + analysis
│   ├── my/page.tsx              # User's saved cards
│   ├── card/[id]/page.tsx       # Public shareable card
│   ├── layout.tsx               # Root layout (fonts, theme, PWA)
│   ├── globals.css              # Design system (CSS variables)
│   └── api/
│       ├── analyze/             # Voice analysis pipeline
│       ├── text-analyze/        # Text analysis + TTS pipeline
│       ├── card/message/        # Save personal message
│       ├── cards/               # Fetch user's cards
│       ├── auth/[...nextauth]/  # OAuth endpoints
│       └── manifest/            # PWA manifest
├── components/
│   ├── Header.tsx               # Logo + theme/language toggles
│   ├── BottomNav.tsx            # Mobile navigation
│   ├── LoginModal.tsx           # Kakao login bottom sheet
│   └── LanguageToggle.tsx       # KO/EN switcher
├── hooks/
│   └── useAudioRecorder.ts      # WebRTC recording + waveform
├── lib/
│   ├── prompts/                 # Gemini analysis prompts (KO/EN)
│   ├── demo/                    # Pre-generated demo bundles
│   ├── gemini.ts                # Gemini API client config
│   ├── supabase.ts              # Supabase client (lazy init)
│   ├── auth.ts                  # NextAuth Kakao config
│   ├── audio-utils.ts           # PCM → WAV conversion
│   └── types.ts                 # TypeScript interfaces
├── translations/
│   ├── ko/common.json           # Korean translations
│   └── en/common.json           # English translations
├── public/
│   ├── demo/                    # Pre-generated demo assets
│   ├── fonts/                   # Lora serif subset (woff2)
│   ├── icons/                   # PWA icons (72–512px)
│   └── images/                  # Logo SVG
├── scripts/
│   ├── deploy-gcp.sh            # Cloud Run deployment
│   └── generate-text-demos.ts   # Generate demo TTS + images
├── Dockerfile                   # Multi-stage Docker build
└── package.json
```

---

## Gemini Models Used

| Model | Purpose | Why |
|-------|---------|-----|
| `gemini-2.5-flash` | Voice/text analysis | Fast, supports audio input, structured JSON output |
| `gemini-3.1-flash-image-preview` | Image generation (Nano Banana 2) | High quality oil pastel illustrations |
| `gemini-2.5-flash-preview-tts` | Text-to-speech | Emotionally directed speech with voice personas |

### Analysis Prompt Design

The analysis prompts are carefully engineered to:

1. **Separate channels** — voice acoustics are analyzed independently from word meaning
2. **Detect concordance** — find the gap (or alignment) between what's said and how it's said
3. **Use nuanced vocabulary** — Korean emotion words like 서운함 (hurt mixed with disappointment), 체념 (resigned acceptance), 억울함 (feeling wronged) that have no direct English equivalent
4. **Generate structured image prompts** — scene, pose, color palette, and lighting are all emotion-mapped to produce consistent, expressive illustrations

### Image Generation

Every illustration follows strict constraints:
- Oil pastel and crayon on textured paper (never photorealistic or digital-looking)
- One small round white cat as the sole character
- Always from behind or three-quarter back view (never front-facing)
- Scene and color palette matched to the detected emotion
- No text, letters, human faces, or other animals

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Gemini API key (with Tier 1+ billing)
- Supabase project (PostgreSQL + Storage)
- Kakao Developer app (for OAuth)

### Environment Variables

```env
# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Supabase Setup

Create the required storage buckets and database table:

```sql
-- Storage buckets (run via Supabase dashboard or API)
-- card-images: public, 10MB limit
-- card-audio: public, 10MB limit

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  nickname TEXT,
  input_mode TEXT DEFAULT 'voice',
  voice_tone JSONB,
  text_content JSONB,
  surface_emotion JSONB,
  hidden_emotion JSONB,
  concordance JSONB,
  core_emotion TEXT,
  summary TEXT,
  image_url TEXT,
  audio_url TEXT,
  image_prompt JSONB,
  personal_message TEXT,
  show_transcript BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Allow public read for shared cards
CREATE POLICY "Public read" ON cards FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access" ON cards FOR ALL USING (true);
```

### Install & Run

```bash
pnpm install
pnpm dev
```

### Build

```bash
pnpm build
pnpm start
```

---

## Deployment (Google Cloud Run)

```bash
# Set your GCP project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# Deploy from source
gcloud run deploy sumsori \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars "GEMINI_API_KEY=...,NEXT_PUBLIC_SUPABASE_URL=...,..."
```

Or use the helper script:

```bash
GCP_PROJECT_ID=your-project-id ./scripts/deploy-gcp.sh
```

---

## Demo Mode

Sumsori includes pre-generated demo bundles for both voice and text modes, so users can experience the full flow without consuming API quota. Demo assets include:

- **Voice demos**: 4 Korean + 5 English scenarios with pre-generated illustrations
- **Text demos**: 3 Korean + 3 English scenarios with pre-generated TTS audio + illustrations

To regenerate text demo assets:

```bash
npx tsx scripts/generate-text-demos.ts
```

---

## Design Philosophy

Sumsori is not a clinical emotion analyzer. It's a **communication bridge**.

The app exists for moments when words aren't enough — when you want to tell someone how you feel but can't find the right way to say it. Sumsori listens to the gap between what you say and what you mean, then translates that gap into something visual and shareable.

The illustrations use a **small white cat** seen from behind or in three-quarter back view (a hint of one eye is OK, but never fully front-facing), because:
- It's universal — not tied to any specific person or identity
- The back/side view invites projection — the viewer fills in the emotion
- Oil pastel style feels handmade, warm, and personal
- The cat is always alone in a scene, mirroring the solitude of unexpressed feelings

The accessibility-first text mode ensures that **everyone** — including deaf and hard-of-hearing users — can use this communication tool. The TTS output gives written words an emotional voice they wouldn't otherwise have.

---

## Prior Work / Open Source

Sumsori is built on top of **HUA Framework**, an open-source UI and i18n toolkit developed by HUA Labs prior to this hackathon:

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — i18n provider, theme system, and shared utilities
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui) — component library (Avatar, Popover, overlays, etc.)

These packages are pre-existing open-source libraries and were **not** built for this hackathon. Everything else — the Gemini integration, analysis prompts, voice/text pipelines, image generation, TTS, demo system, and the Sumsori application itself — was built during the hackathon.

---

## Team

Built by **HUA Labs** for the Google DeepMind Gemini 3 Seoul Hackathon.

---

## License

This project was created for a hackathon and is not currently licensed for redistribution.
