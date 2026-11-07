# Manual accessibility checklist (owner step — **not run** by the automated pipeline)

Run on `/` and `/fr`, light and dark, with: NVDA + Firefox (Windows), VoiceOver + Safari (macOS and iOS), TalkBack + Chrome (Android).

## Structure and navigation
- [ ] Skip link is the first tab stop and lands on `main`.
- [ ] Landmarks are announced: banner, navigation "Sections", navigation "Language", main, contentinfo.
- [ ] Exactly one `h1`; headings read in order (h2 per section, h3 inside).
- [ ] Section numerals and the meta line under each heading are **not** announced.
- [ ] Rail / menu links: activating one moves focus to the section heading and the heading is announced.
- [ ] Mobile: Menu button announces expanded/collapsed; Esc closes and returns focus; tapping the toggle again does not re-open it.
- [ ] Language link announces the other language in that language ("Français" is read with a French voice on the English page).
- [ ] Theme group announces its label and the pressed state of System / Light / Dark.

## Content
- [ ] Each project "Details" control announces the project name; expanding reveals the full description once (the print-only duplicate is not read).
- [ ] No link or button is announced without a name; no empty links exist.
- [ ] Skills lists read as lists with a category heading.

## Contact form
- [ ] Every field announces label, hint and required state.
- [ ] Invalid submit with JS: focus moves to the first invalid field and the error is announced.
- [ ] Successful submit with JS: the success message is announced once.
- [ ] No-JS submit (disable JavaScript): after the redirect the status/summary is the first thing read at `#contact-status`; error summary links move focus to the matching field.
- [ ] Character count announces only near the limit (≤50 and 0 remaining).
- [ ] The honeypot field is never reachable or announced.
- [ ] "Copy email address": success and failure messages are announced.

## Reading preferences
- [ ] Zoom 400 % / 320 px width: no horizontal scroll, no overlap, menu still operable.
- [ ] Windows High Contrast / forced colours: focus ring, buttons and chips remain visible.
- [ ] Reduced motion: no animation anywhere.
