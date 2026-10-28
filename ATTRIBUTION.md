# Attribution

Every third-party asset in this repo, plus what was made here. `public/attribution.json` is generated from this file by `scripts/build-attribution.mjs` (run as part of `npm run build`).

## Third-party assets

| Asset | Author | Source | License | Retrieved | Changes |
|---|---|---|---|---|---|
| School Hall (HDRI, 1k .hdr) | Dimitrios Savva, Jarod Guest | https://polyhaven.com/a/school_hall | CC0 | 2026-10-27 | None. Used for image-based lighting and reflections only (not shown as a background). File renamed with a content hash. |
| Wood Table 001 (1k JPG: color, normal GL, roughness) | Dimitrios Savva, Rico Cilliers | https://polyhaven.com/a/wood_table_001 | CC0 | 2026-10-27 | None to pixels. Used on the tutoring table; files renamed with content hashes. |
| Laminate Floor 02 (1k JPG: color, normal GL, roughness) | Charlotte Baglioni, Dario Barresi | https://polyhaven.com/a/laminate_floor_02 | CC0 | 2026-10-27 | None to pixels. Used on the floor; files renamed with content hashes. |
| Painted Plaster Wall (1k JPG: color, normal GL, roughness) | Amal Kumar | https://polyhaven.com/a/painted_plaster_wall | CC0 | 2026-10-27 | None to pixels. Used on the walls; files renamed with content hashes. |
| SchoolDesk_01 (GLB model) | Ethan Place | https://polyhaven.com/a/SchoolDesk_01 | CC0 | 2026-10-28 | None. Student desks and tutor desk. File renamed with a content hash. |
| SchoolChair_01 (GLB model) | Ethan Place | https://polyhaven.com/a/SchoolChair_01 | CC0 | 2026-10-28 | None. Student chairs. File renamed with a content hash. |
| wooden_bookshelf_worn (GLB model) | Ulan Cabanilla | https://polyhaven.com/a/wooden_bookshelf_worn | CC0 | 2026-10-28 | None. Back-wall bookshelf. File renamed with a content hash. |
| wall_clock (GLB model) | PierreB3D | https://polyhaven.com/a/wall_clock | CC0 | 2026-10-28 | Session time drawn on a canvas face in front of the model. File renamed with a content hash. |
| book_encyclopedia_set_01 (GLB model) | John Malcolm | https://polyhaven.com/a/book_encyclopedia_set_01 | CC0 | 2026-10-28 | None. Books on the bookshelf. File renamed with a content hash. |
| potted_plant_02 (GLB model) | Rico Cilliers | https://polyhaven.com/a/potted_plant_02 | CC0 | 2026-10-28 | None. Corner plant. File renamed with a content hash. |
| Sora (woff2, Latin subset, 600/700) | Jonathan Barnbrook; The Sora Project | https://fonts.google.com/specimen/Sora | SIL OFL 1.1 | 2026-10-28 | Subset to Latin, converted to woff2 (`src/styles/fonts/`). |
| Lexend (woff2, Latin subset, 400/600) | Bonnie E. Shinta, Prof. Kevin Larson (Readability Consortium) | https://fonts.google.com/specimen/Lexend | SIL OFL 1.1 | 2026-10-28 | Subset to Latin, converted to woff2 (`src/styles/fonts/`). |
| Patrick Hand (woff2, Latin subset, 400) | Patrick Wagesreither | https://fonts.google.com/specimen/Patrick+Hand | SIL OFL 1.1 | 2026-10-28 | Subset to Latin, converted to woff2 (`src/styles/fonts/`). |
| three.js 0.186.1 | three.js authors | https://github.com/mrdoob/three.js | MIT | 2026-10-27 | None. Bundled by Vite. No Draco/Basis decoders are shipped, because the project loads no compressed models or textures. |

Poly Haven license: https://polyhaven.com/license (CC0, no attribution required; credited anyway).
Fonts are licensed under SIL OFL 1.1 (https://openfontlicense.org); the woff2 subsets are
redistributed in `src/styles/fonts/` with the font names retained, as the licence permits.

## Made for this repo (repo license applies)

| Item | Notes | License |
|---|---|---|
| Three student figures (Jordan, Talia, Sam) | Procedural animated-movie-style teens built by `src/v2/stylized-character.js` (own work: layered eyes with catchlights, sculpted hair, articulated poses, lip-flap). Fictional; no real likeness. The v1 representation rules carry over unchanged (see `design/character-design.md`). | Code MIT |
| Tutoring room (v2.0.0): procedural walls, window with blinds and 3D exterior, whiteboard, posters, radiator, corridor door, backpacks; Poly Haven desks/chairs/bookshelf/clock/plant via `src/v2/model-placer.js` | Procedural three.js geometry; whiteboard, clock face and worksheets drawn on canvas at runtime | Code MIT |
| Shared v2 modules (`src/v2/`) | Cinematic grade + floating HUD shell, ambient life manager, stylized character builder, in-world interaction (glide/WASD/hover), model placer | Code MIT |
| Session script, behavior rules, cues, coach notes, items | Fictional session constructed for teaching purposes. Move names and rubric domains are copied unchanged from `socratic-ai-tutor` and `tutor-training-course` (same author, same licenses). | CC BY 4.0 |
| Poster images (`poster-<version>.webp`, `.jpg`, currently 2.0.0) | Rendered from the real scene by `scripts/render-poster.mjs` | CC BY 4.0 |
| Favicon | Original SVG | CC BY 4.0 |
