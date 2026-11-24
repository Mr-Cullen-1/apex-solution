/* eslint-disable @typescript-eslint/no-require-imports -- Small loader for isolated actual TypeScript modules. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
module.exports = function createLoader(stubs = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (!fs.existsSync(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file, mod);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const localRequire = name => Object.hasOwn(stubs, name) ? stubs[name] : name === 'server-only' ? {} : name.startsWith('@/') ? load(path.join(__dirname, '../src', name.slice(2))) : name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : require(name);
    new Function('require', 'module', 'exports', code)(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
};
