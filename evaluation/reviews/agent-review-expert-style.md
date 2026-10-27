# Agent review: expert-style persona reviews

Agent review — simulated persona. These are not real experts. Plan 07 §10 names two personas ("experienced middle-school math teacher", "tutoring program coach") plus a cue-legibility check and a representation check. Each has its own section below, followed by rule validation, cross-repo naming and honesty.

Method: read all of `content/` and `design/`, ran the student model (`src/systems/student-model.js`) on the best and worst path for both mixes and printed the cue at each moment, and screenshotted the cues headless (see agent-review-visual.md).

## 1. Experienced middle-school math teacher (Agent review — simulated persona)

| # | Sev | Finding | Where | Fix |
|---|---|---|---|---|
| E-M1 | major | The m6 worked example solves to the same answer as the original, with the same intermediate line. Original 5x + 3 = 2x + 12 → 3x = 9 → x = 3; example 4x + 2 = x + 11 → 3x = 9 → x = 3. The "similar problem" hands Sam the answer, which undercuts P7 ("then return to the original"). | content/session.json:140 | Use e.g. 4x + 1 = x + 13 (3x = 12, x = 4). |
| E-M2 | major | m7 treats distributing first as necessary. The tutor asks "Why did you multiply out the 2 first?" and Talia's model answer is "I had to do that before taking anything away." Dividing both sides by 2 first (3 = y + 1) is equally valid, so the sim rewards a false rule. | session.json:168-169 | Rephrase the why as "How did you decide what to do first?" and make the answer correct: "The 2 multiplies the whole bracket, so I distributed. Dividing by 2 first would work too." |
| E-M3 | minor | m3 Run 1 label "You flipped the sign wrong." Jordan didn't flip the sign at all (10 − 5 instead of 10 + 5). The probe "What happens to it when it moves to the other side?" also teaches the "move across" shortcut many teachers avoid. | student-mixes.json:42,44 | Label: "You didn't undo the −5 correctly." Probe: "What do you do to both sides to undo the −5?" |
| E-M4 | minor | In Run 2 the m2 review is still about the sign error (static scene, session.json:43), but Run 2's error student (Sam) then makes the distribution error M3. Reviewing "from the ticket data" never targets the misconception that actually surfaces. | session.json:41-58 | Make m2 board, work and scene mix-aware ({err.*}) so the review targets M3 in Run 2. |
| E-M5 | minor | The m3 coach note for "label" models the Run 2 probe ("What did the 2 multiply?") even in Run 1, where the error is a sign error. | coach-notes.json:20 | Use `{err.probe}` in the note and fill it. |
| E-M6 | minor | m6 says Sam "tried the same step three times", but the worksheet shows one attempt. Only the observation text says the line was erased three times. | session.json:131-134 | Fine as is if the observation stays; optionally show crossed-out lines. |

