/**
 * Headless draw-call probe (perf revision work only — not part of the test suite).
 * Serves ./dist, opens the session scene via the test hooks, and reads
 * renderer.info.render.calls after the static room merge and furniture load settle.
 * Usage: node scripts/probe-draw-calls.mjs [--settle-ms 6000]
 */
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const settleMs = Number(process.argv[3] || process.argv[2] || 6000);
const root = new URL('../dist', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.hdr': 'application/octet-stream', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };

const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join(root, p);
  if (!existsSync(f) || statSync(f).isDirectory()) f = join(root, 'index.html');
  try {
    const data = readFileSync(f);
    res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
await page.evaluate(() => window.__TEST__.hooks.start('quiet'));
await page.waitForFunction(() => window.__TEST__?.app?.engine?.renderer, null, { timeout: 30000 });
// Headless Chromium reports software GL, which forces the Low preset; the probe
// reproduces the headed Medium preset instead (that is the budgeted preset).
await page.evaluate(() => window.__TEST__.app.engine.quality.set('medium'));
await page.waitForTimeout(settleMs);

const info = await page.evaluate(() => {
  const r = window.__TEST__.app.engine.renderer.info;
  const room = window.__TEST__.room;
  let meshes = 0, casts = 0;
  room?.scene?.traverse((o) => { if (o.isMesh) { meshes++; if (o.castShadow) casts++; } });
  return {
    calls: r.render.calls,
    triangles: r.render.triangles,
    geometries: r.memory.geometries,
    textures: r.memory.textures,
    sceneMeshes: meshes,
    casters: casts,
    staticMergedCount: room?.staticMergedCount ?? null,
    quality: window.__TEST__.app.engine.quality.name,
    shadowMapSize: room?.keyLight?.shadow?.mapSize?.x ?? null,
  };
});
console.log(JSON.stringify({ ...info, errors: errors.slice(0, 5) }, null, 2));
await browser.close();
server.close();
