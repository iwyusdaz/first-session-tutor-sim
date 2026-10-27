# Character design (students) and representation

All three students are fictional, constructed for teaching purposes. They are not based on real children and have no real likeness.

## How they are built

Stylized procedural three.js figures (`src/scenes/student.js`) built from primitives with simple joints, so posture, gaze and hand activity can be animated by blending toward target poses. MakeHuman was not used (see `DECISIONS.md`). Faces are deliberately subtle: eyes that blink, no mouth, no lip sync. Dialogue appears as on-screen text. The camera sits at the tutor's seat, at mid distance, so the cues that matter are posture, gaze and hands.

## The three students (after the representation revision)

| | Jordan (A, she) | Talia (B, she) | Sam (C, they) |
|---|---|---|---|
| Pattern | Confident; answers fast; makes sign errors | Quiet; understands more than she shows | Discouraged by earlier failure; "I'm bad at math" |
| Look | Short dark hair, blue shirt | Long brown hair, green shirt | Short dark hair, purple shirt |
| Skin tone | Darkest of the three (#5c3b28) | Medium (#8d5a3b) | Lightest (#d9a882) |
| Seat | Left | Middle | Right |

## Representation revision (2026-10-27, after the agent representation review)

The first build had two correlation problems, both flagged as major in `evaluation/reviews/agent-review-expert-style.md` §4:

1. **Gender mapped onto the quiet/dominant pattern.** Talia was the only girl and the quiet student, while the only boy (Jordan) talked over her at the interruption moment; her observations included approval-seeking ("watching your face for a reaction") and "her work is neat". That reproduced the boy-dominates, girl-defers dynamic.
2. **Skin tone mapped onto the deficit pattern.** Sam — the discouraged "I'm bad at math" student — had the darkest skin, and the highest-understanding student the lightest. A dark-skinned student in a hoodie as the disengaged, failing one is a recognizable racialized deficit image, and Sam also carried the only nonbinary identity.

Changes made, and why:

| Pattern | Before | After | What this decorrelates |
|---|---|---|---|
| Confident / dominant interrupter | Jordan, he/him, medium skin | **Jordan, she/her, darkest skin** | The dominant interrupter is no longer the only boy; the confident student is dark-skinned |
| Quiet / high understanding | Talia, she/her, lightest skin | **Talia, she/her, medium skin** | Talia is no longer the only girl, so the quiet student is not "the girl"; the successful student is not the lightest |
| Discouraged / failing | Sam, they/them, darkest skin, hood up | **Sam, they/them, lightest skin, short hair (hood removed)** | The struggling student is no longer a dark-skinned figure in a hoodie; withdrawal is carried by posture, gaze and hands only |

Supporting content changes:

- The hood was removed entirely (`student.js` no longer builds it), so withdrawal can never be signaled by a clothing item — only by the state model's posture/gaze/hands cues. The "hood up"/"hood is down now" text cues were deleted.
- The m7 approval-seeking observation ("watching your face for a reaction") became a task cue ("slides her worksheet toward you so you can see the steps"), and "her work is neat" was dropped: the quiet student's cues are now about the work, not about pleasing the tutor.
- Jordan's pronouns were updated everywhere (session text, personas, docs); Sam's they/them is stated once in the student list and never made a plot point. Sam's "I'm bad at math" line stays about a past experience with math, not an identity.
- Names, hair styles and seat positions were kept: the reviewer confirmed the names match the companion repos' conventions and no other correlation was flagged.

## Remaining limits (stated honestly)

- Correlation is not elimination: with three characters, some pattern can always be read onto something (for example, both girls now occupy the confident and quiet patterns while the nonbinary student is the discouraged one — a different, weaker correlation). The table above is the builder's reasoning, not a validation.
- **A human representation review has NOT been done.** The agent reviews (including the representation persona in `evaluation/reviews/agent-review-expert-style.md` §4) are simulated, and the fixes above were applied by the builder agent. A human reviewer with lived experience of the identities involved should check the characters before this is used with real cohorts. This limitation is also stated in `evaluation/METHODS.md` and `STATUS.md`.
