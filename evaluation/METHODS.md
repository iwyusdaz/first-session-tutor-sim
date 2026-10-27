# Evaluation methods: First Session 1.0.0

What was run, what it can show, and what it cannot.

## What was run (automated, by the builder agent, 2026-10-27)

| Method | Tool | Scope | Result |
|---|---|---|---|
| Rule validation | `scripts/validate-rules.mjs` (runs before every build) | 8 moments, 30 rules, both mixes: every option has a known move, a matching rule, two phrasings, a response, a 1–4 score and a coach note; every rule has a rationale and source and is reachable; no unresolved placeholders; walks every complete path and checks no state leaves 0–4 | pass, 51,840 paths (`results/validate-rules-2026-10-27.txt`) |
| Unit tests | vitest 5.0.5 | 15 tests: validator, canonical move and domain names match the companion repos exactly, routine time boxes, key rules (telling vs probing, wait time and the quiet student, mix-specific error, generic praise), state bounds, rubric scoring (strong vs weak run, exit-ticket cap, rushed wait), wait-time scale and manual wait, cue mapping, honesty labels | 15/15 pass (`results/unit-tests-2026-10-27.txt`) |
| Functional tests | Playwright 1.64.1, headless Chromium, release build (no test hooks) | 9 tests: four modules by keyboard; pre-check feedback; both mixes end to end with different scores; mix-specific error moment; debrief explanations and coach notes; text-mode parity; resume after reload; timed wait counts rushing as not waiting; reduced-motion intro | 9/9 pass |
| Accessibility | axe-core 4.14 via Playwright | Intro, a moment, the wait prompt, a reaction, the debrief, text mode, settings and progress dialogs (canvas excluded) | 0 critical or serious issues |
| Sub-path build test | Playwright + static server | Built app at `/play/first-session-tutor-sim/`: no failed requests, no console errors, canvas renders, text mode opens, "All projects" → `/` | pass |
| Poster render | `scripts/render-poster.mjs` | Real scene after 3 moments of Run 1, group view, 1200×630 | jpg 103 KB, webp 62 KB (≤ 200 KB) |
| Secret scan | gitleaks `detect --no-git --redact` | Whole repo, before each push | clean |
| Size | `du`, `find -size +20M` | No file > 20 MB; dist ≈ 7.5 MB | pass |

Full browser suite: 11/11 pass in 5.2 min (`results/playwright-2026-10-27.txt`).

## Not run by the builder

- **Headed GPU performance sampling and Lighthouse.** The orchestrator runs these one repo at a time. Performance budgets are not yet measured; see `STATUS.md`.
- **Agent-based expert-style reviews** (math teacher, tutoring coach, representation, cue legibility). Added by the orchestrator in `reviews/`.

## What these methods can show

- The content is internally consistent and complete: every choice in both mixes is reachable, scored, explained and bounded.
- The model behaves as documented in `design/behavior-model.md`.
- The full session is playable end to end through the real UI in both 3D and text mode, is keyboard operable, passes the axe gate, and works from a sub-path with no external requests.

## What these methods cannot show

1. **Transfer.** Nothing here shows that rehearsal in this simulator changes how anyone tutors real students. No real tutors have used it.
2. **Model validity.** The behavior rules are a simplified teaching model, not a validated psychological model. Nothing here shows they reflect how real students respond.
3. **Cue legibility and representation** as judged by people. Automated tests confirm the cues change with state, not that viewers read them as intended or find the portrayals fair.
4. **Accessibility with assistive technology.** axe and keyboard tests don't replace screen-reader testing or an expert WCAG review.
5. **Real devices.** Mobile was checked with device emulation only, never on a physical phone.

`human-protocol/` contains consent and session templates for the first real playtests.
