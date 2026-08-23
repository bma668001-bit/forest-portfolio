import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { imageSizeFromFile } from 'image-size/fromFile';
import { normalizeManifest, renderVisualYaml } from './lib/visual-manifest.mjs';

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, 'content', 'visuals-manifest.json');
const imageRoot = path.join(projectRoot, 'public', 'images');
const outputRoot = path.join(projectRoot, 'src', 'data', 'visuals', 'generated');
const checkOnly = process.argv.includes('--check');

const inside = (root, candidate) => {
  const relative = path.relative(root, candidate);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
};

const manifest = normalizeManifest(JSON.parse(await readFile(manifestPath, 'utf8')));
const expectedFiles = new Set();
const differences = [];

if (!checkOnly) await mkdir(outputRoot, { recursive: true });

for (const entry of manifest) {
  const imagePath = path.resolve(imageRoot, entry.file);
  if (!inside(imageRoot, imagePath)) throw new Error(`resolved image path is outside public/images: ${entry.file}`);
  const dimensions = await imageSizeFromFile(imagePath);
  const output = renderVisualYaml(entry, dimensions);
  const outputPath = path.join(outputRoot, `${entry.id}.yaml`);
  expectedFiles.add(`${entry.id}.yaml`);

  if (checkOnly) {
    let current = '';
    try { current = await readFile(outputPath, 'utf8'); } catch { differences.push(`${entry.id}.yaml is missing`); continue; }
    if (current !== output) differences.push(`${entry.id}.yaml is out of date`);
  } else {
    await writeFile(outputPath, output, 'utf8');
  }
}

let existingGenerated = [];
try { existingGenerated = (await readdir(outputRoot)).filter((file) => file.endsWith('.yaml')); } catch { existingGenerated = []; }
const extras = existingGenerated.filter((file) => !expectedFiles.has(file));
if (extras.length) differences.push(`generated files not present in manifest: ${extras.join(', ')}`);

if (differences.length) {
  throw new Error(differences.join('\n'));
}

console.log(`${checkOnly ? 'Checked' : 'Generated'} ${manifest.length} visual records from ${path.relative(projectRoot, manifestPath)}.`);
