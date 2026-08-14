# AI Prompt Generator

Give it a topic — a sentence, a phrase, or a few keywords — and pick a tone. It
returns the **top 5 ready-to-use AI chatbot prompts** for that topic, generated
live by Claude (Haiku 4.5), with an automatic fallback to a built-in template
engine if the live model call ever fails.

Built by [ItsDad](https://itsdad.io).

## Features

- Live AI generation via the Anthropic API, with automatic graceful fallback
- 6 tone/style presets (Professional, Casual, Funny, Cinematic, Technical, Creative)
- Shuffle — regenerate a different set of 5 angles for the same topic
- Local generation history (stored in the browser, no account required)
- Server-side rate limiting (configurable daily free cap per IP)
- SEO metadata, Open Graph image, sitemap, robots.txt
- Terms of Use / Privacy Policy pages with AI-processing disclosure
- Vercel Web Analytics + first-touch UTM attribution + structured server logs

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui ·
Anthropic SDK · Vercel Analytics

## Getting started (local development)

```bash
npm install
cp .env.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY (get one at https://console.anthropic.com)
npm run dev
```

Open http://localhost:3000.

Without an `ANTHROPIC_API_KEY`, the app still works — it automatically falls
back to a deterministic, template-based prompt engine (`lib/promptEngine.ts`).

## Environment variables

See [`.env.example`](./.env.example) for the full list. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | No (recommended) | Enables live Claude generation. Falls back to built-in engine if unset or if the API call fails. |
| `FREE_DAILY_GENERATION_LIMIT` | No (default `10`) | Server-side daily generation cap per client IP. |
| `PRO_DAILY_GENERATION_LIMIT` | No (default `500`) | Reserved for a future paid tier — not enforced yet, no billing is wired up. |
| `NEXT_PUBLIC_SITE_URL` | No (default `https://prompts.itsdad.io`) | Canonical URL used in metadata, Open Graph tags, and the sitemap. Set this to match the real deployed domain. |

**Never commit `.env.local` or any real API key.** `.gitignore` already excludes it.

## Scripts

```bash
npm run dev     # start the dev server (Turbopack)
npm run build   # production build (forces NODE_ENV=production explicitly)
npm run start   # run the production build locally
npm run lint    # ESLint
npm run test    # run the automated test suite (tests/*.test.ts, via tsx)
```

## Testing

Automated tests cover the two correctness-critical modules:

- `tests/promptEngine.test.ts` — the built-in prompt generation engine (determinism, shuffle variety, tone fallback, output shape)
- `tests/rateLimit.test.ts` — the rate limiter and client-identifier extraction (quota enforcement, per-client isolation, proxy header handling)

Run them with `npm run test`. They use a small zero-dependency harness
(`tests/test-utils.ts`) rather than a full test framework, because the
project's PostCSS/Tailwind config conflicts with Vitest 4's Vite-based config
loader in this CommonJS setup — this was root-caused and worked around
rather than skipped.

## Architecture notes

- **Rate limiting** (`lib/rateLimit.ts`): server-side, in-memory sliding
  24-hour window per client IP (`x-forwarded-for` / `x-real-ip`). This is
  correct on a single server instance. On a multi-instance serverless
  deployment (e.g. Vercel with concurrent function instances), each instance
  has its own memory, so a client could get up to N requests *per warm
  instance* rather than one global N. For strict multi-instance enforcement
  at scale, swap `MemoryStore` for a shared store like Upstash Redis
  (`@upstash/ratelimit` + `@upstash/redis`) — the module's public interface
  (`checkRateLimit`, `getClientIdentifier`) is intentionally small so that's
  a one-file change, not a rewrite.
- **Cost protection**: input length is capped (500 chars), Claude's
  `max_tokens` is capped (1200), and the Anthropic SDK client is configured
  with a 20s request timeout. The user-supplied topic is always passed as
  inert data inside a labeled "Topic:" field, never concatenated into the
  system instructions, to reduce prompt-injection risk against the system
  prompt itself.
- **Monetization** (`lib/entitlements.ts`): a plan/tier scaffold exists
  (`free` / `pro`) but no billing provider is connected, so everyone
  currently resolves to `free`. This is intentional — pricing and payment
  wiring were not invented per project rules. Swapping in real billing later
  only requires changing `resolvePlanTier()`.
- **Analytics** (`lib/track.ts`, `lib/analytics-events.ts`): client events go
  through Vercel Web Analytics (works automatically once deployed on
  Vercel — no extra API key needed) enriched with first-touch UTM
  attribution (`hooks/use-attribution.ts`). Server events are structured
  JSON log lines with no secrets or full prompt text.

## Deployment (Vercel)

1. Push this repository to GitHub (already done if you're reading this from
   the repo).
2. Import the repo in Vercel.
3. Set the environment variables from `.env.example` in the Vercel project
   settings (Production + Preview as needed).
4. Deploy. Vercel auto-detects Next.js — no custom build command needed
   beyond the `build` script already in `package.json`.
5. Point your domain (e.g. `prompts.itsdad.io`) at the Vercel project and
   update `NEXT_PUBLIC_SITE_URL` to match.

## Legal

`/terms` and `/privacy` contain starting drafts with an explicit AI-processing
disclosure (user input is sent to Anthropic's Claude API). They are marked as
drafts pending owner/legal review — see the pages themselves for the exact
language that still needs sign-off (dates, contact email).
