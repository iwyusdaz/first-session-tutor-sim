/**
 * Accessibility: axe on every overlay state (intro, a session moment, the wait
 * prompt, a reaction, the debrief, text mode, settings and progress dialogs).
 * Gate: zero critical or serious issues. The canvas is excluded (not HTML UI).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('overlay UI has no critical or serious axe issues', async ({ page }) => {
  // A full run plus nine axe scans (26–47 s headless with frame pacing; see DECISIONS.md D17).
  test.setTimeout(150_000);
  await page.goto('/');
  await expect(page.locator('#module-h')).toBeVisible({ timeout: 20_000 });
  const scan = async (label) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).exclude('canvas').analyze();
    const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    if (bad.length) console.log(`axe (${label}):`, JSON.stringify(bad.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })), null, 1));
    expect(bad, label).toEqual([]);
  };
  const skip = async () => {
    const o = page.locator('.cinematic-overlay');
    if (await o.isVisible().catch(() => false)) { await page.keyboard.press('Escape'); await expect(o).toBeHidden(); }
  };

  await scan('intro');
  await page.locator('#manual-wait').check();

  await page.getByRole('button', { name: '2. The session' }).click();
  await scan('run picker');
  await page.getByRole('button', { name: 'Start Run 1: the quiet student' }).click();
  await page.waitForTimeout(200);
  await skip();
  await scan('session moment');

  for (const id of ['greet', 'data', 'probe']) {
    await page.locator(`#opt-${id}`).check();
    await page.getByRole('button', { name: 'Say it' }).click();
    if (id === 'greet') await scan('reaction');
    await page.locator('#next-moment').click();
    await page.waitForTimeout(100);
    await skip();
  }
  await page.locator('#opt-ask-wait').check();
  await page.getByRole('button', { name: 'Say it' }).click();
  await scan('wait prompt');
  await page.getByRole('button', { name: /^Wait in silence/ }).click();
  await page.locator('#next-moment').click();
  for (const id of ['redirect', 'worked', 'why', 'ticket']) {
    await page.waitForTimeout(100);
    await skip();
    await page.locator(`#opt-${id}`).check();
    await page.getByRole('button', { name: 'Say it' }).click();
    const w = page.getByRole('button', { name: /^Wait in silence/ });
    if (await w.isVisible().catch(() => false)) await w.click();
    await page.locator('#next-moment').click();
  }
  await page.waitForTimeout(150);
  await skip();
  await expect(page.locator('#debrief-h')).toBeVisible();
  await page.locator('.timeline details summary').first().click();
  await scan('debrief');

  await page.getByRole('button', { name: 'Settings' }).click();
  await scan('settings dialog');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'My progress' }).click();
  await scan('progress dialog');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Text mode' }).first().click();
  await scan('text mode');
});
