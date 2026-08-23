import { describe, expect, it } from 'vitest';
import { filterPublished, sortByOrder } from '../../src/lib/content';

describe('content helpers', () => {
  it('removes draft items', () => {
    expect(filterPublished([{ draft: false }, { draft: true }])).toHaveLength(1);
  });

  it('sorts lower order values first without mutating input', () => {
    const items = [{ order: 20 }, { order: 10 }];

    expect(sortByOrder(items).map((item) => item.order)).toEqual([10, 20]);
    expect(items.map((item) => item.order)).toEqual([20, 10]);
  });
});
