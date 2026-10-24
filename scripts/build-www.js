const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const wwwDir = path.join(rootDir, 'www');

if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

const filesToCopy = [
  'index.html',
  'style.css',
  'app.js',
  'audio.js',
  'stickers.js',
  'sample_photos.js',
  'manifest.json',
  'favicon.svg',
  'favicon-32x32.png',
  'favicon.ico',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'logo.svg'
];

filesToCopy.forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(wwwDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} -> www/${file}`);
  }
});

console.log('Build www completed successfully!');
