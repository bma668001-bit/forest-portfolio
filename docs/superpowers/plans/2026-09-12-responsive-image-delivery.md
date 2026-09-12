# Responsive Image Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve appropriately sized WebP images on mobile and desktop without changing portfolio content or visual layout.

**Architecture:** A source helper derives base-aware 640px, 1024px, and 1600px WebP URLs from existing public image paths. A reusable Astro component outputs the standard image attributes plus `srcset`; image files are generated under `public/images/optimized/` while current originals remain intact.

**Tech Stack:** Astro 7, TypeScript, Vitest, Playwright, Node.js Sharp, GitHub Pages.

---

### Task 1: Define responsive image source generation

**Files:**
- Create: `tests/unit/responsive-image.test.ts`
- Create: `src/lib/responsive-image.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { responsiveImageSources } from '../../src/lib/responsive-image';

describe('responsiveImageSources', () => {
  it('creates base-aware mobile, tablet, and desktop WebP candidates', () => {
    expect(responsiveImageSources('/images/visuals/commercial/cm-02.jpg', '/forest-portfolio/')).toEqual({
      src: '/forest-portfolio/images/optimized/visuals/commercial/cm-02-1024.webp',
      srcset: '/forest-portfolio/images/optimized/visuals/commercial/cm-02-640.webp 640w, /forest-portfolio/images/optimized/visuals/commercial/cm-02-1024.webp 1024w, /forest-portfolio/images/optimized/visuals/commercial/cm-02-1600.webp 1600w',
    });
  });

  it('does not optimize the QR code', () => {
    expect(responsiveImageSources('/images/contact/forest-wechat-qr.png', '/')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/responsive-image.test.ts`

Expected: FAIL because `src/lib/responsive-image.ts` does not exist.

- [ ] **Step 3: Implement the source helper**

```ts
import { joinBase } from './url';

const QR_PATH = '/images/contact/forest-wechat-qr.png';
const WIDTHS = [640, 1024, 1600] as const;

export function responsiveImageSources(src: string, base: string) {
  if (src === QR_PATH || !src.startsWith('/images/')) return null;
  const relative = src.slice('/images/'.length).replace(/\.(?:png|jpe?g|webp)$/i, '');
  const urls = WIDTHS.map((width) => joinBase(base, `images/optimized/${relative}-${width}.webp`));
  return { src: urls[1], srcset: urls.map((url, index) => `${url} ${WIDTHS[index]}w`).join(', ') };
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `npx vitest run tests/unit/responsive-image.test.ts`

Expected: PASS with 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/responsive-image.ts tests/unit/responsive-image.test.ts
git commit -m "feat: add responsive image source helper"
```

### Task 2: Generate WebP derivatives

**Files:**
- Create: `scripts/generate-responsive-images.mjs`
- Create: `tests/unit/responsive-image-assets.test.ts`
- Create: `public/images/optimized/` generated derivatives
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Write the failing asset test**

```ts
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('responsive image assets', () => {
  it('includes optimized portrait variants', () => {
    for (const width of [640, 1024, 1600]) {
      expect(existsSync(`public/images/optimized/contact/forest-portrait-${width}.webp`)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/responsive-image-assets.test.ts`

Expected: FAIL because optimized portrait files do not exist.

- [ ] **Step 3: Implement the generator and run it**

```js
import { glob, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const widths = [640, 1024, 1600];
for await (const file of glob('public/images/**/*.{jpg,jpeg,png,webp}')) {
  if (file.endsWith('forest-wechat-qr.png')) continue;
  const relative = path.relative('public/images', file).replace(/\.[^.]+$/, '');
  for (const width of widths) {
    const output = path.join('public/images/optimized', `${relative}-${width}.webp`);
    await mkdir(path.dirname(output), { recursive: true });
    await sharp(file).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
  }
}
```

Install `sharp` as a development dependency and add `content:images` to package scripts.

- [ ] **Step 4: Verify generated assets**

Run: `npm run content:images; npx vitest run tests/unit/responsive-image-assets.test.ts`

