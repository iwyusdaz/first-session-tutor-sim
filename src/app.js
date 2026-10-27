/**
 * App controller: four modules (Before you start → The session → Debrief → After
 * the session), two student mixes, the 3D tutoring room, cinematics, settings and
 * the local learning record. Every decision is made through the same session
 * panel in the 3D view and in text mode.
 * @module app
 */
import * as THREE from 'three';
import { Engine } from './core/engine.js';
import { hasWebGL2 } from './core/assets.js';
import { Shell } from './ui/shell.js';
import { Settings } from './ui/settings.js';
import { ProgressPage } from './ui/progress.js';
import { LearningRecord } from './learning/record.js';
import { MotionPrefs } from './a11y/motion.js';
import { announce } from './a11y/announcer.js';
import { ShotPlayer } from './cinematics/shot-player.js';
import { TutoringRoom, VIEWS } from './scenes/tutoring-room.js';
import { createRun, choose, currentMoment, cuesFor, fill, scoreRun, STUDENT_IDS } from './systems/student-model.js';
import { renderMoment } from './ui/session-panel.js';
import { renderDebrief } from './ui/debrief.js';
import { renderIntro, renderRunPicker, renderAfter } from './ui/modules.js';

import session from '../content/session.json';
import rules from '../content/behavior-rules.json';
import moves from '../content/moves.json';
import mixes from '../content/student-mixes.json';
import notes from '../content/coach-notes.json';
import cues from '../content/cues.json';
import items from '../content/items.json';
import cinematics from '../content/cinematics.json';

export const SLUG = 'first-session-tutor-sim';
window.__SLUG__ = SLUG;

const MODULES = ['1. Before you start', '2. The session', '3. Debrief', '4. After the session'];

export class App {
  constructor() {
    this.data = { session, rules, moves, mixes, notes, cues, items, cinematics };
    document.body.insertAdjacentHTML('afterbegin',
      '<dialog id="settings-dialog" aria-labelledby="settings-h"></dialog><dialog id="progress-dialog" aria-labelledby="progress-h"></dialog>');
    this.shell = new Shell({ slug: SLUG, title: 'First Session: a tutor simulator', moduleLabels: MODULES, onModuleChange: (i) => this.gotoModule(i) });
    this.record = new LearningRecord(SLUG);
    this.motion = new MotionPrefs(SLUG);
    this.prefs = this._loadPrefs();
    this.state = { module: 0, run: null, runs: {}, noticed: { quiet: {}, dominant: {} }, saved: this._loadSaved(), view: 'session' };
    this._restoreRuns();

    this.panel = document.createElement('section');
    this.panel.className = 'side-panel';
    this.panel.setAttribute('aria-label', 'Session');
    this.shell.overlays.appendChild(this.panel);

    this._init3D();
    if (this.state.run) this._stageMoment(Math.min(this.state.run.index, this.data.session.moments.length - 1), this.state.run.mix);
    this._initDialogs();
    this.shell.on('textmode', () => this.render());
    this.shell.on('restart', () => { if (this.state.module === 1 && this.state.run) this.startRun(this.state.run.mixId); else this.render(); });
    this.gotoModule(this.state.run?.done === false ? 1 : 0, { silent: true });

    if (__TEST_HOOKS__) {
      window.__TEST__ = {
        app: this, engine: this.engine, room: this.room, record: this.record, data: this.data,
        hooks: {
          start: (mixId) => this.startRun(mixId, { skipCinematic: true }),
          choose: (optionId, wait = { seconds: 4 }) => {
            const entry = choose(this.data, this.state.run, optionId, wait);
            entry.phrasing = fill(currentOptionPhrasing(this.data, entry), this.data, this.state.run.mix);
            entry.noticed = [];
            this.onChoice(entry, this.data.session.moments[this.state.run.index - 1], { wait, phrasingIdx: 0 });
            this.nextMoment({ skipCinematic: true });
            return entry;
          },
          score: () => this.state.run && scoreRun(this.state.run),
          state: () => this.state,
        },
      };
    }
  }

