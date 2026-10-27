# Agent review: heuristic evaluation

Agent review. Nielsen's 10 heuristics and game playability heuristics, rated for the 3D UI and text mode. Based on headless play-throughs of both runs (3D Run 1 partly through the UI, text-mode Run 2 fully by keyboard) and code reading.

## Ratings

| Heuristic | 3D UI | Text mode | Notes |
|---|---|---|---|
| 1 Visibility of system status | concern | pass | "Moment N of 8", the routine bar and the clock time are clear. In 3D the student state is only partly readable (H4), and the HUD region is never used. |
| 2 Match with the real world | concern | concern | Tutoring language is authentic. Move labels are evaluative (H1). |
| 3 User control and freedom | concern | concern | No undo per moment (fine for an assessment). "Replay this run from the start" silently wipes the run (H2). |
| 4 Consistency and standards | concern | concern | "(canonical move)" is attached to misapplied hint-ladder options (H3). |
| 5 Error prevention | concern | concern | H2; accidental fast Enter at the wait (accessibility A11). |
| 6 Recognition over recall | pass | pass | Options, phrasing and routine are always visible. |
| 7 Flexibility and efficiency | pass | pass | Look presets, text mode, wait scale and manual wait. |
| 8 Aesthetic and minimalist design | concern | pass | The panel hides part of the scene. Settings show audio controls with no audio. |
| 9 Help users recover from errors | pass | pass | "Choose a move first." alert; the debrief explains each choice. |
| 10 Help and documentation | pass | pass | Module 1 "How it works", facilitator guide. |
| Clear goals | pass | pass | Objectives listed in module 1. |
| Feedback | concern | pass | Reactions are immediate, but in 3D the pose changes sometimes contradict the reaction text (H5). |
| Challenge/skill balance | fail | fail | The labels reveal the best move (H1), so a careful reader scores 4/4 on every domain at first try (verified: Run 2 best path → all domains 4). |
| No unnecessary friction | concern | pass | Panel scrolling to reach "Say it" (H7). |

## Findings

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| H1 | major | The move names in the palette tell the learner which option is wrong: "vague review", "skip the review", "generic praise", "generic group greeting", "skip the exit ticket to finish the problem", "start straight on the worksheet". The learner picks by label, not by reading cues, so the sim measures reading comprehension, not noticing. | moves.json:31-48; session-panel.js:95 | During the session, show only the phrasing (the actual words) as the choice and reveal the move name and canonical tag in the debrief. D3 already says the model responds to the move, not the wording. |
| H2 | major | "Replay this run from the start" (debrief) calls `startRun`, which replaces the finished run and its log with no confirmation. A coach who wants to *review* the replay loses it. | debrief.js:148; app.js:245-250 | Rename it to "Play this run again (replaces this result)" and add a confirm, or keep previous runs in history. |
| H3 | major | "(canonical move)" is shown on misapplications: the m3 partial step and the m6 extra hint (both hint-ladder). | session-panel.js:96; session.json:75,145 | See expert review E-T1. |
| H4 | major | In 3D, the scene text and the rendered figures disagree at m1 (Sam upright vs "sits back, arms folded"; Talia slumped vs "pencil ready"). The learner can't trust either source. | c-m1-look-Sam.png; session.json:20 | See expert review E-T2. |
| H5 | minor | Reactions contradict the resulting poses (m1 "cold": "Talia starts writing silently" while she renders arms folded). | session.json:36 | See expert review E-T3. |
| H6 | minor | Debrief timeline summaries use the first sentence of the scene: "11:00 · Guided practice." and "20:00 · Independent try: 5x + 3 = 2x + 12." tell you nothing about the decision. Some get a double period ("…for a first step.."). | debrief.js:108; d-debrief-full.png | Add a `title` per moment in session.json (e.g. "Jordan's sign error") and use it in the summary. |
| H7 | minor | "Say it" is below the fold in moments with 4–5 options at 1366×820. | v04 | Sticky action bar at the bottom of the panel. |
| H8 | minor | The noticing step has no feedback until the debrief, and the debrief reports only a count ("0 of the 2 that mattered"), not which ones. | debrief.js:86 | List the relevant observations the learner missed. |
| H9 | minor | Settings show master/voice/ambient volume and mute, but there is no audio. | settings.js:62-69 | Remove the audio controls. |
| H10 | minor | Text size and contrast don't persist across reloads. | accessibility A2 | Apply settings at startup. |
| H11 | minor | Module nav lets the learner jump to "3. Debrief" mid-run. It shows "Finish a run…" but the in-progress run is fine; returning via "2. The session" resumes correctly (pass). Clicking "Restart module" in the menu during a run restarts with no confirmation. | app.js:64 | Confirm before restarting a run with choices made. |
| H12 | minor | The "Wait (3+ seconds of silence)" manual option names the target, which makes the right choice explicit. That's acceptable as an accessibility path, but it means manual-wait learners always "pass" wait time. | session-panel.js:146 | Say "Wait in silence" without the number; explain the target in the debrief. |
