import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('responsive image assets', () => {
  it('includes optimized portrait variants', () => {
    for (const width of [640, 1024, 1600]) {
      expect(existsSync(`public/images/optimized/contact/forest-portrait-${width}.webp`)).toBe(true);
    }
  });
});

