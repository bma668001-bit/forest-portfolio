import { describe, expect, it } from 'vitest';
import { normalizeManifest, renderVisualYaml } from '../../scripts/lib/visual-manifest.mjs';

const valid = {
  id: 'poster-001',
  file: 'demo/workflow-field.svg',
  title: '编辑式海报实验',
  alt: '暖米色抽象工作流海报',
  category: '海报',
  year: 2026,
  order: 10,
  featured: true,
  projectId: 'editorial-system',
};

describe('visual manifest', () => {
  it('rejects duplicate ids', () => {
    expect(() => normalizeManifest([valid, valid])).toThrow(/duplicate id: poster-001/i);
  });

  it('rejects parent-directory file paths', () => {
    expect(() => normalizeManifest([{ ...valid, file: '../secret.png' }])).toThrow(/unsafe file path/i);
  });

  it('renders deterministic content fields', () => {
    const rendered = renderVisualYaml(valid, { width: 1600, height: 1000 });

    expect(rendered).toContain('projectId: editorial-system');
    expect(rendered).toContain('width: 1600');
    expect(rendered).toContain('height: 1000');
  });
});
