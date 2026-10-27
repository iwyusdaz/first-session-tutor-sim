/**
 * Module renderers that are not a session moment: 1. Before you start,
 * the run picker inside 2. The session, and 4. After the session.
 * Same markup in the 3D view panel and in text mode.
 * @module ui/modules
 */
import { mcItem } from '../learning/assess.js';
import { scoreRun } from '../systems/student-model.js';
import { h } from './session-panel.js';

const OBJECTIVES = [
  'Run the five-part session routine inside its time boxes.',
  'Choose moves that keep students doing the thinking (probing questions, hints before answers).',
  'Notice and respond to cues of confusion, disengagement or dominance.',
  'Use wait time of 3–5 seconds after asking a question.',
  'Respond to errors with a probing question rather than a correction.',
  'Use an exit ticket to check each student\'s understanding.',
];

function checkSet(app, container, items, phase) {
  for (const item of items) {
    mcItem({
      item, container,
      onAnswered: (a) => app.record.log('answered', { id: `${phase}-${item.id}`, name: item.prompt }, { response: a.chosen, success: a.correct }),
    });
  }
}

export function renderIntro(app, container) {
  const { data } = app;
  const scales = [0.5, 1, 1.5, 2];
  const waitBox = h('fieldset', { class: 'wait-settings' },
    h('legend', { text: 'Wait-time settings' }),
    h('p', { text: 'After some questions, a real silence starts. You decide when to speak again. The move asks for at least 3 seconds.' }),
    h('div', { role: 'radiogroup', 'aria-label': 'Wait-time scale' }, scales.map((s) => h('label', { class: 'choice' },
      h('input', { type: 'radio', name: 'wait-scale', value: String(s), checked: app.prefs.scale === s || null,
        onchange: () => app.setPrefs({ scale: s }) }),
      ` ${s}× (target ${(3 * s).toFixed(1)} seconds)`))),
    h('label', { class: 'choice' },
      h('input', { type: 'checkbox', id: 'manual-wait', checked: app.prefs.manual || null, onchange: (e) => app.setPrefs({ manual: e.target.checked }) }),
      ' Manual wait: choose "Wait" or "Speak again right away" instead of timing the silence'),
    h('p', { class: 'hint-note', text: 'Scoring looks at whether you waited, not at how fast you react.' }));

  const names = Object.values(data.mixes.students).map((s) => s.name).join(', ');
  container.append(
    h('h2', { id: 'module-h', tabindex: '-1', text: '1. Before you start' }),
    h('p', { text: `You're a new tutor with Bridge Math Tutoring (a fictional program). Today is your first 30-minute session with three Grade 7 students: ${names}. You'll work on linear equations.` }),
    h('p', { class: 'label-note', text: 'The students, their names and their reactions are fictional, constructed for teaching. Their behavior comes from a simplified teaching model, not a validated psychological model.' }),
    h('h3', { text: 'What you\'ll practice' }),
    h('ol', {}, OBJECTIVES.map((t) => h('li', { text: t }))),
    h('h3', { text: 'How it works' }),
    h('ul', {},
      h('li', { text: 'The session stops at 8 moments. At each one, read the scene and watch the students.' }),
      h('li', { text: 'Optionally, mark which observations matter. Then choose a move, who it\'s for, and how to say it.' }),
      h('li', { text: 'The students respond. Their posture, gaze and hands show how they\'re doing.' }),
      h('li', { text: 'Afterward, a replay shows each choice, what it changed and why. Then you run the session again with a different mix of students.' })),
    waitBox,
    h('h3', { text: 'Quick check before you start' }),
  );
  checkSet(app, container, data.items.preCheck, 'pre');
  container.append(h('button', { type: 'button', class: 'primary', text: 'Go to the session', onclick: () => app.gotoModule(1) }));
}

export function renderRunPicker(app, container) {
  const { data } = app;
  container.append(
    h('h2', { id: 'module-h', tabindex: '-1', text: '2. The session' }),
    h('p', { text: 'Choose a run. Start with Run 1 if this is your first time.' }));
  for (const mix of data.mixes.mixes) {
    const done = app.state.runs[mix.id]?.done;
    container.append(h('section', { class: 'run-card' },
      h('h3', { text: mix.name }),
      h('p', { text: mix.description }),
      h('p', { class: 'status', text: done ? 'Status: finished. Starting again replaces this run.' : 'Status: not finished.' }),
      h('button', { type: 'button', class: 'primary', text: `Start ${mix.name}`, onclick: () => app.startRun(mix.id) })));
  }
}

export function renderAfter(app, container) {
  const { data } = app;
  container.append(
    h('h2', { id: 'module-h', tabindex: '-1', text: '4. After the session' }),
    h('h3', { text: 'Check: same skills, new situations' }));
  checkSet(app, container, data.items.postCheck, 'post');

  const done = data.mixes.mixes.filter((m) => app.state.runs[m.id]?.done);
  if (done.length) {
    const rows = data.moves.domains.map((d) => h('tr', {}, h('th', { scope: 'row', text: d.name }),
      ...done.map((m) => h('td', { text: String(scoreRun(app.state.runs[m.id]).domains[d.id] ?? '–') }))));
    container.append(h('table', { class: 'compare' },
      h('caption', { text: 'Your rubric levels by run (1–4)' }),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Domain' }), ...done.map((m) => h('th', { scope: 'col', text: m.name })))),
      h('tbody', {}, rows)));
  } else {
    container.append(h('p', { text: 'Finish at least one run to see your rubric levels here.' }));
  }

  container.append(
    h('h3', { text: 'Where this fits' }),
    h('p', {}, 'The move names come from ',
      h('a', { href: 'https://github.com/iwyusdaz/socratic-ai-tutor', text: 'Socratic AI Tutor' }),
      ' and the five rubric domains from ',
      h('a', { href: 'https://github.com/iwyusdaz/tutor-training-course', text: 'Tutor Training Course' }),
      '. This simulator is the practice step between the training modules and real students.'),
    h('p', { class: 'label-note', text: 'This practice can\'t show that you\'ll tutor real students better, and the student model is a teaching simplification. Treat your scores as a conversation starter with a coach.' }),
    h('div', { class: 'debrief-actions' },
      h('button', { type: 'button', text: 'Back to the session', onclick: () => app.gotoModule(1) }),
      h('button', { type: 'button', text: 'Open My progress', onclick: (e) => app.progressPage.open(e.currentTarget) })));
}
