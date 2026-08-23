import { stringify } from 'yaml';

const REQUIRED_TEXT = ['id', 'file', 'title', 'alt', 'category'];
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const assertText = (entry, field) => {
  if (typeof entry[field] !== 'string' || !entry[field].trim()) {
    throw new Error(`missing or empty field: ${field}`);
  }
};

const assertSafeFile = (file) => {
  const segments = file.split(/[\\/]/);
  if (file.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(file) || segments.includes('..') || segments.includes('.')) {
    throw new Error(`unsafe file path: ${file}`);
  }
};

export function normalizeManifest(input) {
  if (!Array.isArray(input)) throw new Error('visual manifest must be an array');
  const ids = new Set();

  return input.map((source, index) => {
    if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error(`entry ${index + 1} must be an object`);
    for (const field of REQUIRED_TEXT) assertText(source, field);
    const id = source.id.trim();
    if (!ID_PATTERN.test(id)) throw new Error(`invalid id: ${id}`);
    if (ids.has(id)) throw new Error(`duplicate id: ${id}`);
    ids.add(id);
    const file = source.file.trim().replaceAll('\\', '/');
    assertSafeFile(file);
    if (!Number.isInteger(source.year) || source.year < 1900 || source.year > 2100) throw new Error(`invalid year for ${id}`);
    if (!Number.isInteger(source.order) || source.order <= 0) throw new Error(`invalid order for ${id}`);
    if (source.projectId !== undefined && (typeof source.projectId !== 'string' || !ID_PATTERN.test(source.projectId))) throw new Error(`invalid projectId for ${id}`);

    return {
      id,
      file,
      title: source.title.trim(),
      alt: source.alt.trim(),
      category: source.category.trim(),
      year: source.year,
      order: source.order,
      draft: source.draft === true,
      demo: source.demo === true,
      featured: source.featured === true,
      ...(source.projectId ? { projectId: source.projectId } : {}),
    };
  });
}

export function renderVisualYaml(entry, dimensions) {
  if (!Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height) || dimensions.width <= 0 || dimensions.height <= 0) {
    throw new Error(`invalid image dimensions for ${entry.id}`);
  }
  const record = {
    title: entry.title,
    order: entry.order,
    draft: entry.draft === true,
    demo: entry.demo === true,
    category: entry.category,
    year: entry.year,
    featured: entry.featured === true,
    ...(entry.projectId ? { projectId: entry.projectId } : {}),
    image: {
      src: `/images/${entry.file}`,
      alt: entry.alt,
      width: dimensions.width,
      height: dimensions.height,
    },
  };
  return stringify(record, { lineWidth: 0 });
}
