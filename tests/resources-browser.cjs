/* eslint-disable @typescript-eslint/no-require-imports -- Local read-only production/browser verification. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { chromium } = require('../node_modules/.qa-tools/node_modules/playwright-core');
const createLoader = require('./load-ts.cjs');
const { fixture, load: fixtureLoad } = require('./resource-fixture.cjs');
const load = createLoader();
const { resources } = load('src/content/resources/articles.ts');
const { resourceCategories } = load('src/content/resources/categories.ts');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3127';
const output = path.resolve('output/playwright/resources');
fs.mkdirSync(output, { recursive: true });
const report = { http: [], layouts: [], interactions: [], links: [], failures: [] };

async function main() {
  const publicRoutes = ['/resources', ...resourceCategories.map(c => `/resources/category/${c.id}`)];
  for (const route of publicRoutes) {
    const response = await fetch(base + route);
    const html = await response.text();
    assert.equal(response.status, 200, route);
    assert.match(html, /name="robots" content="noindex, follow"/);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(new URL(canonical).pathname, route);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(!html.includes('BlogPosting'));
    for (const draft of resources) assert.ok(!html.includes(draft.slug), `Draft leaked: ${draft.slug}`);
    report.http.push({ route, status: response.status, canonical, noindex: true, draftsExcluded: true });
  }
  for (const route of [...resources.map(a => `/resources/${a.slug}`), '/resources/missing-article', '/resources/category/missing-category', '/resources/README.md']) {
    const response = await fetch(base + route);
    const html = await response.text();
    assert.equal(response.status, 404, route);
    assert.ok(!html.includes('BlogPosting'));
    assert.ok(!html.includes('Editorial draft only'));
    report.http.push({ route, status: response.status });
  }
  const xml = await (await fetch(base + '/sitemap.xml')).text();
  assert.ok(!xml.includes('/resources'));
  report.http.push({ route: '/sitemap.xml', emptyResourceRoutesExcluded: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  report.browser = browser.version();
  const links = new Set();
  try {
    for (const width of [320, 390, 768, 1280, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.route('**/*', route => ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()) ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      for (const route of ['/resources', '/resources/category/hvac-heating']) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await inspect(page, `${route}-${width}`, width, errors, links);
      }
      await page.goto(base + '/resources', { waitUntil: 'networkidle' });
      if (width < 1280) {
        await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
        const drawer = page.getByRole('dialog', { name: 'Site navigation' });
        await drawer.getByRole('link', { name: 'Resources', exact: true }).click();
        await assert.doesNotReject(() => drawer.waitFor({ state: 'hidden' }));
        report.interactions.push({ width, mobileResourcesNavigation: true });
      } else {
        assert.ok(await page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'Resources', exact: true }).isVisible());
      }
      await page.getByRole('main').getByRole('button', { name: 'Book Now', exact: true }).click();
      await page.getByRole('dialog').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      report.interactions.push({ width, bookingOpenedAndClosed: true, noSubmission: true });

      // Test the real server components with synthetic content in browser memory.
      // No application records or public preview routes are created.
      const styles = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(n => n.outerHTML).join(''));
      const { ResourceArticle } = fixtureLoad('src/components/resources/resource-article.tsx');
      const { ResourceListing } = fixtureLoad('src/components/resources/resource-listing.tsx');
      for (const [name, element] of [
        ['article-fixture', React.createElement(ResourceArticle, { article: fixture })],
        ['listing-fixture', React.createElement(ResourceListing, { articles: [fixture, ...[1, 2, 3].map(n => ({ ...fixture, id: `fixture-${n}`, slug: `fixture-${n}` }))] })],
      ]) {
        await page.setContent(`<!doctype html><html lang="en"><head><title>Resource component QA fixture</title>${styles}</head><body>${renderToStaticMarkup(element)}</body></html>`);
        await inspect(page, `${name}-${width}`, width, errors);
        if (name === 'article-fixture') {
          await page.locator('summary').focus();
          await page.keyboard.press('Enter');
          assert.equal(await page.locator('details').getAttribute('open'), '');
          await page.getByRole('navigation', { name: 'Table of contents' }).getByRole('link', { name: 'Details to note', exact: true }).click();
          assert.equal(page.url(), base + '/resources#details');
          report.interactions.push({ width, nativeFaqKeyboard: true, tableOfContents: true });
        }
      }
      await context.close();
    }
    for (const href of links) {
      const url = new URL(href, base);
      if (url.origin !== new URL(base).origin) continue;
      const response = await fetch(url);
      report.links.push({ path: url.pathname, status: response.status });
      assert.ok(response.status < 400, `Broken link: ${url.pathname}`);
    }
  } finally { await browser.close(); }
}

async function inspect(page, name, width, errors, links) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let top = 0; top < document.documentElement.scrollHeight; top += 650) { window.scrollTo(0, top); await new Promise(resolve => setTimeout(resolve, 35)); }
    window.scrollTo(0, 0);
  });
  try {
    await page.waitForFunction(() => [...document.images].every(img => img.complete), undefined, { timeout: 10000 });
  } catch (error) {
    console.error('Image loading diagnostic', await page.evaluate(() => ({ url: location.href, scrollY, height: document.documentElement.scrollHeight, images: [...document.images].map(img => ({ src: img.currentSrc, complete: img.complete, width: img.naturalWidth, top: img.getBoundingClientRect().top, loading: img.loading })) })));
    throw error;
  }
  const dom = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    brokenImages: [...document.images].filter(img => !img.naturalWidth).map(img => img.src),
    h1: document.querySelectorAll('h1').length,
    links: [...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href')),
  }));
  if (links) dom.links.forEach(href => links.add(href));
  await page.addScriptTag({ path: require.resolve('../node_modules/.qa-tools/node_modules/axe-core') });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
  const row = { name, width, overflow: dom.overflow, brokenImages: dom.brokenImages, h1: dom.h1, violations, errors: [...errors] };
  report.layouts.push(row);
  await page.screenshot({ path: path.join(output, name.replaceAll('/', '_') + '.png'), fullPage: true });
  assert.equal(dom.overflow, false, name);
  assert.equal(dom.brokenImages.length, 0, name);
  assert.equal(dom.h1, 1, name);
  assert.deepEqual(violations, [], name);
  assert.deepEqual(errors, [], name);
  console.log(`PASS ${name}: layout, images, axe, console`);
}

main().catch(error => { report.failures.push(error.stack); console.error(error); process.exitCode = 1; }).finally(() => {
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
});
