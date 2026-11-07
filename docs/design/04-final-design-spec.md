# Portfolio — Design Specification (A7 "Editorial", self-contained)

Supersedes `01`–`03`. Rounds 1–6 of review are summarised in `05-review-log.md`. This document is complete on its own. (Revision history: A → A2 → A3 → A4 → A5 → A6 → A7; this file is edited in place. A rendered mock-up of this spec lives in `docs/design/mockup/`.)
Owner requirements: migrate to TanStack (Start + Router + Query + Form), redesign UI/UX, modern/clean/accessible, performance- and maintainability-first.

## 1. Concept & audience
A printed-portfolio feel: typography-led, one accent, thin rules, no decorative motion. Audience: recruiters/clients who skim in <30 s, then read; en + fr visitors.
Priority order on the page: *who → proof → experience → bio → skills → education → contact*, with a persistent route to contact.

## 2. Information architecture
Hero → **01 Work** → **02 Experience** → **03 About** → **04 Skills** → **05 Education** → **06 Contact** → footer. Same order in rail, menu, ids, headings.
Routes: `/` (en, default) and `/fr` (optional param `{-$locale}`); `/en` → 301 `/`; any other first segment → 404 page; **no locale cookie**, no Accept-Language redirect
(the only cookie in the whole site is the 60-second flash cookie of the no-JS contact flow, §6).
`/` and `/fr` are **prerendered at build time** (they have no per-request data) and served with `Cache-Control: public, max-age=0, must-revalidate`; requests carrying `?sent` / `?error` are **SSR** and `no-store`.
(If the Start prerender option cannot be made to work on the pinned version, base pages fall back to SSR *without* an ETag; the outcome is recorded in `05-review-log.md`.) No CDN is assumed (Docker on Node);
shared caching would be a deployment decision, not part of this spec.
**Decided CSP path:** all other security headers are enforced; `Content-Security-Policy` ships as **report-only** in v1 with a sha256 hash for the static theme script, because Start's dehydrated-state inline scripts are
dynamic. Enforcing `script-src` is an explicit follow-up, not a hedge. No nonce is used anywhere, so there is no cache/nonce conflict. A test asserts the shipped header set.

