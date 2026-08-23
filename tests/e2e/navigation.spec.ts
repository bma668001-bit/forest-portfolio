import { expect, test } from '@playwright/test';

test('primary navigation reaches every archive', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('link', { name: '返回首页：AI 工作流与视觉设计个人作品集', exact: true })).toHaveAttribute('href', '/');
  const links = page.locator('#primary-navigation a');
  await expect(links.filter({ hasText: /^工作流$/ })).toHaveAttribute('href', /\/workflows\/$/);
  await expect(links.filter({ hasText: /^视觉作品$/ })).toHaveAttribute('href', /\/visuals\/$/);
  await expect(links.filter({ hasText: /^思考$/ })).toHaveAttribute('href', /\/thoughts\/$/);
});

test('header section links return detail pages home without an empty contact target', async ({ page }) => {
  await page.goto('/workflows/wechat-writing/');
  await expect(page.locator('#primary-navigation a', { hasText: /^关于$/ })).toHaveAttribute('href', '/#about');
  await expect(page.locator('.contact-anchor')).toHaveCount(0);
});

test('mobile menu is inert while closed and moves focus into the opened navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const navigation = page.locator('#primary-navigation');
  const openButton = page.getByRole('button', { name: '打开导航' });
  await expect(navigation).toHaveAttribute('inert', '');
  await expect(navigation).toHaveAttribute('aria-hidden', 'true');
  await expect(openButton).toHaveAttribute('aria-controls', 'primary-navigation');

  await openButton.click();
  const closeButton = page.getByRole('button', { name: '关闭导航' });
  await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).not.toHaveAttribute('inert', '');
  await expect(navigation).not.toHaveAttribute('aria-hidden', 'true');
  await expect(navigation.getByRole('link').first()).toBeFocused();
});

test('mobile menu traps Tab in both directions and Escape restores toggle focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const toggle = page.getByRole('button', { name: '打开导航' });
  const navigation = page.locator('#primary-navigation');
  const firstLink = navigation.getByRole('link').first();
  const lastLink = navigation.getByRole('link').last();

  await toggle.click();
  await expect(firstLink).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: '关闭导航' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(lastLink).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '关闭导航' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(firstLink).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '打开导航' })).toBeFocused();
  await expect(navigation).toHaveAttribute('inert', '');
  await expect(navigation).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('body')).not.toHaveAttribute('data-navigation-open', 'true');
});

test('mobile menu closes and unlocks scrolling when a navigation link is activated', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const navigation = page.locator('#primary-navigation');
  await page.getByRole('button', { name: '打开导航' }).click();
  const workflowLink = navigation.getByRole('link', { name: '工作流', exact: true });
  await workflowLink.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault(), { once: true }));
  await workflowLink.click();

  await expect(page.getByRole('button', { name: '打开导航' })).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toHaveAttribute('inert', '');
  await expect(navigation).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('body')).not.toHaveAttribute('data-navigation-open', 'true');
});

test('desktop navigation never carries mobile inert state', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  const navigation = page.locator('#primary-navigation');
  await expect(navigation).not.toHaveAttribute('inert', '');
  await expect(navigation).not.toHaveAttribute('aria-hidden', 'true');
});

test('archive and detail routes mark exactly one current portfolio section', async ({ page }) => {
  const routes = [
    { path: '/workflows/', current: '工作流' },
    { path: '/workflows/wechat-writing/', current: '工作流' },
    { path: '/visuals/', current: '视觉作品' },
    { path: '/projects/editorial-system/', current: '视觉作品' },
    { path: '/thoughts/', current: '思考' },
    { path: '/thoughts/from-design-to-workflow/', current: '思考' },
  ];

  for (const { path, current } of routes) {
    await page.goto(path);
    const currentLinks = page.locator('#primary-navigation a[aria-current="page"]');
    await expect(currentLinks).toHaveCount(1);
    await expect(currentLinks).toHaveText(current);
  }
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
