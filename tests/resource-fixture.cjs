/* eslint-disable @typescript-eslint/no-require-imports -- Test-only fixture, never imported by the application. */
const React = require('react');
const createLoader = require('./load-ts.cjs');
const originalLoad = createLoader();
const { plannedDrafts: resources } = originalLoad('src/content/resources/planned-drafts.ts');
const { siteUrl } = originalLoad('src/content/site-url.ts');
const text = value => [{ type: 'text', text: value }];
const fixture = {
  ...resources[0], id: 'test-only-article', slug: 'test-only-article', title: 'Test fixture: looking after a home system',
  canonicalUrl: new URL('/blog/test-only-article', siteUrl).toString(),
  excerpt: 'Synthetic QA copy. This entry is never added to the application content registry.',
  status: 'published', editorialNote: null, author: { type: 'Person', name: 'QA fixture author' },
  publishedAt: '2026-01-01', updatedAt: '2026-01-02', readingTime: 4,
  featuredImage: { src: '/brand/apex-mark-colored.png', width: 1254, height: 1254 }, featuredImageAlt: 'Apex logo used only as a QA fixture',
  relatedArticles: [resources[1].slug],
  content: [
    { type: 'heading', level: 2, id: 'first-check', text: 'A first observation' },
    { type: 'paragraph', children: [...text('A synthetic paragraph with an '), { type: 'link', text: 'existing service link', href: '/services/heating' }, ...text(' to verify inline rendering.')] },
    { type: 'heading', level: 3, id: 'details', text: 'Details to note' },
    { type: 'list', ordered: false, items: [text('First observation'), text('Second observation')], nested: { 0: [{ type: 'list', ordered: true, start: 3, items: [text('Nested observation')] }] } },
    { type: 'list', ordered: true, items: [text('Step one'), text('Step two')] },
    { type: 'quote', children: [{ type: 'text', text: 'A quoted safety reminder.', bold: true }] },
    { type: 'table', rows: [{ cells: [{ children: text('Observed symptom') }, { children: text('Possible explanation') }] }, { cells: [{ children: text('Fixture symptom') }, { children: text('Fixture explanation') }] }] },
    ...['info', 'tip', 'warning'].map(tone => ({ type: 'callout', tone, title: `${tone} block`, children: text('Test-only callout content.') })),
    { type: 'image', image: { src: '/brand/apex-mark-colored.png', width: 1254, height: 1254 }, alt: 'Test-only inline Apex logo', caption: 'QA fixture caption' },
    { type: 'cta', title: 'Test an inline service action', description: 'Synthetic CTA copy for component validation.' },
  ],
  faqs: [{ question: 'Does this disclosure work without JavaScript?', answer: text('Yes. The template uses a native details and summary disclosure.') }],
};
const entries = [fixture, ...resources];
const load = createLoader({
  './articles': { resources: entries },
  '@/components/ui/booking-link': { BookingLink: () => React.createElement('button', { type: 'button' }, 'Book Now (QA fixture)') },
});
module.exports = { fixture, entries, load };
