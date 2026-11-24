/* eslint-disable @typescript-eslint/no-require-imports -- Isolated browser regression tests; never submit a real lead. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('../node_modules/.qa-tools/node_modules/playwright-core');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3128';
const names = ['booking_click', 'form_start', 'form_submit', 'phone_click', 'contact_click', 'service_select'];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || path.join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1243/chrome-win64/chrome.exe') });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  let status = 201, body = { ok: true, status: 'received', requestId: 'PRIVATE_REQUEST_ID' }, networkFailure = false;
  const submitted = [], errors = [];
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin) return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    if (url.pathname === '/api/book-now') {
      submitted.push(route.request().postDataJSON());
      return networkFailure ? route.abort() : route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    }
    if (url.pathname === '/api/chat') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, status: 'answered', reply: { message: 'TEST_REPLY', intent: 'booking', categoryId: 'cooling', safety: 'normal', emergencyKind: null } }) });
    if (!['GET', 'HEAD'].includes(route.request().method())) return route.fulfill({ status: 503, body: '{}' });
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', e => errors.push(e.message));
  const events = () => page.evaluate(names => (window.dataLayer || []).filter(e => names.includes(e.event)), names);
  const count = async name => (await events()).filter(e => e.event === name).length;
  const reset = () => page.evaluate(() => { (window.dataLayer ??= []).length = 0; });
  const visit = async (route = '/') => { await page.goto(base + route, { waitUntil: 'networkidle' }); };
  const open = () => page.locator('header').getByRole('button', { name: 'Book Now', exact: true }).click();
  const fill = async () => {
    await page.locator('#bn-fullName').fill('PRIVATE_CUSTOMER_NAME');
    await page.locator('#bn-phone').fill('5165550199');
    await page.locator('#bn-zip').fill('10001');
    await page.locator('#bn-email').fill('private@example.test');
    await page.locator('#bn-message').fill('PRIVATE_CUSTOMER_MESSAGE');
  };
  const submit = async () => { await page.getByRole('button', { name: 'Send Request', exact: true }).click(); await page.waitForTimeout(350); };
  const results = [];
  async function check(name, fn) {
    if (process.env.QA_ANALYTICS_CHECK && !name.includes(process.env.QA_ANALYTICS_CHECK)) return;
    try { await fn(); results.push({ name, passed: true }); console.log('PASS', name); } catch (e) { results.push({ name, passed: false, error: e.message }); console.log('FAIL', name, e.message); }
  }
  try {
    await check('one CTA and keyboard activation each emit one booking_click; focus is not form_start', async () => {
      await visit(); await reset(); await open();
      assert.equal(await count('booking_click'), 1);
      await page.locator('#bn-fullName').focus(); assert.equal(await count('form_start'), 0);
      await page.keyboard.press('Escape');
      const trigger = page.locator('header').getByRole('button', { name: 'Book Now', exact: true });
      await trigger.focus(); await page.keyboard.press('Enter');
      assert.equal(await count('booking_click'), 2);
    });
    await check('query opening emits no booking_click or service_select; genuine edit starts once', async () => {
      await visit('/?book=1&service=ac-repair&campaign=PRIVATE_TOKEN');
      assert.equal(await count('booking_click'), 0); assert.equal(await count('service_select'), 0);
      await fill(); assert.equal(await count('form_start'), 1);
      await page.locator('#bn-service').selectOption('heating');
      assert.equal(await count('service_select'), 0, 'Synthetic change is not a user selection');
      await page.locator('#bn-service').focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Tab');
      assert.equal(await count('service_select'), 1); assert.equal(await count('form_start'), 1);
    });
    await check('only HTTP 201 + ok true + received produces exactly one form_submit; no PII', async () => {
      for (const scenario of [
        [500, { ok: false, status: 'error', message: 'Failed' }, false, 0],
        [400, { ok: false, status: 'invalid', errors: { phone: 'Invalid' } }, false, 0],
        [503, { ok: false, status: 'not_configured', message: 'Unavailable' }, false, 0],
        [200, { ok: true, status: 'received' }, false, 0],
        [201, { ok: false, status: 'error', message: 'Failed' }, false, 0],
        [201, { ok: true, status: 'other' }, false, 0],
        [201, { ok: true, status: 'received' }, true, 0],
        [201, { ok: true, status: 'received', requestId: 'PRIVATE_REQUEST_ID' }, false, 1],
      ]) {
        [status, body, networkFailure] = scenario;
        await visit(); await open(); await fill(); await submit();
        assert.equal(await count('form_submit'), scenario[3], JSON.stringify(scenario));
        const serialized = JSON.stringify(await events());
        for (const value of ['PRIVATE_', '5165550199', '10001', 'private@example.test', 'requestId', 'campaignToken']) assert.ok(!serialized.includes(value), value);
        await page.waitForTimeout(100); assert.equal(await count('form_submit'), scenario[3]);
      }
      networkFailure = false;
      assert.equal(submitted.at(-1).fullName, 'PRIVATE_CUSTOMER_NAME', 'Booking still receives customer data');
      assert.equal(submitted.at(-1).email, 'private@example.test');
    });
    await check('client validation sends no conversion; phone click does not cancel tel or double count contact', async () => {
      await visit(); await open(); await submit(); assert.equal(await count('form_submit'), 0);
      await page.keyboard.press('Escape'); await reset();
      // Observe defaultPrevented after the app listener. Prevent only in this test to avoid launching a dialer.
      await page.evaluate(() => document.addEventListener('click', e => {
        if (e.target.closest?.('a[href^="tel:"]')) { window.phoneDefaultPrevented = e.defaultPrevented; e.preventDefault(); }
      }, { once: true }));
      const phone = page.locator('header a[href^="tel:"]').first();
      assert.equal(await phone.getAttribute('href'), 'tel:+15165860826'); await phone.click();
      assert.equal(await page.evaluate(() => window.phoneDefaultPrevented), false);
      assert.equal(await count('phone_click'), 1); assert.equal(await count('contact_click'), 0);
      await page.locator('header a[href="/contact"]').first().click(); await page.waitForURL(base + '/contact');
      assert.equal(await count('contact_click'), 1);
      assert.equal(await page.evaluate(() => window.dataLayer.filter(e => e.event === 'page_view').length), 0);
    });
    await check('service picker ignores current value; service links track once across client navigation', async () => {
      await visit(); await reset();
      await page.locator('.workspace-option[aria-pressed="false"]').first().evaluate(el => el.click());
      assert.equal(await count('service_select'), 0, 'Programmatic homepage selection is not a user action');
      await page.locator('.workspace-option[aria-pressed="true"]').click(); assert.equal(await count('service_select'), 0);
      await page.locator('.workspace-option[aria-pressed="false"]').first().click(); assert.equal(await count('service_select'), 1);
      await visit('/services'); await reset();
      await page.locator('main a[href="/services/cooling"]').first().click(); await page.waitForURL(base + '/services/cooling');
      assert.equal(await count('service_select'), 1);
    });
    await check('private and admin pages emit no public events', async () => {
      for (const route of ['/review', '/admin/login']) {
        await visit(route);
        if (await page.locator('header').count()) { await open(); await fill(); }
        assert.deepEqual(await events(), []);
      }
    });
    await check('all shared BookingLink placements emit once and preserve offer/service context', async () => {
      const seen = new Set();
      for (const route of ['/', '/about', '/brands', '/contact', '/service-areas', '/services', '/services/appliance-repair', '/services/cooling', '/services/cooling/ac-repair']) {
        await visit(route);
        const buttons = page.locator('button[data-analytics-placement]');
        for (let i = 0; i < await buttons.count(); i++) {
          const button = buttons.nth(i);
          if (!await button.isVisible()) continue;
          const placement = await button.getAttribute('data-analytics-placement');
          await reset(); await button.click(); await page.locator('#bn-fullName').waitFor();
          assert.equal(await count('booking_click'), 1, `${route} ${placement}`);
          const event = (await events()).find(e => e.event === 'booking_click');
          assert.equal(event.placement, placement); assert.equal(event.initiator, 'booking_cta');
          seen.add(placement); await page.keyboard.press('Escape');
        }
      }
      for (const placement of ['header', 'footer', 'home_offer', 'home_explorer', 'home_pricing', 'home_coverage', 'service_finder', 'service_hero', 'service_offer', 'service_overview', 'service_cta', 'contact_hero', 'contact_cta', 'about_hero', 'about_cta', 'brands_hero', 'brands_cta', 'coverage_hero', 'coverage_directory', 'coverage_cta']) assert.ok(seen.has(placement), placement);
    });
    await check('direct open callers: header menu, other problem, chat quick/action, mobile dock/menu', async () => {
      async function clickAndCheck(trigger, placement, initiator = 'booking_cta') {
        await reset(); await trigger.click(); await page.locator('#bn-fullName').waitFor();
        assert.equal(await count('booking_click'), 1, placement);
        const event = (await events()).find(e => e.event === 'booking_click');
        assert.equal(event.placement, placement); assert.equal(event.initiator, initiator);
        await page.keyboard.press('Escape');
      }
      await visit('/services/cooling');
      await clickAndCheck(page.getByRole('button', { name: /^Other Something else/ }), 'other_problem');
      await page.locator('header').getByRole('button', { name: 'Services', exact: true }).click();
      await clickAndCheck(page.locator('#services-mega-menu').getByRole('button', { name: 'Book Now' }), 'header_menu');
      await page.getByRole('button', { name: 'Open Apex Assistant' }).click();
      await clickAndCheck(page.getByRole('button', { name: 'Book a service', exact: true }), 'chat_quick', 'chat_action');
      await page.getByRole('button', { name: 'Open Apex Assistant' }).click();
      await page.getByRole('button', { name: 'AC not cooling', exact: true }).click();
      await clickAndCheck(page.getByRole('button', { name: 'Book Cooling Service', exact: true }), 'chat_action', 'chat_action');
      await page.setViewportSize({ width: 390, height: 844 });
      await clickAndCheck(page.locator('.dock-book'), 'mobile_dock');
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await clickAndCheck(page.locator('button[data-analytics-placement="header_mobile"]'), 'header_mobile');
      await page.setViewportSize({ width: 1440, height: 1000 });
    });
    await check('every public phone placement emits once without cancelling the dialer link', async () => {
      const seen = new Set();
      async function inspectPhones() {
        await page.evaluate(() => {
          if (window.phoneTestInstalled) return;
          window.phoneTestInstalled = true;
          document.addEventListener('click', e => {
            if (e.target.closest?.('a[href^="tel:"]')) { window.phoneDefaultPrevented = e.defaultPrevented; e.preventDefault(); }
          });
        });
        const links = page.locator('a[href^="tel:"]');
        for (let i = 0; i < await links.count(); i++) {
          const link = links.nth(i);
          if (!await link.isVisible() || await link.evaluate(el => Boolean(el.closest('[inert]')))) continue;
          // Modal overlays make other page links non-interactive even without inert.
          if (await page.getByRole('dialog').count() && !await link.evaluate(el => Boolean(el.closest('[role="dialog"]')))) continue;
          await reset(); await link.click();
          assert.equal(await link.getAttribute('href'), 'tel:+15165860826');
          assert.equal(await page.evaluate(() => window.phoneDefaultPrevented), false);
          assert.equal(await count('phone_click'), 1); assert.equal(await count('contact_click'), 0);
          seen.add((await events())[0].placement);
        }
      }
      for (const route of ['/', '/contact', '/services/cooling/ac-repair']) { await visit(route); await inspectPhones(); }
      await open(); await fill(); await submit(); await inspectPhones(); await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Open Apex Assistant' }).click(); await inspectPhones();
      await page.getByRole('button', { name: 'AC not cooling', exact: true }).click();
      await page.getByRole('button', { name: 'Book Cooling Service' }).waitFor(); await inspectPhones();
      await visit(); await page.setViewportSize({ width: 390, height: 844 }); await inspectPhones();
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click(); await inspectPhones();
      for (const placement of ['header', 'header_menu', 'footer', 'mobile_dock', 'home_explorer', 'home_pricing', 'home_expertise', 'service_hero', 'service_cta', 'booking_form', 'chat_quick', 'chat_action', 'contact_hero', 'contact_details', 'contact_cta']) assert.ok(seen.has(placement), placement);
    });
    assert.deepEqual(errors, [], 'No browser runtime errors');
    assert.ok(results.length, 'At least one scenario must run');
    console.log(JSON.stringify({ results, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length }, null, 2));
    if (results.some(r => !r.passed)) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
