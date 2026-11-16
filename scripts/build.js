const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const output = path.join(root, 'dist');
const runtimeFiles = ['index.html', 'styles.css', 'translations.js', 'core.js', 'app.js'];
const assetExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.otf']);

for (const filename of runtimeFiles) {
  if (!fs.statSync(path.join(root, filename)).isFile()) throw new Error('Missing website file: ' + filename);
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const filename of runtimeFiles) fs.copyFileSync(path.join(root, filename), path.join(output, filename));
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), {
  recursive: true,
  filter: source => fs.statSync(source).isDirectory() || assetExtensions.has(path.extname(source).toLowerCase())
});
console.log('Static website built in dist/. No server or serverless functions required.');
