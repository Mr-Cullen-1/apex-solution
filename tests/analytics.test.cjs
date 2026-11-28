/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS harness for the actual TypeScript domain modules. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Load the actual pure domain modules with the project's path alias, without
// introducing a test framework or coupling tests to a Next server.
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const localRequire = (name) => name.startsWith('@/')
    ? load(path.join(__dirname, '../src', name.slice(2) + '.ts'))
    : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name);
  new Function('require', 'module', 'exports', code)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const modulePath = path.join(__dirname, '../src/features/analytics/events.ts');
test('safe analytics context removes every query/hash and rejects private origins/routes', () => {
  const { analyticsContext } = load(modulePath);
  assert.equal(typeof analyticsContext, 'function');
  const location = { hostname: 'apexhomesupport.com', origin: 'https://apexhomesupport.com', pathname: '/contact', search: '?email=secret', hash: '#token' };
  assert.deepEqual(analyticsContext(location), { analytics_allowed: true, page_location: 'https://apexhomesupport.com/contact', page_referrer: '', page_path: '/contact', page_title: 'Apex Home Services' });
  for (const pathname of ['/admin/login', '/review/secret', '/l/secret', '/unknown', '/contact/secret']) assert.equal(analyticsContext({ ...location, pathname }), null);
  assert.equal(analyticsContext({ ...location, hostname: 'admin.apexhomesupport.com' }), null);
});
test('adapter exists and rejects arbitrary payloads, private routes, invalid catalog values', () => {
  assert.ok(fs.existsSync(modulePath), 'Frontend analytics adapter is missing');
  const { trackEvent } = load(modulePath);
  global.window = { location: { hostname: 'apexhomesupport.com', origin: 'https://apexhomesupport.com', pathname: '/contact', search: '?email=private@example.test' }, dataLayer: [] };
  const props = { placement: 'header', initiator: 'booking_cta', category_id: 'cooling', service_id: 'ac-repair', email: 'private@example.test', requestId: 'secret' };
  trackEvent('booking_click', props);
  assert.equal(window.dataLayer.length, 1);
  assert.deepEqual(window.dataLayer[0], { ...load(modulePath).analyticsContext(window.location), event: 'booking_click', placement: 'header', initiator: 'booking_cta', page_path: '/contact', form_id: 'book_now', category_id: 'cooling', service_id: 'ac-repair', contact_method: null });
  for (const pathname of ['/admin', '/admin/login', '/review', '/review/private-token', '/l/private-token', '/unknown/private']) {
    window.location.pathname = pathname; trackEvent('booking_click', props);
  }
  window.location.pathname = '/'; window.location.hostname = 'admin.apexhomesupport.com'; trackEvent('booking_click', props);
  assert.equal(window.dataLayer.length, 1);
  window.location.hostname = 'apexhomesupport.com';
  for (const name of ['page_view', 'phone_lead', 'unknown']) trackEvent(name, props);
  trackEvent('booking_click', { ...props, placement: 'private@example.test' });
  trackEvent('booking_click', { ...props, initiator: 'PRIVATE_TOKEN' });
  assert.equal(window.dataLayer.length, 1);
  trackEvent('booking_click', { ...props, category_id: 'PRIVATE_NAME', service_id: 'PRIVATE_TOKEN' });
  assert.equal(window.dataLayer[1].category_id, null); assert.equal(window.dataLayer[1].service_id, null);
  trackEvent('phone_click', { placement: 'header', initiator: 'link', phone: '5165550199' });
  assert.equal(window.dataLayer[2].form_id, null); assert.equal(window.dataLayer[2].category_id, null);
  assert.equal(window.dataLayer[2].contact_method, 'phone');
  assert.ok(!JSON.stringify(window.dataLayer).includes('PRIVATE')); assert.ok(!JSON.stringify(window.dataLayer).includes('@'));
  window.dataLayer.push = () => { throw new Error('Tag failure'); };
  assert.doesNotThrow(() => trackEvent('phone_click', { placement: 'header', initiator: 'link' }));
  delete global.window;
  assert.doesNotThrow(() => trackEvent('phone_click', { placement: 'header', initiator: 'link' }));
});
