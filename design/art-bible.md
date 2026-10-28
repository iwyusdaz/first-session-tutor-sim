# Art bible — First Session, "Room 12, Bridge Math Tutoring, Tuesday 3:30 pm" (v2.0.0)

A warm, slightly cluttered after-school classroom with low afternoon sun coming through
the blinds. The three students — not the furniture — are the visual subject: every
lighting, colour and dressing decision is checked against "can I read Jordan's, Talia's
and Sam's body language from the tutor's seat?"

Fictional room, fictional students. Honesty labels in `ATTRIBUTION.md` and
`public/showcase.json` are unchanged.

## Palette

| Token | Hex | Used for |
|---|---|---|
| Chalkboard green | `#2E4A3F` | Accent: HUD accent, board tray, bookshelf wall details |
| Afternoon sun | `#F3C77A` | Key light colour, sun shafts, dust motes, window glow |
| Notebook blue | `#3A6EA5` | Student clothing accents, folders, worksheet rules |
| Pencil yellow | `#F2B705` | Pencils, hotspot ring accents, small highlights |
| Warm wall cream | `#EFE6D8` | Walls, blinds, paper, ambient bounce |

Grade (from `src/v2/cinematic-grade.js` `CASE_THEMES['first-session-tutor-sim']`):
warm, soft, gentle contrast; AgX tone mapping, exposure 1.14; faint warm haze
(`FogExp2 #EFE3CE`, density 0.015); sky dome `#4A82B8 → #F7D29C` over grass `#4B5C43`.

## Typography (all SIL OFL 1.1, self-hosted, subset woff2 in `src/styles/fonts/`)

| Role | Face | Used for |
|---|---|---|
| Display | **Sora** (600/700) | Headings, module titles |
| Body | **Lexend** (400/600, designed for reading ease) | All body copy, instructions, controls |
| Accent | **Patrick Hand** (400) | In-world handwriting: whiteboard, worksheets, posters |

`html[data-plain-font="on"]` (Plain font toggle in the header, `initFloatingHud`)
switches every role to a hyperlegible system stack. Canvas textures that draw
handwriting re-render once `document.fonts.ready` resolves so Patrick Hand appears
in the 3D world too. Body text/background pairs keep the v1 WCAG AA tokens
(≥ 4.5:1); the HUD floats on the case surface tokens from the theme.

## Lighting mood

Late-afternoon key sun through the window on the left wall (warm `#F3C77A`,
directional, shadow-casting), soft hemisphere fill (sky `#FFE4B5` / ground `#4D4337`),
HDRI (`school_hall`, CC0) for image-based lighting only. Volumetric-feel sun shafts
through the blinds and floating dust motes sell the hour without competing with cues.
Calm mode slows ambient motion to ~30 % while a decision is on screen; reduced motion
stops all non-essential motion (rendering itself is paused in text mode).

## Models (Poly Haven, CC0 — `public/assets/models/`, manifest with authors)

| Model | Placed as |
|---|---|
| `SchoolDesk_01` | One desk per student (3) + tutor desk (2) |
| `SchoolChair_01` | One per student, tucked at desks |
| `wooden_bookshelf_worn` | Back wall, beside the whiteboard |
| `book_encyclopedia_set_01` | On the bookshelf shelves |
| `wall_clock` | Back wall above the door side; session time drawn on its face |
| `potted_plant_02` | Corner by the window |

Everything else is procedural three.js geometry with Poly Haven PBR texture sets
(wood table, laminate floor, painted plaster): full window with blinds and a real 3D
exterior (ground, trees, playground frame, sky dome), whiteboard with Patrick Hand
handwriting, posters, radiator, corridor door with a vision panel, backpacks and a
water bottle at desk feet. Characters are procedural animated-movie-style teens
(`src/v2/stylized-character.js`, own work; the v1 representation rules carry over:
skin tone and gender decorrelated from behaviour, no hood).

## Ambient-life list (`src/v2/ambient-life.js`)

1. Sun shafts through the blinds (light-shaft volumes, window → floor).
2. Floating dust motes in the sun volume.
3. Wall clock pendulum swing + session-time hands.
4. A classmate walking past the corridor door on a loop, visible through the vision panel.
5. Students: breathing, blinking, gaze tracking (worksheet / tutor / window), writing
   pencil motion, confused/withdrawn poses, lip-flap when they respond.
6. Blinds slats and papers respond with a faint idle sway (subtle).

Calm mode ON while a decision is on screen; OFF between moments.

## Interaction list (`src/v2/in-world-interaction.js`)

- Glowing floor hotspot rings for the preset views: whole group, Jordan, Talia, Sam,
  whiteboard, wall clock, overview — click (or use the look buttons in the panel for
  keyboard parity) to glide the camera there.
- Hover highlight + tooltip on each student; clicking a student glides to their
  worksheet close-up view.
- Free navigation: mouse-drag look, WASD/arrow-key walking, always available between
  glides; every in-world action has a panel-button equivalent and a text-mode
  equivalent.

## References (look-match only, nothing shipped)

- Poly Haven `SchoolDesk_01` / `SchoolChair_01` asset pages (CC0).
- Photographs of after-school tutoring rooms (search: "small group tutoring table
  classroom blinds afternoon light") — composition reference only.
- Plan §4.7 palette and mood table (owner-locked 2026-10-28).
