# Personal Portfolio Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, content-driven Astro framework for a warm editorial personal portfolio, with extensible workflow, visual, article, and note collections ready for the user's real material.

**Architecture:** Astro prerenders all pages from validated local Markdown/YAML data. Shared layout and focused components own presentation; small TypeScript modules own filtering, lightbox, navigation, and the optional Canvas hero so the site remains usable when JavaScript or motion is unavailable.

**Tech Stack:** Astro, TypeScript, Astro Content Layer, CSS, Canvas 2D, Vitest, Playwright, GitHub Actions, GitHub Pages

---

## File structure

```text
.github/workflows/deploy.yml           GitHub Pages build and deploy
astro.config.mjs                       Astro site/base configuration
package.json                           scripts and dependencies
playwright.config.ts                   browser test configuration
tsconfig.json                          strict TypeScript settings
public/fonts/                          locally hosted open-source fonts
public/images/demo/                    small neutral demo artwork set
src/content.config.ts                  all collection schemas
src/data/profile/profile.yaml          editable identity and contact data
src/data/workflows/*.md                extensible workflow entries
src/data/visuals/*.yaml                gallery entries
src/data/articles/*.md                 long-form writing
src/data/notes/*.yaml                  short notes
src/layouts/BaseLayout.astro           document shell, metadata, header, footer
src/layouts/DetailLayout.astro         shared detail-page shell
src/components/Header.astro            navigation and mobile menu
src/components/Footer.astro            compact site-wide contact footer
src/components/HeroField.astro         first-screen editorial hero
src/components/WorkflowCard.astro      workflow summary presentation
src/components/VisualCard.astro        gallery item presentation
src/components/Lightbox.astro          accessible image viewer
src/components/SectionHeading.astro    shared editorial section heading
src/components/HomeSections.astro      homepage content composition
src/lib/content.ts                     sorting and filtering helpers
src/scripts/hero-field.ts              reduced-motion-aware Canvas animation
src/scripts/gallery.ts                 gallery filter and lightbox behavior
src/styles/global.css                  tokens, layout, typography, responsive CSS
src/pages/index.astro                  homepage
src/pages/workflows/index.astro        workflow archive
src/pages/workflows/[id].astro         workflow detail routes
src/pages/visuals/index.astro          filterable visual archive
src/pages/thoughts/index.astro         article and short-note archive
src/pages/thoughts/[id].astro          article routes
src/pages/404.astro                    custom not-found page
tests/unit/content.test.ts             content helper tests
tests/e2e/navigation.spec.ts           navigation and mobile smoke tests
tests/e2e/gallery.spec.ts              filters and lightbox tests
tests/e2e/motion.spec.ts               reduced-motion fallback test
```

### Task 1: Bootstrap the tested Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Create the package manifest**

Use this exact script set; dependency versions are resolved and locked by npm at install time:

```json
{
  "name": "personal-portfolio",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "astro check && vitest run"
  }
}
```

- [ ] **Step 2: Install runtime and test dependencies**

Run:

```powershell
npm install astro @astrojs/check @astrojs/sitemap typescript
npm install --save-dev vitest @playwright/test
npx playwright install chromium
```

Expected: `package-lock.json` is created and all commands exit with code 0.

- [ ] **Step 3: Add strict project configuration**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isUserSite = repo.endsWith('.github.io');

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.GITHUB_ACTIONS === 'true' && !isUserSite ? `/${repo}` : '/',
  integrations: [sitemap()],
  build: { assets: '_assets' },
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { include: ['tests/unit/**/*.test.ts'] } });
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:4321', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

`.gitignore`:

```text
node_modules/
dist/
.astro/
playwright-report/
test-results/
.DS_Store
```

- [ ] **Step 4: Verify the toolchain**

Run: `npx astro --version; npx vitest --version; npx playwright --version`

