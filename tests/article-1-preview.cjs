/* eslint-disable @typescript-eslint/no-require-imports -- Local-only draft preview and read-only browser verification. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { chromium } = require('../node_modules/.qa-tools/node_modules/playwright-core');
const createLoader = require('./load-ts.cjs');
const load = createLoader();
const article = load('src/content/resources/articles.ts').resources[0];
const { resourceSources } = load('src/content/resources/sources.ts');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3127';
const output = path.resolve('output/article-1');
fs.mkdirSync(output, { recursive: true });
const report = { article: article.slug, status: article.status, http: [], layouts: [], sourceLinks: Object.values(resourceSources), failures: [] };
const inline = parts => parts.map(part => part.text).join('');
const bodyText = article.content.map(block => block.type === 'heading' ? block.text : block.type === 'list' ? block.items.map(inline).join(' ') : block.type === 'cta' ? `${block.title} ${block.description}` : block.type === 'image' ? (block.caption || '') : `${block.title || ''} ${inline(block.children)}`).join(' ');
report.wordCount = `${bodyText} ${article.faqs.map(faq => `${faq.question} ${inline(faq.answer)}`).join(' ')}`.trim().split(/\s+/).length;

async function main() {
  assert.equal(article.status, 'draft');
  assert.equal(article.author.name, 'Apex Home Services');
  report.author = article.author;
  assert.ok(report.wordCount >= 1500 && report.wordCount <= 1800);
  const response = await fetch(`${base}/resources/${article.slug}`);
  const publicHtml = await response.text();
  assert.equal(response.status, 404);
  assert.match(publicHtml, /name="robots" content="noindex/);
  assert.ok(!publicHtml.includes(article.title));
  assert.ok(!publicHtml.includes('BlogPosting'));
  assert.ok(!publicHtml.includes('Check for danger before troubleshooting'));
  report.http.push({ path: `/resources/${article.slug}`, status: response.status, noindex: true, draftContentAbsent: true, articleSchemaAbsent: true });
  const sitemap = await fetch(`${base}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  assert.ok(!(await sitemap.text()).includes(`/resources/${article.slug}`));
  report.http.push({ path: '/sitemap.xml', draftExcluded: true });
  for (const route of ['/resources', '/resources/category/hvac-heating', ...article.relatedServices]) {
    const result = await fetch(base + route);
    assert.equal(result.status, 200, route);
    const html = await result.text();
    if (route.startsWith('/resources')) assert.ok(!html.includes(article.slug));
    report.http.push({ path: route, status: result.status });
  }
  for (const image of [article.featuredImage, ...article.content.filter(block => block.type === 'image').map(block => block.image)]) {
    const result = await fetch(base + image.src);
    assert.equal(result.status, 200, image.src);
    assert.match(result.headers.get('content-type'), /image\/webp/);
    report.http.push({ path: image.src, status: result.status, bytes: (await result.arrayBuffer()).byteLength });
  }

  // No public endpoint: render actual components into a local artifact. Only fields
  // required by the published template get explicit preview labels, in memory.
  const previewLoad = createLoader({
    '@/components/ui/booking-link': { BookingLink: () => React.createElement('button', { type: 'button', disabled: true, className: 'rounded-control border border-steel px-5 py-3' }, 'Booking disabled in draft preview') },
    './resource-card': { ResourceDate: () => React.createElement('span', null, 'not scheduled'), ResourceCard: () => null },
    '@/components/public/organization-structured-data': { OrganizationStructuredData: () => null },
    '@/components/public/breadcrumb-structured-data': { BreadcrumbStructuredData: () => null },
  });
  const { ResourceArticle } = previewLoad('src/components/resources/resource-article.tsx');
  const markup = renderToStaticMarkup(React.createElement(ResourceArticle, { article }));
  assert.ok(!markup.includes('application/ld+json'));
  const listingHtml = await (await fetch(base + '/resources')).text();
  const cssPaths = [...listingHtml.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map(match => match[1].replaceAll('&amp;', '&'));
  assert.ok(cssPaths.length, 'Compiled site styles must be present');
  const runtimeStyles = [];
  const fontLinks = [...listingHtml.matchAll(/<link\b[^>]*as="font"[^>]*>/g)].map(match => match[0]).join('');
  const styles = await Promise.all(cssPaths.map(async href => {
    const cssResponse = await fetch(new URL(href, base));
    assert.equal(cssResponse.status, 200);
    const css = await cssResponse.text();
    runtimeStyles.push(css.replace(/url\(([^)]+)\)/g, (original, value) => {
      const clean = value.replace(/^['"]|['"]$/g, '');
      return clean.startsWith('data:') ? original : `url(${new URL(clean, new URL(href, base)).pathname})`;
    }));
    return css.replace(/url\(([^)]+)\)/g, (original, value) => {
      const clean = value.replace(/^['"]|['"]$/g, '');
      const assetPath = new URL(clean, new URL(href, base)).pathname;
      if (!assetPath.startsWith('/_next/')) return original;
      const local = path.join(process.cwd(), '.next', assetPath.slice('/_next/'.length));
      if (!fs.existsSync(local)) return original;
      const mime = local.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream';
      return `url(data:${mime};base64,${fs.readFileSync(local).toString('base64')})`;
    });
  }));
  const htmlClass = listingHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] || '';
  const bodyClass = listingHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] || '';
  const html = `<!doctype html><html lang="en" class="${htmlClass}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Internal draft preview — Furnace not heating</title>${fontLinks}<style>${runtimeStyles.join('\n')}</style></head><body class="${bodyClass}"><aside aria-label="Draft status" class="border-b border-steel bg-surface px-6 py-5 text-sm">INTERNAL DRAFT — Not published. Publication date and HVAC/safety approval pending. AI-generated illustrations included. Booking disabled.</aside>${markup}</body></html>`;
  // The exported preview is portable/offline. Browser QA below uses the original
  // Next.js image markup against the real local optimization endpoint instead.
  const offlineHtml = html.replace(runtimeStyles.join('\n'), styles.join('\n')).replace(/\/_next\/static\/media\/[^"<>]+\.woff2/g, value => `data:font/woff2;base64,${fs.readFileSync(path.join('.next', value.slice('/_next/'.length))).toString('base64')}`).replace(/<link\b[^>]*as="image"[^>]*>/g, '').replace(/\s(?:srcset|imagesrcset)="[^"]*"/gi, '').replace(/\/_next\/image\?[^"\s,<>]+/g, value => {
    const asset = new URL(value.replaceAll('&amp;', '&'), base).searchParams.get('url');
    assert.ok(asset.startsWith('/resources/furnace-not-heating-common-problems/'));
    return `data:image/webp;base64,${fs.readFileSync(`public${asset}`).toString('base64')}`;
  }).replace(/href="(\/[^"<>]*)"/g, (_, href) => `href="${base}${href}"`);
  fs.writeFileSync(path.join(output, 'internal-preview.html'), offlineHtml);
  const markdownInline = parts => parts.map(part => part.type === 'link' ? `[${part.text}](${part.href})` : part.text).join('');
  const markdownBlocks = article.content.map(block => {
    if (block.type === 'heading') return `${'#'.repeat(block.level)} ${block.text}`;
    if (block.type === 'list') return block.items.map((parts, index) => `${block.ordered ? `${index + 1}.` : '-'} ${markdownInline(parts)}`).join('\n');
    if (block.type === 'callout') return `> **${block.title}**\n>\n> ${markdownInline(block.children)}`;
    if (block.type === 'paragraph') return markdownInline(block.children);
    if (block.type === 'image') return `![${block.alt}](../../public${block.image.src})\n\n${block.caption || ''}`;
    return '';
  });
  fs.writeFileSync(path.join(output, 'article-draft.md'), `# ${article.title}\n\nBy ${article.author.name}\n\n**DRAFT — not published. ${report.wordCount} words; ${article.readingTime} minute estimate.**\n\n${article.excerpt}\n\n${markdownBlocks.join('\n\n')}\n\n## Frequently asked questions\n\n${article.faqs.map(faq => `### ${faq.question}\n\n${markdownInline(faq.answer)}`).join('\n\n')}\n\n---\n\nThe shared final template CTA offers Book Now / Explore services and explains that Apex connects homeowners with independent professionals. Booking is disabled in the internal preview.\n`);

  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  report.browser = browser.version();
  try {
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      // Read-only browser work. Permit local image optimization; block external
      // traffic and submissions. The draft is never registered as a public route.
      await context.route(/^https?:/, route => route.request().method() === 'GET' && new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
      const page = await context.newPage();
      await page.goto(base + '/resources', { waitUntil: 'networkidle' });
      await page.getByRole('main').getByRole('button', { name: 'Book Now', exact: true }).click();
      await page.getByRole('dialog').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      await page.evaluate(() => document.fonts.ready);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.evaluate(() => {
        window.articleLayoutShift = 0;
        window.articleLayoutShiftEntries = [];
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) {
          window.articleLayoutShift += entry.value;
          window.articleLayoutShiftEntries.push({ value: entry.value, time: entry.startTime, sources: entry.sources.map(source => ({ node: source.node?.outerHTML?.slice(0, 180), previous: source.previousRect.toJSON(), current: source.currentRect.toJSON() })) });
        } }).observe({ type: 'layout-shift' });
      });
      // Preserve the loaded Next font/CSS environment. Replacing the entire
      // document creates an artificial fallback-font swap during setContent.
      const previewBody = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
      await page.evaluate(body => { document.body.innerHTML = body; window.scrollTo(0, 0); }, previewBody);
      await page.evaluate(() => document.fonts.ready);
      const boxesBefore = await page.locator('.resource-image').evaluateAll(nodes => nodes.map(n => ({ width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height })));
      assert.equal(await page.locator('img').count(), 4);
      const imageResults = [];
      for (const img of await page.locator('img').all()) {
        await img.scrollIntoViewIfNeeded();
        await page.waitForFunction(node => node.complete && node.naturalWidth > 0, await img.elementHandle(), { timeout: 15000 });
        await img.evaluate(async node => { await node.decode(); });
        imageResults.push(await img.evaluate(node => ({ src: node.currentSrc, sizes: node.sizes, alt: node.alt, loading: node.loading, width: node.naturalWidth, height: node.naturalHeight })));
      }
      const boxesAfter = await page.locator('.resource-image').evaluateAll(nodes => nodes.map(n => ({ width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height })));
      assert.deepEqual(boxesBefore, boxesAfter, 'Image containers must reserve space before loading');
      for (const result of imageResults) {
        assert.ok(result.src.includes('/_next/image?'), result.src);
        assert.ok(result.width > 0 && result.height > 0);
        assert.ok(result.sizes && result.alt);
      }
      assert.ok(imageResults.slice(1).every(result => result.loading === 'lazy'));
      const imageLayoutShift = await page.evaluate(() => window.articleLayoutShift);
      if (imageLayoutShift) console.error('Layout-shift diagnostic', JSON.stringify(await page.evaluate(() => window.articleLayoutShiftEntries)));
      assert.equal(imageLayoutShift, 0, 'Unexpected layout shift before interaction');
      for (const source of Object.values(resourceSources)) {
        const links = page.locator(`a[href="${source.href}"]`);
        assert.equal(await links.count(), 2);
        assert.equal(await links.first().getAttribute('target'), '_blank');
        assert.equal(await links.first().getAttribute('rel'), 'noopener noreferrer');
      }
      assert.equal(await page.locator('h1').textContent(), article.title);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.getByText('By Apex Home Services', { exact: true }).count(), 1);
      assert.equal(await page.getByText('Unassigned (draft preview)', { exact: true }).count(), 0);
      assert.equal(await page.locator('details').count(), article.faqs.length);
      for (const faq of article.faqs) {
        const summary = page.getByText(faq.question, { exact: true });
        await summary.focus();
        await page.keyboard.press('Enter');
        assert.equal(await summary.locator('..').getAttribute('open'), '');
        assert.ok(await summary.locator('..').getByText(inline(faq.answer), { exact: true }).isVisible());
        await page.keyboard.press('Enter');
      }
      const toc = page.getByRole('navigation', { name: 'Table of contents' });
      for (const heading of article.content.filter(block => block.type === 'heading')) {
        assert.equal(await page.locator(`[id="${heading.id}"]`).count(), 1);
        assert.equal(await toc.getByRole('link', { name: heading.text, exact: true }).getAttribute('href'), `#${heading.id}`);
      }
      await toc.getByRole('link', { name: 'A safe homeowner troubleshooting checklist', exact: true }).focus();
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#safe-homeowner-checks');
      await page.addScriptTag({ path: require.resolve('../node_modules/.qa-tools/node_modules/axe-core') });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `preview-${width}.png`), fullPage: true });
      await page.screenshot({ path: path.join(output, `preview-header-${width}.png`) });
      await page.locator('#winter-vent-safety').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `preview-winter-${width}.png`) });
      const row = { width, overflow, violations, errors, faqKeyboard: true, tableOfContents: true, headingCount: article.content.filter(b => b.type === 'heading').length, images: imageResults, reservedImageSpace: true, imageLayoutShift, realSharedBookingOpenedAndClosed: true, noSubmission: true, externalLinks: 8 };
      report.layouts.push(row);
      assert.equal(overflow, false);
      assert.deepEqual(violations, []);
      assert.deepEqual(errors, []);
      await context.close();
    }
    const offline = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await offline.route(/^https?:/, route => route.abort());
    await offline.goto(pathToFileURL(path.join(output, 'internal-preview.html')).href);
    for (const img of await offline.locator('img').all()) {
      await img.scrollIntoViewIfNeeded();
      await offline.waitForFunction(node => node.complete && node.naturalWidth > 0, await img.elementHandle(), { timeout: 15000 });
      await img.evaluate(node => node.decode());
    }
    assert.equal(await offline.locator('img').count(), 4);
    report.offlinePreviewImages = 4;
    await offline.close();
  } finally { await browser.close(); }
  console.log(`Article 1: ${report.wordCount} words; ${report.http.length} HTTP checks; ${report.layouts.length} layouts passed.`);
}

main().catch(error => { report.failures.push(error.stack); console.error(error); process.exitCode = 1; }).finally(() => {
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
});
