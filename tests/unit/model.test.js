/**
 * Unit tests for the student-state model, the canonical vocabulary and the
 * content validator (plan 07 §10: rule validation, outcome coverage).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadData, validate, DEFAULT_PATH } from '../../scripts/validate-rules.mjs';
import { createRun, choose, currentMoment, scoreRun, cuesFor, studentCues, waitedEnough, fill } from '../../src/systems/student-model.js';

const data = loadData();

/** Play a mix with a fixed choice per moment. */
function play(mixId, picks, wait = { seconds: 4 }) {
  const run = createRun(data, mixId);
  for (const m of data.session.moments) choose(data, run, picks[m.id], wait);
  return run;
}
const BEST = { m1: 'greet', m2: 'data', m3: 'probe', m4: 'ask-wait', m5: 'redirect', m6: 'worked', m7: 'why', m8: 'ticket' };
const WEAK = { m1: 'cold', m2: 'skip', m3: 'tell', m4: 'self', m5: 'let', m6: 'praise', m7: 'praise', m8: 'skip' };

describe('content validator', () => {
  it('passes with no errors and walks every path in both mixes', () => {
    const r = validate(data);
    expect(r.errors).toEqual([]);
    expect(r.moments).toBeGreaterThanOrEqual(6);
    expect(r.moments).toBeLessThanOrEqual(8);
    expect(r.paths).toBeGreaterThan(1000);
  });
});

describe('canonical vocabulary', () => {
  it('uses the seven move names from socratic-ai-tutor exactly', () => {
    const canonical = data.moves.moves.filter((m) => m.canonical).map((m) => m.name).sort();
    expect(canonical).toEqual([
      'confirm and ask why', 'hint ladder (levels 0–5)', 'offer a similar problem', 'probing question',
      'specific feedback', 'wait time', 'worked example after repeated failure',
    ].sort());
  });
  it('uses the five tutor-training-course domain names exactly', () => {
    expect(data.moves.domains.map((d) => d.name)).toEqual([
      'Relationships', 'Session structure', 'Questioning and errors', 'Feedback and motivation', 'Data use',
    ]);
  });
  it('covers the five-part routine with its time boxes', () => {
    expect(data.session.routine.map((r) => `${r.id}:${r.minutes}`)).toEqual(['warm-up:5', 'review:5', 'guided:12', 'independent:5', 'exit:3']);
    const blocks = new Set(data.session.moments.map((m) => m.block));
    for (const r of data.session.routine) expect(blocks.has(r.id)).toBe(true);
  });
});

