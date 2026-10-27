# Decisions

Each decision with alternatives and rationale. Deviations from plan 07 are marked **Deviation**.

## Learning design (plan 07 §9)

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| D1 | Transparent authored student model (`content/behavior-rules.json`, 30 rules, each with rationale and source) | AI-driven students | No API key; explainable feedback; rules a reviewer can read and challenge. Labeled "simplified teaching model, not a validated psychological model". |
| D2 | Body-language cues over facial realism | Detailed faces + lip sync | Cue legibility; avoids the uncanny valley; cost. |
| D3 | Move palette with two equivalent phrasings per option | Free-text input | Reliable scoring without AI; keeps focus on the move, not the wording. The model and score respond to the move only. |
| D4 | Real-time wait mechanic (target 3 s) with a 0.5×–2× scale and a manual-wait option | Abstract "wait" button only | Builds the actual habit; the scale and manual option keep it accessible. Scoring uses whether the learner waited, not reaction speed. |
| D5 | Replay debrief tied to the five `tutor-training-course` rubric domains | Single score | Mirrors real coaching; coherence with the companion repo. |
| D6 | Seated tutor view with preset looks at each student | Free-roaming camera | Mirrors a tutor's real position; keeps attention on the students. |
| D7 | Eight decision points (m1–m8) across the five-part routine | Six | Two moments each for guided practice and independent try give room for the error, group-question, interruption, frustration and correct-answer situations. Inside the plan's 6–8 range. |
| D8 | Move names copied unchanged from `socratic-ai-tutor/spec/pedagogy-rules.md`; non-canonical options (e.g. "tell the answer", "generic praise") labeled "not a canonical move" in the app | Only canonical moves in the palette | A palette of only good moves can't be failed. Realistic failure modes are needed for the replay to teach. |
| D9 | Two mixes share the same eight moments; the error moment adapts to the mix (Run 1: Jordan's sign error, M2; Run 2: Sam's distributing error, M3) | Separate scripts per mix | Lets the second run act as a transfer task while staying content-driven. |
| D10 | Text mode includes neutral observations alongside relevant cues | Only relevant cues | Describing cues in words makes noticing easier; neutral items keep the judgment (plan §11 trade-off). |

## Characters and scene

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| D11 | **Deviation:** stylized procedural students built from three.js primitives with simple joints; MakeHuman not used | MakeHuman CC0 exports with morph targets (plan §1, Phase 3) | MakeHuman is a desktop GUI application; no CC0 export was produced in this agent-run build environment. Procedural figures keep posture, gaze and hand cues fully controllable and avoid the uncanny valley. Labeled honestly in ATTRIBUTION.md. Swapping in MakeHuman exports remains possible (`src/scenes/student.js` is the only consumer). |
| D12 | Faces: blinking eyes and a slight head tilt only; no mouth, no lip sync | Morph-target expressions | Plan §6.1 keeps faces low–medium; the stylized figures would look odd with partial expressions. |
| D13 | Poly Haven CC0 assets: School Hall HDRI (lighting only), Wood Table 001, Laminate Floor 02, Painted Plaster Wall at 1k, real-world texture scale | ambientCG materials | Poly Haven offered all four in one CC0 source with author metadata; 1k keeps the download small. `scripts/fetch-assets.mjs` re-fetches them. |
| D14 | Whiteboard, worksheets and clock drawn on canvas at runtime | Pre-baked textures | Student work changes per moment and per mix; runtime canvas keeps it readable and in sync with the content JSON. |
| D15 | Post-processing: SMAA on Medium+, N8AO on High+, no bloom, no DOF (`src/core/post.js`, postprocessing 6.39.5, n8ao 2.0.1) | No post; bloom | Standards 4.3 ask for restrained post and AO on High+. A daylit room doesn't motivate bloom. If an effect fails to initialize, rendering falls back to the direct path. |

## Engineering

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| D16 | Content imported into the bundle from `content/*.json` | Fetch from `public/content/` at runtime | No runtime fetch to fail at a sub-path; no sync script needed. The JSON stays separate from code in the repo. |
| D17 | Render-loop frame pacing plus software-WebGL detection (`src/core/engine.js`) | Raise test timeouts | Root cause of slow browser tests (found by an earlier builder session, verified here): under SwiftShader each frame took ~540 ms and the loop rendered back to back, blocking the main thread (4 clicks took ~30 s; `page.evaluate` could hang 90 s). The fix: (a) after an expensive frame, wait at least as long as it took, so rendering uses ≤ ~50% of the main thread; (b) detect software renderers (SwiftShader, llvmpipe, Microsoft Basic Render) and drop to Low at 0.5× resolution, no MSAA, ~5 fps cap. This also helps real users on GPU-blocklisted machines. |
| D18 | Rendering paused while text mode is open | Keep rendering a hidden canvas | Saves battery and keeps the HTML UI responsive. |
| D19 | Functional tests drive the real UI with no test hooks, so they run on the release build | Hook-driven tests | Tests what users get. `__TEST_HOOKS__` (VITE_TEST_HOOKS=1) is used only by `scripts/render-poster.mjs`. |
| D20 | Own ports: preview 4187, sub-path server 4198, poster server 4791 | Defaults | Other repos' servers share this machine. |
| D21 | No decoder plugin and no Draco/KTX2 decoders | Template decoder plugin | The project loads no compressed models or textures. |

## Not done

- **Trailer:** not recorded (needs a headed GPU capture, which the orchestrator serializes). README has a placeholder.
- **≥ 5 documented revisions** (plan §2): revisions come from the agent reviews added by the orchestrator; see `evaluation/reviews/` and CHANGELOG.md.
