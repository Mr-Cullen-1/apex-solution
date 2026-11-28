/* eslint-disable @typescript-eslint/no-require-imports -- Uses the repository's isolated TypeScript loader. */
const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs')();
const { plannedDrafts: resources } = load('src/content/resources/planned-drafts.ts');
const { getPublishedResources, getPublishedResource, validateResources, getRelatedResources } = load('src/content/resources/index.ts');
const { resourceMetadata, resourceStructuredData, resourceSitemapEntries } = load('src/lib/resource-seo.ts');

function published(overrides = {}) {
  const draft = resources[0];
  return { ...draft, status: 'published', editorialNote: null, relatedArticles: [], author: { name: 'Test author', type: 'Person' }, publishedAt: '2026-01-01', updatedAt: null, readingTime: 3, featuredImage: { src: '/brand/apex-mark-colored.png', width: 1254, height: 1254 }, featuredImageAlt: 'Test fixture image', content: [{ type: 'heading', level: 2, id: 'checks', text: 'Checks' }, { type: 'paragraph', children: [{ type: 'text', text: 'Reviewed fixture body for rendering tests only.' }] }], ...overrides };
}

test('all five planned drafts stay outside every public selector', () => {
  assert.equal(resources.length, 5);
  for (const article of resources) {
    assert.equal(article.status, 'draft');
    if (article.id !== "furnace-not-heating") assert.equal(article.content.length, 0);
    assert.ok(article.editorialNote);
    assert.equal(getPublishedResource(article.slug), undefined);
    assert.equal(resourceStructuredData(article), null);
    assert.equal(resourceMetadata(article).robots.index, false);
  }
  assert.deepEqual(getPublishedResources(resources), []);
  assert.deepEqual(resourceSitemapEntries(resources), []);
  assert.equal(getPublishedResources().length, 13, 'Current public registry contains the 13 client articles');
  assert.doesNotThrow(() => validateResources(resources));
});

test('publishing requires content, author, dates and a real image', () => {
  assert.throws(() => validateResources([{ ...resources[0], status: 'published', relatedArticles: [] }]), /publish|content|author|image|date/i);
  assert.doesNotThrow(() => validateResources([published()]));
  assert.throws(() => validateResources([published({ updatedAt: '2025-01-01' })]), /date/i);
  assert.throws(() => validateResources([published({ updatedAt: '2999-01-01' })]), /date/i);
  assert.throws(() => validateResources([published({ publishedAt: '2026-02-30' })]), /date/i);
});

test('publication boundary excludes future content and related drafts', () => {
  const article = published();
  const future = published({ id: 'future', slug: 'future', publishedAt: '2999-01-01' });
  assert.deepEqual(getPublishedResources([resources[1], future, article]).map(a => a.id), [article.id]);
  assert.deepEqual(getRelatedResources({ ...article, relatedArticles: [resources[1].slug] }, resources), []);
});

test('publication validation catches duplicate slugs, broken services and unsafe content links', () => {
  assert.throws(() => validateResources([resources[0], resources[0]]), /duplicate/i);
  assert.throws(() => validateResources([published({ relatedServices: ['/services/plumbing'] })]), /service/i);
  assert.throws(() => validateResources([published({ content: [{ type: 'paragraph', children: [{ type: 'link', href: 'javascript:alert(1)', text: 'Unsafe' }] }] })]), /link/i);
});

test('editorial links accept existing categories and heading anchors, but reject missing anchors', () => {
  const heading = { type: 'heading', level: 2, id: 'checks', text: 'Checks' };
  const withLink = href => published({ content: [heading, { type: 'paragraph', children: [{ type: 'link', href, text: 'Read more' }] }] });
  assert.doesNotThrow(() => validateResources([withLink('/blog/category/hvac-heating')]));
  assert.doesNotThrow(() => validateResources([withLink('#checks')]));
  assert.throws(() => validateResources([withLink('#missing')]), /link|anchor/i);
});

test('published metadata, schema and sitemap agree on canonical and real dates', () => {
  const article = published();
  const metadata = resourceMetadata(article);
  const schema = resourceStructuredData(article);
  assert.equal(metadata.alternates.canonical, article.canonicalUrl);
  assert.equal(metadata.openGraph.url, article.canonicalUrl);
  assert.equal(metadata.openGraph.type, 'article');
  assert.equal(metadata.twitter.card, 'summary_large_image');
  assert.equal(metadata.robots.index, true);
  assert.equal(metadata.keywords, undefined);
  assert.equal(schema['@type'], 'BlogPosting');
  assert.equal(schema.mainEntityOfPage, article.canonicalUrl);
  assert.equal(schema.datePublished, article.publishedAt);
  assert.ok(schema.publisher['@id'].endsWith('/#organization'));
  const entries = resourceSitemapEntries([article, resources[1]]);
  assert.ok(entries.some(e => e.url === article.canonicalUrl && e.lastModified === article.publishedAt));
  assert.ok(!entries.some(e => e.url === resources[1].canonicalUrl));
  assert.ok(!entries.some(e => e.url.endsWith('/category/home-maintenance')));
});

module.exports = { published };

test('source links allow only reviewed exact HTTPS destinations without weakening internal validation', () => {
  const { resourceSources } = load('src/content/resources/sources.ts');
  const withLink = href => published({ content: [{ type: 'paragraph', children: [{ type: 'link', href, text: 'Source' }] }] });
  for (const source of Object.values(resourceSources)) assert.doesNotThrow(() => validateResources([withLink(source.href)]));
  for (const href of ['javascript:alert(1)', 'http://www.cpsc.gov/', '//www.cpsc.gov/', 'https://www.cpsc.gov.evil.example/', 'https://www.cpsc.gov@evil.example/', 'https://example.com/', resourceSources.filters.href + '?redirect=elsewhere', '/blog/how-to-prevent-frozen-pipes-in-winter', '/resources/how-to-prevent-frozen-pipes-in-winter']) {
    assert.throws(() => validateResources([withLink(href)]), /link/i, href);
  }
});
