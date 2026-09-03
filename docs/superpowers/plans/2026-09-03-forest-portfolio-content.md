# Forest Portfolio Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace framework copy with concise, verified personal-brand content for 森林 while keeping unknown facts and job-seeking status off the site.

**Architecture:** Keep Astro content collections as the source of truth. Profile, workflows, project, article, and notes remain independent records; homepage components only render concise summaries. Existing abstract images remain temporary illustrative covers and are described honestly rather than presented as finished client work.

**Tech Stack:** Astro 7, TypeScript, Astro content collections, YAML/Markdown, Vitest, Playwright.

---

### Task 1: Replace the homepage identity and capability narrative

**Files:**
- Modify: `src/data/profile/profile.yaml`
- Modify: `src/components/HeroField.astro`
- Modify: `src/components/HomeSections.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/components/Footer.astro`
- Modify: `tests/e2e/profile.spec.ts`

- [ ] **Step 1: Write failing homepage identity assertions**

Add exact Playwright assertions for the public name, experience, four capability labels, and absence of job-seeking language:

```ts
await expect(page.getByRole('heading', { level: 1 })).toContainText('森林');
await expect(page.getByText('5 年视觉设计经验', { exact: false })).toBeVisible();
for (const label of ['视觉设计', 'AI 生图', '内容工作流', '个人工作台']) {
  await expect(page.getByText(label, { exact: true })).toBeVisible();
}
await expect(page.getByText(/求职|入职|自由职业/)).toHaveCount(0);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npx playwright test tests/e2e/profile.spec.ts --project=desktop`

Expected: FAIL because the current hero does not name 森林 and the four capability labels do not exist.

- [ ] **Step 3: Implement the concise identity content**

Set profile facts to:

```yaml
name: 森林
role: 视觉设计师 × AI 工作流实践者
status: 用设计判断连接视觉、内容与可运行的工作流。
bio: 我是森林，一名有 5 年经验的视觉设计师。现在，我把传统设计判断应用到 AI 生图、内容生产和个人工作流中。
location: ""
availability: ""
resumeUrl: ""
socialLinks: []
tools:
  - Photoshop
  - AI 生图
  - 内容工作流
  - AI 编程协作
experience:
  - period: AI 前
    label: 用 Photoshop 完成海报、电商、自媒体与活动视觉
  - period: 现在
    label: 把设计判断放进 AI 生图、内容生产与个人工作流
```

Change the hero heading to include `森林` and `VISUAL × AI WORKFLOW`. Add a four-item capability strip in `HomeSections.astro`, each with one sentence grounded in the mother document. Update page metadata to `森林｜视觉设计与 AI 工作流实践` and a matching description. Keep the footer neutral: `欢迎交流视觉、内容与工作流的具体问题。`

- [ ] **Step 4: Verify homepage behavior**

Run: `npx playwright test tests/e2e/profile.spec.ts tests/e2e/motion.spec.ts tests/e2e/mobile.spec.ts`

Expected: all selected tests PASS at desktop and mobile widths.

- [ ] **Step 5: Commit**

```powershell
git add src/data/profile/profile.yaml src/components/HeroField.astro src/components/HomeSections.astro src/pages/index.astro src/components/Footer.astro tests/e2e/profile.spec.ts
git commit -m "feat: introduce forest on the portfolio"
```

### Task 2: Publish five real workflow case summaries

**Files:**
- Modify: `src/data/workflows/wechat-writing.md`
- Modify: `src/data/workflows/video-booklist.md`
- Create: `src/data/workflows/batch-visual-production.md`
- Create: `src/data/workflows/personal-workbench.md`
- Create: `src/data/workflows/ai-event-content.md`
- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/profile.spec.ts`

- [ ] **Step 1: Write failing archive and detail assertions**

Add a test that expects exactly five workflow rows and verifies a real detail page contains the sections `为什么要做`, `我的处理方式`, `实际变化`, and `还在改进`:

```ts
await page.goto('/workflows/');
await expect(page.locator('.workflow-row')).toHaveCount(5);
await expect(page.getByText('个人工作台设计', { exact: true })).toBeVisible();
await page.getByRole('link', { name: /公众号快速创作/ }).click();
for (const heading of ['为什么要做', '我的处理方式', '实际变化', '还在改进']) {
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
}
```

- [ ] **Step 2: Run and verify RED**

Run: `npx playwright test tests/e2e/navigation.spec.ts --project=desktop`

Expected: FAIL because only two workflow records exist and their body copy is still framework copy.

- [ ] **Step 3: Replace and add workflow records**

Use these titles, summaries, statuses, and tools:

```text
公众号快速创作 — active — 内容拆解 / 动作核对 / 图文协同
视频书单号工作流 — evolving — DeepSeek API / AI 生图 / TTS / 剪映
快速批量高质量生成 — active — 视觉规范 / 批量生图 / 人工复核
个人工作台设计 — evolving — Codex / API 协作 / 任务状态
AI 活动信息整理与社交内容生产 — active — 信息整理 / 视觉设计 / 社交内容
```

Set `demo: false` for all five because the cases are real. Every body must use the same concise headings: `为什么要做`, `我的处理方式`, `我负责什么`, `实际变化`, `还在改进`. State that abstract covers are temporary illustrative graphics; do not claim metrics or client outcomes.

- [ ] **Step 4: Verify archive, details, and demo labeling**

Run: `npm run check`

Run: `npx playwright test tests/e2e/navigation.spec.ts tests/e2e/profile.spec.ts`

Expected: five workflow routes build, no workflow is labeled `结构示例`, and all tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/workflows tests/e2e/navigation.spec.ts tests/e2e/profile.spec.ts
git commit -m "feat: publish forest workflow cases"
```

