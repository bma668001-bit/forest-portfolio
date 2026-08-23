import { expect, test } from '@playwright/test';

test('homepage exposes portfolio paths and the runtime year', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: '查看工作流', exact: true })).toHaveAttribute('href', '/workflows/');
  await expect(page.getByRole('link', { name: '浏览视觉作品', exact: true })).toHaveAttribute('href', '/visuals/');
  await expect(page.locator('[data-portfolio-year]')).toHaveText(String(new Date().getFullYear()));
});

test('homepage presents the real experience narrative without invented profile details', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('海报、电商、自媒体与活动视觉设计', { exact: true })).toBeVisible();
  await expect(page.getByText('AI 内容工作流与视觉应用实践', { exact: true })).toBeVisible();
  await expect(page.locator('[data-profile-location]')).toHaveCount(0);
  await expect(page.locator('[data-profile-availability]')).toHaveCount(0);
  await expect(page.locator('[data-profile-resume]')).toHaveCount(0);
  await expect(page.locator('[data-profile-social-links]')).toHaveCount(0);
  await expect(page.locator('.contact-anchor')).toHaveCount(0);
  await expect(page.getByRole('link', { name: '浏览视觉作品', exact: true })).toBeVisible();
});

test('demo content carries one consistent structure label across portfolio surfaces', async ({ page }) => {
  const routes = [
    '/',
    '/workflows/',
    '/workflows/wechat-writing/',
    '/visuals/',
    '/projects/editorial-system/',
    '/thoughts/',
    '/thoughts/from-design-to-workflow/',
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByText('结构示例', { exact: true }).first()).toBeVisible();
  }
});

test('demo workflow links expose their demo status in the accessible name', async ({ page }) => {
  await page.goto('/workflows/');

  await expect(page.getByRole('link', {
    name: '查看工作流：公众号快速创作（演示内容）',
    exact: true,
  })).toBeVisible();
});
