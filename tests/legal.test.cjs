/* eslint-disable @typescript-eslint/no-require-imports -- Server-render actual draft pages. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { renderToStaticMarkup } = require('react-dom/server');
const load = require('./load-ts.cjs')();
test('legal routes are explicit pending drafts with own canonicals and noindex', () => {
  for (const slug of ['privacy-policy', 'terms']) {
    const file = `src/app/(marketing)/${slug}/page.tsx`;
    assert.ok(fs.existsSync(file), `${slug} route missing`);
    const page = load(file);
    assert.deepEqual(page.metadata.robots, { index: false, follow: true });
    assert.equal(page.metadata.alternates.canonical, '/' + slug);
    const html = renderToStaticMarkup(page.default());
    assert.match(html, /Awaiting business-owner approval/);
    assert.match(html, /not an approved/);
    assert.doesNotMatch(html, /effective date|binding arbitration|we never sell/i);
  }
});