describe('student model rules', () => {
  it('telling the answer does not raise understanding; probing an engaged student does', () => {
    const tell = createRun(data, 'quiet');
    choose(data, tell, 'greet'); choose(data, tell, 'data');
    const uBefore = tell.students.A.u;
    choose(data, tell, 'tell');
    expect(tell.students.A.u).toBe(uBefore);

    const probe = createRun(data, 'quiet');
    choose(data, probe, 'greet'); choose(data, probe, 'data');
    const before = probe.students.A.u;
    choose(data, probe, 'probe');
    expect(probe.students.A.u).toBeGreaterThan(before);
  });
  it('wait time of 3 s or more raises the quiet student; rushing lowers her engagement', () => {
    const go = (seconds) => {
      const run = createRun(data, 'quiet');
      for (const id of ['greet', 'data', 'probe']) choose(data, run, id);
      const e0 = run.students.B.e;
      choose(data, run, 'ask-wait', { seconds });
      return run.students.B.e - e0;
    };
    expect(go(4)).toBeGreaterThan(0);
    expect(go(1)).toBeLessThan(0);
  });
  it('the error moment follows the mix: sign error by Jordan (quiet mix), distributing error by Sam (dominant mix)', () => {
    const q = data.mixes.mixes.find((m) => m.id === 'quiet');
    const d = data.mixes.mixes.find((m) => m.id === 'dominant');
    expect(q.error.student).toBe('A');
    expect(d.error.student).toBe('C');
    expect(fill('{E}', data, d)).toBe('Sam');
  });
  it('praising effort-free ("generic praise") does not help the discouraged student', () => {
    const run = createRun(data, 'quiet');
    for (const id of ['greet', 'data', 'probe', 'ask-wait', 'redirect']) choose(data, run, id, { seconds: 4 });
    const c0 = run.students.C.c;
    choose(data, run, 'praise');
    expect(run.students.C.c).toBeLessThanOrEqual(c0);
  });
  it('state always stays within 0-4', () => {
    for (const mix of ['quiet', 'dominant']) for (const picks of [BEST, WEAK]) {
      const run = play(mix, picks);
      for (const s of Object.values(run.students)) for (const v of Object.values(s)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe('scoring against the observation rubric', () => {
  it('a strong run scores 4 on every domain; a weak run scores low', () => {
    const strong = scoreRun(play('quiet', BEST));
    expect(Object.values(strong.domains)).toEqual([4, 4, 4, 4, 4]);
    expect(strong.waitCompliance).toBe(1);
    expect(strong.exitTicket).toBe('given');
    const weak = scoreRun(play('quiet', WEAK));
    expect(Math.max(...Object.values(weak.domains))).toBeLessThanOrEqual(2);
  });
  it('skipping the exit ticket caps Session structure at 1', () => {
    const picks = { ...BEST, m8: 'skip' };
    expect(scoreRun(play('dominant', picks)).domains[2]).toBe(1);
  });
  it('rushing the wait lowers the questioning score', () => {
    const waited = scoreRun(play('quiet', BEST, { seconds: 4 }));
    const rushed = scoreRun(play('quiet', BEST, { seconds: 1 }));
    expect(rushed.domains[3]).toBeLessThan(waited.domains[3]);
    expect(rushed.waitCompliance).toBe(0);
  });
});

describe('wait-time accessibility scale', () => {
  it('scales the 3-second target and honors a manual choice', () => {
    expect(waitedEnough({ seconds: 3 })).toBe(true);
    expect(waitedEnough({ seconds: 3, scale: 2 })).toBe(false);
    expect(waitedEnough({ seconds: 1.6, scale: 0.5 })).toBe(true);
    expect(waitedEnough({ manualWaited: true })).toBe(true);
    expect(waitedEnough({ manualWaited: false, seconds: 10 })).toBe(false);
  });
});

describe('cues', () => {
  it('maps state to distinguishable body-language cues', () => {
    const low = cuesFor({ u: 1, e: 1, c: 1 }, data.cues);
    const high = cuesFor({ u: 3, e: 4, c: 4 }, data.cues);
    expect(low.posture.id).toBe('withdrawn');
    expect(low.gaze.id).toBe('away');
    expect(high.posture.id).toBe('engaged');
    expect(high.hands.id).toBe('hand-up');
  });
  it('shows a confused cue for low understanding with engagement still present', () => {
    const stuck = cuesFor({ u: 1, e: 3, c: 2 }, data.cues);
    expect(stuck.hands.id).toBe('confused');
    const fine = cuesFor({ u: 2, e: 3, c: 2 }, data.cues);
    expect(fine.hands.id).toBe('writing');
    const shutDown = cuesFor({ u: 1, e: 0, c: 0 }, data.cues);
    expect(shutDown.hands.id).toBe('arms-folded');
  });
  it('relevant body-language observations agree with the rendered cues on the default path, in both mixes', () => {
    for (const mix of data.mixes.mixes) {
      const run = createRun(data, mix.id);
      for (const m of data.session.moments) {
        for (const o of m.observations) {
          if (!o.relevant || !o.expects) continue;
          for (const [key, want] of Object.entries(o.expects)) {
            const id = key === 'E' ? mix.error.student : key;
            const c = studentCues(data, run, id, m);
            const got = { posture: c.posture.id, gaze: c.gaze.id, hands: c.hands.action };
            for (const dim of ['posture', 'gaze', 'hands']) {
              if (want[dim]) expect(got[dim], `${mix.id}/${m.id}/${o.id} ${id}.${dim}`).toBe(want[dim]);
            }
          }
        }
        choose(data, run, DEFAULT_PATH[m.id], { seconds: 4 });
      }
    }
  });
  it('moment cuePose overrides reach both the 3D pose and the written description', () => {
    const run = createRun(data, 'quiet');
    for (const id of ['greet', 'data']) choose(data, run, id, { seconds: 4 });
    // At m3 the error student is pinned to "waiting for you" even though engagement says worksheet-gaze.
    const m3 = currentMoment(data, run);
    const errId = run.mix.error.student;
    const c = studentCues(data, run, errId, m3);
    expect(c.gaze.id).toBe('on-tutor');
    expect(c.hands.action).toBe('waiting');
    // A non-target student keeps pure state-derived cues.
    const other = studentCues(data, run, 'C', m3);
    expect(other.hands.action).not.toBe('waiting');
  });
});

describe('labels and honesty', () => {
  it('labels the model and the students as constructed', () => {
    expect(data.rules._meta.label).toMatch(/not a validated psychological model/);
    expect(data.mixes._meta.label).toMatch(/fictional/i);
    const sources = readFileSync(new URL('../../research/sources.md', import.meta.url), 'utf8');
    expect(sources).toMatch(/UNVERIFIED/);
  });
});