Expected: all three tools print a version.

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts .gitignore
git commit -m "build: bootstrap Astro portfolio"
```

### Task 2: Define content contracts and demo entries

**Files:**
- Create: `src/content.config.ts`
- Create: `src/data/profile/profile.yaml`
- Create: `src/data/workflows/wechat-writing.md`
- Create: `src/data/workflows/video-booklist.md`
- Create: `src/data/visuals/editorial-poster.yaml`
- Create: `src/data/visuals/social-cover.yaml`
- Create: `src/data/articles/from-design-to-workflow.md`
- Create: `src/data/notes/workflow-is-a-product.yaml`
- Create: `src/lib/content.ts`
- Test: `tests/unit/content.test.ts`

- [ ] **Step 1: Write failing helper tests**

```ts
import { describe, expect, it } from 'vitest';
import { filterPublished, sortByOrder } from '../../src/lib/content';

describe('content helpers', () => {
  it('removes drafts', () => {
    expect(filterPublished([{ draft: false }, { draft: true }])).toHaveLength(1);
  });

  it('sorts lower order values first', () => {
    expect(sortByOrder([{ order: 20 }, { order: 10 }]).map((item) => item.order)).toEqual([10, 20]);
  });
});
```

- [ ] **Step 2: Run the test and confirm the intended failure**

Run: `npm test`

Expected: FAIL because `src/lib/content.ts` does not exist.

- [ ] **Step 3: Implement typed helpers**

```ts
type Publishable = { draft: boolean };
type Orderable = { order: number };

export const filterPublished = <T extends Publishable>(items: T[]) =>
  items.filter((item) => !item.draft);

export const sortByOrder = <T extends Orderable>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order);
```

- [ ] **Step 4: Define collection schemas**

Create collections with `glob()` loaders and strict schemas. Workflow status must be `active | evolving | archived`; `featured` must remain an independent boolean. Visual category must be a free non-empty string so later categories require no schema change. Profile contact values may be empty and the UI must hide empty actions.

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const image = z.object({ src: z.string().min(1), alt: z.string().min(1), width: z.number().positive(), height: z.number().positive() });
const base = { title: z.string().min(1), order: z.number().int(), draft: z.boolean().default(false) };

const workflows = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/workflows' }),
  schema: z.object({ ...base, summary: z.string().min(1), year: z.number().int(), status: z.enum(['active', 'evolving', 'archived']), featured: z.boolean().default(false), cover: image, tools: z.array(z.string()).default([]), versionOf: z.string().optional() }),
});
const visuals = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/visuals' }),
  schema: z.object({ ...base, category: z.string().min(1), year: z.number().int(), image, featured: z.boolean().default(false), projectId: z.string().optional() }),
});
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/articles' }),
  schema: z.object({ ...base, summary: z.string().min(1), publishedAt: z.coerce.date(), cover: image.optional() }),
});
const notes = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/notes' }),
  schema: z.object({ ...base, text: z.string().min(1), publishedAt: z.coerce.date() }),
});
const profile = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/profile' }),
  schema: z.object({ name: z.string().min(1), role: z.string().min(1), status: z.string().min(1), bio: z.string().min(1), email: z.string(), wechatQr: z.string(), tools: z.array(z.string()), experience: z.array(z.object({ period: z.string(), label: z.string() })) }),
});

export const collections = { workflows, visuals, articles, notes, profile };
```

- [ ] **Step 5: Add neutral demo content**

Use the real known workflow names—公众号快速创作 and 视频书单号—and abstract local SVG artwork under `/images/demo/`. Mark all demo records with `draft: false`; their descriptions must state they are framework demonstrations rather than claims of measured outcomes.

- [ ] **Step 6: Verify schemas and tests**

Run: `npm test; npx astro sync`

Expected: unit tests pass and Astro sync reports no schema errors.

- [ ] **Step 7: Commit**

```powershell
git add src/content.config.ts src/data src/lib/content.ts public/images/demo tests/unit/content.test.ts
git commit -m "feat: add extensible portfolio content model"
```

### Task 3: Build the global editorial design system

**Files:**
- Create: `src/styles/global.css`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/SectionHeading.astro`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/DetailLayout.astro`
- Create: `tests/e2e/navigation.spec.ts`

- [ ] **Step 1: Write failing navigation tests**

