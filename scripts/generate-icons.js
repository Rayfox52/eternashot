const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. High-resolution 512x512 SVG Master Icon (Y2K Neo-Brutalist ETN_00)
// Designed for extreme legibility at 16px, 32px, 48px, 192px, and 512px.
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Sharp Neo-brutalist drop shadow filter -->
    <filter id="brutal-shadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="12" dy="12" stdDeviation="0" flood-color="#000000" flood-opacity="1" />
    </filter>
  </defs>

  <!-- Dark Obsidian Base Background -->
  <rect width="512" height="512" rx="112" fill="#090b10"/>

  <!-- Subtle Y2K Grid Pattern in Background -->
  <g opacity="0.15">
    <line x1="128" y1="0" x2="128" y2="512" stroke="#ffffff" stroke-width="2"/>
    <line x1="256" y1="0" x2="256" y2="512" stroke="#ffffff" stroke-width="2"/>
    <line x1="384" y1="0" x2="384" y2="512" stroke="#ffffff" stroke-width="2"/>
    <line x1="0" y1="128" x2="512" y2="128" stroke="#ffffff" stroke-width="2"/>
    <line x1="0" y1="256" x2="512" y2="256" stroke="#ffffff" stroke-width="2"/>
    <line x1="0" y1="384" x2="512" y2="384" stroke="#ffffff" stroke-width="2"/>
  </g>

  <!-- Hard Neo-Brutalist Shadow Layer -->
  <rect x="58" y="58" width="410" height="410" rx="72" fill="#000000" />

  <!-- Main Electric Cyber Lime Stamp Badge -->
  <rect x="44" y="44" width="410" height="410" rx="72" fill="#ccff00" stroke="#000000" stroke-width="16" />

  <!-- Camera / Shutter Aperture Accent Ring (Top Right) -->
  <circle cx="400" cy="100" r="14" fill="#000000"/>
  <circle cx="400" cy="100" r="6" fill="#00e5ff"/>

  <!-- Top Micro-Label: ETERNA LAB -->
  <text x="74" y="112" font-family="'Courier New', Courier, monospace" font-size="24" font-weight="900" fill="#000000" letter-spacing="3">ETERNASHOT</text>

  <!-- Divider Line -->
  <line x1="74" y1="130" x2="438" y2="130" stroke="#000000" stroke-width="6"/>

  <!-- Big Bold Brutalist "ETN" (Line 1) -->
  <text x="249" y="275" font-family="'Arial Black', 'Impact', 'Space Grotesk', sans-serif" font-size="142" font-weight="900" text-anchor="middle" fill="#000000" letter-spacing="-2">ETN</text>

  <!-- Big Bold Brutalist "_00" with Shutter Aperture Lens (Line 2) -->
  <!-- Left: Underline underscore bar -->
  <rect x="94" y="380" width="48" height="18" fill="#000000" rx="4"/>
  
  <!-- "0" Digit 1 -->
  <text x="215" y="420" font-family="'Arial Black', 'Impact', 'Space Grotesk', sans-serif" font-size="132" font-weight="900" text-anchor="middle" fill="#000000">0</text>

  <!-- "0" Digit 2 with Camera Shutter / Aperture Iris Center -->
  <text x="345" y="420" font-family="'Arial Black', 'Impact', 'Space Grotesk', sans-serif" font-size="132" font-weight="900" text-anchor="middle" fill="#000000">0</text>
  <!-- Cyber lens iris dot inside second 0 -->
  <circle cx="345" cy="382" r="15" fill="#ff2a70"/>
  <circle cx="345" cy="382" r="6" fill="#ffffff"/>

  <!-- Corner Notch Crosshairs -->
  <path d="M 60 70 L 60 90 M 60 70 L 80 70" stroke="#000000" stroke-width="4" stroke-linecap="square"/>
  <path d="M 438 424 L 438 404 M 438 424 L 418 424" stroke="#000000" stroke-width="4" stroke-linecap="square"/>
</svg>`;

// Also generate a Simplified Pure Favicon for 16x16 / 32x32 (clean, giant ETN / 00 without micro-labels)
const faviconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!-- Solid Cyber Lime Rounded Base -->
  <rect width="128" height="128" rx="26" fill="#ccff00" stroke="#000000" stroke-width="8"/>
  <!-- ETN Text -->
  <text x="64" y="66" font-family="'Arial Black', 'Impact', sans-serif" font-size="46" font-weight="900" text-anchor="middle" fill="#000000" letter-spacing="-1">ETN</text>
  <!-- 00 Text with neon lens dot -->
  <text x="64" y="108" font-family="'Arial Black', 'Impact', sans-serif" font-size="42" font-weight="900" text-anchor="middle" fill="#000000">_00</text>
</svg>`;

async function generateAllIcons() {
  const rootDir = path.resolve(__dirname, '..');
  const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

  // 1. Save Web SVG Favicon
  fs.writeFileSync(path.join(rootDir, 'favicon.svg'), faviconSvgContent);
  fs.writeFileSync(path.join(rootDir, 'logo.svg'), svgContent);
  console.log('Saved favicon.svg and logo.svg');

  // 2. Render Web PNG Icons
  await sharp(Buffer.from(faviconSvgContent)).resize(32, 32).png().toFile(path.join(rootDir, 'favicon-32x32.png'));
  await sharp(Buffer.from(faviconSvgContent)).resize(48, 48).png().toFile(path.join(rootDir, 'favicon.ico')); // standard ico
  await sharp(Buffer.from(svgContent)).resize(180, 180).png().toFile(path.join(rootDir, 'apple-touch-icon.png'));
  await sharp(Buffer.from(svgContent)).resize(192, 192).png().toFile(path.join(rootDir, 'icon-192.png'));
  await sharp(Buffer.from(svgContent)).resize(512, 512).png().toFile(path.join(rootDir, 'icon-512.png'));
  console.log('Saved web icons: favicon-32x32.png, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png');

  // 3. Render Android Mipmap Icons
  const androidDensities = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 }
  ];

  // Android Round Icon SVG (circular badge)
  const roundSvgContent = svgContent.replace('rx="112"', 'rx="256"');

  for (const { dir, size } of androidDensities) {
    const targetDir = path.join(resDir, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Square launcher
    await sharp(Buffer.from(svgContent)).resize(size, size).png().toFile(path.join(targetDir, 'ic_launcher.png'));
    // Round launcher
    await sharp(Buffer.from(roundSvgContent)).resize(size, size).png().toFile(path.join(targetDir, 'ic_launcher_round.png'));
    // Foreground launcher (centered on transparent canvas for adaptive icons)
    const fgPadding = Math.round(size * 0.15);
    const innerSize = size - fgPadding * 2;
    const innerBuf = await sharp(Buffer.from(svgContent)).resize(innerSize, innerSize).png().toBuffer();
    
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: innerBuf, top: fgPadding, left: fgPadding }])
    .png()
    .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Rendered Android icons for ${dir} (${size}x${size})`);
  }

  // 4. Also copy web icons into www/ if it exists
  const wwwDir = path.join(rootDir, 'www');
  if (fs.existsSync(wwwDir)) {
    ['favicon.svg', 'logo.svg', 'favicon-32x32.png', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'].forEach(file => {
      fs.copyFileSync(path.join(rootDir, file), path.join(wwwDir, file));
    });
    console.log('Copied all icons into www/');
  }

  console.log('All icons generated successfully!');
}

generateAllIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