Plausible as written: the m3 errors (3x = 5; 2x − 4 = 10), Jordan's m5 answer, Talia's m4 margin note, the m6 specific-feedback phrasing (matches Sam's actual line 3x + 3 = 12), and the m7 similar problems.

## 2. Tutoring program coach (Agent review — simulated persona)

| # | Sev | Finding | Where | Fix |
|---|---|---|---|---|
| E-T1 | major | The failure options at m3 (partial step L3, skipping rungs) and m6 (another hint after three failures) are tagged "(canonical move)" because they use the move id `hint-ladder`. P2 *is* "escalate one rung at a time", so these options violate the canonical move while being labeled as it. The tag also works as an answer hint. | session-panel.js:96; session.json:75,145; moves.json:24 | Add an option-level `misapplied: true` and show "(canonical move, misapplied: skips rungs)". Or hide canonical tags until the debrief. |
| E-T2 | major | Scene and observation text contradict the live cue description at m1. Run 1 Sam renders and is described as "sitting upright, looking at you, pencil down" (e=2, c=1), but the scene says "Sam sits back, hood up, arms folded" and observation o1a, marked *relevant*, says "arms folded and hasn't looked up." Talia (e=1) renders "slumped back, looking toward the window, arms folded" while the scene says "pencil ready" and o1b says "ready to work." A coach would read this as the sim marking the wrong cues as correct. | session.json:20-25; student-mixes.json:34-35; cues.json | Set Run 1 initials so the render matches the script (Talia e=2 c=1, Sam e=1 c=1), or generate the m1 scene/observations from state. Add a validator check that every `relevant` posture observation agrees with `cuesFor` at that moment on the default path. |
| E-T3 | major | Response text contradicts the resulting state. m1 "cold" says "Talia starts writing silently," but r-cold-open drops her to e=0, so she renders slumped with arms folded. m4 "volunteer" says "Talia puts her pencil down," but e 2→1 renders arms folded and looking away. | session.json:36,102; behavior-rules.json:14,39 | Rewrite these responses to match the rendered cue, or make the response text template on the post-choice cue. |
| E-T4 | minor | Best path ceiling: by m7 all three students show "hand up, ready to answer" at once, including during independent work. Real groups don't look like that, and the cue stops carrying information. | cues.json:17 | Show hand-up only when the moment is a group question (context gq/interruption); otherwise show "writing". |
| E-T5 | minor | m8 "one-more" targets Jordan (who asked), but r-tc-similar raises Talia's understanding. | session.json:191; behavior-rules.json:73 | Change the effect to A u+1, or the target to all. |
| E-T6 | minor | m5 option "let the interrupting student finish" is phrased as praise ("Nice, Jordan, that's right"). The coach note correctly calls it praising the interrupter, but the move label doesn't match. | moves.json:44; session.json:121 | Rename to "accept the interruption and praise it". |
| E-T7 | minor | The rubric "What the level means" column uses the same generic sentences for every domain ("absent, or the failure mode dominates"). It doesn't use the per-domain anchors the debrief claims to apply. | src/ui/debrief.js (scoreTable); d-debrief.png | Pull the per-domain level anchors from `observation-rubric.md`. |

Coach positives: the m8 exit-ticket cap, the m4 wait split (waited/rushed with different scores), the replay showing the fired rule rationale plus source, and the "conversation starter, not certification" framing (teacher-guide.md:34).

## 3. Cue legibility check (Agent review)

Plan §10 asks that each state be readable at session distance and not stereotyped.

- **Disengaged (e ≤ 1):** carried by slumped posture, gaze to the window and folded arms. Posture lean (−0.22 rad) is visible. The folded-arms pose renders as two raised fists (c-m1-look-Talia.png), which reads as cheering or a hand up. **major**, see visual V2.
- **Confused:** there is no confusion cue. `cues.json` derives posture, gaze and hands from e and c only, and understanding "shows only in written work" (cues.json:3). The worksheets are unreadable from the tutor seat (visual V3). So a confused-but-engaged student looks the same as a fine one, and confusion is only readable from the text. **major.** Fix: add a "stalled" cue (pencil hovering, head tilt) when u ≤ 1 and e ≥ 2, plus a worksheet close-up view.
- **Waiting (m3 "waiting for you to say whether it's right"):** no distinct rendered cue. The scene text carries it. **minor.** Fix: a "looking at tutor, pencil down" override for the targeted student at m3/m7.
- **Gaze:** gaze is tied to engagement, so e = 2 always means "looking at you." That makes it impossible to show Talia's defining "minimal eye contact" while she is moderately engaged (personas.md:20). **minor.** Fix: tie gaze-to-tutor to c ≥ 2.
- **HUD:** `.hud` exists (shell.js:26) but `setStatus` is never called, so the HUD is always empty. Cues come only from the figures and the side panel. **minor.**
- **Color-only:** the only color-only cue is the worksheet ellipse, red for error and green for fixed (tutoring-room.js:236), and it is unreadable anyway. **minor.** Add a ✗ / ✓ glyph. Debrief charts use dash patterns plus ●■▲ markers and data tables (pass).

## 4. Representation review (Agent review — simulated persona)

The builder flagged (character-design.md:21) that Talia is both the only girl and the quiet student. Agent judgment: **yes, as built it reinforces the "quiet girl in math" stereotype, and the scene compounds it.** Jordan, the only boy, talks over her at m5 (session.json:110). She is "watching your face for a reaction" (approval-seeking, o7b) and her "work is neat" (session.json:160). That is the boy-dominates, girl-defers dynamic in full. The mitigation (she has the highest understanding) arguably feeds the "girls are diligent but under-confident" trope rather than countering it. **major.**

A second risk the design doc does not flag, and which is more serious: the skin tones line up with the patterns. Sam, the discouraged "I'm bad at math" student with hood up and arms folded, has the darkest skin (#5c3b28). Talia, the highest-understanding student, has the lightest (#d9a882) (student-mixes.json:12,18,24). A dark-skinned student in a hoodie as the disengaged, failing one is a recognizable racialized deficit image. Sam is also the only nonbinary student, so the struggling student carries two marked identities. character-design.md:19 says "Behavior patterns are not tied to any demographic trait," but the build does exactly that. **major (treat as release-blocking for a teacher-training product).**

Specific fix (cheap, content-only):
1. Make Jordan she/her (the name is unisex). The dominant interrupter becomes a girl, so there are two girls, and m5 is no longer gendered. Edit `pronoun` in student-mixes.json:10 and "his/he" at session.json:52, 99, 114, plus personas.md:19 and character-design.md:11.
2. Rotate skin tones so the discouraged student isn't darkest: Sam #d9a882, Talia #8d5a3b, Jordan #5c3b28. That way the confident student is darkest and the high-understanding quiet student is medium.
3. Remove the hood as the disengagement marker. Give Sam a beanie or short hair and let posture alone carry withdrawal. Delete observation o1c/o8c hood references (session.json:20,185).
4. Remove "her work is neat" (session.json:160). Swap o7b ("watching your face for a reaction") for a neutral cue such as "Talia slides the worksheet toward you."
5. Have a human reviewer with lived experience check the result. No human has checked these characters (character-design.md:27).

## 5. Rule validation: behavior-rules.json vs design/behavior-model.md (Agent review)

- All 8 example rules in behavior-model.md:26-35 match the JSON in move, context, condition and effect. The validator passes (8 moments, 30 rules, 51,840 paths).
- Plausibility issues are E-T2, E-T3, E-T5 (above) plus:
  - r-review-skip (behavior-rules.json:21) lowers only Jordan's understanding, though m2 work shows Sam made the same sign error (session.json:42). **minor.** Effects should be A and C.
  - r-review-data raises everyone's u, including Talia, whose ticket was correct (o2b). **minor.**
  - Worst path: from m2 on, Talia and Sam sit at e=0 and every later bad move produces no visible change (floor). The replay still lists rules, so this is acceptable. **minor.**
- The model is consistently labeled "simplified teaching model" (behavior-model.md:3, behavior-rules.json:3, modules.js:48, debrief).

## 6. Cross-repo naming (Agent review)

Checked programmatically: the seven canonical names in `content/moves.json:23-29` equal `socratic-ai-tutor/spec/pedagogy-rules.md:9-15` exactly, in order. The five domains in `content/moves.json:8-12` equal the `## Domain N — …` headings in `tutor-training-course/research/competency-model.md:11,23,35,49,62` exactly. **No mismatches.** Behavior codes cited (R1–R4, S1–S3, Q1–Q6, F1–F4, D1, D3) all exist in competency-model.md. Prose uses lowercase plural variants ("probing questions", modules.js:13; "hints before answers"). That's acceptable in prose, but the in-app objective could quote the canonical "probing question" and "hint ladder (levels 0–5)". **minor.**

## 7. Honesty (Agent review)

| # | Sev | Finding | Where | Fix |
|---|---|---|---|---|
| H1 | pass | Students labeled fictional/constructed and Bridge Math Tutoring labeled fictional: README.md:9, modules.js:47-48, session.json:3, student-mixes.json:3, teacher-guide.md:3, sources.md:29-33. | | |
| H2 | pass | No efficacy claims. README.md:57, needs-analysis.md:15, learning-objectives.md:18 and modules.js:105 state what can't be shown. Chernikova 2020 is UNVERIFIED and unused (sources.md:26). | | |
| H3 | major | README.md:1 says "Automated functional, accessibility and performance testing plus agent-based design reviews are complete." STATUS.md:14 says performance is **pending**, and README.md:65 lists the agent reviews as next steps. STATUS.md:12 and :29 mark reviews "done (agent review)" before they existed. | README.md:1, 65; STATUS.md:12, 14, 29 | Make the README banner match STATUS. Mark rows "done" only after the review files exist. |
| H4 | minor | README.md:61 says "Captions with speaker labels for all dialogue." In-session dialogue is in reaction text with inline names, not captions, and the "Captions on" setting is never read (see accessibility review). | | Reword to "All dialogue is shown as on-screen text with speaker names." |
| H5 | minor | realism-matrix.md:12 claims worksheets are "High (readable)". They are not legible from the seat (visual V3). | | Fix or downgrade the claim. |
