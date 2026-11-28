/* eslint-disable @typescript-eslint/no-require-imports -- Read-only tests of rendered production HTML. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3127';

async function read(route) {
  const response = await fetch(new URL(route, base));
  assert.equal(response.status, 200, route);
  return response.text();
}

function schemas(html) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]));
}

test('review title has one brand and remains a noindex utility page', async () => {
  const html = await read('/review');
  assert.equal(html.match(/<title>(.*?)<\/title>/)?.[1], 'Leave a Review | Apex Home Services');
  assert.ok(/name="robots" content="noindex, follow"/.test(html));
});

test('public pages and auth screens return basic protection headers', async () => {
  for (const path of ['/', '/review', '/services/cooling/ac-repair', '/admin/login']) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  }
});

test('sitemap lists public reviews but has no invented modification dates', async () => {
  const xml = await read('/sitemap.xml');
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  assert.equal(new Set(paths).size, paths.length);
  assert.equal(paths.filter(path => path === '/reviews').length, 1);
  assert.ok(!paths.includes('/review'));
  const dated = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .filter(match => match[1].includes('<lastmod>'));
  assert.equal(dated.length, 13, 'Only the 13 approved articles have authored publication dates');
  for (const entry of dated) {
    const path = new URL(entry[1].match(/<loc>(.*?)<\/loc>/)[1]).pathname;
    assert.match(path, /^\/blog\/[^/]+$/);
    assert.ok(entry[1].includes('<lastmod>2026-11-28</lastmod>'));
  }
});

test('home and About identify the same organization without fabricated locations', async () => {
  const entries = await Promise.all(['/', '/about'].map(async route => {
    const data = schemas(await read(route)).find(item => item['@type'] === 'Organization');
    assert.ok(data, route);
    assert.ok(data['@id'].endsWith('/#organization'));
    assert.equal(new URL(data.url).pathname, '/');
    assert.ok(data.logo.startsWith('http'));
    assert.equal(data.address, undefined);
    assert.equal(data.aggregateRating, undefined);
    assert.equal(data.areaServed.length, 18);
    assert.deepEqual([...new Set(data.areaServed.map(area => area.containedInPlace.name))].sort(), ['Connecticut', 'New Jersey', 'New York']);
    const suffolk = data.areaServed.filter(area => area.name === 'Suffolk County');
    assert.deepEqual(suffolk.map(area => area.containedInPlace.name), ['New York']);
    return data;
  }));
  assert.deepEqual(entries[0], entries[1]);
});

test('every service has ordered breadcrumbs ending at its canonical URL', async () => {
  const paths = [
    '/services/appliance-repair', '/services/cooling', '/services/heating', '/services/water-heater-repair',
    ...['ac-repair', 'ac-installation', 'ac-maintenance', 'ac-replacement'].map(slug => '/services/cooling/' + slug),
    ...['furnace-repair', 'heat-pumps', 'heating-maintenance', 'boiler-repair'].map(slug => '/services/heating/' + slug),
  ];
  for (const path of paths) {
    const html = await read(path);
    const graph = schemas(html);
    const breadcrumbs = graph.find(item => item['@type'] === 'BreadcrumbList');
    assert.ok(breadcrumbs, path);
    const items = breadcrumbs.itemListElement;
    assert.deepEqual(items.map(item => item.position), path.split('/').length === 4 ? [1, 2, 3, 4] : [1, 2, 3]);
    assert.equal(new URL(items[0].item).pathname, '/');
    assert.equal(new URL(items[1].item).pathname, '/services');
    assert.equal(new URL(items.at(-1).item).pathname, path);
    assert.ok(items.every(item => item.name.trim().length > 0));
    const service = graph.find(item => item['@type'] === 'Service');
    assert.equal(new URL(service.url).pathname, path);
    assert.ok(service.broker['@id'].endsWith('/#organization'));
    assert.equal(service.provider, undefined);
    assert.equal(typeof service.areaServed, 'string');
    assert.match(service.areaServed, /ZIP/);
  }
});
