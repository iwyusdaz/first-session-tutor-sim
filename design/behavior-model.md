# Behavior model (student-state rules)

**A simplified teaching model, not a validated psychological model.** It encodes the move rationales from the companion repos so that cause and effect are visible in the replay. It does not claim to predict how real students behave.

## State

Each simulated student has three integers, 0–4, clamped:

- **u** understanding (shows only in their written work and answers)
- **e** engagement (shows in posture and gaze)
- **c** confidence (shows in hand activity and willingness to answer)

Starting values differ per mix (`content/student-mixes.json`): Run 1 "the quiet student" and Run 2 "the dominant student".

## Rules

All 30 rules live in `content/behavior-rules.json`. Each has an id, a move, a context (the kind of moment), effects, optional conditions, a rationale and a source. The engine is `src/systems/student-model.js` (pure, deterministic, no DOM, unit-tested).

- **Matching:** a rule applies when its move and context match the chosen option and every condition holds. All matching rules apply, in authored order.
- **Effect keys:** `target` (the student the move is aimed at), `others`, `all`, or a student id (A, B, C).
- **Conditions:** `targetMinEngagement`, `targetMaxEngagement`, `waited` (true/false).
- **Waiting:** `waited` is true when the learner waited at least 3 s × the time scale, or chose "Wait" in manual mode.

Examples (plan 07 §5.3):

| Rule | Move → context | Effect | Source |
|---|---|---|---|
| r-err-probe-engaged | probing question → error, target e ≥ 2 | target u +2 | pedagogy-rules P3 |
| r-err-probe-low | probing question → error, target e ≤ 1 | target u +1 | pedagogy-rules P3 |
| r-err-tell | tell the answer → error | no understanding gain (the answer is now on the board, but the student didn't do the thinking) | plan 07 §5.3; pedagogy-rules P1 |
| r-gq-probe-waited | probing question → group question, waited | Talia (B) u +1, e +1, c +1 | competency-model Q4; Rowe 1972 |
| r-gq-probe-rushed | probing question → group question, didn't wait | Jordan (A) c +1, Talia e −1 | competency-model Q4; Rowe 1972 |
| r-fr-worked | worked example after repeated failure → frustration | Sam (C) u +2, e +1, c +1 | pedagogy-rules P7 |
| r-fr-praise | generic praise → frustration | Sam e −1 | competency-model F1 failure modes |
| r-tc-skip | skip the exit ticket → time check | none (scored instead: caps Session structure at 1) | observation-rubric Domain 2 |

Sources are listed with status in `research/sources.md`. Rules cite the companion repos' pedagogy rules (P1–P7) and competency behaviors (R, S, Q, F, D), plus Rowe (1972) for wait time.

## Cue mapping

`content/cues.json` maps state to body language:

| State | Posture | Gaze | Hands |
|---|---|---|---|
| e ≥ 3 | leaning in | worksheet | hand up if e = 4 and c ≥ 3, else writing |
| e = 2 | upright | tutor | writing if c ≥ 2; pencil down if c ≤ 1 |
| e ≤ 1 | slumped back | window | arms folded |

## Validation

`scripts/validate-rules.mjs` (runs before every build) checks that every option uses a known move and has a rule for its context, two phrasings, a response (waited and rushed variants for wait options), a 1–4 score and a coach note; every moment has relevant and neutral observations; every rule has a rationale and a source and is reachable; no placeholder is left unresolved; and no path pushes a state out of range. It walks every complete path through the session: 51,840 paths across both mixes. Unit tests in `tests/unit/model.test.js` cover the engine.
