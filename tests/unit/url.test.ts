import { describe, expect, it } from 'vitest';

import { joinBase, withBase } from '../../src/lib/url';

describe('joinBase', () => {
  it.each([
    ['/', '/workflows/', '/workflows/'],
    ['/portfolio/', '/workflows/', '/portfolio/workflows/'],
    ['/portfolio', 'images/a.webp', '/portfolio/images/a.webp'],
    ['/portfolio/', '', '/portfolio/'],
  ])('joins %s and %s', (base, path, expected) => {
    expect(joinBase(base, path)).toBe(expected);
  });

  it.each([
    'https://example.com/a',
    'mailto:name@example.com',
    'tel:123',
    '#about',
    'data:image/svg+xml,x',
  ])('leaves %s unchanged', (path) => {
    expect(joinBase('/portfolio/', path)).toBe(path);
  });
});

describe('withBase', () => {
  it('uses the configured site base', () => {
    expect(withBase('/workflows/')).toBe('/workflows/');
  });
});
