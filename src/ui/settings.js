/**
 * Settings dialog: quality preset, text size, contrast, captions, reduced motion,
 * FOV comfort, and (since the app has no audio) no volume controls. Wait-time
 * preferences are editable here too, so a learner mid-session doesn't have to
 * leave to change them. Slug-prefixed persistence; applied at startup (A2).
 * @module ui/settings
 */
import { openDialog, closeDialog } from '../a11y/focus.js';

export class Settings {
  constructor({ slug, dialog, quality, motion, onFov, wait }) {
    this.slug = slug;
    this.dialog = dialog;
    this.quality = quality;
    this.motion = motion;
    this.onFov = onFov;
    /** Optional { get: () => {scale, manual}, set: (p) => void } for wait-time prefs (A12). */
    this.wait = wait;
    this.state = this._load();
  }

  _load() {
    const d = { textSize: 'normal', contrast: 'normal', captions: true, fov: 60 };
    try { Object.assign(d, JSON.parse(localStorage.getItem(`${this.slug}:settings`) || '{}')); } catch { /* ignore */ }
    return d;
  }

  save() { try { localStorage.setItem(`${this.slug}:settings`, JSON.stringify(this.state)); } catch { /* ignore */ } }

  _build() {
    const q = this.dialog;
    const wait = this.wait?.get?.();
    q.innerHTML = `
      <h2>Settings</h2>
      <form method="dialog">
        <fieldset>
          <legend>Graphics quality</legend>
          <label>Quality preset
            <select id="set-quality">
              <option value="low">Low (phones, older laptops)</option>
              <option value="medium">Medium (integrated GPUs)</option>
              <option value="high">High (discrete GPUs)</option>
              <option value="ultra">Ultra (strong desktops)</option>
            </select>
          </label>
        </fieldset>
        <fieldset>
          <legend>Display</legend>
          <label>Text size
            <select id="set-textsize">
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra large</option>
            </select>
          </label>
          <label>Contrast
            <select id="set-contrast">
              <option value="normal">Normal</option>
              <option value="high">High contrast</option>
            </select>
          </label>
          <label>Field of view (comfort) <output id="set-fov-out">${this.state.fov}°</output>
            <input type="range" id="set-fov" min="40" max="90" step="5" value="${this.state.fov}">
          </label>
        </fieldset>
        <fieldset>
          <legend>Captions</legend>
          <label><input type="checkbox" id="set-captions" ${this.state.captions ? 'checked' : ''}> Show cinematic captions</label>
        </fieldset>
        ${wait !== undefined ? `
        <fieldset>
          <legend>Wait time</legend>
          <label>Wait-time scale
            <select id="set-wait-scale">
              ${[0.5, 1, 1.5, 2].map((s) => `<option value="${s}" ${wait.scale === s ? 'selected' : ''}>${s}× (target ${(3 * s).toFixed(1)} seconds)</option>`).join('')}
            </select>
          </label>
          <label><input type="checkbox" id="set-wait-manual" ${wait.manual ? 'checked' : ''}> Manual wait (choose Wait or Speak again instead of timing the silence)</label>
        </fieldset>` : ''}
        <fieldset>
          <legend>Motion</legend>
          <label><input type="checkbox" id="set-motion" ${this.motion?.reduced ? 'checked' : ''}> Reduce motion (no camera flights; still frames and cuts instead)</label>
        </fieldset>
        <menu>
          <button value="cancel" type="button" id="set-cancel">Cancel</button>
          <button value="confirm" type="submit" id="set-save">Save settings</button>
        </menu>
      </form>`;
    const $ = (sel) => q.querySelector(sel);
    if (this.quality) $('select#set-quality').value = this.quality.name;
    $('select#set-textsize').value = this.state.textSize;
    $('select#set-contrast').value = this.state.contrast;
    $('input#set-fov').addEventListener('input', (e) => { $('output#set-fov-out').textContent = `${e.target.value}°`; });
    $('button#set-cancel').addEventListener('click', () => closeDialog(q));
    q.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.quality) { const v = $('select#set-quality').value; if (v !== this.quality.name) this.quality.set(v); }
      this.state.textSize = $('select#set-textsize').value;
      this.state.contrast = $('select#set-contrast').value;
      this.state.captions = $('input#set-captions').checked;
      this.state.fov = parseFloat($('input#set-fov').value);
      if (this.wait) {
        const scaleEl = $('select#set-wait-scale');
        const manualEl = $('input#set-wait-manual');
        if (scaleEl && manualEl) this.wait.set({ scale: parseFloat(scaleEl.value), manual: manualEl.checked });
      }
      if (this.motion) this.motion.setToggle($('input#set-motion').checked);
      this.save();
      this._apply();
      closeDialog(q);
    });
  }

  _apply() {
    const root = document.documentElement;
    root.dataset.textSize = this.state.textSize;
    root.dataset.contrast = this.state.contrast;
    this.onFov?.(this.state.fov);
  }

  open(trigger) { this._build(); openDialog(this.dialog, trigger); this._apply(); }
}
