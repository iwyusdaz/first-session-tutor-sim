/**
 * Core renderer + loop for the immersive learning projects (shared template, adapted).
 * Conventions: 1 unit = 1 meter. sRGB output, ACES Filmic tone mapping by default.
 *
 * Frame pacing: on slow GPUs (or software WebGL) a single frame can take hundreds
 * of milliseconds. Rendering back to back would then starve the main thread and
 * make every button in the HTML overlay lag by seconds. The loop therefore keeps
 * rendering to at most ~50% of the main thread: after an expensive frame it waits
 * at least as long as that frame took before scheduling the next one.
 * @module core/engine
 */
import * as THREE from 'three';
import { QualityManager } from './quality.js';

/**
 * Detect a software WebGL implementation (SwiftShader, llvmpipe, Microsoft Basic
 * Render). Browsers fall back to these when the GPU is blocklisted, and headless
 * test browsers always use them. Uses a throwaway context so the real renderer can
 * be created with the right options.
 * @returns {string|null} the renderer string when it is a software renderer
 */
export function detectSoftwareGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return null;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name) ? name : null;
  } catch {
    return null;
  }
}

export class Engine {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    // Software WebGL: no MSAA, Low preset at half resolution, ~5 fps cap (see DECISIONS.md).
    this.softwareGL = detectSoftwareGL();
    this.minFrameMs = this.softwareGL ? 200 : 0;
    // MSAA on the default framebuffer for Low (no post); Medium+ adds SMAA via the composer.
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !this.softwareGL, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.info.autoReset = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
    this.baseFov = this.camera.fov;

    this.quality = new QualityManager(this.renderer, opts.preset || (this.softwareGL ? 'low' : undefined));
    if (this.softwareGL && !opts.preset) { this.quality.auto = false; this.quality.resolutionScale = 0.5; }
    this.timer = new THREE.Timer();
    this.timer.connect(document);
    this.composer = null;
    this._updateFns = [];
    this._running = false;
    this._paused = false;
    this.frames = 0;
    this.fps = 0;
    this.lastFrameMs = 0;
    this._fpsT = 0;
    this._fpsFrames = 0;
    this._bench = { frames: 0, start: 0, windows: 0 };

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this.resize();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Provide a post-processing composer (or null); when set, rendering goes through it. */
  setComposer(composer) {
    this.composer = composer;
    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * this.quality.resolutionScale);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.composer?.setSize(w, h);
  }

  onUpdate(fn) { this._updateFns.push(fn); return fn; }

  /** Render one frame now (used by the loop and by poster tooling). */
  renderOnce() {
    this.renderer.info.reset();
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._bench.start = performance.now();
    const schedule = (delayMs) => {
      if (delayMs > 4) setTimeout(() => requestAnimationFrame(tick), delayMs);
      else requestAnimationFrame(tick);
    };
    const tick = (timestamp) => {
      if (!this._running) return;
      this.timer.update(timestamp);
      if (this._paused || document.hidden) { schedule(100); return; }
      const dt = Math.min(this.timer.getDelta(), 0.1);
      const t0 = performance.now();
      for (const fn of this._updateFns) fn(dt, this.timer.getElapsed());
      this.renderOnce();
      const cost = performance.now() - t0;
      this.lastFrameMs = cost;
      this.frames++; this._fpsFrames++;
      this._fpsT += dt;
      if (this._fpsT >= 1) { this.fps = this._fpsFrames / this._fpsT; this._fpsT = 0; this._fpsFrames = 0; }
      this._benchmark(t0 + cost);
      // Keep rendering at or below ~50% of the main thread so the overlay stays responsive.
      schedule(Math.max(cost > 20 ? cost : 0, this.minFrameMs - cost));
    };
    requestAnimationFrame(tick);
  }

  /**
   * Warm-up benchmark on wall-clock time (not the clamped dt): every 2 s during the
   * first ~20 s, pick a preset from the measured frame rate.
   */
  _benchmark(now) {
    const b = this._bench;
    if (!this.quality.auto || b.windows >= 10) return;
    b.frames++;
    const span = now - b.start;
    if (span < 2000) return;
    const changed = this.quality.autoSelect((b.frames * 1000) / span);
    b.frames = 0; b.start = now; b.windows++;
    if (changed) this.resize();
  }

  pause() { this._paused = true; }
  resume() { this._paused = false; this.timer.reset(); }
  dispose() {
    this._running = false;
    window.removeEventListener('resize', this._onResize);
    this.timer.dispose();
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
