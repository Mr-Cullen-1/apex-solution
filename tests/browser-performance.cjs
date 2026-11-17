/* eslint-disable @typescript-eslint/no-require-imports -- Isolated local browser measurements. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.QA_PLAYWRIGHT || '../node_modules/.qa-tools/node_modules/playwright-core');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3123';
const output = process.env.QA_PERFORMANCE_OUTPUT || 'docs/qa/current/performance.json';
fs.mkdirSync(path.dirname(output), { recursive: true });
const samples = [];
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1228/chrome-win64/chrome.exe') });
  try {
    for (const profile of ['desktop', 'mobile-throttled']) for (const url of ['/', '/services/cooling/ac-repair']) for (let sample = 1; sample <= 3; sample++) {
      const mobile = profile === 'mobile-throttled';
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile, serviceWorkers: 'block' });
      await context.route('**/*', route => ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()) ? route.continue() : route.abort());
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      if (mobile) {
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await cdp.send('Network.enable');
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1600000 / 8, uploadThroughput: 750000 / 8, connectionType: 'cellular4g' });
      }
      await page.addInitScript(() => {
        window.__perf = { lcp: null, lcpElement: null, cls: 0, longTasks: [], interactions: {} };
        let sessionStart = 0, previousShift = 0, sessionValue = 0;
        new PerformanceObserver(list => { for (const e of list.getEntries()) { window.__perf.lcp = e.startTime; window.__perf.lcpElement = e.element?.tagName + ':' + (e.element?.textContent || e.element?.getAttribute('alt') || '').slice(0, 100); } }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) {
          if (e.startTime - previousShift < 1000 && e.startTime - sessionStart < 5000) sessionValue += e.value;
          else { sessionStart = e.startTime; sessionValue = e.value; }
          previousShift = e.startTime; window.__perf.cls = Math.max(window.__perf.cls, sessionValue);
        } }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) window.__perf.longTasks.push(e.duration); }).observe({ type: 'longtask', buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (e.interactionId) window.__perf.interactions[e.interactionId] = Math.max(window.__perf.interactions[e.interactionId] || 0, e.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
      });
      await page.goto(base + url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      await page.locator('header').getByRole('button', { name: 'Book Now', exact: true }).click();
      await page.locator('#bn-fullName').fill('QA Fixture');
      await page.locator('#bn-service').selectOption('cooling');
      await page.keyboard.press('Escape');
      let cameraFrames = null;
      if (!mobile && url === '/') {
        await page.getByRole('button', { name: 'Rotate home illustration', exact: true }).click();
        cameraFrames = await page.evaluate(() => new Promise(resolve => {
          const frames = []; let previous; let start;
          function frame(now) { if (previous) frames.push(now - previous); previous = now; start ??= now; if (now - start < 900) requestAnimationFrame(frame); else resolve(frames); }
          requestAnimationFrame(frame);
        }));
      }
      await page.waitForTimeout(500);
      const data = await page.evaluate(() => ({ ...window.__perf, resourceBytes: performance.getEntriesByType('resource').reduce((sum, e) => sum + e.transferSize, 0), resources: performance.getEntriesByType('resource').length, navigation: performance.getEntriesByType('navigation').map(e => ({ ttfb: e.responseStart, domContentLoaded: e.domContentLoadedEventEnd, load: e.loadEventEnd })) }));
      const row = { profile, url, sample, ...data, cameraFrames, observedInteractionMax: Math.max(0, ...Object.values(data.interactions)) };
      samples.push(row);
      fs.writeFileSync(output, JSON.stringify({ browser: browser.version(), note: 'Local production build. Synthetic timings; observed interaction maximum is a lab diagnostic, not field INP. New browser context per sample. Throttled profile: 4x CPU, 1.6 Mbps down, 0.75 Mbps up, 150ms latency.', samples }, null, 2));
      console.log(profile, url, sample, 'LCP', row.lcp === null ? 'unavailable' : Math.round(row.lcp), 'CLS', row.cls.toFixed(4), 'interaction', row.observedInteractionMax);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
