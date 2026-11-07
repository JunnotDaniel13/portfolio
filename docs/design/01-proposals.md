# Portfolio redesign — Round 1 proposals

Subject: personal portfolio of **Junnot Daniel**, full-stack developer (JS/TS), Antananarivo, Madagascar.
Audience: hiring managers, recruiters, freelance clients (skim in <30 s, deep-read optional). Languages: **en / fr**.
Content (all of it must be translatable, today only nav/hero/about are): hero, about, 2 jobs, 6 skill groups (~31 skills), 4 projects
(image, role, description, tool list; code/demo links currently empty), 3 education entries, contact form + email/phone/address + 4 socials, résumé link.

## Problems with the current UI (what we are fixing)
- Decorative-first: neon pink/violet gradients, glow-follow-cursor cards, sticky stacked cards, lottie animations (2.4 MB JSON), marquee that
  auto-scrolls skills (fails WCAG 2.2.2 "Pause, Stop, Hide" unless pausable; hover-only pause).
- Accessibility defects: nav `<ul>` is `opacity-0 max-h-0` below `md` (**no mobile navigation at all**), form labels not associated with inputs,
  `role="button"` on a `<button>`, clickable-looking non-interactive icons, toast-only feedback, no skip link, no `prefers-reduced-motion`, no visible
  focus styles, 5.27:1 pink-on-navy used for small text, 1.64:1 borders.
- Information architecture: section order (About → Experience → Skills → Projects → Education) buries the strongest proof (projects) and the CTA.
- Performance: 9 MB of images (one 7500 px tall JPEG), lottie-web loaded twice (npm + CDN `<script>`), `import * as svgl` pulls every icon.
- Only ~15 % of copy is translated.

## Shared foundations (apply to every proposal)
- Semantic landmarks: skip-link, `<header>`, `<nav aria-label>`, `<main>`, `<section aria-labelledby>`, `<footer>`. One `<h1>`.
- Mobile nav: real disclosure button (`aria-expanded`, `aria-controls`), Esc closes, focus returns to the button.
- Language switch is a plain `<a hreflang lang>` link pair (`/` ↔ `/fr`) — no JS required, crawlable.
- `prefers-color-scheme` respected; manual toggle persisted; `prefers-reduced-motion` disables all non-essential motion; `color-scheme` meta.
- Focus: 2 px solid ring, 2 px offset, ≥3:1 against adjacent colours; target size ≥ 44×44 px for primary controls (WCAG 2.5.8 AA is 24 px).
- Contact form: visible `<label>`s, `aria-describedby` errors, `aria-live="polite"` status region, `autocomplete` tokens, honeypot field, no toast.
- Images: AVIF/WebP with explicit width/height, `loading=lazy` below the fold, hero image `fetchpriority=high`; total transferred JS target < 90 kB gz.
- Fonts: self-hosted variable font, `font-display: swap`, preload one file.
- Targets: Lighthouse ≥ 98 perf / 100 a11y / 100 best-practices / 100 SEO on mobile; CLS 0; LCP < 1.8 s on Fast 3G emulation.

---

## Proposal A — "Editorial" (typography-led, single column + sticky rail)

**Concept:** a printed-portfolio feel. Almost no chrome; hierarchy comes from type scale, whitespace and thin rules. One accent colour.
The hero is a statement, not a widget; projects are a ranked, scannable list.

**Information architecture / order:** Hero (statement + 2 CTAs) → Selected work (4 projects) → Experience → About → Skills → Education → Contact.
Rationale: proof first, biography second, action last (and a persistent "Contact" button in the header).

**Layout (≥1024 px):**
```
┌──────────────┬───────────────────────────────────────────────┐
│ JD  (logo)   │  Full-stack developer                         │
│              │  building fast, accessible web products.      │  ← h1, clamp(2.5rem,6vw,4.5rem), tracking -0.03em
│ 01 Work   ●  │  Based in Antananarivo · open to opportunities│
│ 02 Experience│  [ Get in touch ]  [ Résumé ↗ ]               │
│ 03 About     │───────────────────────────────────────────────│
│ 04 Skills    │  01  Selected work                            │
│ 05 Education │  ┌─────────────────────────────────────────┐  │
│ 06 Contact   │  │ AI-powered financial app     2024  ↗    │  │  ← row: title, role, year; hover/focus reveals image
│              │  │ Backend · Express · MongoDB · OpenAI    │  │
│ EN | FR      │  └─────────────────────────────────────────┘  │
│ ◐ theme      │  …                                            │
└──────────────┴───────────────────────────────────────────────┘
```
Sticky left rail (240 px) with scroll-spy (`IntersectionObserver`, `aria-current="location"`); collapses to a top bar + disclosure menu < 1024 px.

**Typography:** Inter Variable (body, 17/1.65) + Fraunces Variable (display numerals and h2 only, optical size axis). Fluid scale
(`clamp`) with a 1.25 ratio; max line length 68 ch; `text-wrap: balance` on headings, `pretty` on paragraphs.

**Colour tokens** (all ratios computed):
| token | dark | light |
|---|---|---|
| bg | #0b0d12 | #fafaf7 |
| surface | #12151c | #ffffff |
| text | #e8eaf0 (16.2:1) | #14161c (17.3:1) |
| muted | #9aa3b5 (7.7:1) | #4b5363 (7.4:1) |
| accent | #5eead4 (13.1:1) | #0f766e (5.2:1; white-on-accent 5.5:1) |
| input/UI border | #6f7a90 (4.5:1) | #7a8394 (3.7:1) |
| error | #fca5a5 (10.2:1) | #b91c1c (6.2:1) |
Default = dark (matches dev audience) but follows system; accent used only for links, focus ring, active-rail marker, primary button.

