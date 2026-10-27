# Agent review: Mayer's multimedia principles

Agent review. Evidence comes from `content/*.json`, the 3D and text-mode UI (headless screenshots in evaluation/reviews/screenshots/) and `src/ui/*`.

| Principle | Rating | Evidence | Violations / fixes |
|---|---|---|---|
| Coherence | concern | No music, ambient audio or bloom. The room is simple. Neutral observations ("blue shirt", "yellow paper") are deliberate distractors for the noticing task (DECISIONS D10), which is justified. | MP1 (minor): settings expose audio controls for audio that doesn't exist. MP2 (minor): the saturated table and blank white window are the most salient surfaces in the frame (v10-ultra). Desaturate and give the window an exterior. |
| Signaling | concern | Routine bar with ▶ current block; "Moment N of 8"; bold move names; debrief rubric table. | MP3 (major): the cue that matters isn't signaled in the 3D view. The figures don't change in a way the learner is told to look for, and in m1 they contradict the text (expert E-T2). Signal the target student briefly after a choice (e.g., a soft outline on whoever's state changed, with a text label "Talia: engagement up"). MP4 (minor): the error mark on the worksheet is too small to work as a signal. |
| Redundancy | pass | Cinematics show captions with no narration, and the 3D figures plus the text descriptions sit behind a disclosure (closed in 3D, open in text mode). | None. |
| Spatial contiguity | concern | The reaction text sits in the side panel while the figures it describes are left of it, and Sam (right seat) sits partly behind the panel. | MP5 (major): text and its referent are split, and one referent is occluded (v04). Re-center the group view in the uncovered area. Place the student's name label near the figure on reaction. |
| Temporal contiguity | pass | The reaction text appears at the same time as the pose change (snap or eased within ~1 s). The m4 waited response follows the real silence. | MP6 (minor): pose easing (k = 1 − e^(−3.2 dt)) takes ~1 s, so a learner reading the panel misses the change. Hold a short "watch" beat before revealing the reaction text, or replay the change on the "Look at" button. |
| Segmenting | pass | Eight moments, each learner-paced, with "Next moment"; the debrief is split into expandable moments. | None. |
| Pre-training | pass | Module 1 lists objectives and how it works; the pre-check primes the moves; the facilitator guide asks tutors to review the seven moves first. | MP7 (minor): the cue vocabulary (what slumped/away/arms folded means in this sim) is never pre-trained. One labeled example of each state in module 1 would help noticing. |
| Modality | n/a / concern | No audio, so all dialogue is printed text. Learners must read the dialogue while also watching figures. | MP8 (minor): if audio is out of scope, keep the reaction text short (most are, under 25 words). |
| Learner control | pass | Learner-paced moments, skippable cinematics, wait scale/manual, text mode, look presets, replay per moment. | MP9 (minor): the reduced-motion still has no Continue button (realism R-C4). MP10 (minor): "Replay this run from the start" overwrites the run (heuristics H2). |
| Personalization (bonus) | pass | Conversational second person ("You sit down at the table"). | None. |
| Embodiment (bonus) | concern | Stylized figures with gaze and posture but folded arms read as fists. | See visual V2. |

## Violation list (summary)

1. MP3 (major): relevant cue not signaled; figures contradict the text at m1.
2. MP5 (major): spatial split, and the side panel occludes the right-hand student.
3. MP1, MP2, MP4, MP6–MP10 (minor): as listed above.
