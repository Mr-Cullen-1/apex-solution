/* eslint-disable @typescript-eslint/no-require-imports -- Editorial and publication-boundary regression checks. */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const sharp = require('sharp');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const load = require('./load-ts.cjs')();
const { plannedDrafts: resources } = load('src/content/resources/planned-drafts.ts');
const { validateResources, getPublishedResource } = load('src/content/resources/index.ts');
const { resourceMetadata, resourceStructuredData, resourceSitemapEntries } = load('src/lib/resource-seo.ts');
const article = resources[0];
const { resourceSources } = load('src/content/resources/sources.ts');
const inline = parts => parts.map(part => part.text).join('');
const body = article.content.map(block => block.type === 'heading' ? block.text : block.type === 'list' ? block.items.map(inline).join(' ') : block.type === 'cta' ? `${block.title} ${block.description}` : block.type === 'image' ? (block.caption || '') : `${block.title || ''} ${inline(block.children)}`).join(' ');
const words = `${body} ${article.faqs.map(faq => `${faq.question} ${inline(faq.answer)}`).join(' ')}`.trim().split(/\s+/).length;

test('Article 1 has a complete 1500–1800 word draft with seven problem headings and FAQs', () => {
  assert.ok(words >= 1500 && words <= 1800, `Article word count: ${words}`);
  assert.equal(article.content.filter(block => block.type === 'heading' && block.level === 3 && /^\d\./.test(block.text)).length, 7);
  assert.equal(article.faqs.length, 5);
  assert.equal(article.readingTime, Math.ceil(words / 200));
  assert.match(body, /independent local professionals/);
  assert.match(body, /call 911/i);
  assert.match(body, /Do not reset a tripped breaker/);
});

test('Article 1 keeps its identity, empty publication fields and private metadata boundary', () => {
  assert.equal(article.slug, 'furnace-not-heating-common-problems');
  assert.equal(article.title, 'Why Is My Furnace Not Heating? 7 Common Problems and When to Call a Professional');
  assert.equal(article.status, 'draft');
  for (const field of ['publishedAt', 'updatedAt']) assert.equal(article[field], null);
  assert.ok(article.featuredImageAlt);
  assert.match(article.featuredImageCaption, /AI-generated/);
  assert.ok(article.editorialNote);
  assert.equal(getPublishedResource(article.slug), undefined);
  assert.equal(resourceStructuredData(article), null);
  assert.equal(resourceMetadata(article).robots.index, false);
  assert.deepEqual(resourceSitemapEntries(resources), []);
  assert.equal(article.seoTitle, 'Furnace Not Heating? 7 Problems & Safe Next Steps');
  assert.ok(article.metaDescription.length >= 140 && article.metaDescription.length <= 160);
  assert.deepEqual(article.secondaryKeywords, ['furnace troubleshooting', 'furnace repair near me', 'furnace not working', 'heating system problems', 'furnace blowing cold air']);
});

test('Article 1 content passes existing publication-shape validation with explicit test-only prerequisites', () => {
  const candidate = { ...article, status: 'published', editorialNote: null, relatedArticles: [], publishedAt: '2026-01-01' };
  assert.doesNotThrow(() => validateResources([candidate]));
  const meta = resourceMetadata(candidate);
  const schema = resourceStructuredData(candidate);
  assert.equal(meta.title, article.seoTitle);
  assert.equal(meta.description, article.metaDescription);
  assert.equal(meta.alternates.canonical, article.canonicalUrl);
  assert.equal(schema.headline, article.title);
  assert.equal(schema['@type'], 'BlogPosting');
  assert.equal(schema.image, new URL(article.featuredImage.src, article.canonicalUrl).toString());
  assert.equal(meta.openGraph.images[0].url, schema.image);
  assert.equal(meta.openGraph.images[0].alt, article.featuredImageAlt);
  assert.equal(meta.twitter.images[0].url, schema.image);
  assert.equal(meta.keywords, undefined);
});

test('four genuine article image files have accurate dimensions, provenance and visible captions', async () => {
  const inlineImages = article.content.filter(block => block.type === 'image');
  assert.equal(inlineImages.length, 3);
  const images = [{ image: article.featuredImage, alt: article.featuredImageAlt, caption: article.featuredImageCaption }, ...inlineImages];
  assert.equal(new Set(images.map(item => item.image.src)).size, 4);
  for (const { image, alt, caption } of images) {
    const asset = `public${image.src}`;
    assert.ok(fs.existsSync(asset), asset);
    assert.ok(fs.existsSync(asset.replace('.webp', '-original.png')));
    const metadata = await sharp(asset).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, image.width);
    assert.equal(metadata.height, image.height);
    assert.equal(image.width / image.height, 16 / 9);
    assert.match(alt, /AI-generated/);
    assert.match(caption, /AI-generated/);
  }
});

