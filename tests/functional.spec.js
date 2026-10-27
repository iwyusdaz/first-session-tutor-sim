/**
 * Functional tests, driven through the real UI (no test hooks), so they run on
 * the release build: both student mixes end to end, every module reachable by
 * keyboard, text mode parity, resume after reload, wait-time behavior, and the
 * reduced-motion cinematic.
 */
import { test, expect } from '@playwright/test';

const BEST = ['greet', 'data', 'probe', 'ask-wait', 'redirect', 'worked', 'why', 'ticket'];
const WEAK = ['cold', 'skip', 'tell', 'self', 'let', 'praise', 'praise', 'skip'];

/** Skip a cinematic if one is showing (Esc works from the first frame). */
async function skipCinematic(page) {
  const overlay = page.locator('.cinematic-overlay');
  if (await overlay.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden();
  }
}

async function useManualWait(page) {
  await page.getByRole('button', { name: '1. Before you start' }).click();
  const box = page.locator('#manual-wait');
  if (!(await box.isChecked())) await box.check();
}

/** Choose a move and answer the wait prompt, then advance. */
async function playMoment(page, optionId, { wait = true } = {}) {
  await page.locator(`#opt-${optionId}`).check();
  await page.getByRole('button', { name: 'Say it' }).click();
  const waitBtn = page.getByRole('button', { name: /^Wait in silence/ });
  if (await waitBtn.isVisible().catch(() => false)) {
    await (wait ? waitBtn : page.getByRole('button', { name: 'Speak again right away' })).click();
  }
  await expect(page.locator('.reaction')).toBeVisible();
  await page.locator('#next-moment').click();
  await page.waitForTimeout(150);
  await skipCinematic(page);
}

async function startRun(page, name) {
  await page.getByRole('button', { name: '2. The session' }).click();
  await page.getByRole('button', { name: `Start ${name}` }).click();
  await page.waitForTimeout(200);
  await skipCinematic(page);
  await expect(page.locator('#moment-h')).toContainText('Moment 1 of 8');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('first-session-tutor-sim:')) localStorage.removeItem(k); });
  await page.reload();
  await expect(page.locator('#module-h')).toBeVisible({ timeout: 20_000 });
});

test('all four modules are reachable and activate by keyboard', async ({ page }) => {
  const tabs = page.locator('.module-nav button');
  await expect(tabs).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await tabs.nth(i).focus();
    await page.keyboard.press('Enter');
    await expect(tabs.nth(i)).toHaveAttribute('aria-current', 'page');
  }
});

test('pre-check items give why-feedback', async ({ page }) => {
  const item = page.locator('.assessment-item').first();
  await item.locator('.choice-btn').first().click();
  await expect(item.locator('.feedback')).toBeVisible();
});

test('both student mixes play end to end; strong and weak runs score differently', async ({ page }) => {
  // 16 moments through the real UI (~55 s headless with frame pacing; see DECISIONS.md D17).
  test.setTimeout(150_000);
  await useManualWait(page);
  await startRun(page, 'Run 1: the quiet student');
  for (const id of BEST) await playMoment(page, id);
  await expect(page.locator('#debrief-h')).toContainText('Debrief: Run 1');
  const strong = page.locator('.score-table tbody tr');
  await expect(strong).toHaveCount(5);
  for (let i = 0; i < 5; i++) await expect(strong.nth(i).locator('td').first()).toHaveText('4');
  await expect(page.getByText('Exit ticket: given')).toBeVisible();

  await page.getByRole('button', { name: /Run the session again: Run 2/ }).click();
  await page.waitForTimeout(150);
  await skipCinematic(page);
  for (const id of WEAK) await playMoment(page, id, { wait: false });
  await expect(page.locator('#debrief-h')).toContainText('Debrief: Run 2');
  await expect(page.getByText('Exit ticket: skipped')).toBeVisible();
  await expect(page.locator('.score-table tbody tr').nth(1).locator('td').first()).toHaveText('1');
  await expect(page.locator('table.compare')).toBeVisible();
});

test('the error moment follows the mix (sign error vs distributing error)', async ({ page }) => {
  await useManualWait(page);
  await startRun(page, 'Run 2: the dominant student');
  await playMoment(page, 'greet');
  await playMoment(page, 'data');
  await expect(page.locator('.scene-text')).toContainText('2x − 4');
  await expect(page.locator('.scene-text')).toContainText('Sam');
});