**Components:** text-link buttons with underline-offset animation; project row = `<article>` with one real `<a>` (stretched link pattern),
image preview appears beside the row on hover/focus-visible on desktop, inline under the row on mobile (no hover dependency);
experience as a two-column `<dl>`; skills as category `<h3>` + `<ul>` of text chips with 20 px svgl icon (decorative, `aria-hidden`) — **no marquee**;
education as compact list; contact: 2-col (details + form).

**Motion:** 150–200 ms colour/underline transitions; section reveal = opacity/translate 8 px once via CSS `animation-timeline: view()` with
`@supports` fallback; everything off under reduced-motion.

**Perf/maintainability:** zero animation libraries; CSS-only interactions except scroll-spy (≈25 lines) and mobile menu; ~35 kB JS gz estimate.

**Risks:** can look "plain" if type/spacing are not executed with discipline; relies on good copy for the hero.

---

## Proposal B — "Bento" (modular card grid, light-first)

**Concept:** an Apple/Linear-style bento grid; each section is a rounded tile; dense but playful; light warm background by default with a dark variant.

**Information architecture:** one dashboard-like grid above the fold: Hero tile (name, role, CTA), Photo tile, "Currently" tile (current job), Location/time tile,
Socials tile, Stack tile (top 8 icons) → then full sections below as larger bento rows (Projects 2×2, Experience timeline tile, Skills tile, Education tile, Contact tile).

**Layout:** 12-col CSS grid, 16 px gap, tile radius 24 px, 1 px border, soft shadow (`0 1px 2px / 0 8px 24px -12px`). Tiles span 3–6 cols; collapses to a single column < 640 px, 2 columns 640–1023 px.
```
┌────────────── Hero (6×2) ──────────────┬─ Photo (3×2) ─┬ Socials (3×1)
│ Hi, I'm Junnot — full-stack developer  │               ├ Location/time (3×1)
│ [Contact] [Résumé]                     │               │
├──────── Currently (4×1) ───────┬── Stack icons (8×1) ──┴──────────────
├─ Project 1 (6×2) ──────────────┬─ Project 2 (6×2) ─────────────────────
```
**Typography:** Geist Sans variable (already in repo) 16/1.6, Geist Mono for labels/meta; headings 600 weight, tight tracking.
**Colour:** light bg #f5f3ee, card #ffffff, text #1c1917 (15.8:1), muted #57534e (7.6:1 on card), accent indigo #4338ca (7.9:1, white-on-indigo 7.9:1);
dark bg #141311, card #1d1b19, text #f2f0ea (16.3:1), muted #a8a29e (6.8:1), accent #a5b4fc (8.6:1).
**Motion:** tiles lift 2 px + shadow on hover/focus-within; magnetic cursor highlight on hero tile (pointer-fine only); staggered reveal.
**Components:** tiles are `<section>`/`<article>`; interactive tiles use the stretched-link pattern; skills tile is a tabbed list (`role=tablist`) by category.
**Perf:** ~55 kB JS gz (tabs + highlight); more DOM nodes above the fold.
**Risks:** bento is now a very common template; many equal-weight tiles compete for attention (weak reading order); reading order must be controlled with DOM order not grid placement; tab widgets add a11y surface.

---

## Proposal C — "Terminal / IDE" (developer-identity concept)

**Concept:** evolve the current "code window" idea into the whole site: sections are "files" in an editor explorer, a command palette (Ctrl/⌘+K) jumps anywhere,
monospace-forward typography, syntax-highlight colour palette (Night Owl-like) used as the accent system.

**Information architecture:** Left explorer (`about.md`, `experience.ts`, `skills.json`, `projects/`, `education.md`, `contact.sh`) acts as navigation; main pane is the scrolling document.
Hero shows a typed `whoami` block (static text for no-JS/reduced-motion, typed animation otherwise). Palette lists sections + actions (toggle theme, switch language, open résumé, copy email).

**Colour:** bg #011627, text #d6deeb (13.5:1), muted #8aa0b8 (6.8:1), green #7fdbca (11.3:1), orange #f78c6c (7.8:1). Dark only (light variant = "Light Owl" inverted palette).
**Typography:** JetBrains Mono for UI chrome + headings, Inter for long paragraphs (mono for paragraphs hurts readability).
**Motion:** typing effect (hero only), caret blink (reduced-motion: none), palette fade.
**Components:** tab-bar scroll-spy, line-number gutters (CSS counters, `aria-hidden`), `role=dialog` combobox palette (`aria-activedescendant`), copy-to-clipboard buttons with live region.
**Perf:** palette + highlight need ~60 kB JS gz (cmdk-like implementation hand-rolled would be ~6 kB).
**Risks:** novelty can alienate non-technical recruiters; heavy reliance on mono and "fake IDE" chrome adds noise for screen-reader users (must `aria-hidden` all faux chrome);
command palettes are poorly discoverable on touch; French copy in code-comment style is awkward.

---

## What we ask reviewers
Score each proposal 1–10 on: visual quality, UX/IA clarity, accessibility (WCAG 2.2 AA), performance & maintainability, fit for the audience, originality vs. risk.
Give an overall score per proposal with concrete justification (strengths, defects, specific changes that would raise it). Be strict: reserve 9–10 for a design you would
ship to production unchanged.
