/**
 * validate-rules.mjs — content checks for the session and behavior model
 * (plan 07 §8 Phase 5). Exits 1 on any error.
 *
 *  - every option's move exists in moves.json
 *  - every option is covered by at least one rule for its context
 *    (a rule with empty effects counts: neutral is a deliberate outcome)
 *  - every rule's move and context are used by some option (no dead rules)
 *  - every rule has a rationale and a source
 *  - every option has two phrasings, a response, a coach note and a score
 *  - placeholders resolve for both mixes
 *  - every path through every mix completes, with state in range
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRun, choose, fill, STUDENT_IDS, STATE_MIN, STATE_MAX } from '../src/systems/student-model.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(readFileSync(join(root, 'content', f), 'utf8'));

export function loadData() {
  return {
    session: read('session.json'),
    rules: read('behavior-rules.json'),
    moves: read('moves.json'),
    mixes: read('student-mixes.json'),
    notes: read('coach-notes.json'),
    cues: read('cues.json'),
  };
}

export function validate(data) {
  const errors = [];
  const moveIds = new Set(data.moves.moves.map((m) => m.id));
  const used = new Set();

  for (const m of data.session.moments) {
    if (!m.observations?.some((o) => o.relevant) || !m.observations?.some((o) => !o.relevant)) {
      errors.push(`${m.id}: needs at least one relevant and one neutral observation`);
    }
    for (const o of m.options) {
      const where = `${m.id}/${o.id}`;
      if (!moveIds.has(o.move)) errors.push(`${where}: unknown move "${o.move}"`);
      used.add(`${o.move}|${m.context}`);
      const covered = data.rules.rules.some((r) => r.move === o.move && r.context === m.context);
      if (!covered) errors.push(`${where}: no rule for move "${o.move}" in context "${m.context}"`);
      if (!Array.isArray(o.phrasings) || o.phrasings.length < 2) errors.push(`${where}: needs 2 phrasings`);
      if (!o.response) errors.push(`${where}: missing response`);
      if (o.wait && (typeof o.response !== 'object' || !o.response.waited || !o.response.rushed)) errors.push(`${where}: wait option needs waited and rushed responses`);
      if (!o.score || !Object.keys(o.score).length) errors.push(`${where}: missing score`);
      for (const s of Object.values(o.score || {})) if (s < 1 || s > 4) errors.push(`${where}: score out of 1-4`);
      if (!data.notes.notes[m.id]?.[o.id]) errors.push(`${where}: missing coach note`);
    }
  }

  for (const r of data.rules.rules) {
    if (!r.rationale || !r.source) errors.push(`rule ${r.id}: needs rationale and source`);
    if (!used.has(`${r.move}|${r.context}`)) errors.push(`rule ${r.id}: never reachable (no option uses ${r.move} in ${r.context})`);
  }

  for (const mix of data.mixes.mixes) {
    for (const m of data.session.moments) {
      const texts = [m.scene, ...m.observations.map((o) => o.text), ...m.options.flatMap((o) => [...o.phrasings, ...(typeof o.response === 'object' ? Object.values(o.response) : [o.response])])];
      for (const t of texts) {
        const out = fill(t, data, mix);
        if (/\{[^}]*\}/.test(out)) errors.push(`${mix.id}/${m.id}: unresolved placeholder in "${out.slice(0, 60)}"`);
      }
    }
  }

  // Exhaustive path check: every combination of options (wait options tried both ways).
  let paths = 0;
  const walk = (mixId, choices) => {
    const run = createRun(data, mixId);
    for (const c of choices) choose(data, run, c.optionId, c.wait);
    if (run.done) {
      paths++;
      for (const id of STUDENT_IDS) for (const d of ['u', 'e', 'c']) {
        const v = run.students[id][d];
        if (v < STATE_MIN || v > STATE_MAX) errors.push(`${mixId}: state out of range`);
      }
      return;
    }
    const moment = data.session.moments[run.index];
    for (const o of moment.options) {
      const variants = o.wait ? [{ seconds: 4 }, { seconds: 1 }] : [{}];
      for (const w of variants) walk(mixId, [...choices, { optionId: o.id, wait: w }]);
    }
  };
  for (const mix of data.mixes.mixes) walk(mix.id, []);

  return { errors, paths, moments: data.session.moments.length, rules: data.rules.rules.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validate(loadData());
  if (result.errors.length) {
    console.error(`validate-rules: ${result.errors.length} error(s)\n` + result.errors.map((e) => ' - ' + e).join('\n'));
    process.exit(1);
  }
  console.log(`validate-rules: OK — ${result.moments} moments, ${result.rules} rules, ${result.paths} complete paths across both mixes`);
}
