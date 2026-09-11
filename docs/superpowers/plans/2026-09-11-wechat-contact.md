# WeChat Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Forest's supplied WeChat QR image to the existing footer contact area and expose the existing contact navigation paths.

**Architecture:** Keep contact data in the existing profile collection, render it through the existing `Footer.astro` component, and style a dedicated QR figure in the shared stylesheet. Preserve the source image exactly in `public/images/contact/`; no image processing or new client-side JavaScript is needed.

**Tech Stack:** Astro 7, YAML content collections, CSS, Playwright.

---

### Task 1: Define the contact behavior with a failing browser test

**Files:**
- Modify: `tests/e2e/profile.spec.ts`

- [ ] **Step 1: Replace the old empty-contact assertions and add the QR acceptance test**

```ts
test('homepage exposes Forest’s WeChat contact without overflowing on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('.contact-anchor')).toHaveAttribute('href', '/#contact');
  await expect(page.locator('.about-section__next')).toHaveAttribute('href', '/#contact');
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "WeChat contact"`

Expected: FAIL because the profile has no `wechatQr` and the QR image is absent.

- [ ] **Step 3: Commit the failing behavior test**

```powershell
git add tests/e2e/profile.spec.ts
git commit -m "test: define wechat contact behavior"
```

### Task 2: Add the source image and contact presentation

**Files:**
- Create: `public/images/contact/forest-wechat-qr.png`
- Modify: `src/data/profile/profile.yaml`
- Modify: `src/components/Footer.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Copy the supplied image without recompressing it**

```powershell
New-Item -ItemType Directory -Force 'public/images/contact'
Copy-Item -LiteralPath 'C:\Users\78779\AppData\Local\Temp\codex-clipboard-0f35cd80-f656-4eed-9e3c-39a5aa9e83db.png' -Destination 'public/images/contact/forest-wechat-qr.png'
```

- [ ] **Step 2: Point the profile at the public image**

```yaml
wechatQr: /images/contact/forest-wechat-qr.png
```

- [ ] **Step 3: Render a semantic QR figure in the footer**

```astro
{profile.wechatQr && (
  <figure class="site-footer__wechat">
    <img src={withBase(profile.wechatQr)} alt="森林的微信联系二维码" width="200" height="300" loading="lazy" />
    <figcaption>微信联系 / 扫码添加森林</figcaption>
  </figure>
)}
```

- [ ] **Step 4: Add restrained responsive styling**

```css
.site-footer__wechat { margin: .75rem 0 0; }
.site-footer__wechat img { width: min(12.5rem, 100%); height: auto; padding: .45rem; background: #fff; }
.site-footer__wechat figcaption { margin-top: .65rem; font-size: .7rem; letter-spacing: .08em; color: color-mix(in srgb, var(--paper) 72%, transparent); }
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "WeChat contact"`

Expected: PASS.

- [ ] **Step 6: Commit the feature files**

```powershell
git add public/images/contact/forest-wechat-qr.png src/data/profile/profile.yaml src/components/Footer.astro src/styles/global.css tests/e2e/profile.spec.ts
git commit -m "feat: add wechat contact to portfolio footer"
```

### Task 3: Verify visual quality and regressions

**Files:**
- Verify only: homepage footer at desktop and mobile widths

- [ ] **Step 1: Run static checks and unit tests**

Run: `npm run check`

Expected: zero Astro diagnostics and all Vitest tests pass.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: all static routes build successfully.

- [ ] **Step 3: Run the full browser suite**

Run: `npm run test:e2e`

Expected: all desktop and mobile Playwright tests pass.

- [ ] **Step 4: Inspect the footer at 1440px and 390px**

Confirm that the QR image is uncropped, remains at or below 200 CSS pixels wide, keeps white quiet space, and does not create horizontal overflow.
