/* eslint-disable @typescript-eslint/no-require-imports -- Server-rendered integration tests using the existing TS loader. */
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const createLoader = require('./load-ts.cjs');
const { fixture, load } = require('./resource-fixture.cjs');

test('published article renders all supported blocks, a single H1 and matching schema', () => {
  const { ResourceArticle } = load('src/components/resources/resource-article.tsx');
  const html = renderToStaticMarkup(React.createElement(ResourceArticle, { article: fixture }));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const value of ['Table of contents', 'id="first-check"', 'href="#details"', '<ul', '<ol', 'start="3"', 'Nested observation', '<blockquote', 'A quoted safety reminder.', '<table', 'Observed symptom', 'Fixture explanation', '<details', '<summary', 'Important precaution', 'Homeowner tip', 'Good to know', 'QA fixture caption', 'Explore related services', 'Updated']) assert.ok(html.includes(value), value);
  assert.ok(!html.includes('Editorial draft only'));
  assert.ok(!html.includes('how-to-prevent-frozen-pipes-in-winter'));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
  assert.equal(schemas.filter(s => s['@type'] === 'Organization').length, 1);
  assert.equal(schemas.filter(s => s['@type'] === 'BlogPosting').length, 1);
  assert.equal(schemas.find(s => s['@type'] === 'BreadcrumbList').itemListElement.at(-1).item, fixture.canonicalUrl);
  assert.equal(schemas.find(s => s['@type'] === 'BlogPosting').publisher['@id'], schemas.find(s => s['@type'] === 'Organization')['@id']);
});

test('optional empty sections are omitted and editorial text is escaped', () => {
  const { ResourceArticle } = load('src/components/resources/resource-article.tsx');
  const html = renderToStaticMarkup(React.createElement(ResourceArticle, { article: { ...fixture, title: '</script><script>alert(1)</script>', updatedAt: null, content: [{ type: 'paragraph', children: [{ type: 'text', text: 'Body' }] }], faqs: [], relatedServices: [], relatedArticles: [] } }));
  for (const label of ['Table of contents', 'Frequently asked questions', 'Explore related services', 'Related articles', 'Updated']) assert.ok(!html.includes(label), label);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('\\u003c/script>'));
});

test('production blog route generates 13 client articles and rejects all draft/unknown metadata and content', async () => {
  const draftLoad = createLoader({ 'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } } });
  const page = draftLoad('src/app/(marketing)/blog/[slug]/page.tsx');
  const { plannedDrafts } = draftLoad('src/content/resources/planned-drafts.ts');
  const { getPublishedResources } = draftLoad('src/content/resources/index.ts');
  assert.equal(page.dynamicParams, false);
  assert.equal(page.generateStaticParams().length, 13);
  assert.deepEqual(page.generateStaticParams(), getPublishedResources().map(article => ({ slug: article.slug })));
  for (const slug of [...plannedDrafts.map(article => article.slug), 'missing']) {
    await assert.rejects(page.default({ params: Promise.resolve({ slug }) }), /NOT_FOUND/);
    await assert.rejects(page.generateMetadata({ params: Promise.resolve({ slug }) }), /NOT_FOUND/);
  }
});

test('published fixture goes through real route, metadata, category and sitemap helpers', async () => {
  const page = load('src/app/(marketing)/blog/[slug]/page.tsx');
  assert.deepEqual(page.generateStaticParams(), [{ slug: fixture.slug }]);
  const props = { params: Promise.resolve({ slug: fixture.slug }) };
  assert.equal((await page.generateMetadata(props)).alternates.canonical, fixture.canonicalUrl);
  assert.ok(renderToStaticMarkup(await page.default(props)).includes(fixture.title));
  const sitemap = load('src/app/sitemap.ts').default();
  assert.ok(sitemap.some(item => item.url === fixture.canonicalUrl));
  const category = load('src/app/(marketing)/blog/category/[category]/page.tsx');
  const categoryProps = { params: Promise.resolve({ category: 'hvac-heating' }) };
  assert.equal((await category.generateMetadata(categoryProps)).robots.index, true);
  assert.equal((await category.generateMetadata({ params: Promise.resolve({ category: 'home-maintenance' }) })).robots.index, false);
  assert.ok(renderToStaticMarkup(await category.default(categoryProps)).includes(fixture.title));
});
