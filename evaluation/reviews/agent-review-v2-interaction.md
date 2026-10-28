# Agent review — v2.0.0 interaction: in-world actions, parity, hooks

**Repo:** first-session-tutor-sim @ main 31b73b0 · **Reviewer:** agent review (headless Chromium + Playwright driving the real UI; SwiftShader/Low by design) · **Date:** 2026-10-28
**Method:** `VITE_TEST_HOOKS=1` build (`tmp/review-build`) served at 127.0.0.1:4197; real pointer/keyboard events; programmatic reads of camera/manager state; screenshots in `evaluation/reviews/screenshots/`.

## Every learning action is doable in-world — PASS

| Check | Result | Evidence |
|---|---|---|
| 7 hotspot rings clickable → camera glides | PASS | `interact.hotspotRings` = `view-group/A/B/C/board/clock/overview` (7). Real mouse click on the clock ring from the overview: camera lands **exactly** at `VIEWS.clock` pos `[1.15, 1.42, -0.15]`, target `[1.9, 1.85, -2.4]` (cubic ease glide, 1.05–1.15 s). |
| WASD/arrows walk in bounds | PASS | W for 1.5 s: z 1.5 → 0.76 toward students; S returns; arrow-left turns the view. Bounds clamp `[-2.9, 2.9] × [-2.1, 2.3]` (`app.js:164`) never exited. |
| Drag-look | PASS | 200 px horizontal drag rotated view direction x: −0.264 → 0.535 (`_dragging` path, `in-world-interaction.js:97-109`). |
| Hover highlight + tooltip + pointer cursor on students | PASS | Hover over Jordan: `canvas.style.cursor = "pointer"`, tooltip visible: "Jordan — Click to read their worksheet up close", emissive highlight tints the figure (`v2-hover-jordan.png`). |
| Click student → glide to worksheet close-up | PASS | Click on Sam: camera settles **exactly** at `VIEWS['C-work'].pos [0.62, 1.22, 0.18]` (`v2-click-jordan-worksheet.png` for Jordan). |
| Floating HUD drawer collapse/expand | PASS | "Hide panel" → `html[data-drawer-collapsed="true"]`, button flips to "Show panel", `aria-expanded="false"`, panel translated + `pointer-events: none`, 100 % scene visible (`v2-drawer-collapsed.png`); "Show panel" restores. |
| Keyboard parity for looks | PASS | Panel look buttons ("Look at Jordan", "Look at the board"…) are real `<button>`s driving the same `app.lookAt` glide path; all in-world actions have a panel equivalent (verified across the session flow). |
| Text-mode parity end-to-end | PASS | One **full moment decision in text mode** (m5: radio + Say it → said/reaction/Next, `v2-textmode-decision.png`) and one **wait-time moment in text mode** (m7 "why": wait counter + Speak again → `waited: true`, `v2-textmode-wait.png`). 3D wait verified too (m4 `ask-wait`: counter ran, held ~5.4 s silence, `waited: true`). |
| Text mode pauses 3D rendering | PASS | `engine._paused === true` while `#textmode` open (D18); resumes on exit. |
| `window.__TEST__` hooks intact | PASS | `app/engine/room/record/data` + `hooks.start/choose/score/state` all present and functional under `VITE_TEST_HOOKS=1`; used only in this test build. |

## Wait-time mechanic in-world — PASS

m4 (Run 1): choosing the `ask-wait` option opens "Silence. Wait as long as feels right…" with a live counter; waiting 3+ s then Speak again recorded `waited: true` (5.4 s). The clock pendulum/second-hand and HUD clock carry the time cue (D27 — visuals only, no audio, per owner decision 9).

## Findings

| ID | Sev | Finding | Where |
|---|---|---|---|
| I-1 | minor | Clicking a student/ring triggers **two** sequential glides to the same destination (manager `_onCanvasClick` glide 1.05 s, then `onClick → app.lookAt` glide 1.15 s). Landing point is exact, but the second glide restarts the ease — visible as a stutter, and under 5 fps software rendering the combined motion took > 2 s. Suppress the manager glide when `entry.onClick` also glides. | `src/v2/in-world-interaction.js:384-399` + `tutoring-room.js:516-527` |
| I-2 | minor | Collapsed drawer leaves a faint watermark strip of the panel (opacity 0.18 remnant at the bottom edge); harmless but slightly muddy. | `src/v2/hud-shell.css:42-53` |
| I-3 | minor | On-screen joystick for touch (plan §2.3) is not present; touch falls back to drag-look + rings. Not an §8 item (parity is keyboard/text), but record as a plan gap for the orchestrator. | plan 09 §2.3 |

**Verdict: no critical or major interaction blockers; every §8 interaction item verified working; ready-after-fixes on minors.**