### Task 3: Turn the representative project into the real workbench case

**Files:**
- Create: `src/data/projects/book-video-workbench.md`
- Delete: `src/data/projects/editorial-system.md`
- Modify: `content/visuals-manifest.json`
- Modify: `tests/e2e/projects.spec.ts`
- Modify: `tests/e2e/local-preview.spec.ts`

- [ ] **Step 1: Write the failing representative-project test**

Replace the old route expectation with:

```ts
await page.goto('/projects/book-video-workbench/');
await expect(page.getByRole('heading', { level: 1 })).toHaveText('图书类短视频半自动工作台');
await expect(page.getByText('不追求表面上的全自动', { exact: false })).toBeVisible();
await expect(page.getByText(/API Key|后台地址/)).toHaveCount(0);
```

- [ ] **Step 2: Run and verify RED**

Run: `npx playwright test tests/e2e/projects.spec.ts tests/e2e/local-preview.spec.ts --project=desktop`

Expected: FAIL because `/projects/book-video-workbench/` does not exist.

- [ ] **Step 3: Add the real project record and remove the framework project**

Create frontmatter with:

```yaml
title: 图书类短视频半自动工作台
summary: 把逐字稿、二创、分镜、生图、配音和任务状态放进一条适合个人使用的半自动流程。
year: 2026
category: AI 内容工作流原型
role: 需求定义、流程设计、视觉与内容判断、测试
duration: 持续迭代
order: 10
draft: false
demo: false
featured: true
```

Use the approved mother-document facts for `项目背景`, `要解决的问题`, `处理方式`, `关键取舍`, `当前结果`, and `复盘`. Keep the existing abstract gallery images but caption both as `流程结构示意图，真实工作台截图整理后替换。` Remove `projectId` from demo visual manifest entries so abstract gallery items do not masquerade as project outputs, then regenerate visual YAML.

- [ ] **Step 4: Verify project route and content references**

Run: `npm run content:visuals && npm run check`

Run: `npx playwright test tests/e2e/projects.spec.ts tests/e2e/local-preview.spec.ts`

Expected: the new route returns 200, the old project route is absent from test fixtures, and all selected tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/projects content/visuals-manifest.json src/data/visuals/generated tests/e2e/projects.spec.ts tests/e2e/local-preview.spec.ts
git commit -m "feat: add the book video workbench case"
```

### Task 4: Replace framework thoughts with Forest's real AI principles

**Files:**
- Modify: `src/data/articles/from-design-to-workflow.md`
- Modify: `src/data/notes/workflow-is-a-product.yaml`
- Create: `src/data/notes/generation-needs-judgment.yaml`
- Create: `src/data/notes/start-with-small-loop.yaml`
- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/profile.spec.ts`

- [ ] **Step 1: Write failing thought-content assertions**

```ts
await page.goto('/thoughts/');
for (const text of ['进入每天重复的工作流程', '能生成，不等于能使用', '先跑通真实的小闭环']) {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
}
await expect(page.getByText('结构示例', { exact: true })).toHaveCount(0);
```

- [ ] **Step 2: Run and verify RED**

Run: `npx playwright test tests/e2e/navigation.spec.ts tests/e2e/profile.spec.ts --project=desktop`

Expected: FAIL because only one framework note exists and the article is marked demo.

- [ ] **Step 3: Publish the real article and three notes**

Set article title to `AI 真正有用的时候，是进入每天的工作` and summary to `从单次生成到日常工作流：我如何看待设计判断、人工复核与适度自动化。` Set `demo: false`. Write a compact first-person article with sections `从单次生成到一条流程`, `能生成不等于能使用`, and `先跑通小闭环` using only facts from the mother document.

Publish these three notes with `demo: false`:

```yaml
text: AI 真正有用的地方，是进入每天重复的工作流程，而不是只完成一次生成。
text: 能生成，不等于能使用；设计判断仍然是最后一道关。
text: 个人工作流不必追求全自动，先跑通真实的小闭环更重要。
```

- [ ] **Step 4: Verify thought archive and homepage preview**

Run: `npm run check`

Run: `npx playwright test tests/e2e/navigation.spec.ts tests/e2e/profile.spec.ts tests/e2e/local-preview.spec.ts`

Expected: article and three notes render without `结构示例`; all selected tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/data/articles src/data/notes tests/e2e/navigation.spec.ts tests/e2e/profile.spec.ts
git commit -m "feat: publish forest ai practice notes"
```

### Task 5: Run complete content and responsive verification

**Files:**
- Modify only if a verified regression requires a focused fix.

- [ ] **Step 1: Check for prohibited or uncertain public copy**

Run:

```powershell
rg -n "求职|入职|自由职业|需要森林补充|API Key|后台地址|框架演示|当前内容用于验证" src/data src/components src/pages
```

Expected: no user-facing match except safety wording inside a project paragraph when it does not disclose a secret. Remove accidental matches from public copy.

- [ ] **Step 2: Run generated-content and type checks**

Run: `npm run content:visuals:check`

Run: `npm run check`

Expected: generated content matches, Astro reports zero diagnostics, and all unit tests PASS.

- [ ] **Step 3: Run production build and full browser suite**

Run: `npm run build`

Run: `npm run test:e2e`

Expected: all routes build and all desktop/mobile Playwright tests PASS.

- [ ] **Step 4: Check the final worktree and commit any focused verification fix**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors and no uncommitted implementation changes.

