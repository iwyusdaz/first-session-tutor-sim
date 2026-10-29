# Status: First Session, a Tutor Classroom Simulator

## v2.0.0 visual revamp (plan 09; 2026-10-28, release gates 2026-10-29)

| Item (plan 09 §8) | Status | Evidence |
|---|---|---|
| Art bible (palette, three fonts, lighting mood, asset/ambient/interaction lists) | done | `design/art-bible.md`; grade tokens in `src/v2/cinematic-grade.js` |
| Living classroom: 6 Poly Haven CC0 models + procedural dressing; no photo backdrops within 30 m (HDRI lighting only, real 3D exterior behind the window) | done | `src/scenes/tutoring-room.js`; `ATTRIBUTION.md` (fonts + models) |
| ≥ 5 ambient-life systems; calm mode during decision moments; reduced-motion respected; text mode still pauses rendering | done | Sun shafts, dust, pendulum + second hand, corridor classmate, character breathing/blinking/gaze (`AmbientLifeManager`); `App.render()` sets calm; D22 |
| In-world interaction with keyboard + text-mode equivalents | done | Hotspot rings / student hover-click glide / WASD-drag (`src/v2/in-world-interaction.js`); panel look buttons and full text mode unchanged |
| Learning cues still the most salient element | done (visual re-check on Low/Medium pending the orchestrator's headed pass) | Calm mode + unchanged cue model; poster + smoke screenshot reviewed |
| Fonts self-hosted, subset, Plain-font toggle, contrast tokens unchanged | done | `src/styles/case-fonts.css`, `src/v2/hud-shell.css`; v1 WCAG AA tokens kept |
| Budgets: first interaction ≤ 15 MB; per-file ≤ 20 MB | done (headless re-measure pending) | dist ~9.5 MB incl. GLBs; CI size gate passes |
| Draw-call budget (≤ 300 on Medium) and ≥ 55 fps | done — headed Apple M1, 2026-10-29, after P11/P12 (`evaluation/results/perf-2026-10-29.json`, staged `startRun('quiet')`): Medium 60.1 fps, 186 draw calls; Low 60.1 fps / 111; High and Ultra 60 fps; menu interactive 0.35 s; 11.9 MB before first interaction. "Is it alive": 16,851 pixels differ between headed frames 5 s apart. Earlier history: | 2026-10-28 perf revision (DECISIONS.md P1–P4): headless probe 481 → 383 draw calls after merging all static content into 40 per-material meshes (was 116 source meshes + 11 separately-drawn GLB instances); Medium preset now 0.8 scale / 1536 shadow map, same as hazard-hunt. Residual calls are animated content the merge must not touch — see open items |
| Honesty labels intact | done | `ATTRIBUTION.md`, `public/showcase.json` (fictional students; constructed room) |
| Poster pair re-rendered from the new scene (≤ 200 KB, blank-frame retry) | done | `public/poster-2.0.0.webp` 61.5 KB / `.jpg` 102.8 KB |
| Version bump, showcase re-pin, docs | done | `package.json`/`showcase.json` 2.0.0; CHANGELOG; DECISIONS D22–D29; validator `validate:showcase` → 2.0.0 |
| ≥ 5 revisions, agent reviews, trailer | done | Four v2 agent reviews (`evaluation/reviews/agent-review-v2-*.md`). Review fixes in commit c17e3cb: spline movers placed on their path, calm-scaled ring pulses, Sam's view cleared of the drawer, Talia's hair JSON matches the render, tooltip font. Plus perf revisions P1–P12. Trailer re-recorded from v2.0.0 (56 s, 16.4 MB, captioned + VTT) |
| Tag v2.0.0 + showcase pin, live checks | done by the orchestrator (see CHANGELOG) | |

v1.0.0 status (below) remains valid for the learning design; scene-level items were superseded by the v2 section above.

---

## 1.0.0 (not tagged)

Statuses: **done** (verified by the builder), **done (agent review)** (pending or completed by orchestrator-run agent reviews), **not possible** (reason given), **pending** (scheduled for the orchestrator).

## Final quality checklist (plan 07 §14)

| Item | Status | Evidence |
|---|---|---|
| Move names match `socratic-ai-tutor`; rubric domains match `tutor-training-course` | done | Unit test "canonical vocabulary" checks both lists exactly; `content/moves.json` |
| Every rule has a rationale and source; the validator passes | done | `scripts/validate-rules.mjs` (30 rules) runs before every build |
| Both student mixes completable; every outcome reachable | done | Validator walks 51,840 paths; Playwright plays both mixes end to end |
| Cues legible at the session distance; representation review done | done (agent review) + revised | Agent reviews found the m1 cue/text mismatch, the fists-like fold pose, missing confused/waiting cues, and gender/skin-tone correlations; all fixed in the 2026-10-27 revision pass (DECISIONS.md R1-R9), with a new validator cue-agreement check. **The representation review was a simulated agent persona; no human representation review has been done and one is recommended** (`evaluation/METHODS.md`) |
| Wait-time scale works; text mode covers every decision | done | Unit test on scale and manual wait; Playwright "timed wait" and "text mode covers the same decisions" |
| Performance budgets met | done (orchestrator, headed Apple M1, 2026-10-27): Medium 60 fps (budget ≥ 55), 155 draw calls, 19.5k triangles, menu interactive 0.20 s, 6.58 MB before first interaction (`evaluation/results/perf-2026-10-27.json`). Headless frame pacing (D17) keeps tests responsive under software WebGL |
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
| Text mode with parity; performance budgets met | both done (headed perf: Medium 60 fps, see `evaluation/results/perf-2026-10-27.json`) |
| Versioned release build meeting the build contract | done (untagged; tagging is the orchestrator's) |
| All verification and reviews done; ≥ 5 revisions documented | done (agent review) for reviews; 17 documented revision fixes applied after them (DECISIONS.md revision log R1-R17); automated verification re-run green |

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

- **No human representation review.** The representation persona in `evaluation/reviews/agent-review-expert-style.md` is simulated; the decorrelation fixes (DECISIONS.md R1) were applied by the builder agent. A human reviewer with lived experience of the identities involved should check the characters before real cohorts use this.
- **Open review findings (deliberately not applied):** hand-up cue gating by context (expert E-T4), per-domain rubric anchors in the debrief level column (E-T7), 3D clock inside the group framing (R-C7, covered by the HUD instead), watch-beat before reaction text (MP6), cue-vocabulary pre-training (MP7). See DECISIONS.md "Not applied".
- **Open perf items after the 2026-10-28 static-room merge (DECISIONS.md P1–P4):** the ≤ 300 draw-call budget on Medium needs one more pass over the animated content the merge must not touch — the 4 articulated characters (127 meshes, ~44 shadow casters), the 7 pulsing hotspot rings (21 meshes) and the ~90-call shadow pass; currently 383 headless calls (was 481). Also: the `mergeStaticGroup` double-draw fix (P2) must be propagated to the synced copies of `src/v2/cinematic-grade.js` in the other repos.

- No real tutors or students have used the simulator.
- The behavior model is a simplified teaching model, not validated against real students.
- `research/simulation-in-teacher-ed-notes.md` (plan §7) was not written: the key primary source (Chernikova et al. 2020) could not be opened, so it is marked UNVERIFIED in `research/sources.md` and no claim depends on it.
- No physical phone testing.
