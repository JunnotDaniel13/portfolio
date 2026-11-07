# Design review log

All reviewers ran on **Sonnet** (no Opus anywhere in this task). Roles: **Designer** (`oh-my-claudecode:designer`), **Critic** (`oh-my-claudecode:critic`),
**Analyst** (`oh-my-claudecode:analyst`), **A11y/Perf auditor** (general-purpose, WCAG 2.2 + web performance persona). Scores are each reviewer's *overall* 1–10.
The reviewers were told that 9–10 means "ship unchanged", were given no target score, and independently re-computed every contrast ratio (all confirmed).

## Round 1 — three concepts (`01-proposals.md`)
| Proposal | Designer | Critic | Analyst | A11y/Perf | Average |
|---|---|---|---|---|---|
| A Editorial | 8 | 7 | 7.5 | 8 | 7.6 |
| B Bento | 6 | 5 | 5.5 | 6.5 | 5.9 |
| C Terminal / IDE | 5 | 4 | 4.5 | 5.5 | 4.9 |
Outcome: none ≥ 9 → nothing implemented. B and C dropped (reviewers independently concluded fixing them turns them into A). Elements adopted from them: copy-email with live region, static "status line" motif.
Key findings: dead project links, hover-only image reveal, scroll-reveal opacity trap, unrealistic JS budget, locale routing treated as given, missing state contrasts.

## Round 2 — A2 (`02-proposal-A2.md`)
Designer 8 · Critic 8 · Analyst 8.5 · A11y/Perf 8.5 → average **8.25**. Findings: hero contradicted the data ("self-taught"), unprotected contact function, sticky chrome at 400 % zoom,
identical "Details" labels, 31 icon components vs the JS budget, framework migration not justified in the spec.
Not followed: "drop TanStack Query/Form" — the owner explicitly asked for a TanStack migration; they are code-split into a lazy contact chunk instead.

## Round 3 — A3 (`03-proposal-A3.md`)
Designer 8.5 · Critic 8.5 · Analyst 8.5 · A11y/Perf 8.5 → average **8.5**. Findings: 320 px top-bar overflow, French hero reintroduced "autodidacte", contradictory size gates, no-JS form path hedged,
focus handed to an input (soft keyboard), numerals behind the h2, white icon tiles, spec split across two documents.

## Round 4 — A4 consolidated (`04-final-design-spec.md`)
Designer 8.5 · Critic 8.8 · Analyst 8.5 · A11y/Perf 8.5 (perf 9) → average **8.58**. Findings: Contact not persistent below 640 px, flash cookie lacked a secret/flags, honeypot "silent 200" on a redirect flow,
post-redirect status not announced, no-JS per-field errors, `focusout` menu close unreliable in Safari/Firefox, CDN caching claim without a CDN, nonce vs caching conflict, numerals at 1.4∶1 too faint to be a signature,
`--bar-h` undefined, JS-only controls shown without JS, awkward French calque.

## Round 5 — A5 (`04-final-design-spec.md`, edited in place)
Designer 8.5 · Critic **9** · Analyst **9** · A11y/Perf 8.5 (perf 9) → average **8.75**. Remaining items (all small): no-JS sticky bar covering anchors, shared-IP rate-limit lockout default, missing/`null` Origin rule,
`__Host-` cookie in dev/WebKit, reload edge case for the single-use flash cookie, hedged CSP path, "swap" vs "hydrate in place" wording, eager thumbnail on mobile, ETag on streamed SSR, client validator not named.
Designer: visual quality capped at 8 until the design is seen rendered → a rendered mock-up was requested *before* the build.

## Round 6 — A6 + rendered mock-up (`mockup/`)
Designer 8.5 · Critic 8.7 · Analyst 8.5 (revised **down** from 9.0 after seeing renders) · A11y/Perf 9 → average **8.68**.
The renders exposed what text could not: two competing primary buttons, no project visible above the fold at 900 px, redundant "01" markers, tiny THEME label, inconsistent skill names, colour-only active rail item,
a `<details>` with no disclosure indicator, the email below the fold at 320 px French. All were fixed (mock + spec = A7). The critic also found `frame-ancestors` is ignored in a report-only CSP → separate enforced CSP.

