import { expect, test } from '@playwright/test';

test('a representative visual links to its project story', async ({ page }) => {
  await page.goto('/visuals/');
  await page.getByRole('link', { name: '查看项目：编辑式视觉系统' }).click();
  await expect(page).toHaveURL(/projects\/editorial-system\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('编辑式视觉系统');
  await expect(page.getByText('项目背景', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '返回视觉作品' })).toBeVisible();
});
