# Status: First Session, a Tutor Classroom Simulator (1.0.0, not tagged)

Statuses: **done** (verified by the builder), **done (agent review)** (pending or completed by orchestrator-run agent reviews), **not possible** (reason given), **pending** (scheduled for the orchestrator).

## Final quality checklist (plan 07 §14)

| Item | Status | Evidence |
|---|---|---|
| Move names match `socratic-ai-tutor`; rubric domains match `tutor-training-course` | done | Unit test "canonical vocabulary" checks both lists exactly; `content/moves.json` |
| Every rule has a rationale and source; the validator passes | done | `scripts/validate-rules.mjs` (30 rules) runs before every build |
| Both student mixes completable; every outcome reachable | done | Validator walks 51,840 paths; Playwright plays both mixes end to end |
| Cues legible at the session distance; representation review done | done (agent review) | Cue mapping unit-tested; legibility and representation reviews are run by the orchestrator (`evaluation/reviews/`). Known risk flagged in `design/character-design.md` |
| Wait-time scale works; text mode covers every decision | done | Unit test on scale and manual wait; Playwright "timed wait" and "text mode covers the same decisions" |
| Performance budgets met | pending | Headed GPU sampling is serialized by the orchestrator. Headless only: frame pacing keeps the UI responsive under software WebGL (DECISIONS.md D17) |
| README: play link, trailer, realism rationale, companion links, evaluation notice | done | Play link marked pending deployment; trailer is a placeholder (not possible here: needs a headed GPU capture) |

## Success criteria (plan 07 §2)

| Criterion | Status |
|---|---|
| Realistic small-group tutoring room; 3 student characters with idle, attention and affect animations | done, with a deviation: stylized procedural figures instead of MakeHuman (DECISIONS.md D11) |
| 6–8 decision points across the session routine | done (8) |
| Student-state model with documented rules | done (`design/behavior-model.md`) |
| Wait-time mechanic, real seconds, adjustable | done |
| Replay debrief: timeline, state graphs, coach notes mapped to the rubric | done |
| Two replayable runs with different student mixes | done |
| Text mode with parity; performance budgets met | text mode done; performance pending |
| Versioned release build meeting the build contract | done (untagged; tagging is the orchestrator's) |
| All verification and reviews done; ≥ 5 revisions documented | done (agent review) for reviews and revisions; automated verification done |

## Build contract (08 §5)

| Item | Status |
|---|---|
| Vite `base: './'`, no absolute asset paths | done |
| `public/showcase.json` validated (`node scripts/validate-showcase.mjs 1.0.0`) | done |
| `public/attribution.json` generated from ATTRIBUTION.md (5 entries) | done |
| Poster pair 1200×630 from the real scene (jpg 103 KB, webp 62 KB) | done |
| `public/favicon.svg` | done |
| Sub-path test | done (pass) |
| axe gate (0 critical/serious) | done |
| CI and release workflows | done |

## Phases (plan 07 §8)

| Phase | Status |
|---|---|
| 0 Setup | done |
| 1 Research and alignment | done; two research claims UNVERIFIED and not used (`research/sources.md`) |
| 2 Learning and behavior design | done (`design/`) |
| 3 Characters and animation | done with deviation (no MakeHuman); uncanny-valley screenshot check: done (agent review) |
| 4 Environment | done |
| 5 Systems | done |
| 6 Cinematics, UI, text mode, accessibility | done |
| 7 Content, verification, reviews, write-up | content, verification and write-up done; reviews and trailer pending |
| 8 Release build | build contract done; `v1.0.0` tag not created (orchestrator) |

## Known limitations

- No real tutors or students have used the simulator.
- The behavior model is a simplified teaching model, not validated against real students.
- `research/simulation-in-teacher-ed-notes.md` (plan §7) was not written: the key primary source (Chernikova et al. 2020) could not be opened, so it is marked UNVERIFIED in `research/sources.md` and no claim depends on it.
- No physical phone testing.
