/* eslint-disable @typescript-eslint/no-require-imports -- Standalone regression for the browser-observed acronym match. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const loaded = { exports: {} };
const source = fs.readFileSync(path.join(__dirname, '../src/lib/service-search.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
new Function('module', 'exports', code)(loaded, loaded.exports);
const { matchesServiceQuery } = loaded.exports;

test('AC repair does not match furnace or diagnostics substrings', () => {
  assert.equal(matchesServiceQuery({ name: 'Furnace Repair', shortDescription: 'Residential heating diagnostics and repair.' }, 'AC repair'), false);
  assert.equal(matchesServiceQuery({ name: 'Cooling', shortDescription: 'Cooling diagnostics, repair, installation, maintenance, and replacement.' }, 'AC repair'), false);
  assert.equal(matchesServiceQuery({ name: 'AC Repair', shortDescription: 'Cooling repair service.' }, 'AC repair'), true);
});
test('search supports word prefixes, hyphenated names and case-insensitive phrases', () => {
  assert.equal(matchesServiceQuery({ name: 'Heat-pump Maintenance', shortDescription: '' }, '  HEAT pump  '), true);
  assert.equal(matchesServiceQuery({ name: 'AC Maintenance', shortDescription: '' }, 'ac maint'), true);
  assert.equal(matchesServiceQuery({ name: 'AC Maintenance', shortDescription: '' }, 'repair'), false);
});
test('clearing search restores the complete directory', () => {
  assert.equal(matchesServiceQuery({ name: 'Heating', shortDescription: '' }, '   '), true);
});
