/**
 * Replay debrief: rubric scores per domain, a timeline of moments (jump to any one),
 * each student's state as an SVG line chart with a data table, coach notes, and a
 * comparison with the other student mix when both runs are done.
 * Charts always have a data table and a text summary (accessibility plan).
 * @module ui/debrief
 */
import { scoreRun, fill, STUDENT_IDS } from '../systems/student-model.js';
import { h, studentName, targetLabel } from './session-panel.js';

const DIM_LABEL = { u: 'Understanding', e: 'Engagement', c: 'Confidence' };
const DIM_DASH = { u: '', e: '6 4', c: '2 3' };
const DIM_MARK = { u: '●', e: '■', c: '▲' };

/** States after each moment, starting with the initial state. */
function series(run) {
  const pts = [run.log[0]?.before ?? run.students];
  for (const e of run.log) pts.push(e.after);
  return pts;
}

function chart(data, run, id) {
  const pts = series(run);
  const W = 320, H = 150, P = 26;
  const x = (i) => P + (i * (W - 2 * P)) / Math.max(1, pts.length - 1);
  const y = (v) => H - P - (v * (H - 2 * P)) / 4;
  const name = studentName(data, id);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  const first = pts[0][id], last = pts[pts.length - 1][id];
  svg.setAttribute('aria-label', `${name}: understanding ${first.u} to ${last.u}, engagement ${first.e} to ${last.e}, confidence ${first.c} to ${last.c}, on a 0 to 4 scale.`);
  let inner = '';
  for (let v = 0; v <= 4; v++) inner += `<line x1="${P}" x2="${W - P}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="6" y="${y(v) + 4}" class="axis">${v}</text>`;
  for (const d of ['u', 'e', 'c']) {
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[id][d]).toFixed(1)}`).join(' ');
    inner += `<path d="${path}" class="line line-${d}" stroke-dasharray="${DIM_DASH[d]}" fill="none"/>`;
    inner += pts.map((p, i) => `<text x="${x(i) - 4}" y="${y(p[id][d]) + 4}" class="mark mark-${d}">${DIM_MARK[d]}</text>`).join('');
  }
  svg.innerHTML = inner;
  return svg;
}

function stateTable(data, run, id) {
  const pts = series(run);
  const head = h('tr', {}, h('th', { scope: 'col', text: 'After' }), ...['u', 'e', 'c'].map((d) => h('th', { scope: 'col', text: DIM_LABEL[d] })));
  const rows = pts.map((p, i) => h('tr', {},
    h('th', { scope: 'row', text: i === 0 ? 'Start' : `Moment ${i} (${run.log[i - 1].clock})` }),
    ...['u', 'e', 'c'].map((d) => h('td', { text: String(p[id][d]) }))));
  return h('table', { class: 'state-table' },
    h('caption', { text: `${studentName(data, id)}: state after each moment (0–4)` }),
    h('thead', {}, head), h('tbody', {}, rows));
}

function scoreTable(data, score) {
  const rows = data.moves.domains.map((d) => {
    const s = score.domains[d.id];
    return h('tr', {}, h('th', { scope: 'row', text: `${d.id}. ${d.name}` }),
      h('td', { text: s === null ? 'not observed' : String(s) }),
      h('td', { text: s === null ? '' : data.items.rubricLevels[String(s)] }));
  });
  return h('table', { class: 'score-table' },
    h('caption', { text: 'Your session on the observation rubric (1–4)' }),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Domain' }), h('th', { scope: 'col', text: 'Level' }), h('th', { scope: 'col', text: 'What the level means' }))),
    h('tbody', {}, rows));
}

/** One timeline entry: what you chose, what changed, why, and the coach note. */
function momentDetail(app, run, entry, i) {
  const { data } = app;
  const m = data.session.moments[i];
  const mv = data.moves.moves.find((x) => x.id === entry.move);
  const changes = entry.applied.flatMap((a) => a.changes);
  const changeText = changes.length
    ? changes.map((c) => `${studentName(data, c.student)} ${DIM_LABEL[c.dim].toLowerCase()} ${c.from} → ${c.to}`).join('; ')
    : 'No change in any student\'s state.';
  const noticed = (entry.noticed || []).map((oid) => m.observations.find((o) => o.id === oid)).filter(Boolean);
  const relevant = m.observations.filter((o) => o.relevant);
  const caught = noticed.filter((o) => o.relevant).length;
  return h('div', { class: 'moment-detail' },
    h('p', {}, h('strong', { text: 'You chose: ' }), `${mv.name} → ${targetLabel(data, run.mix, entry.targetId ?? 'all')}${mv.canonical ? ' (canonical move)' : ''}.`),
    h('p', { text: `You said: ${entry.phrasing}` }),
    entry.waited === null ? null : h('p', { text: entry.waited ? `Wait time: you waited${entry.waitSeconds ? ` ${entry.waitSeconds.toFixed(1)} s` : ''}, at least the 3–5 seconds the move asks for.` : `Wait time: you spoke again${entry.waitSeconds ? ` after ${entry.waitSeconds.toFixed(1)} s` : ' right away'}, before the 3-second mark.` }),
    h('p', { text: `What changed: ${changeText}` }),
    h('ul', { class: 'rule-list', 'aria-label': 'Rules that fired' }, entry.applied.map((a) => h('li', {}, h('span', { text: a.rationale }), h('span', { class: 'source', text: ` (${a.source})` })))),
    h('p', { text: `Noticing: you marked ${noticed.length} observation(s); ${caught} of the ${relevant.length} that mattered.` }),
    h('p', { class: 'coach-note' }, h('strong', { text: 'Coach note: ' }), data.notes.notes[m.id][entry.optionId]),
  );
}

export function renderDebrief(app, container) {
  const { data } = app;
  const run = app.state.run;
  const score = scoreRun(run);
  const other = app.state.runs[run.mixId === 'quiet' ? 'dominant' : 'quiet'];
  const f = (t) => fill(t, data, run.mix);

  const wrap = h('div', { class: 'debrief' },
    h('h2', { id: 'debrief-h', tabindex: '-1', text: `Debrief: ${run.mix.name}` }),
    h('p', { class: 'label-note', text: 'Students and their reactions come from a simplified teaching model, not a validated psychological model. Scores apply the observation-rubric anchors to your choices. They are not a judgment of you as a tutor.' }),
    scoreTable(data, score),
    h('p', { text: `Wait time: ${score.waitCompliance === null ? 'not tested' : `${Math.round(score.waitCompliance * 100)}% of your questions got 3+ seconds`}. Exit ticket: ${score.exitTicket}.` }),
  );

  const timeline = h('ol', { class: 'timeline', 'aria-label': 'Session timeline' });
  run.log.forEach((entry, i) => {
    const m = data.session.moments[i];
    const det = h('details', { id: `tl-${m.id}` }, h('summary', { text: `${entry.clock} · ${f(m.scene).split('. ')[0]}.` }), momentDetail(app, run, entry, i));
    det.addEventListener('toggle', () => { if (det.open) app.showReplayMoment(i); });
    timeline.append(h('li', {}, det));
  });
  wrap.append(h('h3', { text: 'Replay: moment by moment' }), h('p', { text: 'Open a moment to see what you chose, what changed and why. In the 3D view, the students take the pose they had after that moment.' }), timeline);

  const graphs = h('div', { class: 'graphs' });
  for (const id of STUDENT_IDS) {
    graphs.append(h('figure', { class: 'graph' },
      h('figcaption', { text: `${studentName(data, id)}: ${data.mixes.students[id].pattern}` }),
      chart(data, run, id),
      h('p', { class: 'legend', text: '● Understanding (solid)  ■ Engagement (dashed)  ▲ Confidence (dotted)' }),
      h('details', {}, h('summary', { text: `Data table for ${studentName(data, id)}` }), stateTable(data, run, id))));
  }
  wrap.append(h('h3', { text: 'How each student changed' }), graphs);

  if (other?.done) {
    const o = scoreRun(other);
    wrap.append(h('h3', { text: 'Your two runs side by side' }), h('table', { class: 'compare' },
      h('caption', { text: 'Rubric level per domain in each run' }),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Domain' }), h('th', { scope: 'col', text: run.mix.name }), h('th', { scope: 'col', text: other.mix.name }))),
      h('tbody', {}, data.moves.domains.map((d) => h('tr', {}, h('th', { scope: 'row', text: d.name }), h('td', { text: String(score.domains[d.id] ?? '–') }), h('td', { text: String(o.domains[d.id] ?? '–') }))))));
  }

  const refl = h('form', { class: 'reflection', onsubmit: (e) => {
    e.preventDefault();
    const answers = Object.fromEntries([...refl.querySelectorAll('textarea')].map((t) => [t.id, t.value.trim()]));
    app.saveReflection(run.mixId, answers);
    refl.querySelector('.saved').textContent = 'Saved in this browser only.';
  } }, h('h3', { text: 'Reflect' }));
  for (const r of data.items.reflection) {
    refl.append(h('label', { for: r.id, text: r.prompt }), h('textarea', { id: r.id, rows: '3' }));
  }
  refl.append(h('button', { type: 'submit', text: 'Save reflection' }), h('p', { class: 'saved', role: 'status' }));
  wrap.append(refl);

  const nextMix = run.mixId === 'quiet' ? 'dominant' : 'quiet';
  const actions = h('div', { class: 'debrief-actions' },
    other?.done
      ? h('button', { type: 'button', class: 'primary', text: 'Go to the post-check', onclick: () => app.gotoModule(3) })
      : h('button', { type: 'button', class: 'primary', text: `Run the session again: ${data.mixes.mixes.find((x) => x.id === nextMix).name}`, onclick: () => app.startRun(nextMix) }),
    h('button', { type: 'button', text: 'Replay this run from the start', onclick: () => app.startRun(run.mixId) }));
  wrap.append(actions);
  container.append(wrap);
}
