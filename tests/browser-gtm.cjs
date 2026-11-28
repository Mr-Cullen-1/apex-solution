/* eslint-disable @typescript-eslint/no-require-imports -- Local privacy regression; every external request is intercepted. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.QA_PLAYWRIGHT || '../node_modules/.qa-tools/node_modules/playwright-core');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3128';
const enabled = process.env.QA_ANALYTICS_READY === 'true';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1243/chrome-win64/chrome.exe') });
  const result = { enabled, mode: 'isolated fixture, not GTM Preview/DebugView', checks: [] };
  try {
    const context = await browser.newContext(); let requests = 0;
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(base).origin) {
        if (url.hostname === 'www.googletagmanager.com' && url.pathname === '/gtm.js') requests++;
        return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
      }
      if (!['GET', 'HEAD'].includes(route.request().method())) return route.fulfill({ status: 503, body: '{}' });
      return route.continue();
    });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(60000);
    for (const route of ['/admin/login?email=PRIVATE_MARKER', '/review?token=PRIVATE_MARKER']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(requests, 0); assert.equal(await page.locator('script#apex-gtm, noscript iframe').count(), 0);
    }
    result.checks.push('private entry routes never bootstrap GTM');
    await page.goto(base + '/services?email=PRIVATE_MARKER#PRIVATE_MARKER', { waitUntil: 'networkidle' });
    assert.equal(requests, enabled ? 1 : 0);
    assert.equal(await page.locator('noscript iframe').count(), 0);
    if (enabled) {
      const views = () => page.evaluate(() => (window.dataLayer || []).filter(e => e.event === 'apex_page_view'));
      assert.equal((await views()).length, 1);
      await page.locator('main a[href="/services/cooling"]').first().click();
      await page.waitForURL(base + '/services/cooling');
      await page.waitForFunction(() => window.dataLayer.filter(e => e.event === 'apex_page_view').length === 2);
      assert.equal(requests, 1);
      await page.evaluate(() => history.pushState({}, '', '/services/cooling?email=PRIVATE_MARKER#PRIVATE_MARKER'));
      await page.waitForTimeout(150); assert.equal((await views()).length, 2);
      assert.ok(!await page.evaluate(() => JSON.stringify(window.dataLayer).includes('PRIVATE_MARKER')));
      await page.evaluate(() => history.pushState({}, '', '/admin/login?email=PRIVATE_MARKER'));
      await page.waitForFunction(() => window.dataLayer.some(e => e.analytics_allowed === false));
      assert.equal((await views()).length, 2);
      assert.ok(await page.evaluate(() => Object.keys(window).filter(k => k.startsWith('ga-disable-')).some(k => window[k] === true)));
      await page.evaluate(() => history.pushState({}, '', '/services'));
      await page.waitForFunction(() => window.dataLayer.filter(e => e.event === 'apex_page_view').length === 3);
      result.checks.push('one sanitized view per public pathname; query-only and private navigation excluded; public tracking resumes');
    } else result.checks.push('readiness gate defaults off on public pages');
    for (const route of ['/privacy-policy', '/terms']) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.match(await page.locator('main').innerText(), /Awaiting business-owner approval/i);
      assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    }
    result.checks.push('legal drafts render 200 and noindex');
    result.status = 'passed';
    await context.close();
  } catch (error) { result.status = 'failed'; result.error = error.message; process.exitCode = 1; }
  finally {
    await browser.close();
    const output = process.env.QA_OUTPUT || 'docs/qa/current/gtm'; fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, enabled ? 'enabled-fixture.json' : 'disabled.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  }
})();
