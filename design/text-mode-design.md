# Text mode design (parity)

Text mode (the "Text mode" button in the header) replaces the 3D view with an HTML rendering of the same session. It is driven by the same content and the same student model, so every run, score and replay is identical to the 3D mode.

| 3D mode | Text mode |
|---|---|
| Scene plays to the decision point | Scene description for the moment (`session.json` → `scene`) |
| Body language on the three figures | A plain-language description of each student's posture, gaze and hands, generated from their current state via `content/cues.json` |
| Optional "notice" action | The same observation checklist, including neutral observations |
| Move palette (radio group + phrasing) | Same palette, same option ids, same scoring |
| Real-time wait after a question | Same wait buttons (timed, scaled, or manual) |
| Students react | Reaction line plus "What the students are doing now" list |
| Debrief: timeline, state graphs, coach notes | Same timeline; state graphs as data tables; same coach notes |
| Cinematics S1–S3 | Skipped; their captions are not needed for any decision |

## Documented trade-off

Describing cues in words makes noticing easier than reading them from posture. Mitigation (plan §11): each moment's observation list mixes relevant cues with neutral ones (for example, "Jordan is wearing a blue shirt"), so the learner still has to judge which cues matter. The debrief reports noticing the same way in both modes: "you marked N observation(s); X of the Y that mattered."

## Tested

`tests/functional.spec.js` → "text mode covers the same decisions" plays a run in text mode through the real UI.
