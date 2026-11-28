/* eslint-disable @typescript-eslint/no-require-imports -- Isolated actual-module content and SEO verification. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const load = require('./load-ts.cjs')();
const source = require('../src/content/resources/client-articles-source.json');
const { resources } = load('src/content/resources/articles.ts');
const { plannedDrafts } = load('src/content/resources/planned-drafts.ts');
const { getPublishedResources, getPublishedResource, getRelatedResources, getRelatedServices, validateResources, resourcePath } = load('src/content/resources/index.ts');
const { resourceMetadata, resourceStructuredData, resourceSitemapEntries } = load('src/lib/resource-seo.ts');
const { siteUrl } = load('src/content/site-url.ts');
const sitemap = load('src/app/sitemap.ts').default;

const expectedSlugs = ['furnace-not-heating', 'refrigerator-not-cooling', 'commercial-refrigerator-not-cooling', 'washer-not-draining', 'dryer-not-heating', 'dishwasher-not-draining', 'oven-not-heating', 'ice-maker-not-working', 'walk-in-cooler-not-cooling', 'commercial-ice-machine-cleaning', 'commercial-oven-not-heating', 'commercial-freezer-not-freezing', 'ice-machine-not-making-ice'];
const normalize = text => text.replace(/\s+/g, ' ').trim();
const inlineText = parts => parts.map(part => part.text).join('');

function listEntries(block) {
  return block.items.flatMap((parts, index) => [
    { text: inlineText(parts), ordered: block.ordered },
    ...(block.nested?.[index] || []).flatMap(listEntries),
  ]);
}

function flattenBody(blocks) {
  return blocks.map(block => {
    if (block.type === 'heading') return block.text;
    if (block.type === 'paragraph' || block.type === 'quote') return inlineText(block.children);
    if (block.type === 'list') return listEntries(block).map(item => item.text).join('\n');
    if (block.type === 'table') return block.rows.map(row => row.cells.map(cell => inlineText(cell.children)).join('\t')).join('\n');
    assert.fail(`Unexpected source-body block: ${block.type}`);
  }).join('\n\n');
}

function allInlines(blocks) {
  return blocks.flatMap(block => {
    if (block.type === 'list') return block.items.flatMap((parts, index) => [...parts, ...allInlines(block.nested?.[index] || [])]);
    if (block.type === 'table') return block.rows.flatMap(row => row.cells.flatMap(cell => cell.children));
    return block.children || [];
  });
}

test('exactly 13 supplied articles are public and four unrelated planned drafts remain private', () => {
  assert.deepEqual(source.articles.map(article => article.slug), expectedSlugs);
  assert.equal(resources.length, 17);
  assert.deepEqual(getPublishedResources().map(article => article.slug).sort(), [...expectedSlugs].sort());
  assert.equal(resources.filter(article => article.status === 'draft').length, 4);
  assert.equal(plannedDrafts.length, 5);
  assert.equal(getPublishedResource('furnace-not-heating-common-problems'), undefined);
  assert.equal(resources.some(article => article.slug === 'furnace-not-heating-common-problems'), false);
  for (const draft of plannedDrafts) {
    assert.equal(draft.status, 'draft');
    assert.equal(getPublishedResource(draft.slug), undefined);
    assert.equal(resourceStructuredData(draft), null);
  }
  assert.doesNotThrow(() => validateResources(resources));
});

for (const original of source.articles) {
  test(`${original.slug}: full original body, structure, FAQ and source links survive the adapter`, () => {
    const actual = getPublishedResource(original.slug);
    assert.ok(actual);
    assert.equal(normalize(flattenBody(actual.content)), normalize(original.bodyPlainText));
    assert.deepEqual(actual.content.filter(block => block.type === 'heading').map(({ text, level }) => ({ text, level })), original.blocks.filter(block => block.type === 'heading').map(({ text, level }) => ({ text, level })));
    assert.deepEqual(actual.content.filter(block => block.type === 'list').flatMap(listEntries), original.blocks.filter(block => block.type === 'list-item').map(block => ({ text: block.text, ordered: block.list.format !== 'bullet' })));
    assert.deepEqual(actual.content.filter(block => block.type === 'table').map(block => block.rows.map(row => row.cells.map(cell => inlineText(cell.children)))), original.blocks.filter(block => block.type === 'table').map(block => block.rows.map(row => row.cells.map(cell => cell.text))));
    assert.deepEqual(actual.content.filter(block => block.type === 'quote').map(block => inlineText(block.children)), original.blocks.filter(block => block.type === 'quote').map(block => block.text));
    const heading = actual.content.findIndex(block => block.type === 'heading' && block.text === 'Frequently asked questions');
    assert.ok(heading >= 0);
    const faqs = [];
    for (const block of actual.content.slice(heading + 1)) {
      if (block.type === 'heading') break;
      assert.equal(block.type, 'paragraph');
      assert.equal(block.children[0].bold, true);
      faqs.push(inlineText(block.children));
    }
    assert.equal(faqs.length, original.counts.faq);
    assert.deepEqual(actual.faqs, [], 'FAQs must not be duplicated beneath the preserved body');
    const originalLinks = original.blocks.flatMap(block => block.runs || []).filter(run => run.href).map(run => ({ text: run.text, href: run.href }));
    const actualLinks = allInlines(actual.content).filter(part => part.type === 'link');
    for (const link of originalLinks) assert.ok(actualLinks.some(part => part.text === link.text && part.href === link.href), `Source link missing: ${link.href}`);
    assert.equal(actual.sourceDocument.sha256, source.provenance.sha256);
    assert.equal(actual.sourceDocument.articleNumber, original.number);
  });

  test(`${original.slug}: original SEO, organization author, publication date and canonical agree`, () => {
    const actual = getPublishedResource(original.slug);
    const canonical = new URL(original.urlSlug, siteUrl).toString();
    assert.equal(actual.title, original.title);
    assert.equal(actual.seoTitle, original.seoTitle);
    assert.equal(actual.metaDescription, original.metaDescription);
    assert.equal(actual.excerpt, original.metaDescription);
    assert.deepEqual([actual.primaryKeyword, ...actual.secondaryKeywords], original.keywords);
    assert.deepEqual(actual.tags, original.keywords);
    assert.equal(actual.publishedAt, '2026-11-28');
    assert.equal(actual.updatedAt, null);
    assert.equal(actual.author.name, 'Apex Home Services');
    assert.equal(actual.author.type, 'Organization');
    assert.equal(actual.canonicalUrl, canonical);
    assert.equal(resourcePath(actual.slug), original.urlSlug);
    const metadata = resourceMetadata(actual);
    assert.deepEqual(metadata.title, { absolute: original.seoTitle });
    assert.equal(metadata.description, original.metaDescription);
    assert.equal(metadata.alternates.canonical, canonical);
    assert.equal(metadata.openGraph.url, canonical);
    assert.equal(metadata.openGraph.title, original.seoTitle);
    assert.equal(metadata.twitter.title, original.seoTitle);
    assert.equal(metadata.robots.index, true);
    assert.equal(metadata.openGraph.images[0].width, 1600);
    assert.equal(metadata.openGraph.images[0].height, 900);
    const schema = resourceStructuredData(actual);
    assert.equal(schema['@type'], 'BlogPosting');
    assert.equal(schema['@id'], `${canonical}#article`);
    assert.equal(schema.mainEntityOfPage, canonical);
    assert.equal(schema.headline, original.title);
    assert.equal(schema.datePublished, '2026-11-28');
    assert.equal(schema.author['@type'], 'Organization');
    assert.equal(schema.author.name, 'Apex Home Services');
    assert.equal(schema.author['@id'], schema.publisher['@id']);
    assert.ok(schema.publisher['@id'].endsWith('/#organization'));
    assert.equal(schema.author.name.includes('Cameron'), false);
  });

  test(`${original.slug}: image pixels and related destinations are present`, async () => {
    const actual = getPublishedResource(original.slug);
    const imagePath = path.join(__dirname, '../public', actual.featuredImage.src);
    assert.ok(fs.existsSync(imagePath), imagePath);
    const image = await sharp(imagePath).metadata();
    assert.equal(image.width, 1600);
    assert.equal(image.height, 900);
    assert.equal(actual.featuredImage.width, image.width);
    assert.equal(actual.featuredImage.height, image.height);
    assert.ok(actual.featuredImageAlt.trim());
    assert.deepEqual(getRelatedResources(actual).map(article => article.slug).sort(), [...actual.relatedArticles].sort());
    assert.deepEqual(getRelatedServices(actual).map(service => service.href).sort(), [...actual.relatedServices].sort());
    assert.equal(actual.relatedArticles.includes(actual.slug), false);
  });
}

test('all source headings, 55 FAQs and nine tables are retained across the 13 articles', () => {
  assert.equal(source.articles.reduce((count, article) => count + article.counts.faq, 0), 55);
  assert.equal(getPublishedResources().flatMap(article => article.content).filter(block => block.type === 'table').length, 9);
  assert.equal(getPublishedResources().flatMap(article => article.content).filter(block => block.type === 'heading').length, source.articles.flatMap(article => article.blocks).filter(block => block.type === 'heading').length);
});

test('resource and full sitemaps expose every client canonical once and no legacy or draft article', () => {
  for (const entries of [resourceSitemapEntries(), sitemap()]) {
    const urls = entries.map(entry => entry.url);
    assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URL');
    for (const original of source.articles) {
      const canonical = new URL(original.urlSlug, siteUrl).toString();
      assert.equal(urls.filter(url => url === canonical).length, 1);
      assert.equal(entries.find(entry => entry.url === canonical).lastModified, '2026-11-28');
      assert.equal(urls.includes(new URL(`/resources/${original.slug}`, siteUrl).toString()), false);
    }
    for (const draft of plannedDrafts) assert.equal(urls.includes(draft.canonicalUrl), false);
    assert.equal(urls.some(url => url.includes('furnace-not-heating-common-problems')), false);
  }
});
