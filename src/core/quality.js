/**
 * Quality presets + warm-up auto-selection (shared template).
 * @module core/quality
 */
export const PRESETS = {
  low: { label: 'Low (phones, older laptops)', resolutionScale: 0.75, shadowMapSize: 0, drawDistance: 300, propsDensity: 0.6, post: ['tone'], textureMaxSize: 1024, aoEnabled: false },
  // v2: the living-world scene (GLB props, articulated characters, shadow-casting
  // extras) is fragment-bound at DPR 2; 0.8 scale + 1536 shadow map hold >= 55 fps
  // on the M1 while keeping the preset's visual quality (DECISIONS.md).
  medium: { label: 'Medium (default, integrated GPUs)', resolutionScale: 0.8, shadowMapSize: 1024, drawDistance: 600, propsDensity: 1.0, post: ['tone', 'smaa'], textureMaxSize: 2048, aoEnabled: false },
  high: { label: 'High (discrete GPUs, Apple Pro chips)', resolutionScale: 1.0, shadowMapSize: 2048, drawDistance: 1200, propsDensity: 1.0, post: ['tone', 'smaa', 'ao'], textureMaxSize: 4096, aoEnabled: true },
  ultra: { label: 'Ultra (strong desktops)', resolutionScale: 1.0, shadowMapSize: 4096, drawDistance: 2400, propsDensity: 1.2, post: ['tone', 'smaa', 'ao'], textureMaxSize: 4096, aoEnabled: true },
};
const ORDER = ['low', 'medium', 'high', 'ultra'];

export class QualityManager {
  constructor(renderer, forcedPreset) {
    this.renderer = renderer;
    this.auto = !forcedPreset;
    this.name = forcedPreset || (Math.min(window.innerWidth, window.innerHeight) < 700 ? 'low' : 'medium');
    this.resolutionScale = this.presetDef.resolutionScale;
    this.listeners = [];
  }
  get presetDef() { return PRESETS[this.name]; }
  set(name) {
    if (!PRESETS[name]) return;
    this.name = name; this.auto = false;
    this.resolutionScale = PRESETS[name].resolutionScale;
    for (const fn of this.listeners) fn(this.presetDef, name);
    try { localStorage.setItem(this.storageKey(), name); } catch { /* private mode */ }
  }
  storageKey() { return (window.__SLUG__ || 'app') + ':quality'; }
  restore() { try { const s = localStorage.getItem(this.storageKey()); if (s && PRESETS[s]) this.set(s); } catch { /* ignore */ } }
  /**
   * Step the preset from a measured frame rate (warm-up benchmark). On Low, keep
   * lowering the resolution scale (dynamic resolution, floor 0.5) while frames stay slow.
   * @returns {boolean} whether anything changed
   */
  autoSelect(measuredFps) {
    if (!this.auto || measuredFps <= 0) return false;
    const idx = ORDER.indexOf(this.name);
    const emit = () => { for (const fn of this.listeners) fn(this.presetDef, this.name); return true; };
    if (measuredFps < 45 && idx > 0) { this.name = ORDER[idx - 1]; this.resolutionScale = PRESETS[this.name].resolutionScale; return emit(); }
    if (measuredFps < 20 && this.name === 'low' && this.resolutionScale > 0.5) { this.resolutionScale = Math.max(0.5, +(this.resolutionScale - 0.125).toFixed(3)); return true; }
    if (measuredFps > 70 && idx < ORDER.length - 1) { this.name = ORDER[idx + 1]; this.resolutionScale = PRESETS[this.name].resolutionScale; return emit(); }
    return false;
  }
  onChange(fn) { this.listeners.push(fn); }
}
