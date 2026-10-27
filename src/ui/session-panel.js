/**
 * Session panel: one moment at a time — the situation, optional noticing, the move
 * palette (move, target, phrasing), the wait-time mechanic, and the reaction.
 * The same markup serves the 3D view (bottom panel) and text mode, so both modes
 * make identical decisions. Text mode adds a written description of every
 * student's body language (plan 07 §11).
 * @module ui/session-panel
 */
import { fill, currentMoment, choose, resolveTarget, studentCues, STUDENT_IDS } from '../systems/student-model.js';
import { announce } from '../a11y/announcer.js';

/** Tiny element helper. `text` sets textContent; `on*` attaches listeners. */
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined) el.append(kid);
  return el;
}

export const studentName = (data, id) => data.mixes.students[id]?.name ?? id;

export function targetLabel(data, mix, target) {
  const t = resolveTarget(target, mix);
  return !t || t === 'all' ? 'the group' : studentName(data, t);
}

/** Plain-language body language for each student, from content/cues.json (with the moment's cuePose overrides). */
export function describeStudents(data, run) {
  const m = currentMoment(data, run);
  return STUDENT_IDS.map((id) => {
    const c = studentCues(data, run, id, m);
    return `${studentName(data, id)} is ${c.posture.description}, ${c.gaze.description}, ${c.hands.description}.`;
  });
}

export function routineBar(data, blockId) {
  const ol = h('ol', { class: 'routine', 'aria-label': 'Session routine' });
  for (const b of data.session.routine) {
    const cur = b.id === blockId;
    ol.append(h('li', { class: cur ? 'current' : null, 'aria-current': cur ? 'step' : null, text: `${b.name} (${b.minutes} min)` }));
  }
  return ol;
}

/**
 * Render the current moment of the active run into `container`.
 * @param {object} app the App (data, state, prefs, engine, onChoice, nextMoment, lookAt)
 */
