# Portfolio Public Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有 Astro 个人作品网站补成可在根路径和 GitHub Pages 子路径正确运行、可分享、可键盘访问、可持续导入内容并能判断公开发布条件的个人简历网站。

**Architecture:** 保留 Astro 静态内容集合和现有编辑式 UI。新增一个纯函数 URL 层、一个 Node 内容预检层和少量可选内容字段；页面只消费通过 schema 与预检的数据。所有新行为先用 Vitest 或 Playwright 写失败测试，再做最小实现。

**Tech Stack:** Astro 7、TypeScript 6、Vitest、Playwright、Node.js ESM、YAML、image-size、GitHub Pages Actions。

---

## 文件职责

- `src/lib/url.ts`：唯一的 base 路径拼接规则，供组件与页面复用。
- `src/layouts/BaseLayout.astro`：canonical、Open Graph、Twitter/X、robots 与 JSON-LD。
- `src/pages/robots.txt.ts`：根据 `Astro.site` 和 `BASE_URL` 生成 robots。
- `src/components/Header.astro`：当前栏目、移动导航焦点与 inert 状态。
- `src/components/HeroField.astro`：动态年份与首屏站内入口。
- `src/components/HomeSections.astro`：经历时间线与可选个人资料。
- `src/content.config.ts`：demo、简历字段、视觉阶段/关联、图集图注 schema。
- `src/pages/visuals/index.astro`：类别/创作阶段双筛选、灯箱完整元数据。
- `src/pages/workflows/[id].astro`：关联视觉成果。
- `scripts/lib/content-preflight.mjs`：可测试的内容扫描与验证纯逻辑。
- `scripts/validate-content.mjs`：普通与严格发布模式 CLI。
- `scripts/import-visuals.mjs`：换行归一化和受限 `--prune`。
- `public/images/site/social-preview.svg|png`：默认分享图。
- `docs/content/*.md`：真实个人资料、工作流与项目案例填写模板。

### Task 1: 统一根路径与 GitHub Pages 子路径 URL

**Files:**
- Create: `src/lib/url.ts`
- Create: `tests/unit/url.test.ts`
- Modify: `astro.config.mjs`
- Modify: `src/components/Header.astro`
- Modify: `src/components/HomeSections.astro`
- Modify: `src/components/VisualCard.astro`
- Modify: `src/components/WorkflowCard.astro`
- Modify: `src/layouts/DetailLayout.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/pages/visuals/index.astro`
- Modify: `src/pages/workflows/index.astro`
- Modify: `src/pages/workflows/[id].astro`
- Modify: `src/pages/projects/[id].astro`
- Modify: `src/pages/thoughts/index.astro`
- Modify: `src/pages/thoughts/[id].astro`

- [ ] **Step 1: 写 URL 失败测试**