## 3. Navigation & chrome
- Skip link first in DOM → `#main`.
- **Desktop ≥1100 px:** sticky left rail, width `clamp(13.5rem,16vw,15rem)`, `max-height:100dvh; overflow-y:auto`. Top→bottom: name/logo · section links (01–06; numerals in an
  `aria-hidden` column; labels may wrap, `min-height:44px`) · **Contact** button (anchor to `#contact`; **outline/secondary style — the hero "Write a message" is the only filled primary button in the page chrome; the contact form's own "Send message" submit is also filled because it is the primary action of that form**) · language links · theme group.
  **Active section cue is not colour-only:** the `aria-current="location"` link gets font-weight 600 **and** a 3 px accent bar on its inline-start edge (bar ≥3∶1: 13.1∶1 dark / 5.2∶1 light); same treatment in the mobile menu.
- **Below 1100 px:** top bar `padding-inline:1rem; display:flex; flex-wrap:wrap; gap:.5rem`. Contents, left→right: logo link · **single language link showing the *other* language
  ("Français" on en / "English" on fr; `lang` + `hreflang`)** · **Contact** (persistent, never inside the menu) · Menu button (icon only, accessible name "Menu", `aria-expanded`, `aria-controls`).
  - Logo: full name ≥480 px; **below 480 px the visible text is the monogram "JD"** with accessible name "JD — Junnot Daniel" (contains the visible label → 2.5.3).
  - Contact: **icon-only envelope button below 640 px** (44×44, accessible name = localised "Contact"/"Me contacter", no visible text so 2.5.3 does not apply); **visible text label ≥640 px**.
  - Budget @320 px (en/fr): 44 (JD) + 72 (lang) + 44 (Contact) + 44 (Menu) + gaps 24 = 228 of 288 px; 480–639 px: 105 + 72 + 44 + 44 + 24 = 289 of ≥448 px. `flex-wrap` is a safety net (two rows, never overflow).
- **Mobile menu = overlay** under the bar (no layout shift): `max-height: calc(100dvh - var(--bar-h)); overflow-y:auto`. Contents: section links, theme group.
  Closing logic does **not** rely on `relatedTarget` (unreliable in Safari/Firefox on macOS): a document-level `focusin` and `pointerdown` listener closes the menu when the event target is outside both the panel
  and the Menu toggle; the toggle handles its own click; Esc and link activation close it and return focus to the toggle on Esc; viewport ≥1100 px closes it.
- **`--bar-h`:** CSS default `4rem`, kept exact by a tiny `ResizeObserver` on the bar (so a wrapped two-row bar is accounted for); **0 at ≥1100 px (no bar) and under `@media (max-height:480px)` where the bar is `static`**.
  The bar is `position: sticky` otherwise. `html { scroll-padding-top: var(--bar-h) }` is the **only** offset mechanism (sections have no `scroll-margin`), which also keeps tabbed-to elements clear of the bar (2.4.11).
- **Without JS** (the `<html>` lacks the `js` class set by the pre-paint script): `html:not(.js) .bar { position: static }` and `--bar-h: 0` (a taller wrapped bar must never cover anchors or focused elements);
  the Menu button and overlay are not rendered; the six section links show as a wrapped inline list under the bar; the
  *Copy email address* button and the theme group are hidden (the `mailto:` link is in the lede; theme follows the system via CSS, §7).
- **Focus handoff rule (uniform):** every in-page link (rail, bar, menu, hero CTA) moves focus to the **target section's `<h2 tabindex="-1">`** — never into an input (avoids opening the soft keyboard).
- Scroll-spy: one `IntersectionObserver` sets `aria-current="location"` on the active rail link (plain anchors without JS).
- Landmarks: `header` (bar/rail) with `nav aria-label` "Sections"; language links in `nav aria-label` "Language"; `main#main`; `footer`. Theme group: `role="group"` + `aria-labelledby`.
- Theme: 3-state group **System / Light / Dark** (`aria-pressed`, JS-only; the pressed segment has a background change **and** a 2 px accent underline). Legend/label text ≥12 px. Resolution: stored choice → `prefers-color-scheme`. The pre-paint script (static, allowed by CSP **sha256** hash) only adds
  the `js` class and sets `data-theme="light|dark"` when a choice is stored; `<html suppressHydrationWarning>`. **No-JS and "System" are pure CSS:** `:root{color-scheme:light dark}`; dark tokens are the default,
  `@media (prefers-color-scheme: light){ :root:not([data-theme]) { …light tokens… } }`, plus `[data-theme=light]` / `[data-theme=dark]` overrides. When "System" is active a `matchMedia` change listener
  keeps the JS-managed bits in sync (removed on unmount).

## 4. Hero (copy verified against repo data — no invented claims)
Order: status line → h1 → **actions** → lede (actions precede the lede so the primary CTA is in the first viewport at 360×640 in both locales).
- Voice: **third person throughout the hero** (h1, status line, lede); the About section keeps the owner's first-person bio from the existing catalogs. French copy avoids gendered forms.
- Status line (mono, `--subtle`): "Currently: Full-stack developer at SFER Madagascar / FINAMAD, Antananarivo" · fr "Actuellement : développement full-stack chez SFER Madagascar / FINAMAD, Antananarivo".
- h1 (`clamp(1.875rem, 6vw + .5rem, 4.5rem)`, 800, tracking −0.03em, `text-wrap:balance`): **"Junnot Daniel: full-stack JavaScript, from the database to the browser."** ·
  fr **"Junnot Daniel : du JavaScript full-stack, de la base de données au navigateur."** (supported by the skills data: MongoDB/MySQL/PostgreSQL → Node/Express → React/Angular.)
- h1 size is capped at **4rem** (`clamp(1.875rem, 5vw + .5rem, 4rem)`), hero bottom padding 1.5rem, so that **the first project title is visible at 1280×800 in en and fr** (gate 4).
  A small `<NoBreakHyphen>` helper wraps every hyphenated compound of ≤14 characters ("full-stack", "self-driven") in `white-space: nowrap` wherever it appears (h1, status line, chips) — no catalog changes, no U+2011.
- Actions (≥44 px high, wrap): **Write a message** (primary, → `#contact`) · **Copy email address** (button) · **Résumé / CV** (tertiary, external, `hreflang`; the *visible* label stays short — "Résumé" / "CV" —
  and "(opens in a new tab)" is added in visually hidden text so the accessible name contains the visible label). In the h1, "full-stack" is wrapped in `white-space: nowrap` so it never breaks mid-word ("full-/stack") at any width.
  *(Both rules came from rendering the mock-up; see `docs/design/mockup/`.)*
- **Email line** (mono, 1 rem, `mailto:` link, `overflow-wrap:anywhere`) sits **directly under the actions**, before the lede, so the address is above the fold on a 320 px French screen.
- Lede (muted, max 60 ch; the email is *not* repeated inside it): "React, Node.js and Express, SQL and MongoDB, shipped with Docker. Self-driven and committed to making the web more accessible. Open to job opportunities that fit this
  skill set. " · fr "React, Node.js et Express, SQL et MongoDB, livrés avec Docker. Autonome, avec la volonté de rendre le web plus accessible.
  À l'écoute d'opportunités professionnelles en phase avec ce profil.".
- No socials in the hero (they live in Contact and the footer).

## 5. Sections
All headings, meta lines, copy, labels, errors, alt text come from the en/fr catalogs (today ~85 % of copy is hard-coded English). Proper nouns (companies, school, technology names) are unchanged.
**Section header pattern (signature element, zero JS):** a large outlined display numeral **above** the `h2` (`clamp(2.5rem,6vw,4rem)`, Geist 800, `-webkit-text-stroke:1px`, transparent fill, stroke
dark `#566078` (3.1∶1 on bg) / light `#858ea1` (3.2∶1 on bg), `aria-hidden`, decorative only; hidden under `forced-colors: active`, `prefers-contrast: more` and below 640 px) followed by the real `h2` and an `aria-hidden` mono meta line
(**count only** — "4 projects", "2 roles", "6 groups" — `--subtle`, ≥12 px; it no longer repeats the numeral and the heading). The same numerals number the rail; **projects carry no index numerals** (no clash with section numbers).
Spacing tokens: `section{padding-top:2rem;margin-top:2.25rem}`, `.meta{margin-bottom:1.5rem}`. **Type floor: no text below 12 px** (mono meta/chips ≥13 px, legends ≥12 px). Numeral stroke is set to a clearly visible but still non-essential **3.1∶1 dark / 3.2∶1 light**
(see §7); the rendered result is part of the post-build design review (§9 gate 8).
- **Ordering:** projects and skill categories keep the catalog order of the current data (projects: AI financial app, travel agency, AI real estate, newsroom management; skills: Frontend, Backend, Languages, Databases, Tools & DevOps, Design).
  **Display names are normalised in the data and enforced by a test:** Next.js, Node.js, Express, Tailwind CSS, NestJS, React, Angular, MongoDB, MySQL, PostgreSQL, SQLite, TypeScript, JavaScript, HTML5, CSS, Bootstrap, FastAPI, Hono, Laravel, PHP, Python, Docker, Git, Linux, Ubuntu, Windows, Canva, Figma, Photoshop.
- **01 Work:** `<ul>` of `<article>`. Thumb (AVIF+WebP, `object-fit:cover; object-position:top`, explicit width/height, `srcset` 192/480/960 w with `sizes="(min-width:640px) 24rem, 6rem"`; **the first project's thumb is `loading="eager"`** (it is inside the desktop first viewport; the 192 w variant keeps the mobile cost ≈5 kB), the others `loading=lazy`, all `decoding=async`; the LCP element is recorded by gate 5. Frame: 1 px `--border` outline, `--surface` backing, radius .75 rem, and a mild `filter: brightness(.9) contrast(.96)` in the dark theme so white illustrations do not glare. The images are owner-supplied illustrations; real screenshots can replace them through the data model (`image`) with no code change; `alt` from `projects.{id}.alt`);
  <640 px: 6 rem square beside the title, ≥640 px: 16∶10, 40 % column. Text: h3, role (mono), explicit catalog `summary` (1 sentence, hand-written paraphrase of the existing description), tool chips,
  `<details><summary>Details<span class="sr-only"> — {project}</span></summary>` with a **rotating chevron** (CSS border arrow, accent colour ≥3∶1, `CanvasText` under `forced-colors`; the default marker is removed, so the chevron is the disclosure affordance); `<details>` renders only when `description.length > summary.length + 40` (data-integrity test) with the full description (summary min-height 44 px), a `print-only` duplicate of the description (`display:none` on screen).
  "Live demo"/"Source" links render **only** when a non-empty URL exists (today none). Never an empty `href`; no decorative `↗`.
- **02 Experience:** `<dl>`: dt role · company, dd period (mono). 2 columns ≥640 px.
- **03 About:** 220 px photo (≤30 kB AVIF/WebP), bio paragraphs ≤68 ch.
- **04 Skills:** per category `h3` + `<ul>` of **text-only chips** (no icons, no images, no marquee; always visible, Ctrl+F friendly).
- **05 Education:** `<ol>` reverse-chronological.
- **06 Contact:** details (`mailto:`, `tel:`, location) + text-labelled social list + form. Footer: copyright, source-repo link.

## 6. Contact form & delivery (progressive enhancement, committed — no hedge)
1. **Baseline (no JS):** server-rendered `<form method="post" action="/contact-submit">` with labels, `autocomplete="name|email"`, hint text, **native constraints** (`required`, `type=email`, message `minlength=10`,
   `maxlength` 100/254/500), a **hidden `locale` input** (validated against the fixed list `['en','fr']`; the redirect target is built from that list, never from user input), and a visually hidden honeypot wrapper
   (`aria-hidden="true"`, input `tabindex="-1" autocomplete="off"`). `POST /contact-submit` is a TanStack Start **server route** that validates, calls the shared `sendContactMessage()`, and replies
   **303 → `/{-$locale}?sent=1#contact-status`** or `?error=1#contact-status`.
   - **Flash cookie** (only on the no-JS path): name is an env-aware constant — production: `__Host-flash` with `Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=60`; non-production: `flash` with `HttpOnly; SameSite=Lax; Path=/; Max-Age=60`
     (no `Secure`, so dev/staging over plain http and WebKit work). Cleared on first read. Payload = submitted values + per-field error codes,
     **HMAC-SHA256 signed with env `COOKIE_SECRET`** (required in production; the server refuses to start without it — **checked in a server-start hook only, never at module import or during `vite build`/prerender**, so the Docker build needs no secrets). It is signed, not encrypted; contents are only the visitor's own input and are never logged.
   - **Reload edge case:** the cookie is single-use, so reloading `?error=1` finds no payload; the page then shows a generic error ("Your message wasn't confirmed — please check the fields and try again") with the
     empty form, and with JS `history.replaceState` strips `?sent`/`?error` from the URL after first render.
   - **Honeypot hit** → the same 303 to `?sent=1` with no delivery (bots and autofill false-positives see an identical outcome; no blank page).
   - The contact section reads `sent`/`error` through `validateSearch` and renders **server-side**: a `<div id="contact-status" tabindex="-1" role="status|alert">` containing the message and, on error, an error summary
     (links to each invalid field) plus per-field errors (`aria-describedby`, `aria-invalid`) restored from the flash cookie. The URL fragment targets this element so it is the reading/focus-navigation start (4.1.3);
     with JS it is also `.focus()`ed on mount.
2. **Enhanced (JS) — one form, hydrated in place, never swapped:** the server renders the *enhanced* form component (TanStack Form + Zod + TanStack Query `useMutation` → the typed **server function** `sendContact`,
   which calls the same `sendContactMessage()`) inside a `Suspense` boundary; its markup is a normal `<form method="post" action="/contact-submit">`, so it already works natively before any JS. The component is a
   `React.lazy` chunk, so React **hydrates that boundary in place when the chunk arrives** (selective hydration) — the DOM node is kept, so there is no fallback duplicate and no layout shift.
   Because controlled inputs would otherwise reset to defaults on hydration, a ~200-byte delegated `input`/`focusin` listener installed by the main bundle records field values, the focused field and its caret;
   the form's `defaultValues` read that record and a `useLayoutEffect` restores focus and caret before paint (2.4.3). Hydration of the boundary is deferred while an IME composition is active (`compositionend`).
   Client-side validation uses the same schema through **`zod/mini`** (tree-shakable Standard Schema) so the lazy chunk stays under its gate.
   `QueryClientProvider` lives **inside the lazy chunk** (not in `__root`). Prefetch the chunk on idle / when `#contact` nears the viewport / on first focus inside the form.
3. **A11y:** the JS path uses empty-at-load `role="status"` / `role="alert"` regions for success/failure (changes are announced) and the same `#contact-status` element for focus management; on invalid submit focus moves
   to the first invalid field; character count = static "500 max" hint + threshold announcements only at ≤50 and 0 remaining (warn: dark `#fcd34d` 13.5∶1, light `#92400e` 6.8∶1); "Sending…" keeps ≥4.5∶1 (`aria-disabled`, not low opacity).
4. **Server hardening (`sendContactMessage`):** Zod caps (name ≤100, email ≤254 valid, message 10–500); body ≤8 kB; **Origin allow-list** built from server env `SITE_URL` (+ optional `ALLOWED_ORIGINS`;
   localhost allowed only when `NODE_ENV!=='production'`); a **missing or `null` `Origin` is rejected unless `Sec-Fetch-Site: same-origin`** (the server-function path is additionally same-origin-enforced by Start);
   **rate limit 5 / 10 min per client IP** (in-memory, per instance, **capped at 10 000 keys with expiry eviction**). The client IP comes from the header named by env `CLIENT_IP_HEADER`
   set by the owner's trusted proxy (e.g. `x-real-ip`); `X-Forwarded-For` is never read implicitly. **In production the server refuses to start if `CLIENT_IP_HEADER` is unset, unless `ALLOW_SHARED_RATE_LIMIT=1` is set**
   (then the limit uses the socket address — behind a proxy that is one shared IP; documented in README and compose); HTML-escaped email template; Telegram + email via
   `Promise.allSettled` (success if ≥1 channel delivered, failures logged without personal data); generic client errors.
5. **Copy email:** `navigator.clipboard.writeText` → status "Email address copied"; on failure → "Couldn't copy automatically — the address is selected, copy it manually." and the text is selected.

## 7. Visual system
**Type:** Geist Variable only for text and display (400/600/800), Geist Mono for small meta (years, role, status line). Body 17/1.65, h2 `clamp(1.75rem,3vw,2.25rem)` 700, h3 1.125rem 600, max 68 ch, `text-wrap` balance/pretty.
Self-hosted woff2 (latin; caps: Geist Sans ≤45 kB, Geist Mono ≤30 kB), `font-display:swap`, preload Geist Sans; **metric-matched fallback `@font-face` for both Sans and Mono** (size-adjust/ascent/descent vs Arial) generated by script; CLS = 0 is a gate.
**Colour tokens (WCAG relative luminance; all re-verified by 4 reviewers):**
| role | dark | light |
|---|---|---|
| bg / surface | #0b0d12 / #12151c | #fafaf7 / #ffffff |
| text | #e8eaf0 — 16.2∶1 | #14161c — 17.3∶1 |
| muted | #9aa3b5 — 7.7∶1 (7.2 surface) | #4b5363 — 7.4∶1 (7.7 surface) |
| subtle (meta) | #8b94a7 — 6.4∶1 (6.0 surface) | #5b6474 — 5.7∶1 |
| accent | #5eead4 — 13.1∶1 | #0f766e — 5.2∶1 (5.5 surface) |
| link/btn hover | #99f6e4 — 15.4∶1 (ink #04201c 13.6∶1) | #115e59 — 7.3∶1 (white on it 7.6∶1) |
| text on accent | #04201c — 11.6∶1 | #ffffff — 5.5∶1 |
| control border (≥3∶1) | #6f7a90 — 4.5∶1 | #7a8394 — 3.7∶1 |
| chip text on chip bg | #e8eaf0 on #12151c — 15.2∶1 | #14161c on #f0f0ea — 15.8∶1 |
| focus ring | `outline:2px solid` accent, offset 2px — 12.4∶1 | 5.2∶1 |
| error / success | #fca5a5 10.2∶1 / #86efac 13.8∶1 | #b91c1c 6.2∶1 / #166534 6.8∶1 |
| `prefers-contrast: more` borders | #9aa3b5 — 7.7∶1 | #4b5363 — 7.4∶1 |
Inline links are underlined at rest (1 px, offset .2em; 2 px on hover); visited = same colour. Cards/sections are not separated by colour alone. `forced-colors`: system colours, 1 px `CanvasText` borders,
outline-based focus. Motion: only ≤150 ms colour/underline transitions on `:hover`/`:focus-visible`; **no scroll-reveal, no animation libraries**; `scroll-behavior:smooth` only when `prefers-reduced-motion: no-preference`.
Targets ≥44×44 px; no fixed text-container heights (1.4.12); reflow clean at 320 px / 400 % zoom. Print: single column, no chrome, URLs shown, project descriptions fully expanded.
**Images:** AVIF + WebP at 480/960 px from the originals (current set is 9 MB; one source is 7500 px tall). Caps: thumb ≤40 kB AVIF / ≤60 kB WebP, photo ≤30 kB, `sizes="(min-width:640px) 24rem, 6rem"`.

## 8. Platform, SEO, security
- TanStack Start (SSR/streaming), Router (file routes, optional `{-$locale}`, typed links), a **typed dotted-key message lookup** (≈15 lines, `src/i18n/config.ts`; **only the active locale's catalog is loaded** via the route loader). *Implementation note: the spec originally named `use-intl`; the build showed its ICU parser cost ≈11 kB gz and the catalogs use no ICU features (no placeholders/plurals/rich text), so it was removed — a unit test asserts the no-placeholder invariant and en/fr key parity.*
  Query + Form + Zod (lazy contact chunk), Vitest. Removed: next, next-intl, axios, react-toastify, lottie (npm + CDN), react-fast-marquee, radix select, lucide, flag-icons, clsx, svgl-react, react-icons (4 inline social SVGs).
- Deleted: unused `/api/data`, `/api/google`, `NEXT_PUBLIC_RECAPTCHA_*`. Env: secrets server-only; `SITE_URL`, `CLIENT_IP_HEADER` (required in production unless `ALLOW_SHARED_RATE_LIMIT=1`), `COOKIE_SECRET` (required in production), `ALLOWED_ORIGINS` (optional), `EMAIL_ADDRESS`, `GMAIL_PASSKEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- SEO: per-locale title/description, canonical, `hreflang` en/fr/x-default, JSON-LD `Person`, `robots.txt`, `sitemap.xml` with alternates.
- Headers (all enforced): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Frame-Options: DENY`, and a **separate enforced CSP** `Content-Security-Policy: frame-ancestors 'none'; base-uri 'none'; object-src 'none'; form-action 'self'`
  (`frame-ancestors` is ignored in report-only mode, hence the split). The full script/style policy ships as `Content-Security-Policy-Report-Only` with the theme-script sha256 and **no `report-uri` in v1** (violations are visible in DevTools only; wiring a collector is a documented follow-up).
- Docker: node 22 alpine multi-stage, non-root, runs the Start/Nitro Node output; compose keeps port 3001→3000 and documents `CLIENT_IP_HEADER`.

## 9. Acceptance gates (run after the build; results reported verbatim, misses included)
1. `tsc --noEmit` clean; Vitest green (schema, escaping, rate limiter + IP-header rule, Origin allow-list, locale resolution, data integrity: no empty `href`, every project has `summary`+`alt` in both locales, no untranslated keys).
2. **Hard size gates (fail the script):** first-load JS ≤ **130 kB gz**; lazy contact chunk ≤ **45 kB gz**. 130 kB is an initial ceiling derived from published sizes (React 19 + ReactDOM ≈ 55 kB, Router/Start runtime,
   one catalog, page code); **the first measured value is recorded in `05-review-log.md`** and the gate is then tightened to measured + 10 % if lower. Raising either requires a written rationale in the log.
   Also: Geist Sans woff2 ≤45 kB, Geist Mono ≤30 kB, image caps from §7.
3. axe-core on `/` and `/fr` at 320 and 1280 px, light + dark, **plus the open-menu, `?sent=1` and `?error=1` states**: 0 violations.
4. Playwright (Chromium always; **Firefox and WebKit projects run if the browsers can be installed here — otherwise reported as "not run"**): keyboard-only walk; no horizontal scroll at 320 px (en **and fr**, bar single row);
   viewport 320×256 (≈400 % zoom) with menu open still operable; FR overflow at 1100 px; **the "Write a message" CTA and the email address are inside the first viewport at 360×640 and 320×640 in en and fr, the first project title is visible at 1280×800 in en and fr, and the Contact control is reachable in one
   tap from a scrolled page at 360 px**; menu open/close/toggle/theme-click-inside-panel regression; typing into the form while hydration is artificially delayed preserves value, focus and caret;
   reduced-motion + forced-colors emulation; no-JS run (`javaScriptEnabled:false`) completes the 303 flow (stubbed transport) and lands on `#contact-status`; screenshots.
5. Lighthouse mobile (default throttling) for `/` and `/fr`: **CLS = 0, LCP ≤ 2.5 s, TBT ≤ 200 ms are failing gates**; the LCP element is recorded (h1 text, or the first project thumbnail on wide screens); other scores reported as measured.
6. Contact flow tests with a stub transport: success, validation (per-field errors), rate-limit (incl. spoofed `X-Forwarded-For` ignored, `CLIENT_IP_HEADER` honoured), honeypot (303 `?sent=1`, no delivery),
   Origin rejection, flash-cookie tamper rejection, missing `COOKIE_SECRET` in production refuses to start, the enforced-CSP + report-only-CSP + caching headers match §2/§8 exactly.
7. Manual NVDA/VoiceOver pass: **a checklist is delivered (`docs/a11y-manual-checklist.md`); a screen reader cannot be run in this environment, so this gate is reported as "not run"** and is the owner's step.
8. Post-build design review: the same reviewer roles re-rate the **built** site from screenshots (EN/FR, light/dark, 360/1280 px) and the measured gate numbers; findings feed a fix round before completion.

## 10. Owner dependencies / known limits
Project demo/source URLs and hosted PDF résumés (en/fr) are owner-supplied; the data model supports them and the UI omits what is missing. In-memory rate limiting is per instance. Runtime numbers are measured after the build, not promised.

---
## What we ask reviewers (Round 7)
Re-rate **A7 (this document as it now stands) together with the rendered mock-up it links to (`docs/design/mockup/`, including the new state renders)** (same 6 criteria + overall, 1–10; 9–10 = ship unchanged; judge as a spec assuming faithful execution but penalising anything underspecified, contradictory, unrealistic or defective).
This is now a single self-contained document. Say which Round-6 findings are resolved or not, flag NEW defects, and list the exact remaining changes that would earn a 9.
