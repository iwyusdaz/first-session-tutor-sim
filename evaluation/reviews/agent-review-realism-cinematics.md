# Agent review: realism matrix and cinematic budget

Agent review. Sources checked: `design/realism-matrix.md`, `design/shot-list.md`, `content/cinematics.json`, `src/cinematics/shot-player.js`, `src/app.js`, and headless screenshots (agent-review-visual.md; software WebGL, so visual fidelity is judged cautiously).

## Cinematic budget

| Check | Result | Evidence |
|---|---|---|
| Total ≤ 90 s | pass: 35 s (S1 15 + S2 5 + S3 15) | cinematics.json:3,11,25,39 |
| Each shot ≤ 25 s | pass (max 15 s) | same |
| Purpose tags | pass (orient, orient, reveal); shown on screen as "Shot 1 of 1 — purpose: orient" | v03-intro-cinematic.png |
| Skippable from first frame | pass: Skip button visible at frame 1 plus a document-level Esc listener | shot-player.js:39-48 |
| Captions | pass for display; see R-C3 for the toggle | v03 |
| Reduced-motion version | pass: still frame at the final camera pose, auto-advance | shot-player.js:69-71 |
| Never during assessment | pass: S1 before m1, S2 before m8 choices render, S3 after the last choice. Text mode skips all cinematics. | app.js:257-301, 264-265 |
| shot-list.md matches JSON | pass (ids, durations, purposes, reduced-motion text) | shot-list.md:7-9 |

## Findings

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| R-C1 | major | Body language, rated High and the core cue, is undercut by two pose problems. The folded-arms pose reads as raised fists, and posture/gaze ignore understanding, so "confused" has no rendered cue at all. The highest-realism element doesn't carry two of the three states the objectives name (objective 3: "confusion, disengagement or dominance"). | cues.json:3,20; student.js:139; c-m1-look-Talia.png | See expert review §3: fix the fold pose and add a stalled/confused cue for u ≤ 1. |
| R-C2 | major | Worksheets are rated "High (readable)" and justified as "Errors are visible in the students' writing," but they are not legible from any preset view. The only visual carrier of understanding and of the m3 error is effectively decorative. | realism-matrix.md:12; c-m3-look-Jordan-worksheet.png | Add a worksheet close-up view per student, or downgrade the row and say the error is carried by text. |
| R-C3 | minor | "Cinematic captions are on by default and can be turned off" (accessibility-plan.md:26), but `settings.state.captions` is never read outside settings.js, so the toggle does nothing. | settings.js:64,90; grep of src | Read the flag in ShotPlayer (`caption.hidden = !captions`), or drop the claim and the checkbox. |
| R-C4 | minor | Reduced-motion stills hold for 70% of the shot length (S1 and S3 ≈ 10.5 s each) with no "Continue" control. Skip is the only way out, and skipping also logs "Cinematic skipped." | shot-player.js:70 | Show a "Continue" button on stills. Don't log a skip when reduced motion is on. |
| R-C5 | minor | S1 is 15 s of camera travel. Its learning purpose ("watch the students") is all in the caption, and the figures are small and far during the move. 8–10 s would do the same job. | cinematics.json:11-14; v03 | Shorten S1 to 9 s, or end it with a 2 s hold on the group. |
| R-C6 | minor | S2 "Time check" ends on the clock, but m8 then snaps back to the group view and the clock is outside the group framing (and behind the panel). The time-box cue disappears as soon as the decision appears. | app.js:299-300; v04 | Keep the clock in frame at m8 (use the `camera: "clock"` field for the decision view as well), or show the session clock in the HUD (the `.hud` region is unused). |
| R-C7 | minor | The wall clock (Medium, "Yes" learning cue) is not visible in the default group view at any moment. It can only be seen with "Look at the clock." The routine bar in the panel carries the time-box cue instead, which is fine but makes the 3D clock decorative. | realism-matrix.md:13; v04, v10-* | Put the clock in the group view or drop it to "No" in the matrix. |
| R-C8 | minor | The window is rated None/Omitted for "background noise, other people", but the m3 neutral observation "Someone in the hallway is laughing" describes something with no audio or visual counterpart. That's harmless in text, but it is the only text-only cue in the 3D mode. | session.json:69 | Accept, or swap for a visible neutral detail. |
| R-C9 | minor | Room materials (High) are fine. The red-brown table competes with the figures. Decorative realism costs little here. | v10-ultra | Desaturate the table (visual V7). |
| R-C10 | minor | Faces Low/no lip sync matches the matrix and avoids the uncanny valley (dot eyes, no mouth). No uncanny frames were seen. Gaze direction is still hard to read at mid distance with dot eyes. | c-m1-look-* | Larger head pitch delta (visual V9). |
| R-C11 | minor | Esc is used both for skipping cinematics and (natively) for closing `<dialog>`. Opening Settings during a cinematic and pressing Esc skips the cinematic as well as closing the dialog. | shot-player.js:47 | Ignore Esc in the skip handler when `document.querySelector('dialog[open]')` is set. |

Matrix rows that are justified and working: lip sync None, background noise None, camera fixed seated view, faces Low, room geometry simple.
