/**
 * fetch-assets.mjs — download the CC0 Poly Haven assets used by the tutoring room
 * and write them to public/assets/ with content-hashed names (build contract 08 5.1).
 *
 * Usage: node scripts/fetch-assets.mjs
 * Prints the hashed filenames; copy them into src/scenes/tutoring-room.js (TEX/HDRI)
 * and ATTRIBUTION.md if they change. Already-committed outputs are the processed
 * result; this script is kept so the owner can re-fetch or swap resolutions.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PH = 'https://dl.polyhaven.org/file/ph-assets';

const ASSETS = [
  { url: `${PH}/HDRIs/hdr/1k/school_hall_1k.hdr`, out: 'school_hall_1k', ext: 'hdr' },
  ...['wood_table_001', 'laminate_floor_02', 'painted_plaster_wall'].flatMap((id) => [
    { url: `${PH}/Textures/jpg/1k/${id}/${id}_diff_1k.jpg`, out: `tex/${id}_color`, ext: 'jpg' },
    { url: `${PH}/Textures/jpg/1k/${id}/${id}_nor_gl_1k.jpg`, out: `tex/${id}_normal`, ext: 'jpg' },
    { url: `${PH}/Textures/jpg/1k/${id}/${id}_rough_1k.jpg`, out: `tex/${id}_rough`, ext: 'jpg' },
  ]),
];

for (const a of ASSETS) {
  let buf;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(a.url);
      if (!res.ok) throw new Error(`${res.status} ${a.url}`);
      buf = Buffer.from(await res.arrayBuffer());
      break;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 10);
  const rel = `assets/${a.out}-${hash}.${a.ext}`;
  mkdirSync(dirname(join(root, 'public', rel)), { recursive: true });
  writeFileSync(join(root, 'public', rel), buf);
  console.log(`${rel}  ${(buf.length / 1024).toFixed(0)} KB`);
}
