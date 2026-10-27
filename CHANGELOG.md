# Changelog

## 1.0.0 (unreleased; not tagged yet)

First complete build.

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
