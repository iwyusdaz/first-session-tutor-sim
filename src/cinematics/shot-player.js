/**
 * Data-driven cinematic shot player (shared template). Skippable from the first
 * frame (Skip button + Esc), captioned, reduced-motion stills, never during assessment.
 * @module cinematics/shot-player
 */
import { Vector3, CatmullRomCurve3 } from 'three';

export const EASINGS = {
  linear: (t) => t,
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  easeOut: (t) => 1 - (1 - t) ** 3,
};

export class ShotPlayer {
  constructor({ container, camera, motion, onDone, onSkip, captions }) {
    this.container = container;
    this.camera = camera;
    this.motion = motion;
    this.onDone = onDone;
    this.onSkip = onSkip;
    /** Optional () => boolean; cinematic captions show only when it returns true. */
    this.captions = captions;
    this.shots = [];
    this.index = -1;
    this.playing = false;
    this._buildUI();
  }

  _buildUI() {
    this.root = document.createElement('div');
    this.root.className = 'cinematic-overlay';
    this.root.setAttribute('role', 'region');
    this.root.setAttribute('aria-label', 'Cinematic');
    this.caption = document.createElement('p');
    this.caption.className = 'cinematic-caption';
    this.caption.setAttribute('aria-live', 'polite');
    this.desc = document.createElement('p');
    this.desc.className = 'cinematic-audio-description visually-hidden';
    this.progress = document.createElement('p');
    this.progress.className = 'cinematic-progress';
    // Reduced-motion stills get a Continue (one shot forward); Skip jumps to the end.
    this.continueBtn = document.createElement('button');
    this.continueBtn.type = 'button';
    this.continueBtn.className = 'cinematic-skip';
    this.continueBtn.hidden = true;
    this.continueBtn.textContent = 'Continue';
    this.continueBtn.addEventListener('click', () => {
      clearTimeout(this._stillTimer);
      this.continueBtn.hidden = true;
      this._nextShot();
    });
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'cinematic-skip';
    skip.textContent = 'Skip cinematic (Esc)';
    skip.addEventListener('click', () => this.skip());
    this.skipBtn = skip;
    this.root.append(this.progress, this.caption, this.desc, this.continueBtn, skip);
    this.container.appendChild(this.root);
    this.root.hidden = true;
    // Esc skips only when no dialog is open, so closing Settings mid-cinematic
    // does not also skip the shot (accessibility A10 / realism R-C11).
    this._esc = (e) => {
      if (e.key === 'Escape' && this.playing && !document.querySelector('dialog[open]')) this.skip();
    };
    document.addEventListener('keydown', this._esc);
  }

  load(def) { this.def = def; this.shots = def.shots || []; this.index = -1; }

  play() {
    if (!this.shots.length) { this.onDone?.(); return; }
    this.playing = true;
    this.root.hidden = false;
    this.index = -1;
    this._nextShot();
  }

  _nextShot() {
    this.index++;
    if (this.index >= this.shots.length) return this._finish();
    const shot = this.shots[this.index];
    this.progress.textContent = `Shot ${this.index + 1} of ${this.shots.length} — purpose: ${shot.purpose}`;
    this.caption.textContent = shot.captions?.join(' ') || '';
    // Captions can be turned off in Settings (accessibility A4 / realism R-C3).
    this.caption.hidden = this.captions ? !this.captions() : false;
    this.desc.textContent = shot.description || '';
    this._t = 0;
    if (this.motion.reduced) {
      this._placeAt(shot, 1);
      // Still frame with the same captions and a Continue control (realism R-C4).
      this.skipBtn.hidden = true;
      this.continueBtn.hidden = false;
      this._stillTimer = setTimeout(() => { this.continueBtn.hidden = true; this._nextShot(); }, Math.max(2500, (shot.duration || 10) * 700));
    } else {
      this.skipBtn.hidden = false;
      this.continueBtn.hidden = true;
      this._start = performance.now();
      cancelAnimationFrame(this._raf);
      const step = () => {
        if (!this.playing) return;
        const elapsed = (performance.now() - this._start) / 1000;
        const t = Math.min(1, elapsed / (shot.duration || 10));
        this._placeAt(shot, t);
        if (t >= 1) { this._nextShot(); return; }
        this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    }
  }

  _placeAt(shot, t) {
    const ease = EASINGS[shot.easing] || EASINGS.easeInOut;
    const k = ease(t);
    const pts = (shot.path || []).map((p) => new Vector3(...p));
    const target = new Vector3(...(shot.target || [0, 0, 0]));
    let pos;
    if (pts.length === 0) pos = this.camera.position.clone();
    else if (pts.length === 1) pos = pts[0];
    else if (pts.length === 2) pos = pts[0].clone().lerp(pts[1], k);
    else pos = new CatmullRomCurve3(pts).getPoint(k);
    this.camera.position.copy(pos);
    this.camera.lookAt(target);
  }

  skip() {
    if (!this.playing) return;
    clearTimeout(this._stillTimer);
    cancelAnimationFrame(this._raf);
    this.playing = false;
    this.root.hidden = true;
    this.continueBtn.hidden = true;
    // Under reduced motion the button reads "Continue" — leaving a still is not a skip.
    if (!this.motion.reduced) this.onSkip?.(this.def?.id);
    this.onDone?.();
  }

  _finish() { this.playing = false; this.root.hidden = true; this.onDone?.(); }
  dispose() { document.removeEventListener('keydown', this._esc); clearTimeout(this._stillTimer); cancelAnimationFrame(this._raf); this.root?.remove(); }
}