```ts
import { expect, test } from '@playwright/test';

test('primary navigation reaches every archive', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('link', { name: '工作流' })).toHaveAttribute('href', /workflows/);
  await expect(page.getByRole('link', { name: '视觉作品' })).toHaveAttribute('href', /visuals/);
  await expect(page.getByRole('link', { name: '思考' })).toHaveAttribute('href', /thoughts/);
});

test('mobile menu opens and closes with accessible state', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: '打开导航' });
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: '关闭导航' }).click();
  await expect(page.getByRole('button', { name: '打开导航' })).toHaveAttribute('aria-expanded', 'false');
});
```

- [ ] **Step 2: Run the tests and confirm the intended failure**

Run: `npm run test:e2e -- navigation.spec.ts --project=desktop`

Expected: FAIL because the homepage and shared layout do not exist.

- [ ] **Step 3: Create the visual tokens**

In `global.css`, define the approved palette (`--paper: #ede6d8`, `--ink: #241b16`, `--espresso: #30231d`, `--clay: #a85f3b`, `--gold: #c6a36a`, `--sage: #72745e`), fluid type with `clamp()`, 12-column desktop grids, focus outlines, reduced-motion rules, and breakpoints at 960px and 640px. Set `box-sizing`, body margin, background, foreground, and a readable Chinese system-font stack before local fonts load.

- [ ] **Step 4: Implement the shared shell**

`BaseLayout.astro` must accept `title`, `description`, and optional `image`; emit canonical URL and Open Graph metadata; include a skip link, `Header`, main slot, and `Footer`. Build URLs with `import.meta.env.BASE_URL` so project-site deployment works. `Header.astro` must use a button-controlled mobile panel and close on Escape. `Footer.astro` must render email and QR actions only when the corresponding profile value is non-empty.

- [ ] **Step 5: Implement the detail shell and section heading**

`DetailLayout.astro` wraps `BaseLayout`, adds a back link, title, summary, metadata slot, body slot, and previous/next navigation slot. `SectionHeading.astro` accepts `eyebrow`, `title`, and optional `href`/`linkLabel`.

- [ ] **Step 6: Run browser and type checks**

Run: `npm run build; npm run test:e2e -- navigation.spec.ts`

Expected: build succeeds; both desktop and mobile navigation tests pass.

- [ ] **Step 7: Commit**

```powershell
git add src/styles src/components src/layouts tests/e2e/navigation.spec.ts
git commit -m "feat: add warm editorial site shell"
```

### Task 4: Build the homepage and motion-safe hero

**Files:**
- Create: `src/components/HeroField.astro`
- Create: `src/components/HomeSections.astro`
- Create: `src/components/WorkflowCard.astro`
- Create: `src/components/VisualCard.astro`
- Create: `src/scripts/hero-field.ts`
- Create: `src/pages/index.astro`
- Create: `tests/e2e/motion.spec.ts`

- [ ] **Step 1: Write the failing homepage and reduced-motion tests**