## Implementation, then Gate 8 — post-build review of the BUILT site (`built/`)
Implementation followed spec A7. Verified by me, not just reported: typecheck, unit tests, production build, size gates, Playwright e2e (axe at 320/1280 px x light/dark x en/fr = 0 violations), production-server smoke tests.
Reviewers rated the **built** site from real screenshots and source: Designer **8.5** · Critic **8.0** · Analyst **8.5** · A11y/Perf **8.5** (perf 9) → average **8.4**.
**No design or build reached an average of 9.** Individual ratings of 9 were given (critic and analyst on A5, a11y/perf on A6, perf on the build); every reviewer stated that a 9+ also needs things a written spec or a screenshot
cannot supply (manual screen-reader pass, real project screenshots, hosted PDF resume, project URLs).

Defects found at Gate 8 and fixed afterwards (each verified):
- Submit button was `disabled` instead of `aria-disabled` (focus loss while sending).
- One status element swapped roles; now two persistent `role=status` / `role=alert` regions.
- Char-count threshold announcement could be skipped by a paste; now announces once per threshold crossing.
- Form submit rendered as outline (spec: filled); menu icon did not show the open state.
- Compose default trusted a spoofable `X-Real-IP` and published the port directly; now a shared-limit default, documented how to opt in to a trusted proxy header.
- Chunked bodies bypassed the 8 kB cap (also the unbounded locale pre-read); now streamed with a hard limit and content-type check.
- Flash cookie could exceed the browser limit and had no embedded expiry; values truncated to field caps, `iat` checked.
- Honeypot was checked after validation; now first (silent success regardless of other fields).
- Static-file cache headers were set in the wrong layer (Nitro serves static files before the Start middleware, so the rule never ran); moved to Nitro `routeRules`, dead branches and a misleading test deleted.
- `From: 'Portfolio'` was not an address; compose rejected its own origin.
Not followed: the analyst asked for the rail "Contact" to be filled; the Round-6 designer asked for a single primary and the spec says outline — kept.

Defects found by running the code, not by reviewers:
- The French first-load bundle failed its own size gate by 27 bytes (130,027 > 130,000) — `use-intl`'s ICU parser removed (no ICU features used), now 118.9 kB.
- The image optimiser re-encoded buffers through sharp after fitting them to the cap, discarding the cap (`travel-960.webp` 70.8 kB vs a 60 kB cap).
- The "refuses to start" rule only fired on the first request; added `scripts/start.mjs` boot guard (used by `npm start` and the Dockerfile) with tests.
- Three e2e tests were racing React hydration (clicking before the page was interactive) and one used a value-setting technique React ignores; fixed with a `data-hydrated` marker and `fill()`.
- The old Next.js code (47 tracked files) and ~16 MB of unused design assets were still in the repo; deleted. Image sources moved out of `public/` so ~5 MB of originals are no longer deployed.

## Measured values (production build, this machine)
| Gate | Result | Limit |
|---|---|---|
| First-load JS (en / fr, gzip) | 118.7 kB / 118.9 kB (129.9 / 130.0 kB with `use-intl`) | <= 130 kB |
| Lazy contact chunk (gzip) | 28.5 kB | <= 45 kB |
| Geist Sans / Mono woff2 | 29.4 kB / 23.1 kB | <= 45 / 30 kB |
| Images | all under caps | <= 40 kB AVIF, <= 60 kB WebP |
| Deployed `public/` | 984 kB (was 21 MB) | - |
| CLS (360x640 and 1280x800, en/fr) | **0.0000** | = 0 |
| LCP, 4x CPU + ~Fast-3G emulation | 732-912 ms, element is text (h1 / lede) | <= 2.5 s |
| TBT~ (same profile) | 67-110 ms | <= 200 ms |
Caveat: CLS/LCP/TBT were measured with `PerformanceObserver` in Chromium under CDP throttling, **not** an official Lighthouse run.

## Not done (stated plainly)
- Manual NVDA / VoiceOver / TalkBack pass (`docs/a11y-manual-checklist.md`) - cannot be run here.
- Firefox and WebKit runs - only Chromium is installed.
- Official Lighthouse run.
- Docker image build - Docker is not installed in this environment; the Dockerfile and compose file are reviewed but unbuilt.
- Owner-supplied content: real project screenshots (current thumbnails are illustrations), project demo/source URLs, hosted PDF resumes, outcome lines per role. Reviewers say these cap the audience-fit score below 9.
