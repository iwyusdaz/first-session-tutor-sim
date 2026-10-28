# Agent review — v2.0.0 motion: ambient life, calm mode, reduced motion

**Repo:** first-session-tutor-sim @ main 31b73b0 · **Reviewer:** agent review (headless; motion verified by state sampling across ~1.5 s windows plus code trace) · **Date:** 2026-10-28

## Ambient systems census — ≥ 5 running, ≥ 3 verified live

`AmbientLifeManager` census at runtime: 1 light-shaft group (3 shafts through the blinds), 1 dust volume (90 motes), 2 oscillators (pendulum rotate + second-hand spin), 1 spline mover (corridor classmate, ping-pong, character-driven), plus 3 student characters + classmate micro-motion driven by `TutoringRoom.update()` (breathing / blinking / gaze tracking at the moving tutor camera / writing pencil / lip-flap via `setSpeaking`, `app.js:227-232`).

Live deltas sampled while calm (factor 0.30) — all non-zero, so calm slows but never freezes (plan §1 "never stops"):

| System | Δ over ~1.5 s |
|---|---|
| Pendulum rotation | 0.108 rad |
| Second hand | 0.023 rad |
| Classmate on corridor spline | 0.21 m |
| Dust position | 0.0019 units |
| Student breathing (spine scale) | 0.0097 |

## Calm mode — PASS (observed + code-traced)

- During a staged decision (Run 1, m1): `room.life.calm === true`, `calmFactor` converges to exactly **0.30**; particle opacity and shaft shimmer dim accordingly (`ambient-life.js:272, 290`).
- After choosing (reaction playing): `calm === false`, factor easing back toward 1.0 (sampled 0.54 mid-ease). `app.render()` sets calm for `module 1 && run && !run.done` (`app.js:246`); `onChoice` clears it (`app.js:313`). Calm is also off in menu/debrief modules (debrief capture shows ambient running).
- Students follow the same factor (`tutoring-room.js:651-655`), so the room slows as one.

## Motion load during a decision — PASS with one minor

During the decision the dimmed shafts/dust and slowed micro-motion leave the students' poses as the dominant motion; whiteboard/cue text static. **Minor (M-2):** the hotspot-ring pulse and diamond beacon animate at **full speed during calm** — `InWorldInteractionManager.update()` uses raw `elapsed`, not the calm factor (`in-world-interaction.js:452-459`). Rings are guidance rather than learning cues, but they are the only things pulsing at 100 % while everything else is calmed; scale them by the calm factor.

## Reduced motion — motion stops, poses stay; one MAJOR bug

- Emulation check (`reducedMotion: 'reduce'` context): `prefers-reduced-motion` detected, `life.reducedMotion === true`; all sampled deltas **exactly 0** (pendulum, second hand, dust, breathing, classmate); cue poses still apply snapped (`setStudentState(..., {snap:true})` → `action: 'hand-up'` confirmed). Glide snaps instantly (`glideTo` reduced-motion path). PASS on the §8 intent.
- **M-1 (major): the corridor classmate is never placed on its spline under reduced motion, and stands frozen at the world origin (0, 0, 0) — the middle of the classroom**, directly in front of the group view, occluding Talia (`v2-reduced-motion.png`, `v2-medium-group.png`). Cause: `addSplineMover()` registers the mover but only positions it inside `update()`'s spline loop, which `if (this.reducedMotion) return;` skips (`ambient-life.js:253-268, 296-333`); the character's root starts at the origin. Fix: on registration (and on `setReducedMotion(true)`), place `object3d` at `curve.getPointAt(u)` once (rotation too), or hide the mover while reduced.

## Findings

| ID | Sev | Finding | Where |
|---|---|---|---|
| M-1 | **major** | Reduced-motion: classmate frozen at room origin, occluding the group view / middle student (screenshot evidence). Ambient-motion stop itself works. | `src/v2/ambient-life.js` `addSplineMover` (no initial placement) + `update()` early return at line 268 |
| M-2 | minor | Hotspot ring/beacon pulse ignores calm mode (full-speed during decisions). | `src/v2/in-world-interaction.js:452-459` |
| M-3 | minor | No "is it alive" headed capture exists yet for v2 (plan §3 step 4) — this review's sampled deltas substitute in headless; the orchestrator's headed pass should record the 10 s capture. | plan 09 §3 |

**Verdict: calm mode and normal-mode ambient life meet §8; reduced-motion has one major placement bug to fix before tagging (one-line-ish fix).**