Expected: PASS and each portrait candidate exists.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json scripts/generate-responsive-images.mjs tests/unit/responsive-image-assets.test.ts public/images/optimized
git commit -m "feat: generate responsive WebP assets"
```

### Task 3: Render responsive candidates in published pages

**Files:**
- Create: `src/components/ResponsiveImage.astro`
- Modify: `src/components/VisualCard.astro`
- Modify: `src/components/TraditionalVisualGrid.astro`
- Modify: `src/components/WorkflowCaseGallery.astro`
- Modify: `src/components/ProjectGallery.astro`
- Modify: `src/components/HomeSections.astro`
- Modify: `src/pages/visuals/index.astro`
- Modify: `src/pages/workflows/[id].astro`
- Modify: `src/pages/projects/[id].astro`
- Modify: `src/pages/thoughts/[id].astro`
- Modify: `tests/e2e/profile.spec.ts`

- [ ] **Step 1: Write the failing browser assertion**

```ts
test('serves responsive candidates for the portrait', async ({ page }) => {
  await page.goto('/');
  const portrait = page.locator('.about-section__portrait img');
  await expect(portrait).toHaveAttribute('srcset', /forest-portrait-640\.webp 640w/);
  await expect(portrait).toHaveAttribute('sizes', /(max-width: 767px) 92vw/);
});
```

- [ ] **Step 2: Run the assertion to verify it fails**

Run: `npx playwright test tests/e2e/profile.spec.ts --project=chromium`

Expected: FAIL because portrait has no `srcset`.

- [ ] **Step 3: Implement the reusable image component**

```astro
---
import { responsiveImageSources } from '../lib/responsive-image';
import { withBase } from '../lib/url';
interface Props { src: string; alt: string; width: number; height: number; loading?: 'eager' | 'lazy'; sizes?: string; class?: string; }
const { src, alt, width, height, loading = 'lazy', sizes = '(max-width: 767px) 92vw, (max-width: 1200px) 48vw, 800px', ...attributes } = Astro.props;
const candidates = responsiveImageSources(src, import.meta.env.BASE_URL);
---
<img {...attributes} src={candidates?.src ?? withBase(src)} srcset={candidates?.srcset} sizes={candidates ? sizes : undefined} alt={alt} width={width} height={height} loading={loading} decoding="async" />
```

Replace each non-QR published image in the listed files with `ResponsiveImage`. Preserve existing alt text, dimensions, loading strategy, and classes. Use `sizes="(max-width: 767px) 92vw, 45vw"` for grids and `sizes="(max-width: 767px) 92vw, 520px"` for article galleries.

- [ ] **Step 4: Verify focused browser test**

Run: `npx playwright test tests/e2e/profile.spec.ts --project=chromium`

Expected: PASS and the portrait contains 640w and 1024w candidates.

- [ ] **Step 5: Commit**

```bash
git add src/components src/pages tests/e2e/profile.spec.ts
git commit -m "feat: serve responsive portfolio images"
```

### Task 4: Verify mobile selection and deploy

**Files:**
- Modify: `tests/e2e/mobile.spec.ts`

- [ ] **Step 1: Write the failing mobile request test**

```ts
test('requests the 640px portrait candidate on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/#about');
  await expect(page.locator('.about-section__portrait img')).toBeVisible();
  expect(requests.some((url) => url.includes('forest-portrait-640.webp'))).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails before the final sizes adjustment**

Run: `npx playwright test tests/e2e/mobile.spec.ts --project=chromium`

Expected: FAIL if the browser chooses a non-640px candidate.

- [ ] **Step 3: Adjust only the portrait sizes prop if needed**

```astro
<ResponsiveImage {...profile.portrait} sizes="(max-width: 767px) 92vw, 440px" />
```

- [ ] **Step 4: Run all validation**

Run: `npm run check; npm run build; npx playwright test tests/e2e/mobile.spec.ts --project=chromium`

Expected: Astro diagnostics show 0 errors, Vitest is green, static build succeeds, and mobile requests the 640px image.

- [ ] **Step 5: Deploy and verify production**

```bash
git add tests/e2e/mobile.spec.ts
git commit -m "test: verify mobile image candidates"
git push
```

Check `https://bma668001-bit.github.io/forest-portfolio/` for HTTP 200 and confirm its portrait `srcset` includes `forest-portrait-640.webp`.

