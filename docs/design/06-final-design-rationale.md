# Final design rationale

This explains *why* the shipped design and architecture look the way they do. The full spec is `04-final-design-spec.md`; every review round, score
and measurement is in `05-review-log.md`. All design reviewers ran on Sonnet (no Opus was used for any part of this task).

## Outcome in one paragraph
The site was redesigned as an **"Editorial"** portfolio (typography-led, one accent, sticky section rail, proof-first order) and migrated from Next.js 15 to
**TanStack Start + Router + Query + Form**. **No version reached the requested score of 9 on average.** Scores rose from 7.6 (first Editorial draft) to a best spec average of 8.75,
and the built site was rated 8.4 (8.5 / 8.0 / 8.5 / 8.5). Several individual reviewers did give 9, and each said what stops a full 9: a manual screen-reader pass, real project screenshots,
project links and a hosted PDF résumé — none of which can be produced from a written spec or from this environment. The site was implemented because you asked for it explicitly; the shortfall is documented, not hidden.

## Why this concept (and not the other two)
| | Concept | Round-1 average | Why |
|---|---|---|---|
| **A** | Editorial: one column, sticky rail, proof first | **7.6** → built 8.4 | Fewest widgets, text-only LCP, shortest path to contact, copes with thin content (2 jobs, 4 projects, no links) and with French text ~20 % longer. |
| B | Bento card grid | 5.9 | Equal-weight tiles bury the proof; filler tiles (clock, location); reordering risk between grid and DOM; fixed spans clip French. Reviewers: "fixing it turns it into A". |
| C | Terminal / IDE | 4.9 | Memorable but the worst fit for a recruiter's 30-second skim; command palette is the riskiest ARIA pattern and invisible on touch; caret/typing animation fails WCAG 2.2.2. |
Two small ideas were kept from B and C: a visible *status line* ("Currently: …") and a copy-email button with a polite live-region confirmation.

## Design decisions that came from the reviews (not from taste)
- **Proof first, contact always near.** Order is Work → Experience → About → Skills → Education → Contact; the primary CTA and the email sit directly under the h1 so they are inside the first screen at 320×640 in English and French.
- **One filled primary button** per context (hero CTA; the form's submit inside the form). The rail "Contact" is outline so two filled buttons never compete.
- **No dead links, ever.** Project demo/source links render only when a URL exists (none do today). Each project expands with a native `<details>` (rotating chevron, hidden project name in the accessible name).
- **No motion for its own sake.** No scroll-reveal, marquee, parallax, glow, Lottie, or typing effect — the old site had all of them, and the marquee and glow failed WCAG.
- **Contrast is computed, not eyeballed.** Every token pair in the spec was recomputed by three reviewers (body ≥ 7∶1, muted ≥ 5.7∶1, controls ≥ 3∶1). Decorative numerals sit at ≈3∶1 and are `aria-hidden`.
- **State is never colour-only:** the active rail item gets a bar *and* heavier weight; pressed theme buttons get an underline *and* a background; errors get text, a thicker border and a linked summary.
- **Whole-site French:** before, ~85 % of copy was hard-coded English. Every string now lives in the en/fr catalogs; French copy avoids gendered forms; lookups throw on a missing key and a test enforces key parity.
- **Honest copy:** the hero was rewritten after a reviewer noticed "self-taught" contradicted the Bachelor's degree in the data. Every claim traces to repo data; nothing was invented.
- **Rendering changes the verdict.** Putting the design on screen (mock-up, then the built site) found things text could not: no project above the fold, a mid-word "full-/stack" break, a `<details>` with no indicator, and the analyst lowering a 9.0 to 8.5.

## Architecture: the TanStack migration
| Concern | Choice | Reason |
|---|---|---|
| Framework | TanStack Start 1.169 (SSR) on Vite 8 + Nitro | The requested migration; Node output runs from an empty directory (no `node_modules`) which suits a small Docker image. |
| Routing / i18n | Router file route `{-$locale}`: `/` = en, `/fr` = fr; `/en` → 301, unknown → 404 | Crawlable, cacheable, no cookie, no redirect by `Accept-Language`; `hreflang`, canonical, JSON-LD, sitemap included. |
| Contact (JS) | `createServerFn` + `.validator(zod)` + `useMutation` + TanStack Form, in a **lazy chunk** | Idiomatic Start stack; code-split so Query/Form/Zod (28.5 kB gz) are off the critical path. |
| Contact (no JS) | A server route `POST /contact-submit` → 303 → server-rendered status, signed 60-second flash cookie | Same `sendContactMessage()` core for both paths; works with JavaScript disabled. |
| Messages | Typed dotted-key lookup (~15 lines), **not** `use-intl` | The catalogs use no ICU features; `use-intl` cost ≈11 kB gz and pushed the French first load over its own 130 kB gate. |
| Styling | Hand-written CSS with tokens (no Tailwind runtime) | Zero client CSS-in-JS; tokens map 1∶1 to the contrast table. |
| Removed | next, next-intl, axios, react-toastify, lottie (npm + CDN script), react-fast-marquee, radix select, lucide, flag-icons, svgl, react-icons, the unused `/api/data` and `/api/google` routes, ~16 MB of design assets | The old bundle loaded Lottie twice and pulled every icon via `import *`. |
| Security | Origin allow-list, per-IP limit with a trusted-header rule, bounded body, HMAC-signed single-use cookie, HTML-escaped mail, honeypot first, enforced + report-only CSP, boot guard | The old contact route interpolated raw input into HTML and had no limits. |

## Trade-offs I want you to know about
- **Originality is deliberately modest (~7/10 from the designer).** A restrained design is easier to read and to make accessible; the signature element is the outlined section numerals, which cost zero JavaScript.
- **Query and Form are heavier than a 3-field form needs.** Two reviewers suggested dropping them. They stayed because you asked for TanStack, and are isolated in a lazy chunk.
- **CSP is report-only for the script/style policy in v1** (Start's inline hydration payload is dynamic). The clickjacking/base/object/form-action directives *are* enforced. Enforcing `script-src` is a follow-up.
- **Per-instance rate limiting** (in memory). Behind several instances or a CDN you need a shared store.

## What would move this to a genuine 9+
1. Run the manual NVDA / VoiceOver / TalkBack checklist (`docs/a11y-manual-checklist.md`) and fix what it finds.
2. Add real project screenshots (the thumbnails are illustrations), project links, a hosted PDF résumé in both languages, and one outcome line per role.
3. Run Firefox/WebKit Playwright projects and an official Lighthouse mobile pass; build the Docker image once on a machine that has Docker.
