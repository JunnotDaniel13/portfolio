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
npm run build:resume # build the resume
```

For a locally cached Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable. Otherwise run `npx playwright install chromium` first.

## CV / Résumé PDF

The CV is maintained in LaTeX, one source per language:

| Language | Source | Published file (served from `public/`) |
| --- | --- | --- |
| English | `cv/cv.tex` | `public/Junnot-Daniel-Resume.pdf` → `/Junnot-Daniel-Resume.pdf` |
| French | `cv/cv-fr.tex` | `public/Junnot-Daniel-CV.pdf` → `/Junnot-Daniel-CV.pdf` |

The Résumé / CV button in the hero links to the PDF that matches the current page language (`personal.resume` in `src/data/portfolio.ts`).

Build and publish both PDFs from the project root:

```bash
npm run build:resume
```

`build:resume` runs `scripts/build-resume.mjs`, which:

1. compiles each `.tex` file with **pdfLaTeX** (two passes, so bookmarks and references settle);
2. copies the English PDF to `public/Junnot-Daniel-Resume.pdf` and the French PDF to `public/Junnot-Daniel-CV.pdf`;
3. deletes the intermediate PDFs from `cv/`. The LaTeX byproducts (`.aux`, `.log`, `.out`) stay there for debugging.

Commit the two files in `public/` after rebuilding.

### LaTeX dependencies

The CV uses the Source Sans LaTeX package and Source Sans 3 Type 1 fonts. These may need to be installed separately from the base TeX Live packages.

On Ubuntu / WSL, install the base LaTeX packages:

```bash
sudo apt update
sudo apt install texlive-latex-base texlive-latex-recommended
```

Verify that the Source Sans package and font files are discoverable:

```bash
kpsewhich sourcesans.sty
kpsewhich SourceSans3-Bold.pfb
```

Both commands should print a file path. If either returns no path, install the missing Source Sans package or font files and refresh the TeX filename database:

```bash
mktexlsr ~/texmf
```

If you install or change a local pdfTeX font map, refresh the user font maps:

```bash
updmap-user --force
```

### Important: use pdfLaTeX, not Tectonic

The Source Sans package and Type 1 fonts in this setup are installed in the local TeX Live tree (`~/texmf`). Tectonic does not automatically use that local TeX Live configuration.

`scripts/build-resume.mjs` calls `pdflatex` directly; do not switch it to `tectonic`.

### Check the generated PDFs

After building, confirm that both files exist:

```bash
ls -lh public/Junnot-Daniel-Resume.pdf public/Junnot-Daniel-CV.pdf
```

If compilation fails, the script exits with an error without showing LaTeX output. Inspect the logs:

```bash
tail -n 30 cv/cv.log cv/cv-fr.log
```

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

The UI includes keyboard focus handoff, non-colour active states, 44 px targets, reduced-motion/forced-colour support, native form constraints, live status regions and print styles. Automated checks do not replace the manual screen-reader checklist. Project demo/source URLs are omitted unless supplied by the owner; no placeholder links are rendered.
