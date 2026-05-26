/**
 * Metro expects back-icon@3x.png but @react-navigation/elements ships
 * platform-specific names (back-icon@3x.android.png). Copy aliases after install.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const assetsDir = path.join(
  root,
  'node_modules/@react-navigation/elements/lib/module/assets',
);

if (!fs.existsSync(assetsDir)) {
  process.exit(0);
}

const pairs = [
  ['back-icon@1x.android.png', 'back-icon@1x.png'],
  ['back-icon@2x.android.png', 'back-icon@2x.png'],
  ['back-icon@3x.android.png', 'back-icon@3x.png'],
  ['back-icon@4x.android.png', 'back-icon@4x.png'],
];

for (const [src, dest] of pairs) {
  const srcPath = path.join(assetsDir, src);
  const destPath = path.join(assetsDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
}
