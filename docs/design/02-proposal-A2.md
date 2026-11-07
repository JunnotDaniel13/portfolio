# Round 2 — Proposal A2 "Editorial" (revised after Round 1 review)

Round-1 verdict (overall scores, designer / critic / analyst / a11y-perf): **A** 8 / 7 / 7.5 / 8 (avg 7.6), **B** 6 / 5 / 5.5 / 6.5 (avg 5.9),
**C** 5 / 4 / 4.5 / 5.5 (avg 4.9). B and C were dropped: reviewers independently concluded that fixing them turns them into A.
Palette/contrast figures were independently re-computed by 3 reviewers and confirmed (one discrepancy, B's accent, is moot now).

A2 keeps A's concept (proof-first, typography-led, one accent, sticky rail) and applies **every** change the reviewers requested.
Round-1 finding → resolution:

| # | Finding (who raised it) | Resolution in A2 |
|---|---|---|
| 1 | Project rows link nowhere; `↗` + stretched link imply a destination that doesn't exist (designer, critic, analyst) | **No dead links, ever.** A row renders "Live demo" / "Source" links *only* when the data has a non-empty URL (today: none). The row is an `<article>`, not a link. Rows are expandable with native `<details>` ("Read the details": full description, role, full stack) so every row *does* lead somewhere without JS or routes. No `↗` glyph unless a real external link exists. |
| 2 | Hover-reveal project image fails skimmers, touch and WCAG 1.4.13 (designer, a11y) | Thumbnail is **always visible** (fixed aspect 16∶10, AVIF/WebP, lazy, explicit width/height). No hover- or focus-triggered content anywhere (1.4.13 therefore not applicable). |
| 3 | `animation-timeline: view()` + opacity-0 trap; hero must not animate (critic, a11y) | **All reveal-on-scroll animation removed.** Content is visible in every browser/state. Only colour/underline/transform-free transitions (≤150 ms) on `:hover`/`:focus-visible`, disabled under `prefers-reduced-motion`. |
| 4 | JS/perf claims unrealistic for the stack (critic, a11y) | **Budget restated as measured, not promised:** first-load JS ≤ 120 kB gz *total* (React 19 + ReactDOM ≈ 45 kB, TanStack Router/Start runtime, app code ≤ 25 kB gz), reported by `npm run size` after build. Hero is text-only (LCP = h1 text, no image). Lighthouse numbers are reported from a real run, not claimed. |
| 5 | Locale routing treated as a given; repo used cookie locale (critic) | Explicit design task: **path-prefixed locale** — `/` (en, default) and `/fr` via TanStack Router optional param `{-$locale}`; no cookie, no Accept-Language redirect; `<html lang>`, `hreflang` alternates + `x-default` in `<head>`, sitemap lists both; unknown prefixes → 404. |
| 6 | Hero copy generic; no identity/stack/contact in hero; About buried (designer, critic, analyst) | Hero rewritten (below): concrete claim + stack + current role + availability, **visible `mailto` + copy-email**, short about summary in the lede. Full About stays as §04 with the photo. Only facts that exist in the repo data are used — **no invented metrics**. |
| 7 | Contact is item 6 of 6 in the rail; mobile menu hides it (analyst) | Persistent **"Contact" button** in the desktop rail (pinned above the language/theme controls) and in the mobile top bar *outside* the disclosure menu. Rail still lists Contact as the last section link; the button is a distinct control (`aria-label="Contact me"`). |
| 8 | Two variable fonts vs "preload one" (analyst, critic, a11y) | **Geist Variable only** (already in repo; designer suggested it over Inter) for body *and* display (weights 400/600/800, tight tracking). Geist Mono only for small meta labels (years, role, tool chips). Fraunces and Inter dropped. Preload Geist (latin subset, woff2). Mono is not preloaded, uses `size-adjust`-matched fallback to avoid CLS. |
| 9 | Rail 240 px squeezes content at 1024–1180; FR labels wrap (designer, critic, analyst) | Rail appears from **1100 px**; width `clamp(13.5rem, 16vw, 15rem)`; labels `white-space: nowrap`, numerals in their own `aria-hidden` column; below 1100 px a sticky top bar + disclosure menu. Every layout verified with the real French strings (Expérience, Compétences, Formation, Projets sélectionnés, Me contacter). |
| 10 | a11y: sticky bars obscure focus (2.4.11); numerals/arrows in link names (4.1.2, 2.5.3); landmark labels; theme/lang toggles (a11y) | `scroll-padding-top` = sticky-bar height + `scroll-margin-top` on sections; numerals/glyphs `aria-hidden`; `nav` landmarks labelled ("Sections", "Language"); theme toggle = `<button aria-pressed>` with stable accessible name ("Dark theme"); language links `lang`/`hreflang`/`aria-current="true"`, separator decorative. |
| 11 | Mixed-language content (3.1.2) (a11y) | **Every string is in the en/fr catalogs** (today ~85 % was hard-coded English): jobs, education, projects, skills categories, form labels/errors, 404, footer. Proper nouns (company, school, technology names) remain as-is; they are not "passages in another language". |
| 12 | Links need a non-colour cue (1.4.1) (a11y) | Inline links are **underlined at rest** (`text-decoration-thickness: 1px; text-underline-offset: .2em`), thickness 2 px on hover; visited = same colour (no colour-only state). |
| 13 | Missing state contrasts (hover, visited, disabled, placeholder, focus) (a11y) | Table below. No placeholder text is used (visible labels + hint text). Disabled/"Sending…" button stays legible (ink on accent 11.6∶1); it is `aria-disabled`, not low-opacity. |
| 14 | `Contact` duplicated as nav + CTA (critic) | Intentional and documented: nav item = location, button = action. |
| 15 | Theme toggle / system preference conflict (a11y, from B) | Three-way resolution: stored choice → `prefers-color-scheme` → dark. Applied via an inline pre-paint script in `<head>` to avoid flash; `color-scheme` set on `:root`. |
| 16 | Steal from C/B in a *progressive* way (designer, analyst) | Added: copy-email button with `aria-live="polite"` confirmation; mono "status line" in hero (`currently → <role> @ <company>`), static text only. **Rejected:** command palette (ARIA risk, touch discoverability), typing animation (WCAG 2.2.2), cursor glow, marquee, tabs, bento tiles. |
| 17 | Faux-IDE / faux chrome | None. |

## Information architecture (order = priority for a 30-second skim)
1. **Hero** — who + claim + stack + availability + contact.
2. **01 Selected work** — 4 projects.
3. **02 Experience** — 2 roles.
4. **03 About** — photo + full bio.
5. **04 Skills** — 6 groups, ~31 skills, always visible (Ctrl+F friendly).
6. **05 Education** — 3 entries.
7. **06 Contact** — details + form.
Section ids and rail follow the same order. (Numerals are decorative labels in the rail; headings carry the real names.)

## Hero (en) — all facts exist in the current data
- Status line (mono, small): `Currently → Full-stack developer @ SFER Madagascar / FINAMAD · Antananarivo`
- `<h1>` (display, `clamp(2.5rem, 6vw, 4.5rem)`, 800, −0.03em, `text-wrap: balance`):
  **"Junnot Daniel builds fast, accessible full-stack web applications."**
- Lede (muted, 1.2rem, max 60 ch): "JavaScript and TypeScript across the stack — React, Node.js and Express, SQL and MongoDB, shipped with Docker.
  Self-taught, quick to learn, and open to new opportunities."
- Actions (≥44 px high): **[Email me]** (primary, `mailto:`) · **[Copy address]** (button, live region: "Address copied") · **[Résumé]** (secondary; opens
  the existing résumé site with `?lang=`; `rel="noopener"`, accessible name says it opens in a new tab).
- Socials: GitHub, LinkedIn, X, Facebook as a text-labelled list (icon + name) — not icon-only.
(fr) "Junnot Daniel conçoit des applications web full-stack rapides et accessibles." / "JavaScript et TypeScript sur toute la chaîne — React, Node.js et Express,
SQL et MongoDB, livrés avec Docker. Autodidacte, j'apprends vite et je suis ouvert à de nouvelles opportunités."

## Layout
Desktop ≥1100 px: sticky rail (left, `clamp(13.5rem,16vw,15rem)`) + content column (max 46 rem text, 64 rem for work rows). Below: top bar (logo, Contact button,
menu button) + content with `px-5`/`px-8`. Reflow safe at 320 px / 400 % zoom (no fixed widths, no horizontal scroll).
- **Work row** (`<article>`): grid `[thumb 40 %] [text 60 %]` ≥768 px, stacked below. Text: h3 (project name), role (mono, muted), 1–2 sentence summary
  (first sentence of the description), tool chips (`<ul>`), `<details><summary>Details</summary>` full description. Optional links only if URL present.
- **Experience**: `<dl>` — dt = role · company, dd = period (mono). Two columns ≥640 px.
- **About**: photo 220 px square, `border-radius: 1rem`, alt text from catalog; bio paragraphs (68 ch max).
- **Skills**: each category = h3 + `<ul>` flex-wrap of chips (icon 20 px `aria-hidden` + label); no auto-motion.
- **Education**: `<ol>` reverse-chronological; institution + period.
- **Contact**: left = `<address>`-style details (email as link, phone `tel:`, location) and social list; right = form (TanStack Form): Name, Email, Message
  with visible labels, `autocomplete="name|email"`, hint text, per-field errors (`aria-describedby`, `aria-invalid`), form-level status `role="status"`
  (success) / `role="alert"` (failure), hidden honeypot, `maxLength`s as before (100/100/500) with a live character count for the message.
- **Footer**: copyright, link to source repo; skip-link target `#main`.

## Typography
Geist Variable: body 17/1.65 (400), h2 `clamp(1.75rem, 3vw, 2.25rem)` 700, h3 1.125rem 600, h1 800. Geist Mono: 0.8125rem meta labels, uppercase tracking .06em
only for ≥4.5∶1 muted text. Max line length 68 ch. `text-wrap: balance` (headings) / `pretty` (paragraphs). `font-display: swap`, preloaded woff2.

## Colour tokens (WCAG relative luminance, all computed)
| role | dark | light |
|---|---|---|
| bg | #0b0d12 | #fafaf7 |
| surface | #12151c | #ffffff |
| text | #e8eaf0 — 16.2∶1 bg | #14161c — 17.3∶1 |
| muted | #9aa3b5 — 7.7∶1 bg / 7.2∶1 surface | #4b5363 — 7.4∶1 bg / 7.7∶1 surface |
| subtle (meta) | #8b94a7 — 6.4∶1 bg / 6.0∶1 surface | #5b6474 — 5.7∶1 bg |
| accent (links, ring, primary btn bg) | #5eead4 — 13.1∶1 bg / 12.4∶1 surface | #0f766e — 5.2∶1 bg / 5.5∶1 surface |
| link / btn hover | #99f6e4 — 15.4∶1 bg; ink #04201c on it 13.6∶1 | #115e59 — 7.3∶1 bg; white on it 7.6∶1 |
| text on accent | #04201c — 11.6∶1 | #ffffff — 5.5∶1 |
| input / control border (non-text ≥3∶1) | #6f7a90 — 4.5∶1 bg / 4.2∶1 surface | #7a8394 — 3.7∶1 bg / 3.8∶1 surface |
| focus ring (2 px + 2 px offset) | #5eead4 — 12.4∶1 on surface | #0f766e — 5.2∶1 bg / 5.5∶1 surface |
| error | #fca5a5 — 10.2∶1 | #b91c1c — 6.2∶1 |
| success | #86efac — 13.8∶1 | #166534 — 6.8∶1 |
| decorative hairline rules | #232834 (decorative only; never conveys state) | #e3e5ea |
Card/section boundaries never rely on colour alone: sections are separated by spacing + h2 + rule; interactive controls use the ≥3∶1 border.

## Behaviour & motion
- Scroll-spy via one `IntersectionObserver` setting `aria-current="location"` on the active rail link (progressive: without JS the rail is plain anchors).
- Mobile menu: `<button aria-expanded aria-controls>`; closes on Esc, on link activation, and returns focus to the button; no focus trap needed (not modal) — menu is a
  `<nav>` panel that pushes content, sits below the sticky bar.
- Smooth scroll only when `prefers-reduced-motion: no-preference` (CSS `scroll-behavior`).
- Theme toggle persists to `localStorage`; inline pre-paint script; no flash.
- Print stylesheet: single column, no rail, underlined URLs (useful when recruiters print).

## Performance / maintainability (measured after build, reported honestly)
- Stack: TanStack Start (SSR + streaming), Router (type-safe, file-based, optional locale param), Query (mutation + cache for contact), Form + Zod.
- No animation libraries, no icon sets beyond explicit named imports, no toast lib, no axios (native `fetch` through server functions).
- Images: re-encoded to AVIF + WebP + JPEG fallback at 1×/2× widths (current set is 9 MB, one 7500 px-tall JPEG). `<picture>`, explicit dimensions.
- Server function for the contact form with Zod validation, HTML-escaped email template (the old template injected raw user input), Telegram + email
  delivered with `Promise.allSettled`; request succeeds if at least one channel delivers, failures are logged.
- Unit tests (Vitest) for the schema, escaping, locale resolution and project/skill data integrity (no empty links rendered).

## Known limits (stated up-front)
- Project demo/code URLs are empty in the data; A2 handles that by omission, but the owner should add them for stronger credibility.
- Résumé lives on an external site; language param is passed, correctness of that page is outside this repo.
- Lighthouse and bundle numbers will be **measured** and reported after the build; the budget above is a gate, not a claim.

---
## What we ask reviewers (Round 2)
You scored Round 1. Re-rate **A2 only** on the same six criteria plus overall, 1–10, strictly and honestly (9–10 = ship unchanged).
Judge the specification as a specification: a document can't be profiled, so assume it is executed faithfully — but penalise anything underspecified,
contradictory, unrealistic or still defective. Say explicitly which Round-1 findings you consider resolved vs. not resolved, and list any NEW defects you find.
If you give <9, list the exact remaining changes that would earn a 9.
