import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { normalizeManifest, renderVisualYaml } from '../../scripts/lib/visual-manifest.mjs';

const valid = {
  id: 'poster-001',
  file: 'demo/workflow-field.svg',
  title: '编辑式海报实验',
  alt: '暖米色抽象工作流海报',
  category: '海报',
  era: 'ai-assisted',
  description: '用于验证作品归档的暖米色演示海报。',
  tools: ['SVG', 'AI 辅助编排'],
  year: 2026,
  order: 10,
  demo: true,
  featured: true,
  projectId: 'editorial-system',
  workflowId: 'wechat-writing',
};

describe('visual manifest', () => {
  it('rejects duplicate ids', () => {
    expect(() => normalizeManifest([valid, valid])).toThrow(/duplicate id: poster-001/i);
  });

  it('rejects parent-directory file paths', () => {
    expect(() => normalizeManifest([{ ...valid, file: '../secret.png' }])).toThrow(/unsafe file path/i);
  });

  it('preserves and renders creative metadata', () => {
    const [normalized] = normalizeManifest([valid]);
    const rendered = renderVisualYaml(normalized, { width: 1600, height: 1000 });

    expect(normalized).toMatchObject({
      era: 'ai-assisted',
      description: valid.description,
      tools: ['SVG', 'AI 辅助编排'],
      workflowId: 'wechat-writing',
      projectId: 'editorial-system',
      demo: true,
    });
    expect(parse(rendered)).toMatchObject({
      title: valid.title,
      category: valid.category,
      era: 'ai-assisted',
      description: valid.description,
      tools: ['SVG', 'AI 辅助编排'],
      workflowId: 'wechat-writing',
      projectId: 'editorial-system',
      demo: true,
    });
  });

  it('rejects unsupported creative eras', () => {
    expect(() => normalizeManifest([{ ...valid, era: 'future-made' }])).toThrow(/invalid era/i);
  });

  it('requires a visual description', () => {
    expect(() => normalizeManifest([{ ...valid, description: '' }])).toThrow(/description/i);
  });

  it('defaults omitted tools to an empty list', () => {
    const { tools: _tools, ...withoutTools } = valid;
    const [normalized] = normalizeManifest([withoutTools]);

    expect(normalized.tools).toEqual([]);
  });

  it('rejects blank tool names', () => {
    expect(() => normalizeManifest([{ ...valid, tools: ['SVG', '  '] }])).toThrow(/invalid tools/i);
  });

  it('rejects non-array tool metadata', () => {
    expect(() => normalizeManifest([{ ...valid, tools: null }])).toThrow(/invalid tools/i);
  });

  it('rejects invalid workflow ids', () => {
    expect(() => normalizeManifest([{ ...valid, workflowId: 'Wechat Writing' }])).toThrow(/invalid workflowId/i);
  });

  it('renders deterministic content fields', () => {
    const rendered = renderVisualYaml(valid, { width: 1600, height: 1000 });

    expect(rendered).toContain('projectId: editorial-system');
    expect(rendered).toContain('width: 1600');
    expect(rendered).toContain('height: 1000');
  });
});
