# Accessibility plan

Target: WCAG 2.2 AA for all HTML UI. Automated axe checks are run (`tests/a11y.spec.js`, zero critical/serious allowed). Full WCAG validation needs manual testing with assistive technologies and an expert review, which has not been done.

## Input and navigation

- Every action is reachable by keyboard: module navigation, move choice (radio group), "Say it", wait buttons, Next, debrief timeline, settings. Visible focus styles.
- A skip link ("Skip to content") is the first focusable element. Dialogs move focus in and restore it on close (`src/a11y/focus.js`).
- Live-region announcements for state changes (`src/a11y/announcer.js`).

## Text mode (parity)

See `design/text-mode-design.md`. Text mode covers every decision point with the same palette, the same scoring and the same replay as a data table.

## Wait time (plan §11)

- Real seconds by default; target 3 s.
- Time scale 0.5×, 1×, 1.5×, 2× (the target scales with it).
- A "manual wait" option replaces the timer with an explicit choice: "Wait" or "Speak again right away".
- Scoring uses the intended behavior (did the learner wait), not the learner's reaction speed.
- No other timed pressure: the session waits on the learner at every decision and between moments.

## Captions and audio

- All dialogue is captioned with speaker labels. There is no lip sync.
- Cinematic captions are on by default and can be turned off.

## Motion and comfort

- Reduce motion setting (and `prefers-reduced-motion`) replaces camera flights with still frames and cuts.
- No decorative motion during decisions. Field-of-view comfort setting.

## Vision

- Text size and contrast settings. Cue descriptions are available in a disclosure under each moment in the 3D mode, and open by default in text mode.
- Information is never carried by colour alone: state graphs have data tables, and posture cues are also described in words.

## Mobile

Low quality preset; landscape recommended. Checked with device emulation only, not on a physical phone.
