# Realism matrix

Realism is spent where it carries a learning cue and withheld where it would distract (standards §2, plan 07 §6.1).

| Element | Level | Learning cue? | Implementation | Rationale |
|---|---|---|---|---|
| Body posture, gaze direction, hand activity | High | Yes | Pose blends driven by `content/cues.json` (engaged / neutral / withdrawn; worksheet / tutor / window; confused / hand up / writing / pencil down / arms folded; moment cuePose overrides) | The core cues a tutor must read. Relevant body-language observations are validator-checked against these cues on the default path |
| Facial expression | Low (eyes blink; slight head tilt only) | Partly | Stylized faces, no morph-target expressions | Strong expressions on stylized figures risk the uncanny valley and pull attention from posture |
| Lip sync | None | No | Captions with speaker labels | Avoids uncanny mouth movement; captions are accessible |
| Characters overall | Medium (stylized procedural figures) | Yes | Primitives with joints; MakeHuman not used | See `DECISIONS.md`; labeled honestly in ATTRIBUTION.md |
| Room (table, chairs, whiteboard, clock, window) | High materials, simple geometry | Partly | Poly Haven CC0 PBR textures (wood table, laminate floor, painted plaster), School Hall HDRI for lighting, ACES tone mapping | Believable space at 1 unit = 1 m |
| Whiteboard and worksheets | High (readable via the worksheet close-up) | Yes | Canvas textures drawn at runtime, updated per moment; "Look at {name}'s worksheet" close-up views | Errors are visible in the students' writing from the close-up view; at normal session distance the text carries the error |
| Wall clock and routine bar | Medium | Yes | Canvas clock face (own "Look at the clock" view); HTML routine bar; session clock in the HUD | Supports the time-box objective. The 3D clock is outside the group framing by design; the HUD keeps the time cue visible at every decision |
| Background noise, other people | None | No | Omitted | Distraction |
| Camera | Fixed seated tutor view with preset looks at each student | No | Preset views; no free roaming | Mirrors a tutor's real position; keeps attention on cues |
