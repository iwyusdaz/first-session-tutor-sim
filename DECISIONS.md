# Decisions

Each decision with alternatives and rationale. Deviations from plan 07 are marked **Deviation**.

## Learning design (plan 07 §9)

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| D1 | Transparent authored student model (`content/behavior-rules.json`, 30 rules, each with rationale and source) | AI-driven students | No API key; explainable feedback; rules a reviewer can read and challenge. Labeled "simplified teaching model, not a validated psychological model". |
| D2 | Body-language cues over facial realism | Detailed faces + lip sync | Cue legibility; avoids the uncanny valley; cost. |
| D3 | Move palette with two equivalent phrasings per option | Free-text input | Reliable scoring without AI; keeps focus on the move, not the wording. The model and score respond to the move only. |
| D4 | Real-time wait mechanic (target 3 s) with a 0.5×–2× scale and a manual-wait option | Abstract "wait" button only | Builds the actual habit; the scale and manual option keep it accessible. Scoring uses whether the learner waited, not reaction speed. |
| D5 | Replay debrief tied to the five `tutor-training-course` rubric domains | Single score | Mirrors real coaching; coherence with the companion repo. |
| D6 | Seated tutor view with preset looks at each student | Free-roaming camera | Mirrors a tutor's real position; keeps attention on the students. |
| D7 | Eight decision points (m1–m8) across the five-part routine | Six | Two moments each for guided practice and independent try give room for the error, group-question, interruption, frustration and correct-answer situations. Inside the plan's 6–8 range. |
| D8 | Move names copied unchanged from `socratic-ai-tutor/spec/pedagogy-rules.md`; non-canonical options (e.g. "tell the answer", "generic praise") labeled "not a canonical move" in the app | Only canonical moves in the palette | A palette of only good moves can't be failed. Realistic failure modes are needed for the replay to teach. |
| D9 | Two mixes share the same eight moments; the error moment adapts to the mix (Run 1: Jordan's sign error, M2; Run 2: Sam's distributing error, M3) | Separate scripts per mix | Lets the second run act as a transfer task while staying content-driven. |
| D10 | Text mode includes neutral observations alongside relevant cues | Only relevant cues | Describing cues in words makes noticing easier; neutral items keep the judgment (plan §11 trade-off). |

## Characters and scene

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| D11 | **Deviation:** stylized procedural students built from three.js primitives with simple joints; MakeHuman not used | MakeHuman CC0 exports with morph targets (plan §1, Phase 3) | MakeHuman is a desktop GUI application; no CC0 export was produced in this agent-run build environment. Procedural figures keep posture, gaze and hand cues fully controllable and avoid the uncanny valley. Labeled honestly in ATTRIBUTION.md. Swapping in MakeHuman exports remains possible (`src/scenes/student.js` is the only consumer). |
| D12 | Faces: blinking eyes and a slight head tilt only; no mouth, no lip sync | Morph-target expressions | Plan §6.1 keeps faces low–medium; the stylized figures would look odd with partial expressions. |
| D13 | Poly Haven CC0 assets: School Hall HDRI (lighting only), Wood Table 001, Laminate Floor 02, Painted Plaster Wall at 1k, real-world texture scale | ambientCG materials | Poly Haven offered all four in one CC0 source with author metadata; 1k keeps the download small. `scripts/fetch-assets.mjs` re-fetches them. |
| D14 | Whiteboard, worksheets and clock drawn on canvas at runtime | Pre-baked textures | Student work changes per moment and per mix; runtime canvas keeps it readable and in sync with the content JSON. |
| D15 | Post-processing: SMAA on Medium+, N8AO on High+, no bloom, no DOF (`src/core/post.js`, postprocessing 6.39.5, n8ao 2.0.1) | No post; bloom | Standards 4.3 ask for restrained post and AO on High+. A daylit room doesn't motivate bloom. If an effect fails to initialize, rendering falls back to the direct path. |

