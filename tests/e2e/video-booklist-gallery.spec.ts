import { expect, test } from '@playwright/test';

test('video booklist workflow presents five ordered case-study graphics', async ({ page }) => {
  await page.goto('/workflows/video-booklist/');

  const gallery = page.getByRole('region', { name: '案例图解' });
  await expect(gallery).toBeVisible();
  const images = gallery.locator('img');
  await expect(images).toHaveCount(5);
  expect(await images.evaluateAll((items: HTMLImageElement[]) => items.map((image) => image.getAttribute('src')))).toEqual([
    '/images/workbenches/video-booklist/input-copy.png',
    '/images/workbenches/video-booklist/structure-breakdown.png',
    '/images/workbenches/video-booklist/visual-generation.png',
    '/images/workbenches/video-booklist/delivery-info.png',
    '/images/workbenches/video-booklist/quality-check.png',
  ]);
  expect(await images.evaluateAll((items: HTMLImageElement[]) => items.map((image) => [image.getAttribute('width'), image.getAttribute('height')]))).toEqual([
    ['679', '510'], ['679', '510'], ['679', '510'], ['679', '510'], ['679', '511'],
  ]);
  await expect(gallery.locator('figcaption')).toHaveText([
    '输入与文案处理：先把原始材料整理成可编辑、可确认的文本。',
    '结构拆分：把确认后的内容拆成清晰、可修改的节点。',
    '视觉生成与筛选：统一参考条件，批量生成后再逐项确认。',
    '交付信息整理：将成品、发布信息和可复用材料集中整理。',
    '质量检查与最终格式：统一检查规则，输出可以直接使用的版本。',
  ]);
});
