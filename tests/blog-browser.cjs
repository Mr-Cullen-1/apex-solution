/* eslint-disable @typescript-eslint/no-require-imports -- Read-only local browser QA using existing QA dependencies. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('../node_modules/.qa-tools/node_modules/playwright-core');
const load = require('./load-ts.cjs')();
const source = require('../src/content/resources/client-articles-source.json');
const coverage = require('../src/content/service-coverage-data.json');
const { getPublishedResources } = load('src/content/resources/index.ts');
const { resourceCategories, resourceCategoryPath } = load('src/content/resources/categories.ts');
const { siteUrl } = load('src/content/site-url.ts');
const articles = getPublishedResources();
const categories = resourceCategories.filter(category => articles.some(article => article.category === category.id));
const base = new URL(process.env.QA_BASE_URL || 'http://127.0.0.1:3127');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'QA only runs against a local server.');
const output = path.resolve('output/blog-qa');
const focused = process.env.QA_SCOPE === 'focused';
const report = { startedAt: new Date().toISOString(), base: base.origin, scope: focused ? 'focused-category-filter-zip' : 'full', html: [], layouts: [], interactions: [], links: [], warnings: [], blockedRequests: [], failures: [] };
const internalLinks = new Set();
const normalize = text => text.replace(/\(opens in a new tab\)/g, '').replace(/\s+/g, ' ').trim();
const briefError = error => error.stack || String(error);

async function check(name, action) {
  try { await action(); console.log(`PASS ${name}`); }
  catch (error) { report.failures.push({ name, error: briefError(error) }); console.error(`FAIL ${name}: ${error.message}`); }
}

async function localGet(href) {
  let url = new URL(href, base);
  assert.equal(url.origin, base.origin, 'External HTTP fetch is prohibited.');
  for (let redirects = 0; redirects < 6; redirects++) {
    const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(30000) });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const next = new URL(response.headers.get('location'), url);
    // Production-host redirects must be verified using the same local deployment.
    assert.ok([base.origin, new URL(siteUrl).origin].includes(next.origin), `Unexpected redirect: ${next}`);
    url = new URL(next.pathname + next.search, base);
  }
  throw new Error(`Redirect loop: ${href}`);
}

function sourceLinks(value) {
  if (!value || typeof value !== 'object') return [];
  return [...(typeof value.href === 'string' ? [value.href] : []), ...Object.values(value).flatMap(sourceLinks)];
}

async function auditHtml(page, route, original) {
  const response = await localGet(route);
  assert.equal(response.status, 200, route);
  const raw = await response.text();
  const seo = await page.evaluate(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return {
      title: doc.title,
      description: doc.querySelector('meta[name="description"]')?.content,
      canonical: doc.querySelector('link[rel="canonical"]')?.href,
      robots: [...doc.querySelectorAll('meta[name="robots"]')].map(node => node.content),
      h1: [...doc.querySelectorAll('h1')].map(node => node.textContent),
      schema: [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent)),
    };
  }, raw);
  assert.equal(seo.canonical, new URL(route, siteUrl).href);
  assert.equal(seo.h1.length, 1);
  assert.ok(seo.robots.every(value => !/noindex/i.test(value)), route);
  assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''));
  if (original) {
    assert.equal(seo.title, original.seoTitle);
    assert.equal(seo.description, original.metaDescription);
    assert.equal(seo.h1[0], original.title);
    const schema = seo.schema.flatMap(item => item['@graph'] || [item]).find(item => item['@type'] === 'BlogPosting');
    assert.ok(schema, 'BlogPosting schema missing');
    assert.equal(schema.headline, original.title);
    assert.equal(schema.mainEntityOfPage, seo.canonical);
    assert.equal(schema.author['@type'], 'Organization');
    assert.equal(schema.author.name, 'Apex Home Services');
    assert.equal(schema.author['@id'], schema.publisher['@id']);
    assert.equal(schema.datePublished, '2026-11-28');
  }
  report.html.push({ route, status: response.status, ...seo });
}

async function inspect(page, label, screenshot = false) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let top = 0; top < document.documentElement.scrollHeight; top += 800) {
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  // Horizontal carousels intentionally leave offscreen lazy images unrequested.
  // Scrolling the document above loads every image in its visible horizontal column.
  await page.waitForFunction(() => [...document.images].every(img => {
    const rect = img.getBoundingClientRect();
    return img.complete || !img.checkVisibility() || (img.loading === 'lazy' && (rect.right <= 0 || rect.left >= innerWidth));
  }), undefined, { timeout: 15000 });
  const dom = await page.evaluate(() => ({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll('main *, header *, footer *')].filter(node => {
      const rect = node.getBoundingClientRect();
      return rect.width && (rect.right > innerWidth + 1 || rect.left < -1) && !node.closest('.resource-table-wrap') && getComputedStyle(node).position !== 'absolute';
    }).slice(0, 12).map(node => ({ tag: node.tagName, className: node.className, text: node.textContent.slice(0, 70) })),
    images: [...document.images].map(img => {
      const rect = img.getBoundingClientRect();
      return { src: img.currentSrc || img.src, width: img.naturalWidth, alt: img.getAttribute('alt'), deferred: !img.checkVisibility() || (img.loading === 'lazy' && (rect.right <= 0 || rect.left >= innerWidth)) };
    }),
    tables: [...document.querySelectorAll('.resource-table-wrap')].map(node => ({ tabIndex: node.tabIndex, role: node.getAttribute('role'), label: node.getAttribute('aria-label'), width: node.clientWidth, contentWidth: node.scrollWidth })),
    controls: [...document.querySelectorAll('#blog-search, #blog-category, input[autocomplete="postal-code"]')].map(node => ({ id: node.id, height: node.getBoundingClientRect().height, width: node.getBoundingClientRect().width })),
    h1: document.querySelectorAll('h1').length,
    links: [...document.querySelectorAll('a[href]')].map(node => node.getAttribute('href')),
  }));
  for (const href of dom.links) {
    if (href.startsWith('/') && !href.startsWith('//')) internalLinks.add(href.split('#')[0]);
    else if (href.startsWith(siteUrl)) internalLinks.add(new URL(href).pathname);
  }
  await page.addScriptTag({ path: require.resolve('../node_modules/.qa-tools/node_modules/axe-core') });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => node.target) })));
  report.layouts.push({ label, ...dom, violations });
  if (screenshot) {
    await page.screenshot({ path: path.join(output, `${label}.png`), fullPage: true });
    await page.screenshot({ path: path.join(output, `${label}-viewport.png`) });
  }
  assert.ok(dom.scrollWidth <= dom.viewport + 1, `Horizontal overflow: ${dom.scrollWidth}/${dom.viewport}`);
  assert.equal(dom.h1, 1);
  assert.deepEqual(dom.images.filter(img => (!img.width && !img.deferred) || img.alt === null), [], 'Missing visible image pixels/alt');
  assert.ok(dom.controls.every(control => control.height >= 44 && control.width > 0), 'Controls need visible touch targets');
  assert.ok(dom.tables.every(table => table.tabIndex === 0 && table.role === 'region' && table.label), 'Scrollable tables need keyboard access and labels');
  assert.deepEqual(violations, [], 'axe WCAG violations');
}

async function filterTest(page, width) {
  await page.goto(new URL('/blog', base).href, { waitUntil: 'networkidle' });
  const search = page.getByLabel('Search articles', { exact: true });
  const category = page.getByLabel('Filter by category', { exact: true });
  const cards = () => page.locator('[data-blog-card]').evaluateAll(nodes => nodes.map(node => node.dataset.blogCard).sort());
  assert.equal(await page.locator('[data-blog-card]').count(), 12);
  assert.equal(await page.locator('section[aria-labelledby="resource-featured"]').count(), 1);
  const original = source.articles[0];
  for (const query of [original.title, original.keywords[1]]) {
    await search.fill(query);
    await page.waitForFunction(slug => [...document.querySelectorAll('[data-blog-card]')].some(node => node.dataset.blogCard === slug), original.slug);
    assert.ok((await cards()).includes(original.slug));
  }
  await search.fill('ice');
  const iceCategory = articles.find(article => article.slug === 'ice-machine-not-making-ice').category;
  await category.selectOption(iceCategory);
  assert.deepEqual(await cards(), articles.filter(article => article.category === iceCategory && `${article.title} ${[article.primaryKeyword, ...article.secondaryKeywords].join(' ')}`.toLowerCase().includes('ice')).map(article => article.slug).sort());
  await search.fill('zzzx-no-matching-guide-zzzx');
  await page.getByRole('heading', { name: 'No articles found', exact: true }).waitFor();
  assert.deepEqual(await cards(), []);
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  assert.equal(await search.inputValue(), '');
  assert.equal(await category.inputValue(), '');
  assert.equal(await page.locator('[data-blog-card]').count(), 12);
  assert.equal(await page.locator('section[aria-labelledby="resource-featured"]').count(), 1);
  report.interactions.push({ width, searchTitleAndKeyword: true, combinedFilter: true, emptyState: true, reset: true });
}

async function articleTest(page, original, width) {
  await page.goto(new URL(original.urlSlug, base).href, { waitUntil: 'networkidle' });
  const text = await page.locator('.resource-prose').innerText();
  assert.equal(normalize(text), normalize(original.bodyPlainText), `Source body differs: ${original.slug}`);
  const hrefs = await page.locator('.resource-prose a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
  for (const href of sourceLinks(original.blocks)) assert.ok(hrefs.includes(href), `Missing source URL: ${href}`);
  assert.ok(await page.locator('#resource-related a[href^="/blog/"]').count(), 'Related articles missing');
  assert.ok(await page.locator('a[href="tel:+15165860826"]').count(), 'Approved phone CTA missing');
  await inspect(page, `${original.slug}-${width}`, original === source.articles[0]);
}

async function categoryTest(page, category, width) {
  await page.goto(new URL(resourceCategoryPath(category.id), base).href, { waitUntil: 'networkidle' });
  const count = articles.filter(article => article.category === category.id).length;
  assert.equal(await page.getByRole('heading', { name: 'No articles found', exact: true }).count(), 0, 'Populated category must not show an empty state');
  assert.equal(await page.locator('[data-blog-card]').count(), Math.max(0, count - 1));
  assert.equal(await page.locator('section[aria-labelledby="resource-featured"]').count(), 1);
  assert.match(await page.getByRole('status').innerText(), new RegExp(`^${count} article`));
  report.interactions.push({ width, category: category.id, count, featured: 1, falseEmptyState: false });
  if (['heating', 'washers-dryers'].includes(category.id)) await inspect(page, `category-${category.id}-${width}`, true);
}

async function zipTest(page, route, width) {
  await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
  const form = page.getByRole('form', { name: 'Check your ZIP code' });
  const input = form.getByLabel('ZIP code', { exact: true });
  const container = form.locator('..');
  for (const state of ['NY', 'NJ', 'CT']) {
    const zip = coverage.zipCodes[state].find(value => value.startsWith('0')) || coverage.zipCodes[state][0];
    await input.fill(zip);
    await form.getByRole('button', { name: 'Check coverage', exact: true }).click();
    await container.getByRole('status').getByText(new RegExp(`${zip} is in our`)).waitFor();
    assert.ok(await container.getByRole('button', { name: 'Book Now', exact: true }).isVisible());
  }
  await container.screenshot({ path: path.join(output, `${route === '/' ? 'home' : 'service-areas'}-zip-supported-${width}.png`) });
  for (const zip of ['', '7001', '070011', '07001-1234', 'abcde', '07001 ']) {
    await input.fill(zip);
    await form.getByRole('button', { name: 'Check coverage', exact: true }).click();
    await form.getByRole('alert').waitFor();
    assert.equal(await input.getAttribute('aria-invalid'), 'true');
    assert.equal(await input.evaluate(node => node === document.activeElement), true);
  }
  for (const zip of ['02108', '02903', '90210']) {
    await input.fill(zip);
    assert.equal(await container.getByRole('status').innerText(), '', 'Stale result must clear');
    await input.press('Enter');
    await container.getByRole('status').getByText(`${zip} is outside our current listed coverage.`).waitFor();
    assert.ok(await container.locator('a[href="tel:+15165860826"]').isVisible());
    assert.equal(await container.getByRole('button', { name: 'Book Now', exact: true }).count(), 0);
  }
  report.interactions.push({ route, width, exactZipCoverage: true, leadingZeros: true, accessibleInvalidState: true, unsupportedMAandRI: true });
  await container.screenshot({ path: path.join(output, `${route === '/' ? 'home' : 'service-areas'}-zip-unsupported-${width}.png`) });
  await inspect(page, `${route === '/' ? 'home' : 'service-areas'}-zip-${width}`, true);
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  assert.equal(source.articles.length, 13);
  assert.equal(categories.length, 12);
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  report.browser = browser.version();
  try {
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.route('**/*', route => {
        const request = route.request();
        if (request.method() === 'GET' && new URL(request.url()).origin === base.origin) return route.continue();
        report.blockedRequests.push({ method: request.method(), url: request.url() });
        return route.abort();
      });
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      page.on('pageerror', error => report.failures.push({ name: `browser runtime ${width}`, error: error.message }));
      page.on('console', message => { if (message.type() === 'error') report.warnings.push({ kind: 'console', width, page: page.url(), message: message.text() }); });
      page.on('response', response => {
        if (response.status() >= 400) {
          const row = { kind: 'http', width, url: response.url(), status: response.status() };
          if (new URL(response.url()).pathname.startsWith('/api/')) report.warnings.push(row);
          else report.failures.push(row);
        }
      });
      if (width === 320 && !focused) {
        for (const original of source.articles) await check(`HTML ${original.urlSlug}`, () => auditHtml(page, original.urlSlug, original));
        for (const category of categories) await check(`HTML category ${category.id}`, () => auditHtml(page, resourceCategoryPath(category.id)));
        await check('HTML /blog', () => auditHtml(page, '/blog'));
        await check('Sitemap exact article and active category coverage', async () => {
          const response = await localGet('/sitemap.xml');
          assert.equal(response.status, 200);
          const xml = await response.text();
          const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
          for (const route of ['/blog', ...source.articles.map(article => article.urlSlug), ...categories.map(category => resourceCategoryPath(category.id))]) assert.equal(locations.filter(url => url === new URL(route, siteUrl).href).length, 1, route);
          assert.equal(locations.filter(url => new URL(url).pathname.startsWith('/blog/') && !new URL(url).pathname.startsWith('/blog/category/')).length, 13);
          report.html.push({ route: '/sitemap.xml', articles: 13, categories: 12, unique: new Set(locations).size === locations.length });
        });
      }
      await check(`Filters ${width}`, () => filterTest(page, width));
      await check(`Blog layout ${width}`, () => inspect(page, `blog-${width}`, true));
      if (focused) {
        for (const category of categories) await check(`Category ${category.id} ${width}`, () => categoryTest(page, category, width));
      } else {
        for (const original of source.articles) await check(`Article ${original.slug} ${width}`, () => articleTest(page, original, width));
      }
      await check(`Booking dialog ${width}`, async () => {
        await page.getByRole('button', { name: 'Book a Service', exact: true }).first().click();
        const dialog = page.getByRole('dialog').filter({ visible: true });
        await dialog.waitFor({ state: 'visible' });
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        report.interactions.push({ width, bookingOpenClose: true, submitted: false });
      });
      for (const route of ['/', '/service-areas']) await check(`ZIP ${route} ${width}`, () => zipTest(page, route, width));
      await context.close();
    }
    for (const route of internalLinks) await check(`GET link ${route}`, async () => {
      if (!route || route.startsWith('/api/')) return;
      const response = await localGet(route);
      report.links.push({ route, status: response.status });
      assert.ok(response.status >= 200 && response.status < 400, route);
    });
  } finally { await browser.close(); }
}

main().catch(error => report.failures.push({ name: 'runner', error: briefError(error) })).finally(() => {
  fs.mkdirSync(output, { recursive: true });
  report.finishedAt = new Date().toISOString();
  report.summary = { html: report.html.length, layouts: report.layouts.length, interactions: report.interactions.length, links: report.links.length, warnings: report.warnings.length, failures: report.failures.length };
  fs.writeFileSync(path.join(output, focused ? 'verification-focused.json' : 'verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary));
  if (report.failures.length) process.exitCode = 1;
});