## Engineering

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| D16 | Content imported into the bundle from `content/*.json` | Fetch from `public/content/` at runtime | No runtime fetch to fail at a sub-path; no sync script needed. The JSON stays separate from code in the repo. |
| D17 | Render-loop frame pacing plus software-WebGL detection (`src/core/engine.js`) | Raise test timeouts | Root cause of slow browser tests (found by an earlier builder session, verified here): under SwiftShader each frame took ~540 ms and the loop rendered back to back, blocking the main thread (4 clicks took ~30 s; `page.evaluate` could hang 90 s). The fix: (a) after an expensive frame, wait at least as long as it took, so rendering uses ≤ ~50% of the main thread; (b) detect software renderers (SwiftShader, llvmpipe, Microsoft Basic Render) and drop to Low at 0.5× resolution, no MSAA, ~5 fps cap. This also helps real users on GPU-blocklisted machines. |
| D18 | Rendering paused while text mode is open | Keep rendering a hidden canvas | Saves battery and keeps the HTML UI responsive. |
| D19 | Functional tests drive the real UI with no test hooks, so they run on the release build | Hook-driven tests | Tests what users get. `__TEST_HOOKS__` (VITE_TEST_HOOKS=1) is used only by `scripts/render-poster.mjs`. |
| D20 | Own ports: preview 4187, sub-path server 4198, poster server 4791 | Defaults | Other repos' servers share this machine. |
| D21 | No decoder plugin and no Draco/KTX2 decoders | Template decoder plugin | The project loads no compressed models or textures. |

## Not done

- **Trailer:** not recorded (needs a headed GPU capture, which the orchestrator serializes). README has a placeholder.
- ~~**≥ 5 documented revisions** (plan §2)~~: done in the post-review revision pass below.

## Revision log (2026-10-27, after the seven agent reviews)

Each entry: review finding → change made → evidence that it holds. The agent review reports live in `evaluation/reviews/`.

