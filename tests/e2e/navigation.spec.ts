import { expect, test } from '@playwright/test';

test('primary navigation reaches every archive', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('link', { name: '工作流' })).toHaveAttribute('href', /workflows/);
  await expect(page.getByRole('link', { name: '视觉作品' })).toHaveAttribute('href', /visuals/);
  await expect(page.getByRole('link', { name: '思考' })).toHaveAttribute('href', /thoughts/);
});

test('mobile menu opens and closes with accessible state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const openButton = page.getByRole('button', { name: '打开导航' });
  await openButton.click();
  const closeButton = page.getByRole('button', { name: '关闭导航' });
  await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
  await closeButton.click();
  await expect(page.getByRole('button', { name: '打开导航' })).toHaveAttribute('aria-expanded', 'false');
});