```ts
import { describe, expect, it } from 'vitest';
import { joinBase } from '../../src/lib/url';

describe('joinBase', () => {
  it.each([
    ['/', '/workflows/', '/workflows/'],
    ['/portfolio/', '/workflows/', '/portfolio/workflows/'],
    ['/portfolio', 'images/a.webp', '/portfolio/images/a.webp'],
  ])('joins %s and %s', (base, path, expected) => expect(joinBase(base, path)).toBe(expected));

  it.each(['https://example.com/a', 'mailto:name@example.com', '#about', 'data:image/svg+xml,x'])('leaves %s unchanged', (path) => {
    expect(joinBase('/portfolio/', path)).toBe(path);
  });
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `npx vitest run tests/unit/url.test.ts`

Expected: FAIL，无法解析 `src/lib/url.ts`。

- [ ] **Step 3: 实现 URL 纯函数**

```ts
const PASSTHROUGH = /^(?:[a-z][a-z\d+.-]*:|#)/i;

export function joinBase(base: string, path: string) {
  if (PASSTHROUGH.test(path)) return path;
  const cleanBase = `/${base}`.replace(/\/{2,}/g, '/').replace(/\/?$/, '/');
  const cleanPath = path.replace(/^\/+/, '');
  return cleanPath ? `${cleanBase}${cleanPath}` : cleanBase;
}

export const withBase = (path: string) => joinBase(import.meta.env.BASE_URL, path);
```

- [ ] **Step 4: 将全部站内 href、图片 src、灯箱 data-src 与二维码改为 `withBase()`**

删除各文件中重复的 `const link = ...`。外部 URL 与锚点也交给 `withBase()`，由纯函数原样返回。

- [ ] **Step 5: 确保生产 base 带尾斜杠**

在 `astro.config.mjs` 中将项目站 base 改为 `/${repo}/`。

- [ ] **Step 6: 运行单元和现有 E2E**

Run: `npm run check && npm run test:e2e -- navigation.spec.ts gallery.spec.ts`

Expected: URL 单测与现有导航/画廊测试全部通过。

- [ ] **Step 7: 提交**

```powershell
git add astro.config.mjs src tests/unit/url.test.ts
git commit -m "fix: make portfolio urls base-path safe"
```

### Task 2: 补全分享、搜索与 robots 元数据

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/DetailLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/pages/projects/[id].astro`
- Modify: `src/pages/thoughts/[id].astro`
- Create: `src/pages/robots.txt.ts`
- Create: `public/images/site/social-preview.svg`
- Create: `public/images/site/social-preview.png`
- Create: `tests/e2e/metadata.spec.ts`

- [ ] **Step 1: 写默认元数据、文章类型、404 与 robots 失败测试**

```ts
import { expect, test } from '@playwright/test';

test('homepage exposes complete share metadata', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.png$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('script[type="application/ld+json"]')).toContainText('WebSite');
});

test('article uses article metadata', async ({ page }) => {
  await page.goto('/thoughts/from-design-to-workflow/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(1);
});

test('404 is not indexed', async ({ page }) => {
  await page.goto('/missing-page/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
});

test('robots points to sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(await response.text()).toContain('Sitemap:');
});
```

- [ ] **Step 2: 运行并确认四组断言因元数据缺失而失败**

Run: `npm run test:e2e -- metadata.spec.ts --project=desktop`

- [ ] **Step 3: 扩展 BaseLayout 接口并输出元数据**

接口包含 `image`、`imageAlt`、`type`、`publishedAt`、`noindex`、`structuredData`；默认图为 `/images/site/social-preview.png`。输出 `og:site_name`、`og:locale=zh_CN`、`twitter:card`、`twitter:title`、`twitter:description`、`twitter:image` 与 `og:image:alt`。JSON-LD 使用 `set:html={JSON.stringify(structuredData)}`。

- [ ] **Step 4: 为文章、项目、首页和 404 传入准确类型**

首页输出 `WebSite`；文章传 `type="article"` 与 ISO 日期；项目输出 `CreativeWork`；404 传 `noindex`。不输出虚构 Person。

- [ ] **Step 5: 添加动态 robots 端点**

```ts
import type { APIRoute } from 'astro';
import { joinBase } from '../lib/url';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(joinBase(import.meta.env.BASE_URL, 'sitemap-index.xml'), site);
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

- [ ] **Step 6: 设计 1200×630 默认分享图并生成 PNG**

SVG 使用现有 `--paper/#ede6d8`、`--ink/#241b16`、`--clay/#a85f3b` 颜色、AW/VP 标识、AI WORKFLOW / VISUAL PRACTICE 标题和细线节点。通过 Playwright 以 1200×630 截图生成 PNG，检查实际尺寸。

- [ ] **Step 7: 运行元数据测试和生产构建**

Run: `npm run test:e2e -- metadata.spec.ts && npm run build`

- [ ] **Step 8: 提交**

```powershell
git add src public/images/site tests/e2e/metadata.spec.ts
git commit -m "feat: add complete portfolio sharing metadata"
```

### Task 3: 完善简历叙事、演示标识和首页入口

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/data/profile/profile.yaml`
- Modify: `src/data/workflows/*.md`
- Modify: `src/data/projects/*.md`
- Modify: `src/data/articles/*.md`
- Modify: `src/data/notes/*.yaml`
- Modify: `content/visuals-manifest.json`
- Modify: `src/components/HeroField.astro`
- Modify: `src/components/HomeSections.astro`
- Modify: `src/styles/global.css`
- Create: `tests/e2e/profile.spec.ts`

- [ ] **Step 1: 写首页入口、动态年份、经历和示例标识失败测试**

```ts
test('homepage exposes portfolio paths and existing experience', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: '查看工作流' })).toHaveAttribute('href', /workflows/);
  await expect(page.getByRole('link', { name: '浏览视觉作品' })).toHaveAttribute('href', /visuals/);
  await expect(page.locator('[data-portfolio-year]')).toContainText(String(new Date().getFullYear()));
  await expect(page.getByText('海报、电商、自媒体与活动视觉设计')).toBeVisible();
  await expect(page.getByText('AI 内容工作流与视觉应用实践')).toBeVisible();
  await expect(page.getByText('结构示例').first()).toBeVisible();
});
```

- [ ] **Step 2: 运行并确认缺少入口、经历和标识**

Run: `npm run test:e2e -- profile.spec.ts --project=desktop`

- [ ] **Step 3: 扩展内容 schema**

所有作品型集合增加 `demo: z.boolean().default(false)`；profile 增加可为空的 `location`、`availability`、`resumeUrl` 和 `socialLinks: [{ label, url }]`。

- [ ] **Step 4: 给现有框架数据显式设置 `demo: true`**

现有工作流、项目、文章、短灵感和两条视觉清单都标记为示例。页面显示统一小标签，不改变本地路由和预览完整度。

- [ ] **Step 5: 在 HeroField 加入动态年份与两条站内入口**

CTA 使用下划线文字链接并通过 `withBase()` 生成地址；移动端保证首屏内可见，不增加实心大按钮。

- [ ] **Step 6: 在关于区渲染经历时间线和可选资料**

`profile.experience` 显示 period/label；location、availability、resumeUrl、socialLinks 为空时不渲染。联系锚点只在 email 或 wechatQr 存在时显示，否则引导浏览作品。

- [ ] **Step 7: 运行专项与移动端测试**

Run: `npm run check && npm run test:e2e -- profile.spec.ts mobile.spec.ts`

- [ ] **Step 8: 提交**

```powershell
git add src content/visuals-manifest.json tests/e2e/profile.spec.ts
git commit -m "feat: strengthen portfolio resume narrative"
```

### Task 4: 增加视觉阶段、工作流产出关联和项目图注

**Files:**
- Modify: `scripts/lib/visual-manifest.mjs`
- Modify: `content/visuals-manifest.json`
- Modify: `src/content.config.ts`
- Modify: `src/components/Lightbox.astro`
- Modify: `src/components/ProjectGallery.astro`
- Modify: `src/pages/visuals/index.astro`
- Modify: `src/pages/workflows/[id].astro`
- Modify: `src/scripts/gallery.ts`
- Modify: `src/styles/global.css`
- Modify: `tests/unit/visual-manifest.test.ts`
- Create: `tests/e2e/visual-metadata.spec.ts`

- [ ] **Step 1: 写 manifest 新字段失败单测**

扩展测试数据为 `era: 'ai-assisted'`、`description`、`tools`、`workflowId`、`demo`，断言 YAML 包含这些字段；断言非法 era 与非法 workflowId 被拒绝。

- [ ] **Step 2: 运行并确认 normalize/render 尚未支持这些字段**

Run: `npx vitest run tests/unit/visual-manifest.test.ts`

- [ ] **Step 3: 实现 manifest 与 schema 字段**

`era` 必填且只能为三种值；`description` 必填；`tools` 默认空数组；`workflowId` 与 `projectId` 使用同一 ID 规则；demo 默认 false。项目 gallery 改为 `image.extend({ caption: z.string().optional() })`。

- [ ] **Step 4: 写双筛选与灯箱元数据 E2E**

测试创作阶段按钮可以隐藏不匹配项，灯箱显示 description、era label 与 tools，并保留滑动/键盘切换。

- [ ] **Step 5: 实现双筛选与灯箱元数据**

类别和 era 各维护一个 pressed 状态，作品只有同时匹配才显示。`data-caption` 拆为标题、说明、阶段、工具属性，gallery 脚本更新可见文本。caption 容器设置 `aria-live="polite"`。

- [ ] **Step 6: 在工作流详情显示关联视觉成果**

`getStaticPaths()` 同时读取 visuals，并把 `workflowId === entry.id` 的记录传入；存在时复用 `VisualCard` 渲染 2–4 张。没有关联时不显示空区块。

- [ ] **Step 7: 为项目图集渲染可选图注**

编号继续保留，caption 存在时输出 `<figcaption>`；图片路径经过 `withBase()`。

- [ ] **Step 8: 重新生成示例视觉并运行专项测试**

Run: `npm run content:visuals && npm run check && npm run test:e2e -- visual-metadata.spec.ts gallery.spec.ts mobile.spec.ts`

- [ ] **Step 9: 提交**

```powershell
git add content scripts src tests
git commit -m "feat: connect visual work to creative stages"
```

### Task 5: 修复移动导航与灯箱的辅助访问

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Lightbox.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/gallery.spec.ts`

- [ ] **Step 1: 写移动导航真实键盘失败测试**

测试关闭时 nav 有 `inert` 和 `aria-hidden=true`；打开后第一条链接获得焦点；最后一个可聚焦元素 Tab 回到第一个；Escape 关闭并把焦点还给按钮；桌面 nav 不 inert。

- [ ] **Step 2: 运行并确认当前 transform-only 菜单失败**

Run: `npm run test:e2e -- navigation.spec.ts`

- [ ] **Step 3: 实现移动状态同步和焦点循环**

导航使用 `id="primary-navigation"`，按钮添加 `aria-controls`。`setOpen()` 只在移动断点写 inert/aria-hidden；打开后 `requestAnimationFrame` 聚焦第一链接。keydown 根据 `[data-nav-toggle], nav a` 列表循环焦点；Escape 调用 `setOpen(false, true)` 恢复按钮焦点。

- [ ] **Step 4: 标记当前栏目与可访问品牌名称**

根据 `Astro.url.pathname` 为归档与详情页设置 `aria-current="page"`。品牌链接加 `aria-label="返回首页：个人作品集"`。CSS 复用细下划线表现当前栏目。

- [ ] **Step 5: 补灯箱关系与播报测试**

dialog 使用 `aria-describedby` 指向 caption；caption 为 `aria-live="polite" aria-atomic="true"`。测试下一张后 caption 文本更新且 dialog 仍保持焦点语义。

- [ ] **Step 6: 运行导航、画廊和移动专项**

Run: `npm run test:e2e -- navigation.spec.ts gallery.spec.ts mobile.spec.ts`

- [ ] **Step 7: 提交**

```powershell
git add src/components src/styles tests/e2e
git commit -m "fix: make portfolio navigation keyboard complete"
```

### Task 6: 建立内容预检、换行兼容和安全 prune

**Files:**
- Create: `.gitattributes`
- Create: `scripts/lib/content-preflight.mjs`
- Create: `scripts/validate-content.mjs`
- Modify: `scripts/import-visuals.mjs`
- Modify: `scripts/lib/visual-manifest.mjs`
- Create: `tests/unit/content-preflight.test.ts`
- Modify: `tests/unit/visual-manifest.test.ts`
- Modify: `package.json`

- [ ] **Step 1: 写 CRLF 等价与 prune 列表失败测试**

为 `normalizeNewlines(value)` 断言 `a\r\nb\r\n` 等于 `a\nb\n`；为 `findGeneratedExtras(existing, expected)` 断言只返回 `.yaml` 且只包含 expected 外文件。

- [ ] **Step 2: 写内容预检失败测试**

使用临时 fixture 对象测试：未知 projectId、未知 workflowId、未知 versionOf、缺图、profile 数量不为 1 均返回明确 error；过大图片返回 warning；release 模式中 demo 内容、少于 6 张真实视觉和空联系方式返回 error。

- [ ] **Step 3: 运行测试并确认新模块不存在**

Run: `npx vitest run tests/unit/content-preflight.test.ts tests/unit/visual-manifest.test.ts`

- [ ] **Step 4: 实现可测试纯逻辑与 CLI**

`content-preflight.mjs` 导出 `validateReferences()`、`validateReleaseReadiness()`、`normalizeNewlines()` 和 `findGeneratedExtras()`。CLI 读取 manifest、Markdown/YAML frontmatter、profile 和 `public/images`，汇总全部错误后一次输出；普通模式 warning 不导致失败，`--release` 按严格规则失败。

- [ ] **Step 5: 修复 importer 换行比较并加入受限 prune**

check 模式比较 `normalizeNewlines(current)` 与 `normalizeNewlines(output)`。`--prune` 仅删除 `outputRoot` 解析后的 extras；删除前再次验证绝对路径仍位于 `src/data/visuals/generated/`，并逐项输出 `Removed <file>`。

- [ ] **Step 6: 固定生成内容换行**

`.gitattributes` 内容：

```gitattributes
src/data/visuals/generated/*.yaml text eol=lf
*.mjs text eol=lf
```

- [ ] **Step 7: 增加命令并运行**

`package.json` 增加：

```json
"content:preflight": "node scripts/validate-content.mjs",
"content:release": "node scripts/validate-content.mjs --release",
"validate": "npm run content:visuals:check && npm run content:preflight && npm run check"
```

Run: `npm run content:visuals:check && npm run content:preflight && npm run validate`

Expected: 普通校验通过；`npm run content:release` 因当前真实内容和联系方式尚未提供而按设计失败，并列出可操作原因。

- [ ] **Step 8: 提交**

```powershell
git add .gitattributes package.json package-lock.json scripts tests/unit
git commit -m "feat: add portfolio content preflight"
```

### Task 7: 增加部署质量门、子路径验证与内容文档

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `scripts/verify-build.mjs`
- Create: `tests/unit/build-verification.test.ts`
- Modify: `package.json`
- Modify: `README.md`
- Create: `docs/content/profile-launch-checklist.md`
- Create: `docs/content/workflow-case-guide.md`
- Create: `docs/content/project-case-guide.md`

- [ ] **Step 1: 写生产构建验证失败单测**

`verifyBuildText(html, { base: '/portfolio/' })` 必须拒绝 localhost、缺少 `/portfolio/` canonical、根路径 `/images/` 和缺少分享图；sitemap 验证必须包含正式 origin 与 base。

- [ ] **Step 2: 运行并确认验证模块不存在**

Run: `npx vitest run tests/unit/build-verification.test.ts`

- [ ] **Step 3: 实现 `verify-build.mjs`**

CLI 遍历 `dist/**/*.html`、`dist/sitemap-*.xml` 与关键资源引用，汇总错误并返回非零退出码。参数从 `SITE_URL` 与 Astro base 相关环境变量读取；不修改构建产物。

- [ ] **Step 4: 增加可复现子路径构建命令**

```json
"build:subpath": "cross-env GITHUB_ACTIONS=true GITHUB_REPOSITORY=owner/portfolio SITE_URL=https://owner.github.io astro build",
"verify:build": "node scripts/verify-build.mjs"
```

PowerShell 验收先运行 `npm run build:subpath`，再以同样环境运行 `npm run verify:build`，最后重新执行普通 `npm run build` 恢复本地 dist。

- [ ] **Step 5: 将 GitHub Actions 改为显式质量门**

build job 使用 Node 22、`npm ci`、`npm run validate`、`npm run build`、`npm run verify:build`，再上传 Pages artifact。环境变量：

```yaml
env:
  SITE_URL: ${{ vars.SITE_URL || format('https://{0}.github.io', github.repository_owner) }}
```

不运行 `content:release`，因为是否已准备真实内容由用户在发布前主动决定；部署文档明确要求发布前手动运行。

- [ ] **Step 6: 编写三份真实内容指南与 README 命令表**

每份指南给出完整字段、示例结构、图片数量和禁止伪造项。README 说明：本地启动、普通 validate、严格 release、批量导入/prune、子路径构建、关闭后台 dev server。

- [ ] **Step 7: 运行单元、普通构建与子路径构建验证**

Run: `npm run validate && npm run build && npm run verify:build`

Run: `npm run build:subpath`

Run: `$env:GITHUB_ACTIONS='true'; $env:GITHUB_REPOSITORY='owner/portfolio'; $env:SITE_URL='https://owner.github.io'; npm run verify:build`

Expected: 两种构建均通过；任何生成文件不含 localhost 或错误根图片路径。

- [ ] **Step 8: 提交**

```powershell
git add .github package.json package-lock.json scripts tests/unit README.md docs/content
git commit -m "ci: validate portfolio before pages deploy"
```

### Task 8: 全站完整性测试、视觉验收与交付

**Files:**
- Create: `tests/e2e/site-integrity.spec.ts`
- Modify: `tests/e2e/local-preview.spec.ts`
- Modify: `docs/content/profile-launch-checklist.md`

- [ ] **Step 1: 写站内链接与图片完整性 E2E**

从首页、三类归档和三个详情页收集同源 `a[href]` 与 `img[src]`，去重后用 request context 请求，断言所有响应状态小于 400。忽略 `mailto:`、hash 与外部 URL。

- [ ] **Step 2: 运行测试确认能够发现故意构造的坏引用**

先在测试中加入 `/missing-verification-target/` 并确认失败，再删除该测试 fixture，证明检查会捕获 404。

- [ ] **Step 3: 运行全部自动化验证**

Run: `npm run content:visuals:check`

Run: `npm run content:preflight`

Run: `npm run check`

Run: `npm run build`

Run: `npm run verify:build`

Run: `npm run test:e2e`

Run: `git diff --check`

Expected: 普通链路全部通过；`content:release` 仍只因用户尚未提供的真实内容失败，并不是代码错误。

- [ ] **Step 4: 桌面与移动端视觉验收**

在 1440×1000、390×844、320×844 截取首页、视觉归档、项目详情、打开菜单、打开灯箱。检查：无裁切、CTA 可见、经历易读、双筛选可横向滚动、焦点可见、示例标签不喧宾夺主、分享图与站点视觉一致。

- [ ] **Step 5: 修复视觉验收发现的问题**

每个行为缺陷先补失败测试；仅间距或字号调整必须重新截图并运行 `mobile.spec.ts`。

- [ ] **Step 6: 提交验收测试与最后调整**

```powershell
git add tests docs src
git commit -m "test: cover complete portfolio delivery"
```

- [ ] **Step 7: 在主分支复验并启动本地预览**

按 finishing-a-development-branch 流程快进合并。主目录执行 `npm install`、`npm run validate`、`npm run build`、`npm run test:e2e`，确认 clean status 后启动 `npm run dev -- --host 127.0.0.1` 并验证 HTTP 200。

## 自审结论

- 设计规范中的 URL、SEO、简历、视觉阶段、案例关联、辅助访问、内容预检、部署和文档均有对应任务。
- 所有新增行为都有先失败后实现的测试步骤。
- `content:release` 预期失败是诚实的内容准备状态，不影响普通构建与本地预览；交付时必须单独报告。
- 计划不包含 CMS、表单、数据库、分析服务或虚构内容。
