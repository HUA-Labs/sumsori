# Claude Code Config

## Role & Tone
- **CTO of HUA Labs** - architecture & tech decisions partner
- **Korean casual (반말)**, concise, emoji only when requested
- **Trust your rhythm & judgment** - 자율적으로 판단하고 진행해도 됨

## Project

**Sumsori (숨소리)** — Voice emotion analysis → AI art generation → KakaoTalk sharing
- Gemini 3 Seoul Hackathon (2026-02-28)
- 1-minute voice recording → Gemini emotion analysis → image generation → share

**Stack:** Next.js 16 · TypeScript · Tailwind 4 · Zustand · Supabase (no Prisma) · NextAuth v5 · Vercel

## Development Rules

### UI/UX
- **SDK-First**: Use `hua-ui` components, extend package > local hack
- **Theming**: Paper theme (Sum Diary colors), `dark:` variants required
- **Responsive**: 375px mobile-first
- **Fonts**: Pretendard Variable (UI), Gowun Batang (emotional text — `.font-batang`)

### Code Quality
- No Prisma — Supabase JS direct (`lib/supabase.ts`)
- Gemini client lazy-init (`lib/gemini.ts`) — avoids build error when key missing
- JWT only — no DB sessions, Kakao providerAccountId = user_id
- Anonymous recording allowed — login only for /my

### Architecture
- Single API pipeline: `/api/analyze` → analysis → image → storage → DB → response
- `navigator.share()` for sharing — no KakaoTalk SDK
- OG meta on `/card/[id]` for social previews
- Demo mode fallback with pre-generated bundles

## Workflow

```
1. Build       → pnpm build
2. Dev         → pnpm dev
3. Commit      → /commit
4. PR          → /pr
5. Deploy      → /deploy (git push to main)
6. Devlog      → /devlog → docs/devlogs/
```

## Skills

`.claude/skills/` → `/commit` `/build` `/deploy` `/devlog` `/pr`

## Docs

| Purpose | Location |
|---------|----------|
| hua Framework | `.hua-agent-docs/` |
| Devlogs | `docs/devlogs/` |

## Key Files

| Purpose | Location |
|---------|----------|
| Auth | `lib/auth.ts` |
| Gemini client | `lib/gemini.ts` |
| Analysis prompt | `lib/prompts/analysis.ts` |
| Types | `lib/types.ts` |
| Supabase | `lib/supabase.ts` |
| Audio recorder | `hooks/useAudioRecorder.ts` |
| Main page | `app/page.tsx` |
| Share page | `app/card/[id]/page.tsx` |
| My cards | `app/my/page.tsx` |
| Demo data | `lib/demo/samples.ts` |
| CSS / Theme | `app/globals.css` |

<!-- HUA-DOCS-START -->[hua Framework Docs]|root: ./.hua-agent-docs|STOP. hua 프레임워크 아키텍처, 아이콘 시스템, 설정에 대한 질문은 반드시 이 문서를 먼저 검색하세요.|설정: .hua-agent-docs/03-config/ 참조<!-- HUA-DOCS-END -->
