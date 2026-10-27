/**
 * Student-state model — PURE (no THREE/DOM), deterministic, unit-tested.
 * A simplified teaching model, not a validated psychological model: every
 * state change comes from an authored rule in content/behavior-rules.json,
 * and each rule carries its rationale and source.
 * @module systems/student-model
 */

export const STATE_MIN = 0;
export const STATE_MAX = 4;
export const STUDENT_IDS = ['A', 'B', 'C'];
export const WAIT_TARGET_SECONDS = 3;

const clamp = (v) => Math.max(STATE_MIN, Math.min(STATE_MAX, v));
const copyStudents = (s) => Object.fromEntries(STUDENT_IDS.map((id) => [id, { ...s[id] }]));

/** Fill {A} {B} {C} {E} and {err.*} placeholders for a mix. */
export function fill(text, data, mix) {
  if (typeof text !== 'string') return text;
  const names = Object.fromEntries(STUDENT_IDS.map((id) => [id, data.mixes.students[id].name]));
  return text
    .replace(/\{err\.(\w+)\}/g, (_, k) => mix.error[k] ?? '')
    .replace(/\{E\}/g, names[mix.error.student])
    .replace(/\{([ABC])\}/g, (_, id) => names[id]);
}

/** Resolve an option or moment target to a student id, 'all', or null. */
export function resolveTarget(target, mix) {
  if (target === 'error') return mix.error.student;
  return target ?? null;
}

/** Was the wait long enough? Manual mode records the choice directly. */
export function waitedEnough({ seconds = 0, manualWaited = null, scale = 1 } = {}) {
  if (manualWaited !== null) return Boolean(manualWaited);
  return seconds >= WAIT_TARGET_SECONDS * scale;
}

function ruleMatches(rule, ctx) {
  if (rule.move !== ctx.move || rule.context !== ctx.context) return false;
  const w = rule.when || {};
  const t = ctx.targetId && ctx.targetId !== 'all' ? ctx.students[ctx.targetId] : null;
  if (w.targetMinEngagement !== undefined && (!t || t.e < w.targetMinEngagement)) return false;
  if (w.targetMaxEngagement !== undefined && (!t || t.e > w.targetMaxEngagement)) return false;
  if (w.waited !== undefined && w.waited !== ctx.waited) return false;
  return true;
}

function effectTargets(key, targetId) {
  if (key === 'all') return STUDENT_IDS;
  if (key === 'target') return targetId && targetId !== 'all' ? [targetId] : STUDENT_IDS;
  if (key === 'others') return STUDENT_IDS.filter((id) => id !== targetId);
  return STUDENT_IDS.includes(key) ? [key] : [];
}

/** Rules that would fire for a choice, in authored order. */
export function matchingRules(rules, ctx) {
  return rules.filter((r) => ruleMatches(r, ctx));
}

/**
 * Apply a set of rules to student state. Returns new state and the per-rule
 * deltas that were actually applied after clamping (for the debrief).
 */
export function applyRules(students, rules, targetId) {
  const next = copyStudents(students);
  const applied = [];
  for (const rule of rules) {
    const changes = [];
    for (const [key, delta] of Object.entries(rule.effects || {})) {
      for (const id of effectTargets(key, targetId)) {
        for (const [dim, d] of Object.entries(delta)) {
          const before = next[id][dim];
          next[id][dim] = clamp(before + d);
          if (next[id][dim] !== before) changes.push({ student: id, dim, from: before, to: next[id][dim] });
        }
      }
    }
    applied.push({ ruleId: rule.id, rationale: rule.rationale, source: rule.source, changes, events: rule.events || [] });
  }
  return { students: next, applied };
}

/** Create a run for one student mix. */
export function createRun(data, mixId) {
  const mix = data.mixes.mixes.find((m) => m.id === mixId);
  if (!mix) throw new Error(`unknown mix ${mixId}`);
  return { mixId, mix, students: copyStudents(mix.initial), index: 0, log: [], events: [], done: false };
}

/** The moment the run is currently at. */
export function currentMoment(data, run) {
  return data.session.moments[run.index] || null;
}

/**
 * Make a choice at the current moment.
 * @param {object} data   { session, rules, moves, mixes }
 * @param {object} run    from createRun
 * @param {string} optionId
 * @param {object} [wait] { seconds, manualWaited, scale } for options with wait:true
 */
export function choose(data, run, optionId, wait = {}) {
  const moment = currentMoment(data, run);
  if (!moment) throw new Error('run is finished');
  const option = moment.options.find((o) => o.id === optionId);
  if (!option) throw new Error(`unknown option ${optionId} at ${moment.id}`);
  const targetId = resolveTarget(option.target, run.mix);
  const waited = option.wait ? waitedEnough(wait) : null;
  const ctx = { move: option.move, context: moment.context, targetId, waited, students: run.students };
  const rules = matchingRules(data.rules.rules, ctx);
  const before = copyStudents(run.students);
  const { students, applied } = applyRules(run.students, rules, targetId);
  const score = { ...(option.wait && waited === false && option.scoreRushed ? option.scoreRushed : option.score) };
  const events = applied.flatMap((a) => a.events);
  const response = typeof option.response === 'object' ? option.response[waited ? 'waited' : 'rushed'] : option.response;
  const entry = {
    momentId: moment.id, clock: moment.clock, block: moment.block, context: moment.context,
    optionId, move: option.move, targetId, waited, waitSeconds: wait.seconds ?? null,
    score, events, applied, before, after: copyStudents(students), response,
  };
  run.students = students;
  run.log.push(entry);
  run.events.push(...events);
  run.index += 1;
  run.done = run.index >= data.session.moments.length;
  return entry;
}

/**
 * Score a finished (or partial) run on the five rubric domains.
 * Mean of the option scores per domain, then the rubric's tie rule: between
 * two levels the lower wins (floor). Skipping the exit ticket caps Domain 2 at 1.
 */
export function scoreRun(run) {
  const sums = {};
  for (const entry of run.log) {
    for (const [d, s] of Object.entries(entry.score)) {
      (sums[d] ||= []).push(s);
    }
  }
  const domains = {};
  for (let d = 1; d <= 5; d++) {
    const list = sums[d] || [];
    domains[d] = list.length ? Math.floor(list.reduce((a, b) => a + b, 0) / list.length) : null;
  }
  if (run.events.includes('no-ticket')) domains[2] = 1;
  const waits = run.log.filter((e) => e.waited !== null);
  return {
    domains,
    waitCompliance: waits.length ? waits.filter((e) => e.waited).length / waits.length : null,
    exitTicket: run.events.includes('ticket-given') ? 'given' : run.events.includes('ticket-rushed') ? 'rushed' : run.events.includes('no-ticket') ? 'skipped' : 'not reached',
  };
}

/** Cue descriptions for one student's state (posture, gaze, hands). */
export function cuesFor(state, cues) {
  const fits = (w) => (w.eMin === undefined || state.e >= w.eMin) && (w.eMax === undefined || state.e <= w.eMax)
    && (w.cMin === undefined || state.c >= w.cMin) && (w.cMax === undefined || state.c <= w.cMax);
  const pick = (list) => list.find((x) => fits(x.when)) || list[list.length - 1];
  return { posture: pick(cues.posture), gaze: pick(cues.gaze), hands: pick(cues.hands) };
}