test('debrief timeline explains each change and gives a coach note', async ({ page }) => {
  await useManualWait(page);
  await startRun(page, 'Run 1: the quiet student');
  for (const id of BEST) await playMoment(page, id);
  const first = page.locator('.timeline details').first();
  await first.locator('summary').click();
  await expect(first.locator('.coach-note')).toBeVisible();
  await expect(first.locator('.rule-list li').first()).toBeVisible();
  await expect(page.locator('.graph svg')).toHaveCount(3);
});

test('text mode covers the same decisions and describes every student', async ({ page }) => {
  await useManualWait(page);
  await page.getByRole('button', { name: 'Text mode' }).first().click();
  await expect(page.locator('#textmode')).toBeVisible();
  await page.locator('#textmode').getByRole('button', { name: 'Go to the session' }).click();
  await page.locator('#textmode').getByRole('button', { name: 'Start Run 1: the quiet student' }).click();
  const tm = page.locator('#textmode');
  await expect(tm.locator('#moment-h')).toContainText('Moment 1 of 8');
  await expect(tm.locator('.cue-desc li')).toHaveCount(3);
  await tm.locator('#opt-greet').check();
  await tm.getByRole('button', { name: 'Say it' }).click();
  await expect(tm.locator('.cue-after li')).toHaveCount(3);
});

test('progress is saved and the run resumes after a reload', async ({ page }) => {
  await useManualWait(page);
  await startRun(page, 'Run 1: the quiet student');
  await playMoment(page, 'greet');
  await playMoment(page, 'data');
  await page.reload();
  await expect(page.locator('#moment-h')).toContainText('Moment 3 of 8', { timeout: 20_000 });
});

test('timed wait: speaking again too soon counts as not waiting', async ({ page }) => {
  await startRun(page, 'Run 1: the quiet student');
  for (const id of ['greet', 'data', 'probe']) await playMoment(page, id);
  await page.locator('#opt-ask-wait').check();
  await page.getByRole('button', { name: 'Say it' }).click();
  // The activation guard ignores clicks in the first 300 ms (A11), so wait just past it.
  await page.waitForTimeout(400);
  await page.locator('#speak-again').click();
  await expect(page.locator('.wait-note')).toHaveText('You spoke again quickly.');
});

test('the palette shows phrasings only, the debrief names the moves, and replay asks first', async ({ page }) => {
  test.setTimeout(150_000);
  await useManualWait(page);
  await startRun(page, 'Run 1: the quiet student');
  // During play: neutral option letters plus the words you would say — no
  // evaluative move names, no canonical tags (heuristics H1 / walkthrough CW3).
  await expect(page.locator('.palette')).toContainText('Option A');
  await expect(page.locator('.palette')).not.toContainText('generic group greeting');
  await expect(page.locator('.palette')).not.toContainText('canonical');
  for (const id of BEST) await playMoment(page, id);
  await expect(page.locator('#debrief-h')).toBeVisible();
  await page.locator('.timeline details summary').first().click();
  await expect(page.locator('.timeline details').first()).toContainText('greet by name and reference last session');
  await expect(page.locator('.timeline details').first()).toContainText('(not a canonical move)');
  // Canonical moves (and misapplied ones) are named in the debrief too.
  await expect(page.locator('.timeline')).toContainText('(canonical move)');
  // "Play this run again" warns before replacing the finished run (H2 / CW11).
  await page.getByRole('button', { name: /Play this run again/ }).click();
  const armed = page.getByRole('button', { name: /result will be replaced/ });
  await expect(armed).toBeVisible();
  await armed.click();
  await expect(page.locator('#moment-h')).toContainText('Moment 1 of 8');
});

test('reduced motion: the intro cinematic shows stills with captions and a continue control', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#module-h')).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: '2. The session' }).click();
  await page.getByRole('button', { name: 'Start Run 1: the quiet student' }).click();
  const overlay = page.locator('.cinematic-overlay');
  if (await page.locator('canvas').count()) {
    await expect(overlay).toBeVisible();
    await expect(overlay.locator('.cinematic-caption')).toContainText('first session');
    // Reduced motion shows stills with a Continue control; leaving a still is not logged as a skip.
    await expect(overlay.getByRole('button', { name: 'Continue' })).toBeVisible();
    await overlay.getByRole('button', { name: 'Continue' }).click();
    await expect(overlay).toBeHidden();
  }
  await expect(page.locator('#moment-h')).toContainText('Moment 1 of 8');
  await context.close();
});