test('contextual government links and source list render safely with descriptive accessible text', () => {
  const { ResourceText } = load('src/components/resources/resource-content.tsx');
  for (const key of ['carbonMonoxide', 'winterVents', 'winterHeating', 'filters']) {
    const source = resourceSources[key];
    const context = article.content.filter(block => block.type === 'paragraph').flatMap(block => block.children).filter(part => part.type === 'link' && part.href === source.href);
    assert.ok(context.length > 0, source.title);
    const html = renderToStaticMarkup(React.createElement(ResourceText, { parts: context }));
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /opens in a new tab/);
  }
  assert.ok(article.content.some(block => block.type === 'heading' && block.id === 'sources-further-reading'));
  assert.ok(article.content.some(block => block.type === 'heading' && block.id === 'winter-vent-safety'));
  assert.match(body, /Never climb onto roofs or ladders/);
});

test('Article 1 publication fixture produces matching Article and Breadcrumb structured data', () => {
  const previewLoad = require('./load-ts.cjs')({ '@/components/ui/booking-link': { BookingLink: () => React.createElement('button', { type: 'button' }, 'QA booking') } });
  const { ResourceArticle } = previewLoad('src/components/resources/resource-article.tsx');
  const candidate = { ...article, status: 'published', editorialNote: null, publishedAt: '2026-01-01' };
  const html = renderToStaticMarkup(React.createElement(ResourceArticle, { article: candidate }));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
  const breadcrumb = schemas.find(schema => schema['@type'] === 'BreadcrumbList');
  const post = schemas.find(schema => schema['@type'] === 'BlogPosting');
  assert.equal(breadcrumb.itemListElement.at(-1).item, article.canonicalUrl);
  assert.equal(breadcrumb.itemListElement.at(-1).name, article.title);
  const organization = schemas.find(schema => schema['@type'] === 'Organization');
  assert.deepEqual(post.author, { '@type': 'Organization', '@id': organization['@id'], name: organization.name });
  assert.equal(post.publisher['@id'], organization['@id']);
  assert.match(html, /By Apex Home Services/);
  assert.equal(post.headline, article.title);
  assert.equal(post.image, new URL(article.featuredImage.src, article.canonicalUrl).toString());
  assert.equal(schemas.filter(schema => schema['@type'] === 'Organization').length, 1);
  assert.ok(html.includes(article.featuredImageCaption));
});

test('the other four drafts remain unchanged except for the approved organization author', () => {
  assert.equal(resources.length, 5);
  // Preserve pre-author-change baselines; normalize author, environment host and the approved /blog route migration.
  const expected = [
    'b4da4e630f29c6c7b6102ac53f18c64737ec1ed824553551b39b58a924787358',
    'f6064112f9f9f7cbbecbcb072caa468d3a15fc6b87c128933d3fd37606c50b5b',
    '72d48f1bdbb9547e3fd38c34eda85e52195141312b716bf22091199376f7d025',
    'dfd0ba251e8d554e422dd7c5c110ea45501cad2d713b28c071cbd5b64bb5b9ef',
  ];
  resources.slice(1).forEach((draft, index) => {
    const normalized = { ...draft, author: null, canonicalUrl: `http://localhost:3000/resources/${draft.slug}` };
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex'), expected[index], draft.slug);
  });
});


test('all five drafts use the approved Apex organization author and shared byline', () => {
  const { resourceAuthor } = load('src/content/resources/author.ts');
  const { organizationIdentity } = load('src/content/organization.ts');
  const { ResourceAuthor } = load('src/components/resources/resource-author.tsx');
  assert.deepEqual(resourceAuthor, { name: 'Apex Home Services', type: 'Organization', id: organizationIdentity['@id'] });
  for (const draft of resources) {
    assert.deepEqual(draft.author, resourceAuthor);
    assert.equal(draft.status, 'draft');
    assert.equal(draft.publishedAt, null);
    assert.equal(resourceStructuredData(draft), null);
    assert.equal(renderToStaticMarkup(React.createElement(ResourceAuthor, { author: draft.author })), '<span>By Apex Home Services</span>');
    // Test schema in memory without publishing or completing the other article bodies.
    const schema = resourceStructuredData({ ...draft, status: 'published', publishedAt: '2026-01-01', featuredImage: article.featuredImage });
    assert.equal(schema.author['@type'], 'Organization');
    assert.equal(schema.author.name, 'Apex Home Services');
    assert.equal(schema.author['@id'], organizationIdentity['@id']);
    assert.equal(schema.author['@id'], schema.publisher['@id']);
  }
});
