# Junnot Daniel — portfolio

A bilingual, accessible portfolio built with **TanStack Start, Router, Query and Form**, React 19, TypeScript and Zod. The Next.js implementation has been replaced by file-based routes in `src/routes/`.

## Run locally

Requirements: Node.js 22 or later and npm.

```bash
npm ci --legacy-peer-deps
cp .env.example .env.local       # then fill in the values you need
npm run dev
```

Open <http://localhost:3000> (English) or <http://localhost:3000/fr> (French). `/en` redirects to `/`.

The contact form works without JavaScript. Actual delivery needs at least one configured channel (Gmail or Telegram); with neither configured, the UI reports a delivery failure rather than pretending success. The honeypot path intentionally returns success without delivery.

## Commands

```bash
npm run dev          # TanStack Start/Vite development server
npm run assets       # copy capped WOFF2 fonts and generate responsive AVIF/WebP images
npm run build        # assets + production build + TypeScript check
npm start            # run .output/server/index.mjs (after npm run build)
npm test             # Vitest unit/data/security tests
npm run test:e2e     # Playwright + axe browser gates (Chromium)
npm run lint         # TypeScript check
npm run check:size   # bundle/asset size report and gates
```

For a locally cached Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable. Otherwise run `npx playwright install chromium` first.

## Environment

See `.env.example`. Important production settings:

- `SITE_URL` / `VITE_SITE_URL`: canonical public origin.
- `COOKIE_SECRET`: signs the short-lived no-JS form flash cookie; required in production.
- `CLIENT_IP_HEADER`: the header set by your **trusted** reverse proxy (for example `x-real-ip`). `X-Forwarded-For` is never trusted implicitly. If there is no proxy, set `ALLOW_SHARED_RATE_LIMIT=1` and understand that all visitors then share one rate-limit bucket.
- `ALLOWED_ORIGINS`: optional comma-separated additional origins for contact POSTs (Compose defaults it to `http://localhost:3001` so the form works when you open the container locally).
- `EMAIL_ADDRESS` + `GMAIL_PASSKEY`, or `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`: delivery credentials.

Vite reads `.env.local` during development/build. The built Node server reads secrets from its **runtime process environment**, not from `.env.local`.

## Docker

```bash
COOKIE_SECRET="$(openssl rand -hex 32)" docker compose up --build
```

The container listens on port 3000 and Compose maps it to <http://localhost:3001>. It runs as the non-root `node` user. When deployed behind a proxy, configure that proxy to set the header named by `CLIENT_IP_HEADER`.

## Architecture

- `src/routes/{-$locale}/index.tsx`: optional locale prefix, localized catalogs, SEO, validated contact outcomes.
- `src/components/`: SSR-first portfolio UI; the enhanced contact form is a lazy Suspense boundary with a native POST fallback.
- `src/server/`: Zod Mini schema, Start server functions, raw no-JS POST route, signed flash cookie, origin checks, capped rate limiting and `Promise.allSettled` delivery.
- `src/start.ts`: Start CSRF middleware plus security/cache headers. Production configuration is checked in the server request hook, never while Vite is building/prerendering.
- `docs/design/`: proposals, ratings, final A7 rationale/specification and rendered mockups.
- `docs/a11y-manual-checklist.md`: owner-run NVDA/VoiceOver/TalkBack checklist.

The base pages currently use SSR with `Cache-Control: public, max-age=0, must-revalidate` and no ETag. This is the specification's documented fallback when prerendering is not enabled; contact-outcome URLs are `no-store`. The full script/style CSP is report-only in v1; the frame/base/object/form policy is enforced. No report collector is configured.

## Accessibility and content limits

The UI includes keyboard focus handoff, non-colour active states, 44 px targets, reduced-motion/forced-colour support, native form constraints, live status regions and print styles. Automated checks do not replace the manual screen-reader checklist. Project demo/source URLs and localized hosted PDF résumés are omitted unless supplied by the owner; no placeholder links are rendered.
