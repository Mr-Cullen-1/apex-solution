/* eslint-disable @typescript-eslint/no-require-imports -- Isolated browser regression; all submissions are intercepted. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.QA_PLAYWRIGHT || '../node_modules/.qa-tools/node_modules/playwright-core');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3127';
const output = process.env.QA_OUTPUT || 'docs/qa/current/regression';
fs.mkdirSync(output, { recursive: true });

const profiles = [
  ['narrow', 320, 568], ['mobile', 390, 844], ['landscape', 568, 320],
  ['tablet', 768, 1024], ['desktop', 1440, 900],
];
const results = [];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1243/chrome-win64/chrome.exe') });
  try {
    for (const [name, width, height] of profiles) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', serviceWorkers: 'block' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      let responseMode = 'success';
      let submissions = 0;
      await context.route('**/*', route => {
        if (['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) return route.continue();
        if (new URL(route.request().url()).pathname === '/api/book-now') {
          submissions++;
          if (responseMode === 'network') return route.abort('failed');
          const success = responseMode === 'success';
          return route.fulfill({ status: success ? 201 : 503, contentType: 'application/json', body: JSON.stringify(success
            ? { ok: true, status: 'received', requestId: 'local-qa-only' }
            : { ok: false, status: 'not_configured', message: 'QA fixture: online submission unavailable.' }) });
        }
        return route.abort('blockedbyclient');
      });
      try {
        await page.goto(base + '/services/cooling/ac-repair', { waitUntil: 'networkidle' });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, name + ' page overflow');
        const visibleCrumbs = await page.getByRole('navigation', { name: 'Breadcrumb', exact: true }).locator('li').allTextContents();
        assert.deepEqual(visibleCrumbs.map(text => text.replace(/^\s*\/\s*/, '').trim()), ['Home', 'Services', 'Cooling', 'AC Repair']);
        await page.getByRole('link', { name: 'States served NY · NJ · CT · MA · RI', exact: true }).waitFor();
        assert.equal(await page.getByText('Live Now', { exact: true }).count(), 0);
        await page.getByRole('button', { name: 'Book this service', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Let’s get your request started.' });
        await dialog.waitFor();
        assert.equal(await page.locator('#bn-service').inputValue(), 'ac-repair');
        assert.equal(await dialog.getByRole('checkbox').isChecked(), false);
        const submit = dialog.getByRole('button', { name: 'Send Request', exact: true });
        await submit.click();
        assert.equal(submissions, 0, 'invalid form must not reach API');
        assert.equal(await page.locator('#bn-fullName').getAttribute('aria-invalid'), 'true');
        await page.locator('#bn-fullName').fill('QA Local Fixture');
        await page.locator('#bn-phone').fill('2025550123');
        await page.locator('#bn-zip').fill('06810');
        await page.locator('#bn-message').fill('Local intercepted browser fixture only.');
        await submit.scrollIntoViewIfNeeded();
        const buttonBox = await submit.boundingBox();
        assert.ok(buttonBox && buttonBox.y >= 0 && buttonBox.y + buttonBox.height <= height + 1, name + ' submit clipped');
        assert.ok(buttonBox.height >= 48);
        await page.screenshot({ path: path.join(output, `booking-${name}.png`) });
        await submit.click();
        await page.getByRole('heading', { name: 'Request received.', exact: true }).waitFor();
        assert.equal(submissions, 1);
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
        assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Book this service');

        if (name === 'desktop') {
          for (const mode of ['unavailable', 'network']) {
            responseMode = mode;
            await page.getByRole('button', { name: 'Book this service', exact: true }).click();
            await page.locator('#bn-fullName').fill('QA Local Fixture');
            await page.locator('#bn-phone').fill('2025550123');
            await page.locator('#bn-zip').fill('06810');
            await page.locator('#bn-message').fill('Local intercepted failure fixture.');
            await page.getByRole('button', { name: 'Send Request', exact: true }).click();
            if (mode === 'network') await page.getByText("We couldn't confirm whether your request arrived.", { exact: false }).waitFor();
            else await page.getByRole('heading', { name: "We couldn't send this.", exact: true }).waitFor();
            assert.equal(await page.getByRole('heading', { name: 'Request received.', exact: true }).count(), 0);
            await page.keyboard.press('Escape');
          }
        }
        await page.goto(base + '/services/heating/boiler-repair', { waitUntil: 'networkidle' });
        await page.getByText('General HVAC service photo · outdoor equipment', { exact: true }).waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
        await page.screenshot({ path: path.join(output, `boiler-${name}.png`), fullPage: true });
        assert.deepEqual(pageErrors, []);
        results.push({ profile: name, width, height, status: 'passed', interceptedSubmissions: submissions, pageErrors });
        console.log('PASS', name, 'breadcrumbs, footer name, booking validation/receipt/focus, image caption; no live submission');
      } catch (error) {
        await page.screenshot({ path: path.join(output, `failure-${name}.png`), fullPage: true }).catch(() => {});
        results.push({ profile: name, status: 'failed', error: error.message, pageErrors });
        process.exitCode = 1;
        console.error('FAIL', name, error.message);
      } finally {
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ browser: browser.version(), base, note: 'All non-read requests intercepted; synthetic booking responses, not integration validation.', results }, null, 2));
        await context.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