export function renderMoment(app, container, { textMode }) {
  const { data } = app;
  const run = app.state.run;
  const mix = run.mix;
  const m = currentMoment(data, run);
  const f = (t) => fill(t, data, mix);
  const block = data.session.routine.find((b) => b.id === m.block);

  const wrap = h('div', { class: 'moment' });
  wrap.append(
    h('h2', { id: 'moment-h', tabindex: '-1', text: `Moment ${run.index + 1} of ${data.session.moments.length} · ${m.clock} · ${block.name}` }),
    routineBar(data, m.block),
    h('p', { class: 'scene-text', text: f(m.scene) }),
    h('details', { class: 'cue-desc', open: textMode || null },
      h('summary', { text: 'Describe what each student is doing' }),
      h('ul', {}, describeStudents(data, run).map((t) => h('li', { text: t })))),
  );

  if (app.engine && !textMode) {
    const looks = h('div', { class: 'look-buttons', role: 'group', 'aria-label': 'Look at' });
    const lookLabel = (v) => {
      if (v === 'group') return 'Look at the whole group';
      if (v.endsWith('-work')) return `Look at ${studentName(data, v[0])}'s worksheet`;
      if (v.length === 1) return `Look at ${studentName(data, v)}`;
      return `Look at the ${v}`;
    };
    for (const v of ['group', 'A', 'A-work', 'B', 'B-work', 'C', 'C-work', 'board', 'clock']) {
      looks.append(h('button', { type: 'button', text: lookLabel(v), onclick: () => app.lookAt(v) }));
    }
    wrap.append(looks);
  }

  const notice = h('fieldset', { class: 'notice' }, h('legend', { text: 'Notice (optional): which of these matter right now?' }));
  for (const o of m.observations) {
    const id = `obs-${o.id}`;
    notice.append(h('label', { class: 'choice', for: id }, h('input', { type: 'checkbox', id, value: o.id }), ` ${f(o.text)}`));
  }
  wrap.append(notice);

  // The palette shows only what you would say plus a neutral letter (H1/CW3):
  // evaluative move names and canonical tags would give the answer away, so they
  // are revealed in the debrief instead.
  const palette = h('fieldset', { class: 'palette' }, h('legend', { text: 'Choose your move' }),
    h('p', { class: 'hint-note', text: 'Pick what you would actually say. What each choice is called is revealed in the debrief.' }));
  for (const [i, o] of m.options.entries()) {
    const id = `opt-${o.id}`;
    palette.append(h('label', { class: 'choice move-choice', for: id },
      h('input', { type: 'radio', name: 'move', id, value: o.id }),
      h('span', {}, h('strong', { text: `Option ${String.fromCharCode(65 + i)}` }), ` → ${targetLabel(data, mix, o.target)} `)));
  }
  const phrasing = h('div', { class: 'phrasing', hidden: true });
  palette.addEventListener('change', (e) => {
    if (e.target.name !== 'move') return;
    const o = m.options.find((x) => x.id === e.target.value);
    phrasing.hidden = false;
    phrasing.replaceChildren(
      h('label', { for: 'phrasing-select', text: 'Say it this way: ' }),
      h('select', { id: 'phrasing-select' }, o.phrasings.map((p, i) => h('option', { value: String(i), text: f(p) }))),
      h('p', { class: 'hint-note', text: 'Both phrasings are the same move. The students respond to the move, not the wording.' }),
    );
  });
  palette.append(phrasing);
  wrap.append(palette);

  const result = h('div', { class: 'result' });
  const say = h('button', { type: 'button', class: 'primary', text: 'Say it' });
  const sayBar = h('div', { class: 'say-bar' }, say);
  wrap.append(sayBar, result);
  container.append(wrap);

  const lock = () => {
    for (const el of wrap.querySelectorAll('fieldset input, fieldset select')) el.disabled = true;
    say.disabled = true;
    sayBar.hidden = true; // the decision is made; the wait prompt and reaction replace it
  };

  const commit = (o, idx, wait) => {
    const entry = choose(data, run, o.id, wait);
    entry.phrasing = f(o.phrasings[idx]);
    entry.noticed = app.state.noticed[run.mixId]?.[m.id] || [];
    app.onChoice(entry, m, { wait, phrasingIdx: idx });
    const reaction = f(entry.response);
    result.replaceChildren(h('p', { class: 'said', text: `You: ${entry.phrasing}` }));
    if (entry.waited !== null) result.append(h('p', { class: 'wait-note', text: entry.waited ? 'You held the silence.' : 'You spoke again quickly.' }));
    result.append(h('p', { class: 'reaction', text: reaction }));
    if (textMode) result.append(h('ul', { class: 'cue-after', 'aria-label': 'What the students are doing now' }, describeStudents(data, run).map((t) => h('li', { text: t }))));
    const next = h('button', { type: 'button', class: 'primary', id: 'next-moment', text: run.done ? 'End the session' : 'Next moment', onclick: () => app.nextMoment() });
    result.append(next);
    announce(reaction);
    next.focus();
  };

  const startWait = (o, idx) => {
    const { scale, manual } = app.prefs;
    result.replaceChildren(h('p', { class: 'said', text: `You: ${f(o.phrasings[idx])}` }));
    if (manual) {
      result.append(
        h('p', { text: 'Silence after your question. Do you wait, or speak again?' }),
        h('div', { class: 'wait-buttons' },
          h('button', { type: 'button', text: 'Wait in silence (the move asks for a few seconds)', onclick: () => commit(o, idx, { manualWaited: true, scale }) }),
          h('button', { type: 'button', text: 'Speak again right away', onclick: () => commit(o, idx, { manualWaited: false, scale }) })),
      );
    } else {
      const counter = h('span', { class: 'wait-counter', 'aria-hidden': 'true', text: '0.0 s' });
      const t0 = performance.now();
      clearInterval(app.waitTimer);
      app.waitTimer = setInterval(() => { counter.textContent = `${((performance.now() - t0) / 1000).toFixed(1)} s`; }, 100);
      result.append(
        h('p', {}, 'Silence. Wait as long as feels right, then speak again. ', counter),
        h('button', { type: 'button', class: 'primary', id: 'speak-again', text: 'Speak again', onclick: () => {
          // Ignore activation in the first 300 ms: a habitual Enter off "Say it"
          // would end the wait at ~0 s (accessibility A11).
          if (performance.now() - t0 < 300) return;
          clearInterval(app.waitTimer);
          commit(o, idx, { seconds: (performance.now() - t0) / 1000, scale });
        } }),
      );
      announce('Silence. Press Speak again when you are ready to talk.');
    }
    result.querySelector('button')?.focus();
  };

  say.addEventListener('click', () => {
    const sel = palette.querySelector('input[name="move"]:checked');
    if (!sel) { result.replaceChildren(h('p', { class: 'error', role: 'alert', text: 'Choose a move first.' })); return; }
    const o = m.options.find((x) => x.id === sel.value);
    const idx = Number(phrasing.querySelector('select')?.value ?? 0);
    (app.state.noticed[run.mixId] ||= {})[m.id] = [...notice.querySelectorAll('input:checked')].map((x) => x.value);
    lock();
    if (o.wait) startWait(o, idx);
    else commit(o, idx, {});
  });
}
