# Agent review: accessibility

Agent review. Checked against Game Accessibility Guidelines, the Xbox Accessibility Guideline categories (perception, motor, cognitive) and WCAG 2.1 AA for the HTML overlay. This was a headless Playwright inspection plus code reading. No screen reader or other assistive technology was used, so full WCAG conformance can't be confirmed here.

## Text-mode parity spot check (3 objectives, end to end)

Run 2 was played entirely in text mode with keyboard only (Space on radio, Enter on "Say it" and "Next moment"; screenshots a-textmode-*.png).

| Objective | Moment | Result |
|---|---|---|
| 5: respond to an error with a probing question | m3 (Sam, 2(x − 4)) | pass. Same options and ids, reaction text plus a "What the students are doing now" list; debrief detail shows "Sam understanding 3 → 4", the rule rationale and the coach note. |
| 4: wait time | m4 | pass. "Speak again" got focus automatically, a 3.3 s wait scored as waited, and the counter is aria-hidden with a polite announcement instead. |
| 6: exit ticket | m8 | pass. Debrief shows Session structure 4 and Data use 4. |

Parity claim holds for decisions, scoring and replay. Cinematics are skipped in text mode, as documented.

## Checklist

| Area | Result |
|---|---|
| Keyboard-only operation | pass for the session path: header, module nav, look buttons, notice checkboxes, radio palette, phrasing select, Say it, wait buttons, Next, debrief `<details>`, settings. Focus moves to the moment heading and then to Next/Speak again. |
| Points-of-interest list | pass: "Look at" buttons (whole group, each student, board, clock) with announcements (app.js:180). |
| Pointer alternatives | pass: no drag, hover or pointer-only actions. Camera is preset-only. |
| Live announcements | pass: reactions, wait start, text-mode toggle, view changes (announcer.js). |
| Reduced motion | pass: `prefers-reduced-motion` and the toggle; stills replace camera paths; student pose easing snaps (student.js:146). |
| Color-only cues | mostly pass: routine bar uses ▶ plus bold; charts use dashes plus ●■▲ plus tables. Exception A7. |
| Pause | acceptable: no timer runs except the optional wait, and the session waits on the learner. There is no explicit pause during cinematics (Skip only). |
| Captions | displayed, but the toggle is broken (A4). |

## Findings

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| A1 | major | The skip link "Skip to content" targets `#textmode`, which is `hidden` in 3D mode, so activating it goes nowhere. It should land on the session panel. | index.html:11; shell.js:29 | Point it at the panel or main region (`#overlays` / a `main` with tabindex −1) and move focus to the current `h2`. |
| A2 | major | Text size, contrast and FOV are saved to localStorage but only applied when the Settings dialog is opened. After reload, "Extra large" is gone (verified: `data-text-size` was "xlarge" before reload, unset after). Low-vision users must reopen Settings every visit. | settings.js:103-111; app.js:315 | Call `this.settings._apply()` once in `App._initDialogs()` after constructing Settings. |
| A3 | major | The session panel is the only place the decision lives, but at 1366×820 "Say it" is below the fold and the panel scrolls independently. At 200% zoom or text size xlarge the panel covers most of the canvas (WCAG 1.4.10 reflow risk for the overlay). Not tested at 320 CSS px. | v04-m1-low-default.png | Test at 320 px width. Let the panel go full width below a breakpoint, or make it collapsible. |
| A4 | minor | The "Captions on" checkbox does nothing: `state.captions` is never read by ShotPlayer. Since captions are always on this isn't a barrier, but it's a broken control. | settings.js:64,90 | Wire it up or remove it. |
| A5 | minor | Volume sliders and "Mute all audio" are shown, but the app has no audio. Controls that do nothing add cognitive load. | settings.js:62-69 | Hide the audio fieldset; keep the captions toggle. |
| A6 | minor | The cue disclosure "Describe what each student is doing" is closed by default in 3D mode. Screen-reader users who stay in 3D mode get the scene text but not the body-language cues unless they find the disclosure. | session-panel.js:68 | Keep it, but mention text mode / the disclosure in the moment heading for AT users, or open it by default when the user has used a screen reader-like path (e.g., keyboard entry). |
| A7 | minor | The worksheet error/fixed ellipse is red vs green only (tutoring-room.js:236). It's also too small to read (visual V3). | | Add ✗ / ✓ glyphs. |
| A8 | minor | Muted text (`.tag`, `.hint-note`, `.routine li`, 0.8–0.85 rem on a 95% translucent panel over the 3D scene) has contrast that varies with what is behind the panel. axe passes in the test page state, but a light HDRI background (window) behind the panel could drop below 4.5:1. | sim.css:9,22,33,36 | Make the panel background opaque (`var(--surface)`), or check contrast against the worst-case background. |
| A9 | minor | Run picker cards and debrief headings use `h2` → `h3` correctly, but the always-on header uses `<p class="app-title">`, and the page has no `h1`. | shell.js:17 | Use `<h1>` for the app title. |
| A10 | minor | Esc during a cinematic with a dialog open both closes the dialog and skips the cinematic. | shot-player.js:47 | Guard on `dialog[open]`. |
| A11 | minor | Under timed wait, keyboard users have the button focused immediately, so an accidental Enter (key repeat from "Say it") would end the wait at ~0 s and score as rushed. | session-panel.js:163 | Ignore activation in the first 300 ms, or start the timer on keyup. |
| A12 | minor | The manual-wait option is in module 1 only. A learner who discovers the timed wait is hard mid-session must leave the session to change it. | modules.js:36-42 | Add the wait settings to the Settings dialog too. |

Cognitive: the 8-moment structure, the routine bar, "Moment N of 8" and the optional noticing step keep load low. Motor: no precision or timing demands beyond the optional wait. Perception: no audio dependence.