| # | Finding (source) | Change | Evidence |
|---|---|---|---|
| R1 | Gender mapped onto the quiet/dominant pattern; skin tone mapped onto the deficit pattern; hood as withdrawal marker; approval-seeking and "her work is neat" cues (expert-style §4, release-blocking) | Jordan → she/her; skin tones rotated (Jordan darkest, Talia medium, Sam lightest); hood removed from the figure and all text; o7b swapped for a task cue; "her work is neat" dropped; decorrelation table in `design/character-design.md`; human-representation-review-not-done stated in STATUS/METHODS | Commit f23b960; `student-mixes.json`; unit tests pass; `design/character-design.md` |
| R2 | Scene/observations contradict the rendered cues at m1; reactions contradict resulting states (expert E-T2, E-T3; heuristics H4, H5; visual V4; walkthrough CW1, CW5) | Run 1 initials re-set (Talia e=2 c=1, Sam e=1 c=1; Run 2 Sam withdrawn too); m1 scene/observations rewritten; m1 "cold" and m4 "volunteer" responses rewritten; new `expects` annotations + validator cue-agreement check on the default path in both mixes + unit test; `cuePose` moment overrides drive both render and text | `node scripts/validate-rules.mjs` → OK, 51,840 paths; `tests/unit/model.test.js` "relevant body-language observations agree..." |
| R3 | Folded-arms pose reads as raised fists (visual V2; realism R-C1; expert §3) | `armPose('fold')` reworked: shoulder pulls inward, elbow folds forearms across the chest | `src/scenes/student.js`; visuals to be re-verified in the headed pass |
| R4 | No "confused" or "waiting" cue (realism R-C1; expert §3; plan objective 3) | New state-based confused cue (u≤1, e≥2: pencil hovering) and moment-pinned waiting cue (m3 target: pencil in hand, looking at you); unit-tested | `content/cues.json`; `studentCues` in `student-model.js`; unit test "shows a confused cue..." |
| R5 | Worksheets unreadable at session distance (visual V3; realism R-C2; walkthrough CW6; honesty H5) | "Look at {name}'s worksheet" close-up views added; realism-matrix row reworded to name the close-up | `VIEWS['*-work']`; matrix row; look buttons |
| R6 | Side panel occludes Sam; group view off-centre (visual V1; multimedia MP5) | Group/overview look targets shifted so the table centers in the uncovered area left of the panel | `VIEWS.group`/`overview` |
| R7 | Worksheet error/fixed mark is color-only and tiny (accessibility A7; multimedia MP4) | ✗/✓ glyphs drawn beside the ellipse | `setWork()` in `tutoring-room.js` |
| R8 | HUD region unused; clock cue disappears at the m8 decision (realism R-C6/R-C7; expert §3; CW9; multimedia MP3) | HUD shows state-change summaries after each choice and the session clock + routine block at each moment; matrix row updated | `app.js onChoice/nextMoment` |
| R9 | Window blank/overexposed; table competes with figures; gaze pitch unreadable (visual V7/V8/V9; realism R-C9/R-C10; multimedia MP2) | Sky/tree exterior behind the glass, glass opacity down; table tinted lighter/desaturated; head pitch aims at the gaze point; slight torso yaw toward gaze | `tutoring-room.js`, `student.js` |
| R10 | Reduced-motion stills had no Continue and leaving them was logged as a skip; captions toggle dead; Esc during dialogs skipped cinematics (realism R-C3/R-C4/R-C11; accessibility A4/A10; multimedia MP9) | Continue button on stills (no skip log under reduced motion); captions toggle wired into ShotPlayer; Esc guarded on `dialog[open]` | `shot-player.js`; updated reduced-motion test |
| R11 | Move names/canonical tags give the answer away during play (heuristics H1; expert E-T1; walkthrough CW3) | Palette shows neutral option letters + target + the words; move names and canonical/misapplied tags revealed in the debrief; m3 partial and m6 ladder flagged `misapplied` ("canonical move, misapplied") | `session-panel.js`, `debrief.js`; Playwright test "the palette shows phrasings only..." |
| R12 | "Replay this run from the start" silently overwrote the finished run (heuristics H2; walkthrough CW11) | Renamed "Play this run again (replaces this result)" with a two-step confirm | `debrief.js`; Playwright test |
| R13 | m6 worked example solved to the same answer as Sam's problem; m7 treated distributing first as required (expert E-M1, E-M2; walkthrough CW8) | Example → 4x + 1 = x + 13 (intermediate 3x = 12, x = 4 — different from Sam's 3x = 9, x = 3); m7 asks "How did you decide what to do first?" and the model answer names dividing-by-2-first as also valid | `content/session.json`; validator placeholder walk |
| R14 | Settings didn't persist text size/contrast/FOV; audio controls for audio that doesn't exist; wait settings unreachable mid-session; manual wait named the target; instant Enter ended waits (accessibility A2/A5/A11/A12; heuristics H9/H10/H12; multimedia MP1) | `_apply()` at startup; audio fieldset removed; wait scale + manual added to Settings; "Wait in silence" wording; 300 ms activation guard on Speak again | `settings.js`, `app.js`, `session-panel.js` |
| R15 | Skip link went to hidden `#textmode`; no `h1`; "Restart module" mid-run unconfirmed; panel translucency vs contrast; "Say it" below the fold; reflow at narrow widths (accessibility A1/A3/A8/A9; heuristics H7/H11; visual V11; CW4) | Skip link → `#session-panel` (focusable); `h1` app title; restart confirm; opaque panel background; sticky say-bar; full-width panel under 640 px | `index.html`, `app.js`, `shell.js`, `sim.css` |
| R16 | Timeline summaries uninformative; noticing feedback was a count only (heuristics H6/H8; walkthrough CW2/CW10) | Per-moment `title` in session.json used in summaries; debrief lists which relevant cues were marked vs missed | `session.json`, `debrief.js` |
| R17 | m2 review never targeted Run 2's actual misconception; review rules raised/lowered the wrong students; m8 "one-more" raised the wrong student; interrupter-praise move mislabeled (expert E-M4/E-M5/E-T6; §5 minors; E-T5) | m2 board/work/scene/observations mix-aware via `{err.*}`; r-review-data → A,C u+1; r-review-skip → A,C u−1; r-tc-similar → A u+1; move renamed "accept the interruption and praise it"; coach notes made mix-neutral | `session.json`, `behavior-rules.json`, `moves.json`, `coach-notes.json`; validator + unit tests |

Not applied (with reasons):

- E-T4 (hand-up only during group questions) and E-T7 (per-domain rubric anchors in the level column): both need a cue/rubric data rework larger than this pass; left open, recorded in STATUS.md.
- R-C7 full fix (3D clock inside the group framing): handled via the HUD time cue instead; the clock keeps its own look view.
- MP6 (watch beat before the reaction text), MP7 (cue vocabulary pre-training), A6 (disclosure default for AT users), CW7 (visual "about to talk" hint during the wait): minor polish left open.
