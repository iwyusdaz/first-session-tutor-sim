# Agent review — v2.0.0 honesty and accessibility

**Repo:** first-session-tutor-sim @ main 31b73b0 · **Reviewer:** agent review (axe-core 4.14 via Playwright on the real build; file/content audit) · **Date:** 2026-10-28
**Build:** `VITE_TEST_HOOKS=1 npm run build -- --outDir tmp/review-build` — rule validator ran first: **`validate-rules: OK — 8 moments, 30 rules, 51840 complete paths`**; `attribution.json` regenerated at build (14 entries).

## axe scans — PASS (zero critical/serious in all four states)

Scanned with `AxeBuilder` on the full page, 1280×800:

| State | Critical/serious violations |
|---|---|
| Menu ("Before you start", module 0) | none |
| Session moment (3D + floating panel, m1 Run 1) | none |
| Wait-time moment (m4 prompt open: counter + Speak again) | none |
| Debrief (module 2, rubric table) | none |

Text mode (full-page) was exercised end to end; its widgets are the same components (`renderMoment({textMode:true})`) covered by the moment scan.

## Contrast of tooltip/bubble styles — PASS

Measured from computed styles and WCAG luminance math:

| Pair | Ratio |
|---|---|
| Tooltip text `#f8fafc` on `#11161d` (`.v2-world-tooltip`) | **17.36:1** |
| Speech-bubble text `#f8fafc` on `#11161d` (`.v2-speech-bubble`) | **17.36:1** |
| Bubble speaker `#ffd166` on `#11161d` | **12.59:1** |
| Tooltip border accent (non-text) | 12.43:1 |

All far above AA 4.5:1. The case theme tokens (`--v2-text #1c2621` on `--v2-surface-solid #fbf6ec` ≈ 13:1) carry the panel; v1 AA tokens unchanged. Note (minor, cross-ref V-3): the tooltip renders in Patrick Hand (accent role) rather than the Lexend body face that plan §2.4 requires for instructions; contrast is unaffected.

## Honesty labels — PASS

- **Fictional/constructed intact:** README line 9 — "All three students are fictional, constructed for teaching purposes. Bridge Math Tutoring, the program in the story, is fictional." `showcase.json` `contentNotes`: "Simulated students are fictional and constructed for teaching purposes…" Debrief panel carries "a simplified teaching model, not a validated psychological model." Grep for efficacy/claim language ("efficacy", "proven", "improve learning outcomes") in README: no hits.
- **Human-representation-review-not-done note still present:** README line 1 ("No human representation review has been done (recommended before use with real tutors)"); STATUS.md lines 34 and 82; `student-mixes.json` `_meta.representation`. Intact.
- **Poster alt accurate:** describes the tutor-seat view, three animated-movie-style students, bookshelf/whiteboard/clock, handwritten worksheet — matches `poster-2.0.0.jpg` (verified visually; a signature view with rings hidden).
- **No new audio** (owner decision 9): no audio elements added; wait-time expressed visually (pendulum, second hand, HUD clock).

## Attribution — PASS

- `ATTRIBUTION.md`: 14 third-party rows — **Sora / Lexend / Patrick Hand (SIL OFL 1.1, subset woff2)**, **six Poly Haven CC0 GLB models** (SchoolDesk_01, SchoolChair_01, wooden_bookshelf_worn, wall_clock, book_encyclopedia_set_01, potted_plant_02 — all present in `public/assets/models/` with content-hashed names), school-hall HDRI (CC0, lighting only), 3 texture sets (CC0), three.js (MIT). "Made for this repo" section honestly labels the procedural characters and room as own work.
- `public/attribution.json`: **14 entries**, generated from ATTRIBUTION.md at build time (verified in `tmp/review-build/attribution.json`).
- `validate-showcase 2.0.0` against the review build: **"showcase.json valid; version 2.0.0; required files present"** (poster webp 64 KB / jpg 128 KB shipped in the build).
- Poster render is from the real scene (per `scripts/render-poster.mjs` + DECISIONS D29); no AI-generated images shipped, so no "AI-generated illustration" label is required.

## Findings

| ID | Sev | Finding | Where |
|---|---|---|---|
| H-1 | minor | Tooltip uses the accent (handwriting) font for an instructional hint — readability-rule deviation, contrast unaffected. | `src/v2/hud-shell.css:26` |
| H-2 | minor | `validate-showcase.mjs` hardcodes `dist/showcase.json` + repo-relative schema paths, so it cannot run against an alternate `--outDir` build without symlinks (reviewer workaround). Not a release blocker (CI uses default dist). | `scripts/validate-showcase.mjs:13-14` |

**Verdict: no critical/serious accessibility violations in any of the four scanned states; honesty and attribution gates all pass; ready (minors are polish).**
