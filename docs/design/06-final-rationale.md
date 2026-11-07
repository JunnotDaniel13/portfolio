# Final design rationale — A7 Editorial

A7 was selected after six review rounds rather than treating the first visual concept as final. The three initial directions were Editorial, Bento and Terminal/IDE. Bento and Terminal scored below the owner's 9/10 gate and were dropped; their useful ideas (a static status line and copy-email feedback) were folded into Editorial without keeping their visual complexity.

## Why Editorial

The primary users are recruiters and clients who need to understand the owner in under 30 seconds. A typography-led, printed-portfolio structure puts identity, one primary action and proof of work first. One teal accent, thin rules, outlined section numerals and a quiet sticky rail provide identity without animation, icon marquees or decorative cards competing with the content.

The design uses one filled primary action, a persistent route to contact, project summaries before details, and text-only technology chips. English and French use the same information architecture. At 320 px the logo becomes a monogram and Contact remains a named 44 px envelope control outside the menu; at 1100 px the layout becomes a desktop rail.

## What the review rounds changed

- Removed dead links, hover-only content, scroll-reveal animation and decorative icon tiles.
- Replaced unsupported biography claims with copy grounded in the repository data.
- Added real EN/FR catalogs, explicit project summaries/alt text and normalized technology names.
- Reworked the mobile bar after French overflow was found, and kept Contact reachable in one tap.
- Added visible focus, non-colour active/pressed states, disclosure chevrons, 44 px targets, no-JS navigation and a native contact POST.
- Compacted the hero after rendered reviews showed no project above the desktop fold; added the email line after the 320 px French fold was checked.
- Reduced initial JavaScript by keeping Query/Form/Zod in the contact chunk and avoiding icon/animation libraries.
- Made delivery/security behavior explicit: origin allow-list, trusted IP header, capped rate limiting, signed single-use flash cookie and generic client errors.

## Final implementation choice

Implement **A7 exactly as documented in `04-final-design-spec.md`**, using TanStack Start + Router for SSR/routing and TanStack Query + Form for the progressively enhanced contact form. The static HTML mockup in `mockup/` is the visual reference; `mock.html` also shows menu, details, focus and form-error states.

The implementation deliberately reports measured results instead of claiming the design gates in advance. Base-page prerendering falls back to revalidated SSR without ETag, as allowed by the spec. Full script/style CSP remains report-only until Start's dynamic hydration scripts have a production-safe enforcement strategy. Manual NVDA/VoiceOver/TalkBack testing remains an owner step.

Ratings and unresolved review feedback are recorded verbatim in `05-review-log.md`; later reviewer restarts failed before producing a Round-7 score, so no replacement scores are invented. The owner subsequently gave the explicit instruction to implement the documented A7 design.
