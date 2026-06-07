// Rasterize the brand SVG into Capacitor asset sources using sharp (already a
// transitive dep). Produces a crisp 1024px icon and a 2732px brand-bg splash.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SVG = 'public/icons/icon-512x512.svg';
const BG = '#0f1729';

if (!existsSync(SVG)) {
  console.error(`Missing source SVG: ${SVG}`);
  process.exit(1);
}

await mkdir('assets', { recursive: true });

// Icon: 1024x1024 from the vector source.
await sharp(SVG, { density: 512 })
  .resize(1024, 1024, { fit: 'contain', background: BG })
  .png()
  .toFile('assets/icon-only.png');

// Splash: 2732x2732 brand background with the icon centered (~37% width).
const iconForSplash = await sharp(SVG, { density: 512 })
  .resize(1000, 1000, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: { width: 2732, height: 2732, channels: 4, background: BG },
})
  .composite([{ input: iconForSplash, gravity: 'center' }])
  .png()
  .toFile('assets/splash.png');

console.log('Wrote assets/icon-only.png (1024) and assets/splash.png (2732)');