  /* ---------- persistence (slug-prefixed, local only) ---------- */
  _loadPrefs() {
    try { return { scale: 1, manual: false, ...JSON.parse(localStorage.getItem(`${SLUG}:wait`) || '{}') }; } catch { return { scale: 1, manual: false }; }
  }
  setPrefs(p) {
    Object.assign(this.prefs, p);
    try { localStorage.setItem(`${SLUG}:wait`, JSON.stringify(this.prefs)); } catch { /* private mode */ }
    announce(`Wait time set to ${this.prefs.manual ? 'manual' : `${this.prefs.scale} times`}`);
  }
  _loadSaved() {
    try { return JSON.parse(localStorage.getItem(`${SLUG}:runs`) || '{}'); } catch { return {}; }
  }
  _persist() {
    const out = {};
    for (const [id, run] of Object.entries(this.state.runs)) {
      out[id] = { choices: run.log.map((e) => ({ optionId: e.optionId, wait: e.wait, phrasingIdx: e.phrasingIdx, noticed: e.noticed })) };
    }
    out.active = this.state.run?.mixId ?? null;
    try { localStorage.setItem(`${SLUG}:runs`, JSON.stringify(out)); } catch { /* private mode */ }
  }
  /** Rebuild runs from saved choices: the model is deterministic, so replaying them restores state exactly. */
  _restoreRuns() {
    for (const mix of this.data.mixes.mixes) {
      const saved = this.state.saved[mix.id];
      if (!saved?.choices?.length) continue;
      try {
        const run = createRun(this.data, mix.id);
        for (const c of saved.choices) {
          const m = currentMoment(this.data, run);
          const entry = choose(this.data, run, c.optionId, c.wait || {});
          const o = m.options.find((x) => x.id === c.optionId);
          Object.assign(entry, { wait: c.wait, phrasingIdx: c.phrasingIdx ?? 0, noticed: c.noticed || [], phrasing: fill(o.phrasings[c.phrasingIdx ?? 0], this.data, run.mix) });
        }
        this.state.runs[mix.id] = run;
      } catch { /* content changed since save: drop it */ }
    }
    const active = this.state.saved.active;
    if (active && this.state.runs[active]) this.state.run = this.state.runs[active];
  }
  saveReflection(mixId, answers) {
    this.record.log('answered', { id: `reflection-${mixId}`, name: 'Debrief reflection' }, { response: JSON.stringify(answers) });
  }

  /* ---------- 3D ---------- */
  _init3D() {
    this.engine = null;
    if (!hasWebGL2()) {
      document.getElementById('stage').insertAdjacentHTML('beforeend',
        '<div data-webgl-fallback role="alert"><p>WebGL is not available in this browser. Every part of the session works in <strong>Text mode</strong>.</p></div>');
      return;
    }
    this.engine = new Engine(document.getElementById('app'));
    this.engine.camera.fov = 55;
    this.engine.camera.near = 0.05;
    this.engine.camera.updateProjectionMatrix();
    this.room = new TutoringRoom(this.engine.scene, { mixes: this.data.mixes, renderer: this.engine.renderer });
    this.room.applyPreset(this.engine.quality.presetDef);
    this.engine.quality.onChange((def) => { this.room.applyPreset(def); this.engine.resize(); });
    this.player = new ShotPlayer({ container: document.getElementById('cinematic-host'), camera: this.engine.camera, motion: this.motion,
      onSkip: (id) => this.record.log('experienced', { id: `cinematic-${id}-skipped`, name: 'Cinematic skipped' }) });
    this._cam = { pos: new THREE.Vector3(...VIEWS.group.pos), look: new THREE.Vector3(...VIEWS.group.look) };
    this._camTarget = null;
    this.lookAt('group', { snap: true });
    this.engine.onUpdate((dt) => {
      if (this._camTarget && !this.player.playing) {
        const k = this.motion.reduced ? 1 : 1 - Math.exp(-dt * 5);
        this._cam.pos.lerp(this._camTarget.pos, k);
        this._cam.look.lerp(this._camTarget.look, k);
        this.engine.camera.position.copy(this._cam.pos);
        this.engine.camera.lookAt(this._cam.look);
      }
      this.room.update(dt, this.motion.reduced);
    });
    this._applyStudents(this.state.run?.students ?? this.data.mixes.mixes[0].initial, { snap: true });
    this.engine.start();
  }

