import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(readFileSync('content/visuals-manifest.json', 'utf8'));

describe('curated portfolio import', () => {
  it('publishes the approved collection and homepage selection', () => {
    expect(manifest).toHaveLength(57);
    expect(manifest.filter((item: { featured?: boolean }) => item.featured)).toHaveLength(8);
    expect(new Set(manifest.map((item: { category: string }) => item.category))).toEqual(
      new Set(['商业视觉', '电商主图', '节日热点图', '自媒体封面']),
    );
    expect(manifest.every((item: { demo?: boolean }) => item.demo !== true)).toBe(true);
  });

  it('uses stable public filenames backed by real files', () => {
    for (const item of manifest as Array<{ id: string; file: string }>) {
      expect(item.id).toMatch(/^(cm|ec|fd|sc)-\d{2}$/);
      expect(item.file).toMatch(/^visuals\/(commercial|ecommerce|festival|social)\/[a-z]{2}-\d{2}\.jpg$/);
      expect(existsSync(path.join('public/images', item.file)), item.file).toBe(true);
    }
  });
});
