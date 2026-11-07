# Round 3 — Proposal A3 "Editorial" (revised after Round 2)

Round-2 overall scores for A2: designer **8**, critic **8**, analyst **8.5**, a11y/perf **8.5** (avg 8.25). Contrast recomputation was confirmed again by
three reviewers. All four said the remaining gaps were specification-level and listed them; A3 closes **every** item. Where I deliberately did **not** follow a
reviewer, the reason is stated (rows marked ⚠).

## Why TanStack Start (answers critic #1 / designer #1 — "unjustified migration")
This is an **explicit requirement from the site owner** ("migrate this code to TanStack best practices"), not a design choice. It is documented here so the
spec is self-contained. Migration inventory (nothing implicit):
| Next.js 15 today | TanStack replacement |
|---|---|
| App Router, `layout.tsx`, `not-found.tsx` | TanStack Router file routes: `__root.tsx`, `{-$locale}/index.tsx`, `notFoundComponent` |
| `next-intl` (cookie locale, no URL) | **`use-intl`** (same ICU message format + `useTranslations`) with **path-prefixed locale** `/` (en) and `/fr`, optional param `{-$locale}`; `/en` → 301 to `/`; unknown first segment → 404; no cookie, no Accept-Language redirect |
| `app/api/contact/route.ts` (+ unused `/api/data`, `/api/google` → **deleted**) | `createServerFn({ method: 'POST' })` with Zod `inputValidator` |
| `axios`, `react-toastify` | native `fetch` inside the server function; TanStack Query `useMutation`; inline `role=status` region (no toast) |
| `react-hook` hand-rolled form state | **TanStack Form** + Zod (Standard Schema) |
| `next/font/local`, `next/image`, `next/script` (lottie CDN) | `@font-face` + `<link rel=preload>`, `<picture>` (AVIF/WebP), lottie removed |
| `sitemap.ts`, `robots.ts` | static `public/robots.txt`, build-generated `public/sitemap.xml` with `xhtml:link` alternates |
| `NEXT_PUBLIC_*` env | server-only `process.env.*` for secrets; public site URL via `VITE_SITE_URL` |
| `Dockerfile` (node 18, `.next/standalone`) / `compose.yaml` | rewritten for the Start/Nitro Node output (node 22, non-root), compose port mapping kept (3001→3000) |
| removed deps | next, next-intl, axios, react-toastify, lottie-web/-react, react-fast-marquee, @radix-ui/react-select, lucide-react, flag-icons, clsx, svgl-react from the runtime bundle |

**TanStack Query / Form (⚠ reviewers suggested dropping them):** kept because they are part of the requested migration and are the idiomatic Start stack, but they are
**code-split with the contact section** (`React.lazy`, prefetched on idle / when `#contact` nears the viewport / on any "Write a message" interaction), so the
first-load critical path contains only React, Router/Start runtime and page code. Zod is also only imported by the lazy chunk + server function.

