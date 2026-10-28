# Changelog

## 2.0.0 (visual revamp; rolling release, not tagged by the builder)

The plan 09 revamp: from "a 3D picture next to a text panel" to a living classroom you act inside. Owner decisions for plan 09 are locked in `DECISIONS.md` (D22–D29).

- **Living classroom:** the room is now a full classroom — Poly Haven CC0 desks, chairs, bookshelf, encyclopedia set, wall clock and potted plant; a full window with blinds and a real 3D exterior (trees, playground, sky); posters, radiator, corridor door with a classmate walking past; backpacks at the desk feet. Warm afternoon-sun grade (AgX, `#F3C77A` key light), sun shafts through the blinds, floating dust.
- **Animated-movie students:** the stylized capsule figures are replaced by expressive animated-feature-style teens (`src/v2/stylized-character.js`) — layered eyes, sculpted hair, seated at desks — with the same authored cue model driving them: writing, hand-up, confused, withdrawn, thinking, gaze at you, lip-flap when a move lands on them. The v1 representation rules carry over unchanged (Jordan she/her dark skin short hair; Talia medium skin bun; Sam lightest skin, nonbinary, short hair, no hood).
- **Full-bleed 3D + floating HUD:** the scene fills the viewport; the session panel is a compact floating drawer you can hide ("Hide panel"/"Show panel"); Plain-font toggle added; case typography self-hosted (Sora / Lexend / Patrick Hand, SIL OFL 1.1) with Patrick Hand handwriting on the whiteboard, worksheets and posters.
- **In-world interaction:** glowing hotspot rings for every preset view, hover highlights on students, click-to-glide to worksheet close-ups, free mouse-drag look and WASD/arrow walking — every action still available through the panel buttons and text mode.
- **Calm mode:** ambient life slows to ~30 % while a decision is on screen and runs fully between moments; reduced motion still stops all non-essential motion; text mode still pauses rendering.
- **Art bible** at `design/art-bible.md`; attribution extended (fonts + six CC0 models, authors in `public/attribution.json`).
- **Poster pair re-rendered** from the new scene (`poster-2.0.0.webp`/`.jpg`, 1200×630, ≤ 200 KB) with blank-frame detection and retry; `showcase.json` re-pinned for the showcase refresh.

## 1.0.0 (unreleased; not tagged yet)

First complete build, then revised against the seven agent reviews (`evaluation/reviews/`; DECISIONS.md revision log R1–R17).

### Revision pass (2026-10-27)

- Representation: gender and skin tone decorrelated from the behavior patterns (Jordan she/her; darkest tone on the confident student), hood removed as a withdrawal marker, approval-seeking and "work is neat" cues dropped; reasoning and decorrelation table in `design/character-design.md`. No human representation review has been done (stated in METHODS/STATUS).
- Cues agree with the script: Run 1 starting states match the m1 scene, reactions match resulting poses, and a new validator check (plus unit tests) enforces that relevant body-language observations match the rendered cues on the default path in both mixes.
- 3D: folded-arms pose reworked, new confused and waiting cues, worksheet close-up views, group view re-centred out from under the side panel, shape+text worksheet marks, HUD state-change and clock signals, window exterior, calmer table, gaze-derived head pitch, Continue control on reduced-motion stills, working captions toggle, S1 shortened to 9 s.
- Assessment integrity: the move palette shows only what you would say during play (neutral option letters); move names and canonical/misapplied tags are revealed in the debrief; m3/m6 hint-ladder misapplications are labeled as such.
- Math: m6 worked example is now a genuinely similar problem with a different answer (4x + 1 = x + 13); m7 no longer claims distributing first is required; the m2 review targets each mix's actual misconception.
- UX/accessibility: replay asks before replacing a finished run; settings persist at startup; no-audio audio controls removed; wait settings available in Settings; skip link targets the session panel; `h1` header; opaque panel, sticky "Say it", 300 ms wait guard, "Wait in silence" wording; restart confirm; timeline titles; debrief lists which cues mattered.

### Initial build

- Tutoring room scene (three.js): Poly Haven CC0 HDRI lighting and PBR textures at real-world scale, canvas whiteboard, worksheets and wall clock, seated tutor view with preset looks at each student.
- Three simulated students (fictional, constructed for teaching purposes) as stylized procedural figures with posture, gaze and hand cues driven by `content/cues.json`.
- Session of eight decision points across the five-part routine, in two student mixes (the quiet student, the dominant student).
- Authored student-state model (30 rules with rationale and source) and a rule validator that walks all 51,840 paths.
- Real-time wait mechanic with 0.5×–2× scale and manual wait.
- Replay debrief: timeline, state graphs with data tables, rubric-domain scores, coach notes, run comparison.
- Text mode with decision parity; captions; reduced-motion cinematics S1–S3.
- Render-loop frame pacing and software-WebGL detection so the HTML UI stays responsive on slow GPUs (DECISIONS.md D17).
- Post-processing: SMAA on Medium+, N8AO on High+.
- Build contract: relative base, `showcase.json`, `attribution.json`, poster pair, sub-path test, CI and release workflows.
