/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser QA using an isolated local tool installation. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.QA_PLAYWRIGHT || '../node_modules/.qa-tools/node_modules/playwright-core');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3123';
const output = process.env.QA_OUTPUT || path.join('docs/qa/current', process.env.QA_PHASE || 'pages');
const routes = process.env.QA_ROUTES?.split(',') || ['/', '/about', '/brands', '/contact', '/service-areas', '/services', '/reviews',
  ...['appliance-repair', 'cooling', 'heating', 'water-heater-repair'].map(p => '/services/' + p),
  ...['ac-repair', 'ac-installation', 'ac-maintenance', 'ac-replacement'].map(p => '/services/cooling/' + p),
  ...['furnace-repair', 'heat-pumps', 'heating-maintenance', 'boiler-repair'].map(p => '/services/heating/' + p)];
const viewports = { desktop: { width: 1440, height: 900 }, tablet: { width: 768, height: 1024 }, mobile: { width: 390, height: 844 } };
fs.mkdirSync(path.join(output, 'screenshots'), { recursive: true });
function safeUrl(value) {
  try { const u = new URL(value); return u.origin + u.pathname; } catch { return value; }
}
async function observe() {
  window.__qaMetrics = { lcp: null, cls: 0, longTasks: [], interactions: [] };
  for (const type of ['largest-contentful-paint', 'layout-shift', 'longtask', 'event']) {
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (type === 'largest-contentful-paint') window.__qaMetrics.lcp = entry.startTime;
          if (type === 'layout-shift' && !entry.hadRecentInput) window.__qaMetrics.cls += entry.value;
          if (type === 'longtask') window.__qaMetrics.longTasks.push(entry.duration);
          if (type === 'event' && entry.interactionId) window.__qaMetrics.interactions.push({ name: entry.name, duration: entry.duration, interactionId: entry.interactionId });
        }
      }).observe({ type, buffered: true, ...(type === 'event' ? { durationThreshold: 16 } : {}) });
    } catch { /* Browser-specific unsupported metric remains absent. */ }
  }
}
async function scan(browser, name, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: name === 'mobile', hasTouch: name !== 'desktop', reducedMotion: 'no-preference', serviceWorkers: 'block' });
  await context.addInitScript(observe);
  const blockedMutations = [];
  await context.route('**/*', route => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) {
      blockedMutations.push({ method: route.request().method(), url: safeUrl(route.request().url()) });
      return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, status: 'error', message: 'QA intercepted request; no data was sent.' }) });
    }
    return route.continue();
  });
  const results = [];
  for (const url of (process.env.QA_ROUTES ? process.env.QA_ROUTES.split(',') : routes)) {
    const page = await context.newPage();
    const consoleErrors = [], pageErrors = [], failedAssets = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failedAssets.push({ url: safeUrl(response.url()), status: response.status() }); });
    const slug = url === '/' ? 'home' : url.slice(1).replaceAll('/', '__');
    const row = { url, viewport: name, dimensions: viewport, screenshot: `${output}/screenshots/${slug}--${name}.jpg` };
    try {
      const response = await page.goto(base + url, { waitUntil: 'networkidle', timeout: 60000 });
      row.status = response.status();
      await page.evaluate(() => document.fonts.ready);
      // Exercise the real lazy-loading path, then return to the top for screenshots.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * .8) {
          window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60));
        }
        for (const track of document.querySelectorAll('[role="region"][tabindex="0"]')) {
          track.scrollIntoView({ behavior: 'instant', block: 'center' });
          for (let x = 0; x < track.scrollWidth; x += track.clientWidth) {
            track.scrollTo({ left: x, behavior: 'instant' }); await new Promise(r => setTimeout(r, 80));
          }
          track.scrollTo({ left: 0, behavior: 'instant' });
        }
      });
      // Scroll snapping can skip the last carousel card when moving by track width.
      // Bring each rendered image into view and wait for its actual load result.
      for (const img of await page.locator('img').all()) {
        if (!await img.isVisible()) continue;
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(image => new Promise(resolve => {
          if (image.complete) return resolve();
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 5000);
        }));
      }
      await page.evaluate(() => {
        for (const track of document.querySelectorAll('[role="region"][tabindex="0"]')) {
          track.scrollTo({ left: 0, behavior: 'instant' });
        }
      });
      await page.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 12000 }).catch(() => {});
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForFunction(() => window.scrollY === 0);
      await page.waitForTimeout(250);
      row.dom = await page.evaluate(() => {
        const visible = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
        const insideClippedComponent = el => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(p).overflowX)) return true;
          }
          return false;
        };
        return {
          title: document.title, h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          pageWidth: document.documentElement.scrollWidth,
          protrudingContent: [...document.querySelectorAll('h1,h2,h3,p,a,button,input,select,textarea,img')].filter(el => visible(el) && !insideClippedComponent(el) && (el.getBoundingClientRect().right > innerWidth + 1 || el.getBoundingClientRect().left < -1)).map(el => ({ tag: el.tagName, text: el.textContent?.slice(0, 80), className: el.className })).slice(0, 25),
          brokenImages: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => ({ src: new URL(i.currentSrc || i.src, location.href).pathname, alt: i.alt })),
          images: [...document.images].map(i => ({ alt: i.alt, loading: i.loading, width: Math.round(i.getBoundingClientRect().width), naturalWidth: i.naturalWidth, optimized: i.currentSrc.includes('/_next/image') })),
          footerCount: document.querySelectorAll('footer').length,
          footerLinks: [...document.querySelectorAll('footer a')].map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') })),
          phoneLinks: [...document.querySelectorAll('a[href^="tel:"]')].map(a => ({ href: a.getAttribute('href'), accessibleName: a.getAttribute('aria-label') || a.textContent.trim(), visible: visible(a) })),
          visibleTopActions: [...document.querySelectorAll('a[href^="tel:"],button')].filter(el => visible(el) && el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().bottom <= innerHeight).map(el => ({ label: el.getAttribute('aria-label') || el.textContent.trim(), height: Math.round(el.getBoundingClientRect().height) })),
          internalLinks: [...new Set([...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href')))],
          metrics: window.__qaMetrics,
        };
      });
      // Capture before axe, and assert scroll origin so fixed UI is represented accurately.
      await page.screenshot({ path: row.screenshot, fullPage: true, type: 'jpeg', quality: 78, style: 'nextjs-portal { visibility: hidden; }' });
      await page.addScriptTag({ path: process.env.QA_AXE || require.resolve('axe-core') });
      row.accessibility = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
        return { violations: result.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary, html: n.html })) })), incomplete: result.incomplete.map(v => ({ id: v.id, nodes: v.nodes.length })) };
      });
    } catch (error) { row.error = error.message; }
    row.consoleErrors = consoleErrors;
    row.pageErrors = pageErrors;
    row.failedAssets = failedAssets;
    results.push(row);
    fs.writeFileSync(path.join(output, `${name}.json`), JSON.stringify({ browser: browser.version(), results, blockedMutations }, null, 2));
    console.log(name, url, row.error ? 'ERROR ' + row.error : `HTTP ${row.status}; overflow ${row.dom.horizontalOverflow}; broken images ${row.dom.brokenImages.length}; axe ${row.accessibility.violations.length}; console ${consoleErrors.length}`);
    await page.close();
  }
  await context.close();
}
(async () => {
  const executablePath = process.env.QA_BROWSER || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1228/chrome-win64/chrome.exe');
  const browser = await chromium.launch({ headless: true, executablePath });
  try { await Promise.all(Object.entries(viewports).map(([name, viewport]) => scan(browser, name, viewport))); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
