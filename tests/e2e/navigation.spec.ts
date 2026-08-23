import { expect, test } from '@playwright/test';

test('primary navigation reaches every archive', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('link', { name: '工作流', exact: true })).toHaveAttribute('href', /workflows/);
  await expect(page.getByRole('link', { name: '视觉作品', exact: true })).toHaveAttribute('href', /visuals/);
  await expect(page.getByRole('link', { name: '思考', exact: true })).toHaveAttribute('href', /thoughts/);
});

test('header section links return detail pages to the home page', async ({ page }) => {
  await page.goto('/workflows/wechat-writing/');
  await expect(page.getByRole('link', { name: '关于', exact: true })).toHaveAttribute('href', '/#about');
  await expect(page.locator('.contact-anchor')).toHaveAttribute('href', '/#contact');
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

test('workflow archive exposes status and detail routes', async ({ page }) => {
  await page.goto('/workflows/');
  await expect(page.getByRole('heading', { level: 1, name: '工作流档案' })).toBeVisible();
  await page.getByRole('link', { name: /公众号快速创作/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('公众号快速创作');
  await expect(page.getByRole('link', { name: '返回工作流档案' })).toBeVisible();
});

test('thoughts archive separates articles and short notes', async ({ page }) => {
  await page.goto('/thoughts/');
  await expect(page.getByRole('heading', { name: '文章' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '短灵感' })).toBeVisible();
});

test('unknown path renders a useful 404', async ({ page }) => {
  await page.goto('/not-a-real-page/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('没有找到这个页面');
  await expect(page.getByRole('link', { name: '回到首页' })).toBeVisible();
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
