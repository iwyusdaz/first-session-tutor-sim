/**
 * render-poster.mjs — render the 1200×630 poster pair from the real 3D scene.
 *
 * Builds a test-hooks bundle into tmp/poster-build, serves it, starts a run,
 * plays to a chosen moment so the students show real cues, hides the HTML
 * overlay, and screenshots the canvas. Every frame is blank-detected and
 * retried on a fresh page (relaunching the browser if it died), because headless
 * SwiftShader occasionally hands back an uncomposited canvas. Writes
 * public/poster-<version>.jpg and .webp (each must be ≤ 200 KB).
 *
 * Usage: node scripts/render-poster.mjs [view] [--moment N] [--preview]
 *   view       a key of VIEWS in src/scenes/tutoring-room.js (default: group)
 *   --moment N play N moments of the "quiet" run first (default: 3)
 *   --preview  write tmp/poster-preview-<view>.png instead of the poster pair
 */
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const args = process.argv.slice(2);
const view = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--moment') || 'group';
const momentIdx = args.indexOf('--moment');
const moments = momentIdx >= 0 ? Number(args[momentIdx + 1]) : 3;
const preview = args.includes('--preview');
const outDir = join(root, 'tmp', 'poster-build');
const LIMIT = 200 * 1024;

// Choices that produce visible, varied body language for the poster.
const PICKS = ['greet', 'data', 'label', 'volunteer', 'let', 'worked', 'why', 'ticket'];

execSync(`npx vite build --outDir ${outDir} --emptyOutDir`, {
  cwd: root, stdio: 'ignore', env: { ...process.env, VITE_TEST_HOOKS: '1' },
});

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.hdr': 'application/octet-stream', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  let file = join(outDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4791, '127.0.0.1', r));

let browser = null;
async function launchBrowser() {
  if (browser) { try { await browser.close(); } catch { /* already dead */ } }
  browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
}
await launchBrowser();

// Headless SwiftShader occasionally hands back a page whose WebGL canvas was never
// composited (uniform page-background frame) or crashes the GPU process mid-run.
// Blank-detect every frame and retry on a fresh page (relaunching the browser if it died).
async function frameHasContent(page, png) {
  return page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = `data:image/png;base64,${b64}`; });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let min = [255, 255, 255], max = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4 * 97) {
      for (let k = 0; k < 3; k++) {
        if (d[i + k] < min[k]) min[k] = d[i + k];
        if (d[i + k] > max[k]) max[k] = d[i + k];
      }
    }
    // Blank frames are one flat page-background colour: channel spread ~ 0.
    return max.some((v, k) => v - min[k] > 24);
  }, png.toString('base64'));
}

/** Stage the scene and return a screenshot of the full-bleed canvas, or retry. */
async function capture() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    let page = null;
    try {
      page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto('http://127.0.0.1:4791/', { waitUntil: 'networkidle' });
      const hooked = await page.waitForFunction(() => window.__TEST__?.room && window.__TEST__?.app?.interact, null, { timeout: 60000 })
        .then(() => true).catch(() => false);
      if (!hooked) { console.error('No test hooks in dist: build with VITE_TEST_HOOKS=1 first.'); process.exit(1); }
      await page.evaluate(({ picks, n, v }) => {
        const { app, hooks } = window.__TEST__;
        app.engine.quality.set('high');
        hooks.start('quiet');
        for (let i = 0; i < n; i++) hooks.choose(picks[i], { seconds: 4 });
        app.lookAt(v, { snap: true });
        // Navigation UI (glowing rings + beacons) is not part of the hero shot.
        for (const r of app.interact.hotspotRings) r.group.visible = false;
      }, { picks: PICKS, n: moments, v: view });
      // Hide the HTML layer; keep the full-bleed canvas. Do NOT fix .stage — hiding
      // the header while fixing the stage shrink-wraps the canvas and blanks frames.
      await page.addStyleTag({ content: '.app-header,.module-nav,.hud,#overlays,#textmode,.skip-link,dialog,.cinematic-overlay,.v2-world-bubbles,.v2-world-tooltip{display:none!important}#app{width:1200px!important;height:630px!important;visibility:visible!important}' });
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await page.waitForTimeout(4500); // HDRI, models, shadows and pose easing settle
      const png = await page.locator('#app').screenshot({ type: 'png' });
      if (errors.length) console.warn('page errors:\n' + errors.join('\n'));
      const hasContent = await frameHasContent(page, png);
      await page.close();
      page = null;
      if (hasContent) return png;
      console.error(`  attempt ${attempt}: blank frame (SwiftShader canvas not composited), relaunching browser…`);
      await launchBrowser();
    } catch (err) {
      console.error(`  attempt ${attempt}: ${err.message.split('\n')[0]} — relaunching browser`);
      try { await page?.close(); } catch { /* already gone */ }
      await launchBrowser();
    }
  }
  console.error(`capture failed for view '${view}' after 5 attempts`);
  process.exit(1);
}

const png = await capture();
mkdirSync(join(root, 'tmp'), { recursive: true });
if (preview) {
  writeFileSync(join(root, 'tmp', `poster-preview-${view}.png`), png);
  console.log(`preview written: tmp/poster-preview-${view}.png`);
} else {
  const encPage = await browser.newPage();
  const encode = async (type) => {
    for (const q of [0.86, 0.8, 0.72, 0.64, 0.56]) {
      const b64 = await encPage.evaluate(async ({ data, type, q }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = 1200; c.height = 630;
        c.getContext('2d').drawImage(img, 0, 0, 1200, 630);
        return c.toDataURL(type, q).split(',')[1];
      }, { data: png.toString('base64'), type, q });
      const buf = Buffer.from(b64, 'base64');
      if (buf.length <= LIMIT) return { buf, q };
    }
    throw new Error(`${type} could not be encoded under 200 KB`);
  };
  for (const [type, ext] of [['image/jpeg', 'jpg'], ['image/webp', 'webp']]) {
    const { buf, q } = await encode(type);
    writeFileSync(join(root, 'public', `poster-${version}.${ext}`), buf);
    console.log(`poster-${version}.${ext}: ${(buf.length / 1024).toFixed(1)} KB (quality ${q}, view ${view}, after ${moments} moments)`);
  }
  await encPage.close();
}

await browser.close();
server.close();
