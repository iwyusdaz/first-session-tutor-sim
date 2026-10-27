# Realism matrix

Realism is spent where it carries a learning cue and withheld where it would distract (standards §2, plan 07 §6.1).

| Element | Level | Learning cue? | Implementation | Rationale |
|---|---|---|---|---|
| Body posture, gaze direction, hand activity | High | Yes | Pose blends driven by `content/cues.json` (engaged / neutral / withdrawn; worksheet / tutor / window; hand up / writing / pencil down / arms folded) | The core cues a tutor must read |
| Facial expression | Low (eyes blink; slight head tilt only) | Partly | Stylized faces, no morph-target expressions | Strong expressions on stylized figures risk the uncanny valley and pull attention from posture |
| Lip sync | None | No | Captions with speaker labels | Avoids uncanny mouth movement; captions are accessible |
| Characters overall | Medium (stylized procedural figures) | Yes | Primitives with joints; MakeHuman not used | See `DECISIONS.md`; labeled honestly in ATTRIBUTION.md |
| Room (table, chairs, whiteboard, clock, window) | High materials, simple geometry | Partly | Poly Haven CC0 PBR textures (wood table, laminate floor, painted plaster), School Hall HDRI for lighting, ACES tone mapping | Believable space at 1 unit = 1 m |
| Whiteboard and worksheets | High (readable) | Yes | Canvas textures drawn at runtime, updated per moment | Errors are visible in the students' writing |
| Wall clock and routine bar | Medium | Yes | Canvas clock face; HTML routine bar | Supports the time-box objective |
| Background noise, other people | None | No | Omitted | Distraction |
| Camera | Fixed seated tutor view with preset looks at each student | No | Preset views; no free roaming | Mirrors a tutor's real position; keeps attention on cues |
