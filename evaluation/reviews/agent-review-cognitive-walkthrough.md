# Agent review: cognitive walkthrough

Agent review. Persona: **Grace, 52, career changer** (design/personas.md:10): patient, organized, misses the quiet student. Task: Run 1 "the quiet student" in the 3D mode at the default timed wait, from first load to the debrief. Path walked headless (screenshots in evaluation/reviews/screenshots/).

For each step: (Q1) will she know what to do, (Q2) will she see progress, (Q3) will she get usable feedback. Every "no" is logged.

| Step | Q1 | Q2 | Q3 | Notes / problem |
|---|---|---|---|---|
| 1. Land on "1. Before you start" | yes | yes | n/a | Fictional framing and objectives are clear (v01). |
| 2. Set wait time, answer pre-check | yes | yes | yes | Pre-check gives item feedback. |
| 3. "Go to the session" → run picker → Start Run 1 | yes | yes | n/a | "Start with Run 1 if this is your first time" (v02). |
| 4. S1 cinematic | yes | yes | n/a | Caption plus Skip visible (v03). |
| 5. m1: read the scene, watch the students | yes | yes | **no** | CW1: the scene says Sam sits back with arms folded, but on screen Sam is upright with a pencil and Talia (center) is the one who looks folded or withdrawn, and her pose reads as raised fists (c-m1-look-*.png). Grace's problem is missing the quiet student; here the figures point her at the wrong one. |
| 6. m1: optional Notice | yes | no | **no** | CW2: no feedback on noticing until the debrief, and even then only a count. Since noticing is the persona's core gap, she never learns which cue she missed. |
| 7. m1: choose a move | yes | yes | yes | CW3 (no, for the learning goal): the labels "generic group greeting" / "start straight on the worksheet" make the answer obvious, so she isn't practicing the judgment. |
| 8. m1: find "Say it" | **no** | yes | n/a | CW4: "Say it" is below the panel's fold at 820 px (v04). She has to scroll a panel she may not know scrolls. |
| 9. m1 reaction → Next moment | yes | yes | partly | CW5: after "cold," the text says Talia "starts writing silently," but her figure shows withdrawal. The feedback is inconsistent. |
| 10. m3: Jordan's error | yes | yes | yes | Scene text gives the error; c-m3 shows the worksheet can't be read in 3D, so the text carries it (CW6, minor). |
| 11. m4: ask the group, then a real silence | **partly** | yes | yes | CW7: the instruction "Wait as long as feels right, then speak again" is clear, but focus lands on "Speak again" at once. A habitual Enter ends the wait at ~0 s. The counter shows seconds but no target marker. That's acceptable by design (the habit is the point), but the 3D view gives no sign that Talia is about to talk while Grace waits. |
| 12. m4 reaction | yes | yes | yes | "After a few seconds of quiet, Talia says…" makes the cause and effect clear when she waits (c-m4-rushed-reaction.png shows the rushed version). This is the strongest step for the persona. |
| 13. m5: interruption | yes | yes | yes | Clear. Note the gendered dynamic (expert review §4). |
| 14. m6: Sam's frustration | yes | yes | partly | CW8: the worked example has the same answer as Sam's problem (expert E-M1), so after "Then Sam tries the original again" a math-literate learner may notice Sam just copied it. |
| 15. m8: S2 time check | yes | **no** | yes | CW9: the clock cinematic shows 3 minutes left, then the view snaps back and the clock is out of frame behind the panel. The routine bar still shows "Exit ticket (3 min)", so she recovers. |
| 16. End the session → S3 → debrief | yes | yes | yes | Rubric table, wait %, exit ticket status (d-debrief.png). |
| 17. Debrief: find the moment that cost a domain | **partly** | yes | yes | CW10: timeline summaries such as "11:00 · Guided practice." don't say what happened. She has to open each one. Inside, "What changed", the rule rationale and the coach note are usable. |
| 18. Debrief: "Replay this run from the start" | **no** | — | — | CW11: the label suggests reviewing the replay, but it starts a new run and overwrites the result with no warning. |
| 19. Run 2 | yes | yes | yes | "Run the session again: Run 2" is the primary action. |

## Problems logged (with fixes)

| # | Sev | Problem | Fix |
|---|---|---|---|
| CW1 | major | Cues on the figures contradict the scene text at m1, so the persona is pointed at the wrong student. | Align Run 1 initial states with the script (expert E-T2); fix the fold pose (visual V2). |
| CW2 | major | Noticing gets no feedback that tells the persona which relevant cue she missed. | After "Say it", show "Cues that mattered here: …" or list the missed ones in the debrief. |
| CW3 | major | Evaluative move labels give the answer away. | Show phrasings only during play; reveal move names in the debrief (heuristics H1). |
| CW4 | minor | "Say it" below the fold. | Sticky action bar. |
| CW5 | minor | Reaction text vs pose mismatch. | Expert E-T3. |
| CW6 | minor | Worksheet unreadable in 3D. | Worksheet close-up view. |
| CW7 | minor | Instant focus on "Speak again"; no visual hint in the scene during the silence. | Brief activation guard; optionally show Talia's pencil moving to "writing" during the wait. |
| CW8 | minor | Worked example gives the same answer. | Change the m6 example (expert E-M1). |
| CW9 | minor | Clock leaves view at the m8 decision. | Keep the clock in frame or put the clock in the HUD. |
| CW10 | minor | Uninformative timeline summaries. | Per-moment titles. |
| CW11 | major | The replay button destroys the run. | Rename plus confirm (heuristics H2). |
