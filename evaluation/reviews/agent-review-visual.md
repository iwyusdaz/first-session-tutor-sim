# Agent review: visual quality (simulated reviewer, headless)

Agent review. Reviewer sub-agent, 2026-10-27. Build: `VITE_TEST_HOOKS=1 npm run build -- --outDir tmp/review-build`, served with `vite preview` on port 4197, Playwright Chromium headless at 1366×820.

**Limits.** The renderer was SwiftShader (`window.__TEST__.engine.softwareGL` = "ANGLE … SwiftShader driver"). By design (DECISIONS.md D17) the engine drops to Low at 0.5× resolution and a ~5 fps cap when no preset is stored. Medium/High/Ultra were forced through `localStorage['first-session-tutor-sim:quality']`, but they still ran on software WebGL, so the AO and shadow quality here is not representative of a GPU. Judge 3D quality cautiously. This review does not cover performance.

## Screenshots (evaluation/reviews/screenshots/)

| File | What |
|---|---|
| v01-intro.png | Module 1 "Before you start" over the 3D room (auto Low, 0.5×) |
| v02-run-picker.png | Run picker |
| v03-intro-cinematic.png | S1 "Walking in" with caption bar and Skip button |
| v04-m1-low-default.png | Moment 1, auto Low preset |
| v10-{low,medium,high,ultra}-m1-group.png | Moment 1 group view per forced preset |
| c-m1-look-{Jordan,Talia,Sam}.png | Preset looks at each student, Run 1 start state |
| c-m3-after-bad-choices.png, c-m3-look-Jordan-worksheet.png, c-m3-board.png | m3 after cold open + skipped review |
| c-m3-reaction.png, c-m4-wait-timer.png, c-m4-rushed-reaction.png | Reaction and wait UI |
| d-debrief.png, d-debrief-full.png | Debrief (3D overview) |
| a-textmode-*.png | Text mode run 2 |

## Findings

| # | Severity | Preset(s) | Finding | Evidence | Fix |
|---|---|---|---|---|---|
| V1 | major | all | The session side panel covers the right ~36% of the canvas. In the default group view, Sam (seat right, the discouraged student) is half hidden behind the panel at every decision. | v04, v10-*, c-m3-look-Jordan-worksheet.png | Shift `VIEWS.group.look` (src/scenes/tutoring-room.js:38) left so the table centers in the visible area left of the panel, or narrow the panel / let the user collapse it. |
| V2 | major | all | The "arms folded" pose reads as two raised fists, which looks like cheering or "hand up," not withdrawal. Talia (Run 1, e=1) shows it from moment 1. | c-m1-look-Talia.png, c-m1-look-Sam.png (Talia center) | Rework `armPose('fold')` (src/scenes/student.js:139): forearms crossed horizontally in front of the torso (shoulder X ≈ −0.3, elbow ≈ −1.5 with shoulder Z bringing the hands to the midline), checked from the tutor seat. |
| V3 | major | all | The worksheets are unreadable at session distance. The m3 error line "3x = 5" can't be seen even in "Look at Jordan." The sheets read as blank white rectangles. realism-matrix.md:12 claims "High (readable): errors are visible in the students' writing." | c-m3-look-Jordan-worksheet.png, v10-ultra | Add a "Look at {E}'s worksheet" close-up view, or raise the font to ~70 px with fewer lines. Otherwise lower the matrix claim and rely on the text observation. |
| V4 | major | all | Rendered posture contradicts the scene text at m1. The text says "Sam sits back, hood up, arms folded," but Sam renders upright with a pencil (Run 1), while Talia renders folded/slumped despite "pencil ready." See expert review E-C1. | c-m1-look-Sam.png | See E-C1 (state-conditioned scene text). |
| V5 | minor | low | Heavy pixel stair-stepping at 0.5× (whiteboard edge, chair legs, table edge). Expected for the software fallback, but the whiteboard equation is still legible. | v01, v04 | None needed for software GL. On real Low (0.75×) confirm with the headed GPU pass. |
| V6 | minor | medium–ultra | Medium, High and Ultra look nearly identical headless. Soft shadows show on the floor at Ultra; AO can't be judged under SwiftShader. | v10-medium/high/ultra | Re-check in the headed GPU pass. |
| V7 | minor | all | The wood table (Wood Table 001) is a saturated red-brown and the most visually dominant surface. It pulls attention from the figures, which carry the cues. | v10-ultra | Desaturate or lighten the table albedo ~20% so the figures' shirts stand out. |
| V8 | minor | all | The window is a flat overexposed white quad with no exterior. Gaze "toward the window" is a cue, and a blank window gives the head direction no visual anchor. | v03 | Add a simple exterior (sky gradient or blurred trees) so a gaze toward it reads as looking out. |
| V9 | minor | all | Dot eyes on a 21 cm head at mid distance make gaze direction (worksheet vs tutor) hard to read. Head yaw/pitch is the only carrier. | c-m1-look-* | Increase head pitch delta between "worksheet" (−0.35) and "tutor" (0); add a slight torso yaw toward the gaze target. |
| V10 | minor | all | Sam's hood is the same purple as the shirt, so it reads as part of the body. "Hood down" (m8 observation o8c) is never shown: `this.hood` is never toggled in code. | src/scenes/student.js:72-79; session.json:185 | Darken the hood material and toggle `hood.visible` when the state or scene says hood down, or drop o8c. |
| V11 | minor | all | The "Say it" button sits below the fold at 820 px height in moments with 4–5 options (panel scroll needed). | v04, v10-* | Make the palette sticky or the panel taller; at least keep "Say it" in view after a radio is chosen. |
| V12 | minor | all | The debrief overview camera is well framed and the "Exit ticket" whiteboard is legible. No z-fighting or broken textures seen. | d-debrief.png | None. |

No broken textures, missing assets, z-fighting or console errors were seen in any preset.
