import { expect, test } from '@playwright/test';

test('wechat workflow presents four ordered case-study graphics', async ({ page }) => {
  await page.goto('/workflows/wechat-writing/');

  const gallery = page.getByRole('region', { name: '案例图解' });
  await expect(gallery).toBeVisible();
  const images = gallery.locator('img');
  await expect(images).toHaveCount(4);
  expect(await images.evaluateAll((items: HTMLImageElement[]) => items.map((image) => [image.getAttribute('width'), image.getAttribute('height')]))).toEqual([
    ['1448', '1086'], ['1448', '1086'], ['1448', '1086'], ['1448', '1086'],
  ]);
  expect(await images.evaluateAll((items: HTMLImageElement[]) => items.map((image) => image.getAttribute('src')))).toEqual([
    '/images/workbenches/wechat-writing/content-system.png',
    '/images/workbenches/wechat-writing/six-step-flow.png',
    '/images/workbenches/wechat-writing/privacy-boundary.png',
    '/images/workbenches/wechat-writing/reusable-deliverables.png',
  ]);
  await expect(gallery.locator('figcaption')).toHaveText([
    '内容生产系统总览：从想法到成品。',
    '六步工作顺序：输入、判断、创作、视觉、检查、交付。',
    '信息安全原则：展示方法、节点和交付物，隐藏账号、路径、来源与数据。',
    '可复用交付物：内容成品、视觉版本和流程模板。',
  ]);
});

test('workflows without case graphics do not render an empty gallery', async ({ page }) => {
  await page.goto('/workflows/video-booklist/');
  await expect(page.getByRole('region', { name: '案例图解' })).toHaveCount(0);
});

test('workflow case gallery becomes one column without mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/workflows/wechat-writing/');

  const geometry = await page.locator('.workflow-case-grid').evaluate((grid) => ({
    columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(geometry.columns).toBe(1);
  expect(geometry.pageWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});
