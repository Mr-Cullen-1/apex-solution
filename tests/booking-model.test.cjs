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
const { normalizeBookNowPayload, validateBookNowPayload } = load(path.join(__dirname, '../src/features/booking/model.ts'));
const valid = { fullName: 'Test Customer', phone: '(516) 586-0826', zipCode: '06810', message: 'Cooling request', serviceTextConsent: false };

test('phone validation rejects punctuation, short numbers and non-US country codes', () => {
  for (const phone of ['-------', '.......', '1234567', '+44 20 1234 5678', '516abc5860826']) {
    assert.ok(validateBookNowPayload(normalizeBookNowPayload({ ...valid, phone })).phone, phone);
  }
});
test('accepts formatted US numbers and optional email/consent', () => {
  for (const phone of ['(516) 586-0826', '+1 516 586 0826', '5165860826']) {
    assert.deepEqual(validateBookNowPayload(normalizeBookNowPayload({ ...valid, phone })), {});
  }
});
test('ZIP keeps leading zero and rejects non-five-digit input', () => {
  assert.equal(normalizeBookNowPayload(valid).zipCode, '06810');
  for (const zipCode of ['6810', '10001-1234', 'abcde']) assert.ok(validateBookNowPayload(normalizeBookNowPayload({ ...valid, zipCode })).zipCode);
});
test('request normalization retains service, offer, issue and campaign context', () => {
  const result = normalizeBookNowPayload({ ...valid, categoryId: 'cooling', serviceId: 'ac-repair', offer: true, issue: 'not-cooling', campaignToken: 'test-token', sourcePath: '/services/cooling/ac-repair', email: ' PERSON@EXAMPLE.COM ' });
  assert.equal(result.serviceId, 'ac-repair');
  assert.equal(result.categoryId, 'cooling');
  assert.equal(result.campaignToken, 'test-token');
  assert.equal(result.offer, true);
  assert.equal(result.issue, 'not-cooling');
  assert.equal(result.email, 'person@example.com');
  assert.equal(result.sourcePath, '/services/cooling/ac-repair');
});
