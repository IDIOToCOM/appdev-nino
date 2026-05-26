/**
 * Generates Android + iOS launcher icons from assets/images/uto-car-rentals-logo.png
 * Run: node scripts/generate-app-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'assets/images/uto-car-rentals-logo.png');

const BG = { r: 255, g: 255, b: 255, alpha: 1 };

async function squareIcon(size, paddingRatio, outPath) {
  const padding = Math.round(size * paddingRatio);
  const inner = size - padding * 2;
  const logo = await sharp(source)
    .resize(inner, inner, { fit: 'contain', background: BG })
    .png()
    .toBuffer();
  const meta = await sharp(logo).metadata();
  const left = Math.round((size - meta.width) / 2);
  const top = Math.round((size - meta.height) / 2);

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(outPath);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

const androidRes = path.join(root, 'android/app/src/main/res');

const legacy = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const adaptiveForeground = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

console.log('Source:', source);

for (const [folder, size] of Object.entries(legacy)) {
  const dir = path.join(androidRes, folder);
  ensureDir(dir);
  await squareIcon(size, 0.1, path.join(dir, 'ic_launcher.png'));
  await squareIcon(size, 0.1, path.join(dir, 'ic_launcher_round.png'));
  console.log('Android', folder, size);
}

for (const [folder, size] of Object.entries(adaptiveForeground)) {
  const dir = path.join(androidRes, folder);
  ensureDir(dir);
  await squareIcon(size, 0.14, path.join(dir, 'ic_launcher_foreground.png'));
  console.log('Android foreground', folder, size);
}

ensureDir(path.join(androidRes, 'mipmap-anydpi-v26'));
fs.writeFileSync(
  path.join(androidRes, 'mipmap-anydpi-v26/ic_launcher.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`,
);
fs.writeFileSync(
  path.join(androidRes, 'mipmap-anydpi-v26/ic_launcher_round.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`,
);

ensureDir(path.join(androidRes, 'values'));
const colorsPath = path.join(androidRes, 'values/colors.xml');
if (!fs.existsSync(colorsPath)) {
  fs.writeFileSync(
    colorsPath,
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`,
  );
} else {
  let colors = fs.readFileSync(colorsPath, 'utf8');
  if (!colors.includes('ic_launcher_background')) {
    colors = colors.replace(
      '</resources>',
      '    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>',
    );
    fs.writeFileSync(colorsPath, colors);
  }
}

const iosDir = path.join(root, 'ios/Samson/Images.xcassets/AppIcon.appiconset');
ensureDir(iosDir);

const iosIcons = [
  { name: 'Icon-20@2x.png', size: 40 },
  { name: 'Icon-20@3x.png', size: 60 },
  { name: 'Icon-29@2x.png', size: 58 },
  { name: 'Icon-29@3x.png', size: 87 },
  { name: 'Icon-40@2x.png', size: 80 },
  { name: 'Icon-40@3x.png', size: 120 },
  { name: 'Icon-60@2x.png', size: 120 },
  { name: 'Icon-60@3x.png', size: 180 },
  { name: 'Icon-1024.png', size: 1024 },
];

for (const { name, size } of iosIcons) {
  await squareIcon(size, 0.1, path.join(iosDir, name));
  console.log('iOS', name, size);
}

const contents = {
  images: [
    { size: '20x20', idiom: 'iphone', filename: 'Icon-20@2x.png', scale: '2x' },
    { size: '20x20', idiom: 'iphone', filename: 'Icon-20@3x.png', scale: '3x' },
    { size: '29x29', idiom: 'iphone', filename: 'Icon-29@2x.png', scale: '2x' },
    { size: '29x29', idiom: 'iphone', filename: 'Icon-29@3x.png', scale: '3x' },
    { size: '40x40', idiom: 'iphone', filename: 'Icon-40@2x.png', scale: '2x' },
    { size: '40x40', idiom: 'iphone', filename: 'Icon-40@3x.png', scale: '3x' },
    { size: '60x60', idiom: 'iphone', filename: 'Icon-60@2x.png', scale: '2x' },
    { size: '60x60', idiom: 'iphone', filename: 'Icon-60@3x.png', scale: '3x' },
    {
      size: '1024x1024',
      idiom: 'ios-marketing',
      filename: 'Icon-1024.png',
      scale: '1x',
    },
  ],
  info: { author: 'xcode', version: 1 },
};

fs.writeFileSync(
  path.join(iosDir, 'Contents.json'),
  JSON.stringify(contents, null, 2),
);

console.log('Done. Rebuild the app: npx react-native run-android');