  lookAt(view, { snap = false } = {}) {
    if (!this.engine) return;
    const v = VIEWS[view];
    this._camTarget = { pos: new THREE.Vector3(...v.pos), look: new THREE.Vector3(...v.look) };
    if (snap || this.motion.reduced) {
      this._cam.pos.copy(this._camTarget.pos);
      this._cam.look.copy(this._camTarget.look);
      this.engine.camera.position.copy(this._cam.pos);
      this.engine.camera.lookAt(this._cam.look);
    }
    if (!snap) announce(`Looking at ${v.label}`);
  }

  _applyStudents(students, { snap = false } = {}) {
    if (!this.room) return;
    for (const id of STUDENT_IDS) this.room.setStudentState(id, students[id], cuesFor(students[id], this.data.cues), { snap });
  }

  /** Board, clock and worksheets for a moment (index into session.moments). */
  _stageMoment(i, mix) {
    if (!this.room) return;
    const m = this.data.session.moments[i];
    if (!m) return;
    const f = (t) => fill(t, this.data, mix);
    this.room.setBoard(f(m.board || ''));
    this.room.setClock(m.clock);
    const errId = mix.error.student;
    for (const id of STUDENT_IDS) {
      const lines = (id === errId && m.work?.E) ? m.work.E : m.work?.[id];
      if (lines) this.room.setWork(id, lines.map(f), { mark: id === errId && m.work?.E ? 'error' : null });
    }
  }

  /* ---------- flow ---------- */
  _target() {
    const tm = document.getElementById('textmode');
    if (!tm.hidden) { this.panel.hidden = true; return { el: tm, textMode: true }; }
    this.panel.hidden = false;
    return { el: this.panel, textMode: false };
  }

  render({ focus = true } = {}) {
    const { el, textMode } = this._target();
    el.replaceChildren();
    const mod = this.state.module;
    if (mod === 0) renderIntro(this, el);
    else if (mod === 1) {
      if (this.state.run && !this.state.run.done) renderMoment(this, el, { textMode });
      else renderRunPicker(this, el);
    } else if (mod === 2) {
      if (this.state.run?.done) renderDebrief(this, el);
      else {
        const p = document.createElement('p');
        p.textContent = 'Finish a run of the session to see its debrief.';
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'primary'; b.textContent = 'Go to the session';
        b.addEventListener('click', () => this.gotoModule(1));
        const h2 = document.createElement('h2');
        h2.id = 'module-h'; h2.tabIndex = -1; h2.textContent = '3. Debrief';
        el.append(h2, p, b);
      }
    } else renderAfter(this, el);
    el.scrollTop = 0;
    if (focus) el.querySelector('h2')?.focus();
  }

  gotoModule(i, { silent = false } = {}) {
    this.state.module = i;
    this.shell.setModule(i);
    if (i === 2 && this.state.run?.done) this.lookAt('overview', { snap: true });
    else if (this.engine) this.lookAt('group', { snap: true });
    this.render({ focus: !silent });
    this.record.log('experienced', { id: `module-${i + 1}`, name: MODULES[i] });
  }

