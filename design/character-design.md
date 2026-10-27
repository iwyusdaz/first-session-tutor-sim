# Character design (students) and representation

All three students are fictional, constructed for teaching purposes. They are not based on real children and have no real likeness.

## How they are built

Stylized procedural three.js figures (`src/scenes/student.js`) built from primitives with simple joints, so posture, gaze and hand activity can be animated by blending toward target poses. MakeHuman was not used (see `DECISIONS.md`). Faces are deliberately subtle: eyes that blink, no mouth, no lip sync. Dialogue appears as captions. The camera sits at the tutor's seat, at mid distance, so the cues that matter are posture, gaze and hands.

## The three students

| | Jordan (A, he) | Talia (B, she) | Sam (C, they) |
|---|---|---|---|
| Pattern | Confident; answers fast; makes sign errors | Quiet; understands more than she shows | Discouraged by earlier failure; "I'm bad at math" |
| Look | Short dark hair, blue shirt | Long brown hair, green shirt | Hood up, purple shirt |
| Seat | Left | Middle | Right |

## Representation choices

- Behavior patterns are not tied to any demographic trait. The discouraged student is not defined by race, gender or class, and the confident student is not the stereotypical "math kid".
- Skin tones vary across the three students.
- Known risk, flagged for review: Talia is both the only girl and the quiet student, which can read as the "quiet girl" stereotype. Mitigation in the current build: she has the highest starting understanding in Run 1, her quietness is framed as something the tutor's moves cause or fix, and the replay rewards drawing her in. Swapping names/pronouns across patterns is a cheap change if a reviewer judges the risk too high.
- Sam uses they/them. This is stated in the student list, not made into a plot point.
- Sam's "I'm bad at math" line is about a past experience with math, not an identity.

## Review status

The plan calls for a representation review by a reviewer sub-agent. That review is added by the orchestrator under `evaluation/reviews/`; it is not done by the builder. No human reviewer has checked these characters yet.
