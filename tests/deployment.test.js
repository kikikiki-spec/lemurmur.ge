const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const output = path.join(root, 'dist');
const runtimeFiles = ['app.js', 'core.js', 'index.html', 'styles.css', 'translations.js'];

test('Vercel uses the static build with no dependency install or functions', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, 'npm run build');
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.installCommand, '');
  assert.equal(config.functions, undefined);
  assert.equal(config.rewrites, undefined);
});

test('static build preserves website files, resolves assets and removes stale output', () => {
  const build = () => execFileSync(process.execPath, [path.join(root, 'scripts', 'build.js')], { cwd: root });
  build();
  assert.deepEqual(fs.readdirSync(output).sort(), [...runtimeFiles, 'assets'].sort());
  for (const filename of runtimeFiles) {
    assert.deepEqual(fs.readFileSync(path.join(output, filename)), fs.readFileSync(path.join(root, filename)), filename + ' must remain unchanged');
  }
  const assets = fs.readdirSync(path.join(output, 'assets')).sort();
  assert.deepEqual(assets, ['bedroom.jpg', 'detail.jpg', 'favicon.svg', 'living.jpg', 'lobby.jpg']);
  for (const filename of assets) {
    assert.deepEqual(fs.readFileSync(path.join(output, 'assets', filename)), fs.readFileSync(path.join(root, 'assets', filename)));
  }
  const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/.test(reference)) continue;
    assert.ok(fs.statSync(path.join(output, reference)).isFile(), reference + ' must be published');
  }
  fs.writeFileSync(path.join(output, 'stale.js'), 'obsolete');
  build();
  assert.equal(fs.existsSync(path.join(output, 'stale.js')), false);
  for (const filename of ['server.js', 'package.json', 'tests', 'docs', '.git', 'assets/README.md']) {
    assert.equal(fs.existsSync(path.join(output, filename)), false, filename + ' must not be published');
  }
});