  startRun(mixId, { skipCinematic = false } = {}) {
    const run = createRun(this.data, mixId);
    this.state.runs[mixId] = run;
    this.state.run = run;
    this.state.noticed[mixId] = {};
    this._persist();
    this.state.module = 1;
    this.shell.setModule(1);
    this._applyStudents(run.students, { snap: true });
    this._stageMoment(0, run.mix);
    this.record.log('attempted', { id: `run-${mixId}`, name: run.mix.name });
    const go = () => { this.lookAt('group', { snap: true }); this.render(); };
    if (!skipCinematic && this.player && !this.state.seenIntro) {
      this.state.seenIntro = true;
      this._play('intro', go);
    } else go();
  }

  _play(id, onDone) {
    const textMode = !document.getElementById('textmode').hidden;
    if (!this.player || textMode) { onDone(); return; }
    this.panel.hidden = true;
    this.player.onDone = () => { this.panel.hidden = false; onDone(); };
    this.player.load(this.data.cinematics[id]);
    this.record.log('experienced', { id: `cinematic-${id}`, name: this.data.cinematics[id].title });
    this.player.play();
  }

  /** Called by the session panel after a choice is applied to the model. */
  onChoice(entry, moment, { wait, phrasingIdx }) {
    entry.wait = wait;
    entry.phrasingIdx = phrasingIdx;
    this._applyStudents(this.state.run.students);
    const errId = this.state.run.mix.error.student;
    if (moment.id === 'm3' && this.room && ['probe', 'partial', 'tell'].includes(entry.optionId)) {
      this.room.setWork(errId, ['Guided practice', fill(moment.board, this.data, this.state.run.mix), ...this.state.run.mix.error.fixed], { mark: 'fixed' });
    }
    const mv = this.data.moves.moves.find((m) => m.id === entry.move);
    this.record.log('answered', { id: `${this.state.run.mixId}-${moment.id}`, name: `${moment.clock} ${mv.name}` },
      { response: entry.optionId, extensions: { waited: entry.waited, score: entry.score } });
    this._persist();
  }

  nextMoment({ skipCinematic = false } = {}) {
    const run = this.state.run;
    if (run.done) {
      this.record.log('completed', { id: `run-${run.mixId}`, name: run.mix.name }, { score: { raw: Object.values(scoreRun(run).domains).reduce((a, b) => a + (b || 0), 0), max: 20 } });
      this._persist();
      const go = () => { this.state.module = 2; this.shell.setModule(2); this.lookAt('overview', { snap: true }); this.render(); };
      if (!skipCinematic) this._play('debrief', go); else go();
      return;
    }
    this._stageMoment(run.index, run.mix);
    const m = currentMoment(this.data, run);
    const show = () => { this.lookAt('group', { snap: true }); this.render(); };
    if (m.camera === 'clock' && !skipCinematic) this._play('timeCheck', show);
    else show();
  }

  /** Debrief: pose the students as they were after moment i. */
  showReplayMoment(i) {
    const run = this.state.run;
    const entry = run?.log[i];
    if (!entry) return;
    this._stageMoment(i, run.mix);
    this._applyStudents(entry.after, { snap: true });
    this.lookAt('group', { snap: true });
  }

  _initDialogs() {
    this.settings = new Settings({ slug: SLUG, dialog: document.getElementById('settings-dialog'), quality: this.engine?.quality, motion: this.motion,
      onFov: (fov) => { if (!this.engine) return; this.engine.camera.fov = fov; this.engine.camera.updateProjectionMatrix(); } });
    this.shell.on('settings', (btn) => this.settings.open(btn));
    this.progressPage = new ProgressPage({ slug: SLUG, dialog: document.getElementById('progress-dialog'), record: this.record });
    this.shell.on('progress', (btn) => this.progressPage.open(btn));
  }
}

function currentOptionPhrasing(data, entry) {
  const m = data.session.moments.find((x) => x.id === entry.momentId);
  return m.options.find((o) => o.id === entry.optionId).phrasings[0];
}
