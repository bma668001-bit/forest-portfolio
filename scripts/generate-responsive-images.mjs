import { glob, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const imageRoot = 'public/images';
const outputRoot = path.join(imageRoot, 'optimized');
const widths = [640, 1024, 1600];
const excludedFiles = new Set(['contact/forest-wechat-qr.png']);

let generated = 0;

for await (const file of glob(`${imageRoot}/**/*.{jpg,jpeg,png,webp}`)) {
  const relativeFile = path.relative(imageRoot, file).replace(/\\/g, '/');

  if (relativeFile.startsWith('optimized/') || excludedFiles.has(relativeFile)) continue;

  const relativeStem = relativeFile.replace(/\.[^.]+$/, '');
  const image = sharp(file, { animated: false }).rotate();

  for (const width of widths) {
    const output = path.join(outputRoot, `${relativeStem}-${width}.webp`);
    await mkdir(path.dirname(output), { recursive: true });
    await image.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(output);
    generated += 1;
  }
}

console.log(`Generated ${generated} responsive WebP files.`);
