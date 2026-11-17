/* eslint-disable @typescript-eslint/no-require-imports -- Standalone local QA. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.QA_PLAYWRIGHT || '../node_modules/.qa-tools/node_modules/playwright-core');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3123';
const output = process.env.QA_OUTPUT || `docs/qa/current/${process.env.QA_PHASE || 'interactions'}`;
fs.mkdirSync(output, { recursive: true });
const results = [];
const viewports = { desktop: { width: 1440, height: 900 }, tablet: { width: 768, height: 1024 }, mobile: { width: 390, height: 844 } };
async function run(browser, viewportName, viewport) {
  const context = await browser.newContext({ viewport, isMobile: viewportName === 'mobile', hasTouch: viewportName !== 'desktop', serviceWorkers: 'block' });
  let mode = 'success';
  const payloads = [], blocked = [], consoleErrors = [], pageErrors = [];
  await context.route('**/*', async route => {
    const request = route.request();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method())) return route.continue();
    blocked.push({ method: request.method(), path: new URL(request.url()).pathname });
    if (new URL(request.url()).pathname !== '/api/book-now') return route.fulfill({ status: 503, body: '{}' });
    payloads.push(request.postDataJSON());
    if (mode === 'network') return route.abort('failed');
    if (mode === 'success') await new Promise(resolve => setTimeout(resolve, 900));
    const response = mode === 'success' ? { ok: true, status: 'received', requestId: 'qa-local-only' }
      : mode === 'invalid' ? { ok: false, status: 'invalid', errors: { phone: 'QA server validation: check the phone number.' } }
      : mode === 'unavailable' ? { ok: false, status: 'not_configured', message: 'Online submission is unavailable right now. Apex has not received this request.' }
      : { ok: false, status: 'error', message: 'QA simulated server failure. No request was sent.' };
    return route.fulfill({ status: mode === 'success' ? 201 : mode === 'invalid' ? 400 : 503, contentType: 'application/json', body: JSON.stringify(response) });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  const screenshot = async label => {
    const file = `${output}/${label}--${viewportName}.png`;
    await page.screenshot({ path: file, animations: 'disabled', style: 'nextjs-portal { visibility: hidden; }' });
    return file;
  };
  async function check(name, fn) {
    if (process.env.QA_CHECK && !name.includes(process.env.QA_CHECK)) return;
    const row = { viewport: viewportName, name };
    try { row.details = await fn(); row.pass = true; }
    catch (error) { row.pass = false; row.error = error.message; row.screenshot = await screenshot('failure-' + name.replaceAll(/[^a-z0-9]+/gi, '-')); }
    results.push(row);
    fs.writeFileSync(`${output}/interactions.json`, JSON.stringify({ results, payloads, blocked, consoleErrors, pageErrors }, null, 2));
    console.log(viewportName, row.pass ? 'PASS' : 'FAIL', name, row.error || '');
  }
  await check('navigation and overview links', async () => {
    await page.goto(base, { waitUntil: 'networkidle' });
    if (viewportName === 'desktop') {
      const trigger = page.locator('header').getByRole('button', { name: 'Services', exact: true });
      await trigger.click();
      assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
      await screenshot('navigation-open');
      await page.keyboard.press('Escape');
      assert.ok(await trigger.evaluate(el => el === document.activeElement));
      await trigger.click();
      await page.locator('#services-mega-menu').getByRole('link', { name: 'Cooling', exact: true }).click();
    } else {
      const trigger = page.getByRole('button', { name: 'Open navigation', exact: true });
      await trigger.click();
      const menu = page.getByRole('dialog', { name: 'Site navigation' });
      await menu.getByRole('button', { name: 'Cooling', exact: true }).click();
      await screenshot('navigation-open');
      await menu.getByRole('link', { name: 'Cooling overview' }).click();
      assert.equal(await page.getByRole('dialog').count(), 0);
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      await trigger.click();
      await page.keyboard.press('Shift+Tab');
      assert.ok(await page.evaluate(() => Boolean(document.activeElement.closest('[role="dialog"]'))));
      await page.keyboard.press('Escape');
      assert.ok(await trigger.evaluate(el => el === document.activeElement));
    }
    await page.waitForURL('**/services/cooling');
    return { navigatedTo: new URL(page.url()).pathname };
  });
  await check('3D service selection, camera and reduced motion', async () => {
    await page.goto(base, { waitUntil: 'networkidle' });
    const explorer = page.locator('.home-explorer');
    for (const label of ['Cooling', 'Heating', 'Hot water', 'Appliances']) {
      const button = explorer.getByRole('button', { name: label });
      await button.click(); assert.equal(await button.getAttribute('aria-pressed'), 'true');
      assert.equal(await explorer.locator('.house-unit-active').count(), 1);
    }
    let cameraChanged = false;
    if (viewportName !== 'mobile') {
      const before = await page.locator('.house-world').evaluate(el => getComputedStyle(el).transform);
      await explorer.getByRole('button', { name: 'Turn the home' }).click();
      await page.waitForTimeout(700);
      cameraChanged = before !== await page.locator('.house-world').evaluate(el => getComputedStyle(el).transform);
      assert.ok(cameraChanged);
    } else assert.equal(await explorer.getByRole('button', { name: 'Turn the home' }).isVisible(), false);
    await screenshot('home-explorer');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const duration = await page.locator('.house-world').evaluate(el => getComputedStyle(el).transitionDuration);
    assert.ok(parseFloat(duration) < .001, duration);
    await explorer.getByRole('button', { name: 'Cooling' }).click();
    assert.equal(await explorer.getByRole('link').getAttribute('href'), '/services/cooling');
    await screenshot('reduced-motion');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    return { cameraChanged, reducedMotionTransition: duration };
  });
  await check('pricing phone stays on one line', async () => {
    await page.goto(base, { waitUntil: 'networkidle' });
    const section = page.locator('section').filter({ hasText: 'Service call pricing' });
    const phone = section.locator('a[href^="tel:"]');
    await phone.scrollIntoViewIfNeeded();
    const measure = await phone.evaluate(el => {
      const node = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      const range = document.createRange(); range.selectNode(node);
      return { textLines: range.getClientRects().length, height: el.getBoundingClientRect().height };
    });
    await screenshot('pricing');
    assert.equal(measure.textLines, 1);
    return measure;
  });
  await check('service call text stays clear of chat launcher', async () => {
    await page.goto(base, { waitUntil: 'networkidle' });
    const phone = page.locator('section[aria-labelledby="services-grid-heading"] a[href^="tel:"]');
    await phone.evaluate(el => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - innerHeight + 72, behavior: 'instant' }));
    const overlap = await phone.evaluate(el => {
      const node = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      const range = document.createRange(); range.selectNode(node);
      const a = range.getBoundingClientRect();
      const b = document.querySelector('[aria-label="Open Apex Assistant"]').getBoundingClientRect();
      return { width: Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), height: Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) };
    });
    await screenshot('service-call-chat-clearance');
    assert.equal(overlap.width * overlap.height, 0);
    return overlap;
  });
  await check('service category CTA labels stay on one line', async () => {
    const measurements = [];
    for (const route of ['/services/appliance-repair', '/services/cooling', '/services/heating', '/services/water-heater-repair', '/services/heating/heating-maintenance']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const section = page.locator('main section').last();
      await section.scrollIntoViewIfNeeded();
      const labels = await section.locator('a[href^="tel:"],button').evaluateAll(els => els.map(el => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const rects = [];
        while (walker.nextNode()) {
          if (!walker.currentNode.textContent.trim()) continue;
          const range = document.createRange(); range.selectNode(walker.currentNode);
          rects.push(...range.getClientRects());
        }
        return { label: el.textContent.trim(), lines: new Set(rects.map(r => Math.round(r.top))).size };
      }));
      await screenshot('service-cta-' + route.split('/').pop());
      measurements.push({ route, labels });
    }
    assert.ok(measurements.every(m => m.labels.length >= 2 && m.labels.every(l => l.lines === 1)), JSON.stringify(measurements));
    return measurements;
  });
  await check('contact CTA and mobile sticky booking entry', async () => {
    await page.goto(base + '/contact', { waitUntil: 'networkidle' });
    await page.locator('main').getByRole('button', { name: 'Book Now', exact: true }).first().click();
    await page.locator('#bn-fullName').waitFor();
    await screenshot('contact-booking-entry');
    await page.keyboard.press('Escape');
    if (viewportName === 'mobile') {
      const sticky = page.locator('div.fixed.inset-x-0.bottom-0');
      await sticky.getByRole('button', { name: 'Book Now', exact: true }).click();
      await page.locator('#bn-fullName').waitFor();
      await page.keyboard.press('Escape');
      assert.ok(await sticky.getByRole('button', { name: 'Book Now', exact: true }).evaluate(el => el === document.activeElement));
    }
    return { contactEntry: true, mobileStickyEntry: viewportName === 'mobile' };
  });
  await check('booking focus trap, validation and comfortable controls', async () => {
    await page.goto(base + '/contact', { waitUntil: 'networkidle' });
    const trigger = page.locator('header').getByRole('button', { name: 'Book Now', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: "Tell us what's going on." });
    assert.ok(await dialog.getByRole('button', { name: 'Close', exact: true }).evaluate(el => el === document.activeElement));
    await page.keyboard.press('Shift+Tab');
    assert.ok(await dialog.getByRole('button', { name: 'Send Request' }).evaluate(el => el === document.activeElement));
    await page.keyboard.press('Tab');
    assert.ok(await dialog.getByRole('button', { name: 'Close', exact: true }).evaluate(el => el === document.activeElement));
    const controls = await dialog.locator('input:not([type="checkbox"]),select,textarea').evaluateAll(els => els.map(el => ({ id: el.id, size: parseFloat(getComputedStyle(el).fontSize), height: el.getBoundingClientRect().height })));
    assert.ok(controls.every(c => c.size >= 16 && c.height >= 48));
    await dialog.locator('.overflow-y-auto').evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }));
    await screenshot('booking-empty');
    const count = payloads.length;
    await dialog.getByRole('button', { name: 'Send Request' }).click();
    await page.waitForFunction(() => document.activeElement?.id === 'bn-fullName');
    assert.equal(payloads.length, count);
    await screenshot('booking-validation');
    await page.locator('#bn-fullName').fill('QA Fixture');
    await page.locator('#bn-phone').fill('-------');
    await page.locator('#bn-zip').fill('123');
    await page.locator('#bn-message').fill('Synthetic local UI check only.');
    await dialog.getByRole('button', { name: 'Send Request' }).click();
    assert.equal(await page.locator('#bn-phone').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('#bn-zip').getAttribute('aria-invalid'), 'true');
    assert.equal(payloads.length, count);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.ok(await trigger.evaluate(el => el === document.activeElement));
    return { controls, blockedInvalidSubmissions: true };
  });
  for (const scenario of ['success', 'error', 'unavailable', 'network', 'invalid']) {
    await check('booking ' + scenario + ' response', async () => {
      await page.goto(base + '/contact', { waitUntil: 'networkidle' });
      mode = scenario;
      await page.locator('header').getByRole('button', { name: 'Book Now', exact: true }).click();
      await page.locator('#bn-service').selectOption('ac-repair');
      await page.locator('#bn-fullName').fill('QA Fixture');
      await page.locator('#bn-phone').fill('(202) 555-0147');
      await page.locator('#bn-zip').fill('06810');
      await page.locator('#bn-message').fill('Synthetic local UI check only.');
      await page.getByRole('button', { name: 'Send Request' }).click();
      if (scenario === 'success') {
        await page.getByRole('button', { name: 'Sending' }).waitFor();
        assert.ok(await page.getByRole('button', { name: 'Sending' }).isDisabled());
        await screenshot('booking-loading');
        await page.getByRole('heading', { name: 'Request received.' }).waitFor();
        assert.ok(await page.getByRole('heading', { name: 'Request received.' }).evaluate(el => document.activeElement === el));
      } else if (scenario === 'network') {
        await page.getByRole('alert').filter({ hasText: "couldn't confirm" }).waitFor();
        assert.ok(await page.getByRole('button', { name: 'Send Request' }).isEnabled());
      } else if (scenario === 'invalid') {
        await page.getByText('QA server validation: check the phone number.').waitFor();
        await page.waitForFunction(() => document.activeElement?.id === 'bn-phone');
      } else await page.getByRole('heading', { name: "We couldn't send this." }).waitFor();
      const payload = payloads.at(-1);
      assert.equal(payload.zipCode, '06810'); assert.equal(payload.serviceId, 'ac-repair'); assert.equal(payload.categoryId, 'cooling');
      assert.equal(payload.serviceTextConsent, false);
      await screenshot('booking-' + scenario);
      await page.keyboard.press('Escape');
      return { intercepted: true, payloadService: payload.serviceId, zipPreserved: payload.zipCode };
    });
  }
  await check('keyboard skip link and visible focus', async () => {
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    assert.ok(await page.locator('.skip-link').evaluate(el => document.activeElement === el));
    const focus = await page.locator('.skip-link').evaluate(el => ({ outlineStyle: getComputedStyle(el).outlineStyle, outlineWidth: getComputedStyle(el).outlineWidth, top: el.getBoundingClientRect().top }));
    assert.ok(focus.top >= 0 && parseFloat(focus.outlineWidth) >= 2);
    await screenshot('keyboard-focus');
    await page.keyboard.press('Enter');
    assert.ok(page.url().endsWith('#main-content'));
    return focus;
  });
  await check('service preselection and modal accessibility', async () => {
    await page.goto(base + '/?book=1&service=furnace-repair', { waitUntil: 'networkidle' });
    await page.locator('#bn-service').waitFor();
    assert.equal(await page.locator('#bn-service').inputValue(), 'furnace-repair');
    await page.addScriptTag({ path: require.resolve('axe-core') });
    const violations = await page.evaluate(async () => (await window.axe.run('[role="dialog"]', { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
    await screenshot('booking-preselected');
    assert.deepEqual(violations, []);
    return { selected: 'furnace-repair', violations };
  });
  await check('faq expansion and results carousel', async () => {
    await page.goto(base, { waitUntil: 'networkidle' });
    const question = page.getByRole('button', { name: 'Does Apex Home Services serve my area?' });
    if (await question.count()) {
      await question.click(); assert.equal(await question.getAttribute('aria-expanded'), 'true');
      await question.click(); assert.equal(await question.getAttribute('aria-expanded'), 'false');
    } else {
      const summary = page.locator('summary').filter({ hasText: 'Does Apex Home Services serve my area?' });
      await summary.click(); assert.ok(await summary.evaluate(el => el.parentElement.open));
      await summary.click(); assert.equal(await summary.evaluate(el => el.parentElement.open), false);
    }
    const track = page.getByRole('region', { name: 'Apex results' });
    await track.scrollIntoViewIfNeeded();
    const next = track.locator('..').getByRole('button', { name: /next/i });
    await next.click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Apex results"]').scrollLeft > 0);
    const scrollLeft = await track.evaluate(el => el.scrollLeft);
    await screenshot('results-carousel');
    return { scrollLeft };
  });
  fs.writeFileSync(`${output}/interaction-${viewportName}.json`, JSON.stringify({ browser: browser.version(), results: results.filter(r => r.viewport === viewportName), payloads, blocked, consoleErrors, pageErrors }, null, 2));
  await context.close();
}
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1228/chrome-win64/chrome.exe') });
  try { for (const [name, viewport] of Object.entries(viewports)) await run(browser, name, viewport); }
  finally { await browser.close(); }
  console.log('TOTAL', results.length, 'FAILED', results.filter(r => !r.pass).length);
  if (results.some(r => !r.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