## Round-2 finding → A3 resolution
| # | Finding (who) | Resolution |
|---|---|---|
| 1 | JS budget arithmetic doesn't add up (critic, a11y, designer) | Budget split in two measured gates (`npm run size`, gzip): **(a) first-load JS ≤ 105 kB** (React/ReactDOM ≈ 45 + Router/Start runtime + page code ≤ 20); **(b) lazy contact chunk ≤ 45 kB** (Query + Form + Zod + form UI). Gates are *measured on the real build and reported*; if a number is missed the build fails the size script and the number is reported as-is. |
| 2 | Hero contradicts the data: "self-taught", "fast, accessible" (critic) | Hero rewritten using **only claims present in the repo**: "full-stack web applications with JavaScript and TypeScript" (About bio, skills), "committed to making the web more accessible" (About bio, verbatim idea), stack = skills data, "self-driven" (About bio), "open to job opportunities" (About bio). "Self-taught", "fast" removed. |
| 3 | Contact function abuse surface; no-JS behaviour (critic, analyst, designer) | Server function: Zod caps (name ≤100, email ≤254 valid, message 10–500), **Origin/Host check**, **per-IP in-memory rate limit** (5 / 10 min; documented as per-instance), honeypot, request size cap, HTML-escaped templates, generic errors (no internals). **No-JS:** hero "Write a message" is an anchor to `#contact`; the form is server-rendered and posts natively (`<form method="post" action={sendContact.url}>` accepting `FormData`), progressively enhanced by TanStack Form/Query when JS loads; if the framework cannot support native form posts cleanly the implementation falls back to a `<noscript>` notice with the mailto link, and this is reported. |
| 4 | Short viewports / 400 % zoom: sticky bar & rail (designer, critic, a11y) | `@media (max-height: 480px)`: top bar `position: static`. Desktop rail: `max-height: 100dvh; overflow-y: auto`. Mobile menu is an **overlay** below the bar (no layout shift) with `max-height: calc(100dvh - bar); overflow-y: auto`. Use **only `scroll-margin-top`** on sections (no `scroll-padding`) to avoid double offset. |
| 5 | Four identical "Details" summaries (all four) | `<summary>Details<span class="sr-only"> — {project}</span></summary>` (visible text is contained in the accessible name → 2.5.3 OK); min-height 44 px. |
| 6 | "First sentence" summary is fragile, esp. French (all four) | Explicit **`summary`** field per project per locale in the catalogs, hand-written as a paraphrase of the existing description (no new facts). Per-project `alt` keys too. |
| 7 | Contact target undefined; mailto fails with no mail client (analyst, designer) | Header/rail **Contact = anchor to `#contact`**, focus moves to the Name field via `tabindex` handoff on activation. Hero: primary **"Write a message"** (→ #contact), secondary **"Copy email address"** (button), and the address itself shown as a plain `mailto:` link in the lede. Résumé is tertiary. |
| 8 | Language switch hidden in mobile menu (analyst) | **EN / FR links live in the top bar outside the menu** on mobile and in the rail on desktop. Theme control = 3-state group **System / Light / Dark** (`aria-pressed`) so "follow system" is reachable; lives in rail (desktop) and in the menu (mobile). |
| 9 | Résumé on an external site (analyst) | Kept as tertiary, localised link with `hreflang`, "(opens in a new tab)" in the accessible name. A local PDF cannot be created without the owner's file; the data model supports `resume.{en,fr}` URLs so the owner can switch to hosted PDFs by editing one file. Stated as an owner dependency. |
| 10 | Live regions: must pre-exist; focus first error; char-count noise; honeypot reachable (a11y) | `role="status"` and `role="alert"` containers are **rendered empty at load**; on invalid submit focus moves to the first invalid field; char count is a plain text `aria-describedby` hint ("500 max") plus a **threshold live announcement** only at ≤50 and 0 remaining (warn colour: dark #fcd34d 13.5∶1 / light #92400e 6.8∶1); honeypot wrapper `aria-hidden="true"` + visually hidden, input `tabindex="-1" autocomplete="off"`. |
| 11 | Contact `aria-label` mismatch; status-line glyphs (a11y) | Removed `aria-label` (visible localised text "Contact" / "Me contacter" *is* the name). Status line has **no glyphs**: "Currently: Full-stack developer at SFER Madagascar / FINAMAD, Antananarivo" / "Actuellement : …". |
| 12 | CLS: size-adjust fallback only for Mono (a11y) | Metric-matched fallback `@font-face` (size-adjust / ascent / descent overrides vs Arial) for **both** Geist Sans and Geist Mono, generated by a script and verified by a CLS = 0 gate in the Lighthouse report. |
| 13 | 31 React icon components break the budget (a11y) | **Zero icon JS.** A build script renders each used svgl icon once to `public/skills/*.svg`; chips use `<img src width=20 height=20 alt="" loading="lazy">` inside a 28 px white tile so dark-variant icons stay visible on the dark theme. Social icons: 4 inline SVGs, text-labelled. |
| 14 | Missing specs: chip tokens, outline ring, forced-colors, prefers-contrast, 44 px, copy failure, JPEG fallback (a11y, critic) | See "Additional specifications" below. JPEG fallback dropped (AVIF + WebP only). |
| 15 | Thumbnail crop of 7500 px-tall source; mobile scroll length (analyst, designer) | Fixed box with `object-fit: cover; object-position: top`. Mobile (<640 px): 6 rem square thumb beside the title (keeps the list compact); ≥640 px: 16∶10 beside text. |
| 16 | Print hides collapsed `<details>` (analyst, critic) | Print stylesheet shows a **print-only duplicate** of each full description (`display:none` on screen so AT never reads it twice) and hides rail/forms. |
| 17 | Section numbering inconsistent (critic) | Fixed: 01 Work, 02 Experience, 03 About, 04 Skills, 05 Education, 06 Contact — same in IA, rail, headings, ids. |
| 18 | Theme script hydration & CSP (designer) | `<html suppressHydrationWarning>`; inline theme script is static so it is allowed by a **sha256 hash** in CSP (no nonce plumbing); CSP starts in **report-only** if Start's own inline hydration scripts need a nonce; other headers enforced (nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors 'none'). |
| 19 | Hero crowded (designer) | Socials removed from hero (live in Contact + footer, text-labelled). Hero = status line, h1, lede, 3 actions. |
| 20 | Originality only 6.5 (designer) | One signature element at zero JS cost: **the section-numeral motif** — large outlined display numerals (clamp 4–7 rem, Geist 800, `-webkit-text-stroke`, `aria-hidden`, decorative only) sit behind each h2, paired with a mono meta line (`02 · Experience · 2 roles`) that echoes the hero status line. Same system for rail numerals and project index (01–04). |
| 21 | No verification plan (critic, designer, a11y) | Acceptance gates below (axe, Playwright keyboard/reflow, EN/FR overflow, Lighthouse report). |
| 22 | Hydration/`/en` routing/unspecified small items (designer) | `/en` → 301 `/`; copy fallback specified; `hreflang` on résumé; rail labels may wrap (min-height, not nowrap) for 1.4.12. |

## Hero (final copy) — every claim traceable to repo data
- Status line (mono, subtle colour): **Currently: Full-stack developer at SFER Madagascar / FINAMAD, Antananarivo** · fr **Actuellement : Développeur full-stack chez SFER Madagascar / FINAMAD, Antananarivo**
- h1: **Junnot Daniel builds full-stack web applications with JavaScript and TypeScript.** · fr **Junnot Daniel développe des applications web full-stack avec JavaScript et TypeScript.**
- Lede: "React, Node.js and Express, SQL and MongoDB, shipped with Docker. A self-driven learner, committed to making the web more accessible and open to everyone — and
  open to new job opportunities. [jerenasonjunnot@gmail.com]" · fr: "React, Node.js et Express, SQL et MongoDB, livrés avec Docker. Un esprit autodidacte,
  engagé à rendre le web plus accessible et ouvert à tous — et ouvert à de nouvelles opportunités. [adresse e-mail]"
- Actions (≥44 px): **Write a message** (primary → #contact) · **Copy email address** (button) · **Résumé** (tertiary).

## Information architecture & structure
Hero → 01 Work → 02 Experience → 03 About → 04 Skills → 05 Education → 06 Contact → footer. (Unchanged from A2 except numbering fix.)
Rail/top-bar contents (desktop rail top→bottom): logo/name · section links (01–06) · [Contact button] · EN | FR · Theme (System/Light/Dark).
Mobile top bar: logo · EN | FR · Contact · Menu button (menu = section links + theme).

## Additional specifications (previously missing)
- **Chips:** dark text #e8eaf0 on #12151c = 15.2∶1; light #14161c on #f0f0ea = 15.8∶1; chip border is decorative (not the sole indicator of anything).
- **Focus:** `outline: 2px solid var(--accent); outline-offset: 2px` (an *outline*, so it survives `forced-colors`). Never `box-shadow`-only.
- **`forced-colors: active`:** borders `1px solid CanvasText` on chips/buttons/inputs; links `LinkText`; primary button `ButtonText` on `ButtonFace` with `Highlight` focus.
- **`prefers-contrast: more`:** input/UI border tokens step up one level (dark #9aa3b5, light #4b5363); decorative hairlines are hidden.
- **Targets:** rail items, buttons, `<summary>`, language/theme controls ≥ 44×44 px (min-height; text may wrap).
- **Copy email:** `navigator.clipboard.writeText`; on success the status region says "Email address copied"; on failure (insecure context/denied) it says
  "Couldn't copy — the address is selected, press Ctrl+C" and selects the address text.
- **Text spacing (1.4.12):** no fixed heights on text containers; rail labels wrap.
- **Images:** AVIF + WebP at 480/960 px widths from the originals; explicit width/height; `loading="lazy"` except none above the fold (hero is text-only);
  alt text from catalog keys `projects.{id}.alt`.
- **Forms:** `autocomplete="name"` / `"email"`; errors linked with `aria-describedby`, fields `aria-invalid`; submit button stays legible when disabled
  (`aria-disabled`, text "Sending…", ink on accent 11.6∶1 dark / 5.5∶1 light).
- **SEO:** per-locale title/description, canonical, `hreflang` en/fr/x-default, JSON-LD `Person`, `sitemap.xml` with alternates, `robots.txt`.
- All other tokens, typography, layout, behaviour and palette: **unchanged from A2** (see `02-proposal-A2.md`; all contrast numbers re-verified by reviewers).

## Acceptance gates (run after the build; results reported verbatim)
1. `tsc --noEmit` clean; `vitest` green (schema, escaping, rate limiter, locale resolution, data integrity: no empty `href` rendered, every project has `summary`+`alt` in both locales).
2. `npm run size`: first-load JS ≤ 105 kB gz and contact chunk ≤ 45 kB gz (reported even if missed).
3. **axe-core** on `/` and `/fr` at 320 px and 1280 px, light + dark: 0 violations.
4. **Playwright (Chromium)**: keyboard-only walk (skip link → nav → CTAs → form → submit → error focus), no horizontal scroll at 320 px, viewport 320×256 (≈400 % zoom)
   with menu open remains operable, FR overflow check at 1100 px (rail + content), reduced-motion emulation, forced-colors emulation, screenshots of key states.
5. Lighthouse (mobile) report for `/` and `/fr`: scores reported as measured; **CLS = 0** is a hard gate.
6. Contact flow tested end-to-end against a stubbed transport (success, validation failure, rate-limit, honeypot).

## Known limits (unchanged + new)
- Project demo/code URLs and a hosted PDF résumé depend on the owner; handled by omission / config.
- In-memory rate limiting is per instance (documented).
- A written spec cannot prove runtime numbers; they are gates, measured after the build.

---
## What we ask reviewers (Round 3)
Re-rate **A3 only** (same 6 criteria + overall, 1–10, strict and honest, 9–10 = ship unchanged; judge the spec as a spec, assuming faithful execution but penalising
anything underspecified, contradictory, unrealistic or still defective). Say which Round-2 findings are resolved or not, flag any NEW defects, and give the exact
remaining changes that would earn a 9. Note that TanStack Start/Query/Form is an explicit owner requirement (see top section).
