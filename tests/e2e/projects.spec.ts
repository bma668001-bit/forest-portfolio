import { expect, test } from '@playwright/test';

test('the representative project tells the real workbench story', async ({ page }) => {
  await page.goto('/projects/book-video-workbench/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('图书类短视频半自动工作台');
  await expect(page.getByText('不追求表面上的全自动', { exact: false })).toBeVisible();
  await expect(page.getByText(/API Key|后台地址/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: '返回视觉作品' })).toBeVisible();
});
