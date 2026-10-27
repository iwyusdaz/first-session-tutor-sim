# Attribution

Every third-party asset in this repo, plus what was made here. `public/attribution.json` is generated from this file by `scripts/build-attribution.mjs` (run as part of `npm run build`).

## Third-party assets

| Asset | Author | Source | License | Retrieved | Changes |
|---|---|---|---|---|---|
| School Hall (HDRI, 1k .hdr) | Dimitrios Savva, Jarod Guest | https://polyhaven.com/a/school_hall | CC0 | 2026-10-27 | None. Used for image-based lighting and reflections only (not shown as a background). File renamed with a content hash. |
| Wood Table 001 (1k JPG: color, normal GL, roughness) | Dimitrios Savva, Rico Cilliers | https://polyhaven.com/a/wood_table_001 | CC0 | 2026-10-27 | None to pixels. Used on the tutoring table; files renamed with content hashes. |
| Laminate Floor 02 (1k JPG: color, normal GL, roughness) | Charlotte Baglioni, Dario Barresi | https://polyhaven.com/a/laminate_floor_02 | CC0 | 2026-10-27 | None to pixels. Used on the floor; files renamed with content hashes. |
| Painted Plaster Wall (1k JPG: color, normal GL, roughness) | Amal Kumar | https://polyhaven.com/a/painted_plaster_wall | CC0 | 2026-10-27 | None to pixels. Used on the walls; files renamed with content hashes. |
| three.js 0.186.1 | three.js authors | https://github.com/mrdoob/three.js | MIT | 2026-10-27 | None. Bundled by Vite. No Draco/Basis decoders are shipped, because the project loads no compressed models or textures. |

Poly Haven license: https://polyhaven.com/license (CC0, no attribution required; credited anyway).

## Made for this repo (repo license applies)

| Item | Notes | License |
|---|---|---|
| Three student figures (Jordan, Talia, Sam) | Stylized procedural three.js figures with simple joints; subtle faces, no lip sync. Fictional; no real likeness. MakeHuman was not used (see DECISIONS.md). | Code MIT |
| Tutoring room: table, chairs, whiteboard, wall clock, window | Procedural geometry; whiteboard, clock and worksheets drawn on canvas at runtime | Code MIT |
| Session script, behavior rules, cues, coach notes, items | Fictional session constructed for teaching purposes. Move names and rubric domains are copied unchanged from `socratic-ai-tutor` and `tutor-training-course` (same author, same licenses). | CC BY 4.0 |
| Poster images (`poster-1.0.0.webp`, `.jpg`) | Rendered from the real scene by `scripts/render-poster.mjs` | CC BY 4.0 |
| Favicon | Original SVG | CC BY 4.0 |
