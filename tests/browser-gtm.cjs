/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser integration check. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.QA_PLAYWRIGHT || '../node_modules/.qa-tools/node_modules/playwright-core');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3128';
const gtmId = 'GTM-5JLZPN4Q';
const live = process.env.QA_GTM_LIVE === '1';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1243/chrome-win64/chrome.exe') });
  const result = { mode: live ? 'public container; other external requests intercepted' : 'isolated GTM fixture', browser: browser.version(), routes: [], consoleErrors: [], pageErrors: [], gtmResponses: [], blockedExternalRequests: 0 };
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    let requests = 0;
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'www.googletagmanager.com' && url.pathname === '/gtm.js') {
        requests++;
        assert.equal(url.searchParams.get('id'), gtmId);
        if (live) return route.continue();
        return route.fulfill({ contentType: 'application/javascript', body: 'window.__gtmFixtureLoaded = true;' });
      }
      if (url.origin !== new URL(base).origin) {
        result.blockedExternalRequests++;
        return route.fulfill({ status: 204 });
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('console', message => { if (message.type() === 'error') result.consoleErrors.push(message.text()); });
    page.on('pageerror', error => result.pageErrors.push(error.message));
    page.on('response', response => {
      const url = new URL(response.url());
      if (url.hostname === 'www.googletagmanager.com' && url.pathname === '/gtm.js') result.gtmResponses.push(response.status());
    });
    const check = async (route, expectedRequests) => {
      await page.waitForURL(base + route);
      await page.waitForFunction(() => window.dataLayer?.some(item => item.event === 'gtm.js'));
      if (live) await page.waitForFunction(id => Boolean(window.google_tag_manager?.[id]), gtmId);
      assert.equal(await page.locator('head script#apex-gtm').count(), 1);
      assert.equal(await page.locator('head script[src*="googletagmanager.com/gtm.js"]').count(), 1);
      // In fixture mode any extra analytics initialization must come from the
      // app. A real container may legitimately initialize GA4 itself.
      if (!live) {
        assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(), 0, 'No directly initialized GA4');
        assert.equal(await page.evaluate(() => window.dataLayer.filter(item => item.event === 'page_view' || item[0] === 'config').length), 0, 'App must not add page_view or GA4 config events');
      }
      assert.equal(await page.locator('body > noscript').count(), 1);
      assert.equal(await page.evaluate(() => window.dataLayer.filter(item => item.event === 'gtm.js').length), 1);
      assert.equal(requests, expectedRequests, 'Container must load once per document');
      result.routes.push(route);
    };
    await page.goto(base + '/services', { waitUntil: 'networkidle' });
    await check('/services', 1);
    await page.evaluate(() => { window.__documentMarker = 'same-document'; });
    await page.locator('main a[href="/services/cooling"]').first().click();
    await check('/services/cooling', 1);
    await page.locator('main a[href="/services/cooling/ac-repair"]').first().click();
    await check('/services/cooling/ac-repair', 1);
    await page.goBack();
    await check('/services/cooling', 1);
    await page.goForward();
    await check('/services/cooling/ac-repair', 1);
    assert.equal(await page.evaluate(() => window.__documentMarker), 'same-document', 'Links/history must use client navigation');
    await page.reload({ waitUntil: 'networkidle' });
    await check('/services/cooling/ac-repair', 2);
    await page.goto(base + '/admin/login', { waitUntil: 'networkidle' });
    await check('/admin/login', 3);
    assert.deepEqual(result.consoleErrors, []);
    assert.deepEqual(result.pageErrors, []);
    assert.deepEqual(result.gtmResponses, [200, 200, 200]);
    await context.close();

    const noJs = await browser.newContext({ javaScriptEnabled: false });
    let fallbackRequests = 0;
    await noJs.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'www.googletagmanager.com' && url.pathname === '/ns.html') {
        fallbackRequests++;
        assert.equal(url.searchParams.get('id'), gtmId);
        return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Isolated fallback</title>' });
      }
      if (url.origin !== new URL(base).origin) return route.fulfill({ status: 204 });
      return route.continue();
    });
    const noJsPage = await noJs.newPage();
    await noJsPage.goto(base + '/services', { waitUntil: 'networkidle' });
    assert.equal(await noJsPage.locator('body > noscript iframe').getAttribute('src'), `https://www.googletagmanager.com/ns.html?id=${gtmId}`);
    assert.equal(fallbackRequests, 1);
    // Next.js may insert its hidden streaming boundary before authored body content.
    assert.equal(await noJsPage.locator('body > noscript ~ .skip-link').count(), 1);
    await noJs.close();
    result.status = 'passed';
    result.containerRequests = requests;
    result.fallbackRequests = fallbackRequests;
  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
    process.exitCode = 1;
  } finally {
    await browser.close();
    const output = process.env.QA_OUTPUT || 'docs/qa/current/gtm';
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, live ? 'live.json' : 'fixture.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  }
})();
