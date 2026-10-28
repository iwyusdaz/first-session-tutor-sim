# Agent review — v2.0.0 visual revamp: visual realism, characters, cue salience

**Repo:** first-session-tutor-sim @ main 31b73b0 · **Reviewer:** agent review (sub-agent, headless Chromium/SwiftShader — WebGL drops to Low by design; fidelity judged cautiously) · **Date:** 2026-10-28
**Evidence:** `evaluation/reviews/screenshots/v2-*.png` (28 captures: menu, group/calm, per-student looks, 5 induced cue states, 3 worksheet close-ups, board, clock, overview, hover, drawer-collapsed, Medium-forced group, reduced motion, text mode, debrief) plus code trace of `src/scenes/tutoring-room.js`, `src/v2/*`, `content/student-mixes.json`.

## 1. Is the classroom a grounded, detailed place? — PASS

- **Poly Haven models placed and grounded** (`src/v2/model-placer.js`, manifest with authors/licences): desks (3 student + 1 tutor), chairs, worn bookshelf, encyclopedia set, wall clock (readable canvas face in front of the GLB, with pendulum + red second hand), potted plant. `groundProp()` adds contact-shadow discs and shadow casting/receiving; real key-light shadows visible under desks/students in captures.
- **Procedural dressing reads as a room, not a backdrop:** full window (frame, mullion, glass, headrail + 6 tilted slats) with a **real 3D exterior** — lawn, five trunked trees, swing frame, slide, painted distant treeline, sky dome (`applyCaseGrade`). Radiator with 12 fins, two posters ("Math is a door, not a wall" / "ROOM 12"), corridor door with frame, knob, ajar panel, corridor walls + ceiling beyond, backpacks at desk feet, water bottle, notebook stack. No photo backdrop within 30 m; HDRI is lighting-only (PMREM, `environmentIntensity 0.55`).
- Minor (Low-only): `book_encyclopedia_set_01` reads as a plain brown crate at Low's 1024 texture cap (`v2-group-m1-calm.png`, top of shelf). Likely fine at full resolution; verify in the headed pass.

## 2. Are the three teens appealing, distinct, and posed per cue? — PASS with minors

`src/v2/stylized-character.js` builds layered eyes with iris/pupil/catchlight, sculpted hair, blush, articulated arms/legs, warm subsurface-like skin material. In captures the three are **instantly distinct** — Jordan (blue shirt, dark skin, short dark hair), Talia (green shirt, medium skin, auburn bun), Sam (purple shirt, lightest skin, short dark hair) — and seated poses read: write (head bowed, pencil arm oscillating), hand-up (arm vertical with pencil), withdrawn (head turned away, squint), confused (head tilt + asymmetric brows), think. The look is toy-like rather than Pixar at Low resolution, but expressive and consistent with locked decision 5 (D24); judge again on headed GPU.

**Representation check (locked v1 rule) — PASS.** `content/student-mixes.json`: Jordan she/her, darkest skin `#5c3b28`, short hair; Talia she, medium `#8d5a3b`, bun; Sam they/them, lightest `#d9a882`, short hair. `grep` for "hood/hoodie" across `content/` and `src/` finds no clothing marker (the only mentions are the "no hood" rule statements). Behaviour decorrelation holds: quiet → Talia (medium), discouraged → Sam (lightest), dominant/confident → Jordan (darkest). Residual observation for the recommended human representation review: the dominant role stays with the darkest-skinned student in **both** mixes (Run 1 "Jordan answers first", Run 2 "Jordan fills every silence") — not a violation of the stated rule, but worth the human pass. Content inconsistency (minor): student-mixes.json says Talia `hairStyle: "long"` while the render forces `bun` (`tutoring-room.js:386`, per D24) — align the JSON.

## 3. Patrick Hand actually used — PASS

Whiteboard canvas font `110px "Patrick Hand"` (`tutoring-room.js:571`), worksheets `italic 38px "Patrick Hand"` (`:550`), both posters (`:311`, `:320`); all redrawn once `document.fonts.ready` resolves (`:108-114`). Visible in captures: board view shows handwritten "x + 4 = 9"; worksheets show handwriting at close-up (faint at Low's half resolution — re-check headed); poster text visible in group/overview. Note: the hover tooltip also inherits Patrick Hand via `--font-accent` (`hud-shell.css:26`) — see finding V-3.

## 4. Cue salience on Low and Medium — PASS with one framing issue

- **Low (default headless):** in `v2-cue-B-raise.png` the raised arm is unambiguously the most salient object in frame; write/withdrawn poses read at group distance; calm mode dims shafts/dust during decisions.
- **Medium (forced via `quality.set('medium')`):** poses remain legible (`v2-medium-group.png` — though see M-1: the frozen classmate occludes the middle student under reduced motion; re-shoot clean on headed GPU).
- **V-2 (minor):** in the C look view (`VIEWS.C`, `tutoring-room.js:44`) Sam lands at the right edge, partially under the floating HUD drawer (`v2-cue-C-confused.png`): his face and arm still visible but the confused hand-to-face pose is half-occluded. Shift `VIEWS.C`/`VIEWS['C-work']` camera x left (v1 R6 reframed only group/overview).

## 5. Poster — PASS

`public/poster-2.0.0.webp` (64 KB built) / `.jpg` (128 KB) show a signature view: three students at desks (Jordan hand raised), Patrick Hand board problem, bookshelf, clock, ROOM 12 poster, classmate visible through the corridor door, rings hidden for the hero shot. The `showcase.json` poster alt accurately describes the scene.

## Findings

| ID | Sev | Finding | Where |
|---|---|---|---|
| V-1 | minor | Encyclopedia-set GLB reads as a plain brown crate on Low (texture cap); re-verify headed | Low preset / `textureMaxSize` |
| V-2 | minor | Sam's close-up/look view half-occluded by the floating HUD drawer; cue arm can sit under the panel | `src/scenes/tutoring-room.js:44-47` |
| V-3 | minor | Hover tooltip (an instruction) uses Patrick Hand accent font, not the Lexend body face required by plan §2.4 readability rule (contrast is fine, 17.36:1) | `src/v2/hud-shell.css:26` |
| V-4 | minor | Withdrawn "fold" pose reads as one arm extended to the side at the A look angle rather than crossed forearms (re-implemented in v2 character; v1 R3 fix did not fully carry over visually) | `src/v2/stylized-character.js:663-674` |
| V-5 | minor | Content JSON `hairStyle: "long"` for Talia vs forced `bun` in render | `content/student-mixes.json` / `tutoring-room.js:386` |

(Also logged as M-1 in the motion report: reduced-motion leaves the corridor classmate standing at the room origin, occluding the group view — a visual defect as well.)

**Verdict: no critical visual blockers; §8 "cues most salient" holds on Low and forced-Medium; ready-after-fixes on the minors.**