```ts
import { expect, test } from '@playwright/test';

test('homepage communicates the portfolio focus', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI WORKFLOW');
  await expect(page.getByRole('heading', { name: '工作流精选' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '视觉实践' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '关于与联系' })).toBeVisible();
});

test('reduced motion keeps the hero static and readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-hero-field]')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

- [ ] **Step 2: Run the tests and confirm the intended failure**

Run: `npm run test:e2e -- motion.spec.ts --project=desktop`

Expected: FAIL because the homepage is absent.

- [ ] **Step 3: Build semantic homepage sections**

Fetch profile plus published collections in `index.astro`. Sort workflows by order and show only `featured === true` on the homepage; show at most six featured visuals, the latest article, and at most three notes. `HomeSections.astro` must render all seven approved homepage sections and use empty-state omission rather than blank headings.

- [ ] **Step 4: Add the original workflow-field animation**

`hero-field.ts` must create at most 42 particles on desktop and 18 on narrow screens, connect only nearby points, cap device pixel ratio at 2, pause outside the viewport, and set `data-motion="reduced"` without starting an animation loop when `prefers-reduced-motion: reduce` matches. Pointer movement may alter velocity by no more than 0.08 pixels per frame.

- [ ] **Step 5: Style the editorial composition**

Use oversized espresso typography, thin rules, small bilingual labels, a warm paper surface, and an asymmetric hero Canvas. Avoid uniform card grids: workflow entries use horizontal rows, visuals use mixed aspect ratios, and the contact region changes to espresso background.

- [ ] **Step 6: Verify build and homepage behavior**

Run: `npm run check; npm run test:e2e -- motion.spec.ts`

Expected: type/unit checks and both Playwright projects pass.

- [ ] **Step 7: Commit**

```powershell
git add src/pages/index.astro src/components src/scripts/hero-field.ts tests/e2e/motion.spec.ts
git commit -m "feat: build portfolio homepage framework"
```

### Task 5: Build workflow archive and generated detail pages

**Files:**
- Create: `src/pages/workflows/index.astro`
- Create: `src/pages/workflows/[id].astro`
- Modify: `tests/e2e/navigation.spec.ts`

- [ ] **Step 1: Add failing archive and detail assertions**

```ts
test('workflow archive exposes status and detail routes', async ({ page }) => {
  await page.goto('/workflows/');
  await expect(page.getByRole('heading', { level: 1, name: '工作流档案' })).toBeVisible();
  await page.getByRole('link', { name: /公众号快速创作/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('公众号快速创作');
  await expect(page.getByRole('link', { name: '返回工作流档案' })).toBeVisible();
});
```

- [ ] **Step 2: Run the assertion and confirm failure**

Run: `npm run test:e2e -- navigation.spec.ts --project=desktop`

Expected: FAIL with `/workflows/` not found.

- [ ] **Step 3: Implement archive grouping**

The archive reads all published workflows, sorts by order, and displays active/evolving before archived. Each row includes year, title, summary, status, tools, and detail link. Status labels use Chinese visible text while preserving the schema value in `data-status`.

- [ ] **Step 4: Implement static detail routes**

Use `getStaticPaths()` over published workflow entries. Render Markdown with `render(entry)`, use `DetailLayout`, and compute previous/next from the same ordered list. Any `versionOf` value is rendered as a version relationship link only when the referenced entry exists.

- [ ] **Step 5: Verify extensibility**

Duplicate a workflow data file under a temporary sixth ID, run `npm run build`, confirm the sixth route and archive entry are generated, then remove the temporary file and run the build again.

Expected: both builds succeed without component edits.

- [ ] **Step 6: Commit**

```powershell
git add src/pages/workflows tests/e2e/navigation.spec.ts
git commit -m "feat: add extensible workflow archive"
```

### Task 6: Build the filterable visual archive and accessible lightbox

**Files:**
- Create: `src/components/Lightbox.astro`
- Create: `src/scripts/gallery.ts`
- Create: `src/pages/visuals/index.astro`
- Create: `tests/e2e/gallery.spec.ts`

- [ ] **Step 1: Write failing filter and lightbox tests**

```ts
import { expect, test } from '@playwright/test';

test('filters gallery items without navigation', async ({ page }) => {
  await page.goto('/visuals/');
  await page.getByRole('button', { name: '自媒体封面' }).click();
  await expect(page.locator('[data-visual]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/visuals\/$/);
});

test('opens and closes the lightbox with keyboard focus restored', async ({ page }) => {
  await page.goto('/visuals/');
  const trigger = page.locator('[data-lightbox-trigger]').first();
  await trigger.click();
  await expect(page.getByRole('dialog', { name: '作品大图' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '作品大图' })).toBeHidden();
  await expect(trigger).toBeFocused();
});
```

- [ ] **Step 2: Run the tests and confirm the intended failure**

Run: `npm run test:e2e -- gallery.spec.ts --project=desktop`

Expected: FAIL because `/visuals/` does not exist.

- [ ] **Step 3: Render data-driven filters and gallery items**

Derive unique filter buttons from published visual category values, always prefix “全部”, and add `data-category` to each item. Preserve each artwork's intrinsic ratio through `aspect-ratio: width / height`; use `loading="lazy"` and explicit dimensions.

- [ ] **Step 4: Implement filtering and lightbox behavior**

`gallery.ts` toggles `hidden`, `aria-pressed`, and an empty-results message. `Lightbox.astro` uses a native `<dialog>`, has previous/next controls, closes on Escape/backdrop, traps focus through dialog semantics, updates image/caption without rebuilding the page, and restores focus to the opening trigger.

- [ ] **Step 5: Verify interaction and no-JavaScript fallback**

Run: `npm run test:e2e -- gallery.spec.ts`

Expected: desktop and mobile tests pass. With JavaScript disabled in a manual Playwright context, all images remain visible and readable.

- [ ] **Step 6: Commit**

```powershell
git add src/pages/visuals src/components/Lightbox.astro src/scripts/gallery.ts tests/e2e/gallery.spec.ts
git commit -m "feat: add visual archive and lightbox"
```

### Task 7: Build thoughts archive, article pages, 404, and metadata

**Files:**
- Create: `src/pages/thoughts/index.astro`
- Create: `src/pages/thoughts/[id].astro`
- Create: `src/pages/404.astro`
- Create: `public/favicon.svg`
- Modify: `tests/e2e/navigation.spec.ts`

- [ ] **Step 1: Add failing thoughts and 404 tests**

```ts
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
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm run test:e2e -- navigation.spec.ts --project=desktop`

Expected: FAIL because thoughts and custom 404 pages are absent.

- [ ] **Step 3: Implement the thoughts archive**

Sort articles and notes by `publishedAt` descending. Omit an entire subsection when its collection has no published records; never render an empty grid. Article cards link to generated detail pages; notes are non-linking editorial entries with date and text.

- [ ] **Step 4: Implement article details and 404**

Generate article routes with `getStaticPaths()`, render Markdown through `DetailLayout`, and compute previous/next article links. The 404 page uses the same shell, describes the missing page in one sentence, and links to home, workflows, and visuals.

- [ ] **Step 5: Add favicon and verify metadata**

Create a two-color monogram favicon from the letters `AW` using only SVG paths/text and approved palette colors. Verify each route has a unique title, description, canonical URL, and Open Graph type.

- [ ] **Step 6: Run full tests and commit**

Run: `npm run check; npm run test:e2e`

Expected: all checks and both browser projects pass.

```powershell
git add src/pages/thoughts src/pages/404.astro public/favicon.svg tests/e2e/navigation.spec.ts
git commit -m "feat: add writing archive and site metadata"
```

### Task 8: Harden responsive behavior, performance, and deployment

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/scripts/hero-field.ts`
- Modify: `astro.config.mjs`
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

- [ ] **Step 1: Add final responsive assertions**

Extend navigation tests to assert no horizontal overflow at 390px, the mobile menu remains within the viewport, contact content is readable, and every interactive element has a visible focus indicator.

```ts
test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
```

- [ ] **Step 2: Run tests and fix only demonstrated failures**

Run: `npm run test:e2e -- navigation.spec.ts --project=mobile`

Expected: test passes after targeted CSS corrections; do not add decorative mobile-only animation.

- [ ] **Step 3: Add the deployment workflow**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v5
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Document the content replacement workflow**

`README.md` must state the exact local commands, folder responsibility, required image fields, workflow status rules, how `featured` works, how to add the sixth and later cases, and which demo files to replace. It must also explain that `email` and `wechatQr` stay empty until real contact details are supplied.

- [ ] **Step 5: Perform production verification**

Run:

```powershell
npm run check
npm run build
npm run test:e2e
git diff --check
```

Expected: all commands exit 0, `dist/` contains index/workflows/visuals/thoughts/404 output, and the repository has no whitespace errors.

- [ ] **Step 6: Commit**

```powershell
git add .github/workflows/deploy.yml astro.config.mjs src/styles/global.css src/scripts/hero-field.ts tests/e2e/navigation.spec.ts README.md
git commit -m "chore: prepare portfolio framework for deployment"
```

## Framework acceptance checkpoint

The framework phase is complete when:

- all four primary routes and generated details build successfully;
- a sixth workflow can be added only by creating a data file and image;
- gallery categories derive from content and require no component edits;
- the homepage remains readable with JavaScript disabled and reduced motion enabled;
- desktop and mobile Playwright projects pass;
- contact actions hide safely until real details arrive;
- demo content is visibly separable from future production material;
- GitHub Pages workflow is ready, while actual publishing waits for the user's GitHub repository choice.
