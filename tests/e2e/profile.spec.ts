import { expect, test } from '@playwright/test';

test('homepage exposes portfolio paths and the runtime year', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: '查看工作流', exact: true })).toHaveAttribute('href', '/workflows/');
  await expect(page.getByRole('link', { name: '浏览视觉作品', exact: true })).toHaveAttribute('href', '/visuals/');
  await expect(page.locator('[data-portfolio-year]')).toHaveText(String(new Date().getFullYear()));
});

test('homepage introduces Forest through verified identity and capabilities', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('森林');
  await expect(page.getByText('5 年视觉设计经验', { exact: false })).toBeVisible();

  const capabilities = page.locator('.capability-list');
  for (const label of ['视觉设计', 'AI 生图', '内容工作流', '个人工作台']) {
    await expect(capabilities.getByRole('heading', { name: label, exact: true })).toBeVisible();
  }

  await expect(page.getByText(/求职|入职|自由职业/)).toHaveCount(0);
});

test('homepage presents the real experience narrative without invented profile details', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('用 Photoshop 完成海报、电商、自媒体与活动视觉', { exact: true })).toBeVisible();
  await expect(page.getByText('把设计判断放进 AI 生图、内容生产与个人工作流', { exact: true })).toBeVisible();
  await expect(page.locator('[data-profile-location]')).toHaveCount(0);
  await expect(page.locator('[data-profile-availability]')).toHaveCount(0);
  await expect(page.locator('[data-profile-resume]')).toHaveCount(0);
  await expect(page.locator('[data-profile-social-links]')).toHaveCount(0);
});

test('homepage exposes Forest’s WeChat contact without overflowing on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('.contact-anchor')).toHaveAttribute('href', '/#contact');
  await expect(page.locator('.about-section__next')).toHaveAttribute('href', '#contact');
  const qr = page.getByRole('img', { name: '森林的微信联系二维码' });
  await expect(qr).toBeVisible();
  await expect(qr).toHaveAttribute('src', '/images/contact/forest-wechat-qr.png');
  await expect(page.getByText('微信联系 / 扫码添加森林', { exact: true })).toBeVisible();
  const geometry = await qr.evaluate((image) => ({
    width: image.getBoundingClientRect().width,
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));
  expect(geometry.width).toBeLessThanOrEqual(200);
  expect(geometry.pageWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});

test('published portfolio surfaces no longer show placeholder badges', async ({ page }) => {
  const routes = [
    '/',
    '/visuals/',
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByText('结构示例', { exact: true })).toHaveCount(0);
  }
});

test('real workflow links do not carry demo status', async ({ page }) => {
  await page.goto('/workflows/');

  await expect(page.getByRole('link', {
    name: '查看工作流：公众号快速创作',
    exact: true,
  })).toBeVisible();
  await expect(page.getByText('结构示例', { exact: true })).toHaveCount(0);
});
