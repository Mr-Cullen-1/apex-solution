/* eslint-disable @typescript-eslint/no-require-imports -- Local browser QA. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.QA_PLAYWRIGHT || '../node_modules/.qa-tools/node_modules/playwright-core');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3123';
const output = process.env.QA_OUTPUT || 'docs/qa/current/pages';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1228/chrome-win64/chrome.exe') });
  const results = [], destinations = [];
  try {
    for (const viewport of ['desktop', 'tablet', 'mobile']) {
      const inventory = JSON.parse(fs.readFileSync(`${output}/${viewport}.json`));
      assert.equal(inventory.results.length, 19, 'Run the full page sweep first');
      const context = await browser.newContext({ viewport: inventory.results[0].dimensions, isMobile: viewport === 'mobile', serviceWorkers: 'block' });
      await context.route('**/*', route => ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()) ? route.continue() : route.abort());
      await context.addInitScript(() => {
        window.__phoneClicks = [];
        document.addEventListener('click', event => {
          const anchor = event.target.closest('a[href^="tel:"]');
          if (anchor) { event.preventDefault(); event.stopImmediatePropagation(); window.__phoneClicks.push(anchor.getAttribute('href')); }
        }, true);
      });
      const page = await context.newPage();
      page.setDefaultTimeout(5000);
      for (const item of inventory.results) {
        const row = { url: item.url, viewport };
        try {
          assert.equal(item.dom.footerCount, 1);
          assert.deepEqual(item.dom.footerLinks, inventory.results[0].dom.footerLinks);
          assert.ok(item.dom.phoneLinks.every(l => l.href === 'tel:+15165860826' && l.accessibleName));
          await page.goto(base + item.url, { waitUntil: 'networkidle' });
          const phones = page.locator('a[href^="tel:"]');
          let visible = 0;
          for (const phone of await phones.all()) {
            if (await phone.isVisible()) { await phone.click(); visible++; }
          }
          const clicks = await page.evaluate(() => window.__phoneClicks);
          assert.equal(clicks.length, visible);
          assert.ok(clicks.every(href => href === 'tel:+15165860826'));
          row.visiblePhoneClicks = visible; row.totalPhoneLinks = item.dom.phoneLinks.length;
          row.pass = true;
        } catch (error) {
          row.pass = false; row.error = error.message;
          row.screenshot = `${output}/links-failure-${item.url.replaceAll('/', '_') || 'home'}--${viewport}.png`;
          await page.screenshot({ path: row.screenshot });
        }
        results.push(row);
      }
      if (viewport === 'desktop') {
        for (const href of new Set(inventory.results.flatMap(item => item.dom.internalLinks))) {
          const response = await page.goto(base + href, { waitUntil: 'networkidle' });
          destinations.push({ href, status: response.status(), finalPath: new URL(page.url()).pathname });
        }
      }
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(`${output}/links.json`, JSON.stringify({ results, destinations, note: 'Phone clicks were prevented in capture phase; no dialer or call was opened. All non-read requests blocked.' }, null, 2));
  console.log('Phone/footer cases:', results.length, 'failures:', results.filter(r => !r.pass).length, 'phone clicks:', results.reduce((n, r) => n + (r.visiblePhoneClicks || 0), 0), 'internal destinations:', destinations.length);
  if (results.some(r => !r.pass) || destinations.some(r => r.status >= 400)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
