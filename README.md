# 个人作品与 AI 工作流网站

暖米色、咖啡色调的编辑式个人简历与作品网站。网站使用 Astro 静态生成，内容和页面代码分离，可在本地完整预览，也可免费部署到 GitHub Pages。

## 本地运行

环境要求：Node.js 22.12 或更高版本。

```powershell
npm install
npm run dev
```

浏览器打开 [http://localhost:4321](http://localhost:4321)。开发服务器支持热更新，修改内容后不需要重新启动。

常用检查：

```powershell
npm run check
npm run build
npm run test:e2e
```

`npm run check` 会同时检查 Astro/TypeScript 与单元测试；`npm run test:e2e` 会在桌面和移动端尺寸检查核心页面、导航、画廊、动效与触控操作。

## 内容放在哪里

| 内容 | 目录 | 格式 |
| --- | --- | --- |
| 个人信息与联系方式 | `src/data/profile/` | YAML |
| AI 工作流 | `src/data/workflows/` | Markdown |
| 视觉项目详情 | `src/data/projects/` | Markdown |
| 视觉作品批量清单 | `content/visuals-manifest.json` | JSON |
| 自动生成的视觉记录 | `src/data/visuals/generated/` | YAML（不要手改） |
| 长文章 | `src/data/articles/` | Markdown |
| 短灵感 | `src/data/notes/` | YAML |
| 网页图片 | `public/images/` | WebP、AVIF、JPEG、PNG 或 SVG |

`public/images/demo/` 里的两张 SVG 和当前数据文件是框架示例，正式导入素材时可以逐项替换。

## 新增工作流

在 `src/data/workflows/` 新建一个 Markdown 文件。文件名会成为详情页地址，例如 `content-batch.md` 会生成 `/workflows/content-batch/`。

```markdown
---
title: 批量高质量生成
summary: 一句话说明它解决什么问题。
year: 2026
order: 30
draft: false
status: active
featured: true
cover:
  src: /images/workflows/content-batch.webp
  alt: 批量生成工作流界面截图
  width: 1600
  height: 1000
tools:
  - 内容生产
  - 批量处理
---

这里写详情页正文。
```

- `status` 只能是 `active`、`evolving` 或 `archived`。
- `featured: true` 表示同时出现在首页精选；它不改变工作流状态。
- `order` 数字越小越靠前。
- `draft: true` 会从网站中隐藏。
- 新增第 6 个、第 20 个工作流都不需要修改组件。

## 批量新增视觉作品

把压缩后的图片放进 `public/images/visuals/`，再把作品信息加入 `content/visuals-manifest.json`。图片宽高会由导入脚本自动读取，不需要人工填写。

```powershell
npm run content:visuals
npm run content:visuals:check
```

第一条命令生成网站需要的 YAML，第二条命令只校验、不改文件。分类按钮由 `category` 自动生成，新分类不需要改页面。约 60 张素材可以一次写进同一个清单后统一导入。

完整字段、命名、压缩和批量示例见 [`docs/content/visual-import-guide.md`](docs/content/visual-import-guide.md)。

## 新增视觉项目详情

在 `src/data/projects/` 新建 Markdown 文件。文件名会成为 `/projects/文件名/`，正文可以写项目背景、设计思路和结果；`gallery` 可放任意数量的过程图或成品图。视觉清单中的作品只要填写同名 `projectId`，作品卡片就会自动出现“查看项目详情”入口。

当前 `editorial-system.md` 是可直接预览的结构示例，正式素材准备好后替换文字与图片即可。

## 个人信息与联系

编辑 `src/data/profile/profile.yaml`。框架阶段 `email` 和 `wechatQr` 为空，所以页脚不会显示虚假的联系方式。准备好后可改成：

```yaml
email: name@example.com
wechatQr: /images/profile/wechat-qr.webp
```

## 部署到 GitHub Pages

1. 在 GitHub 新建公开仓库并推送本项目。
2. 打开仓库 `Settings → Pages`，把发布来源设为 `GitHub Actions`。
3. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建和发布。
4. 如果仓库不是 `<用户名>.github.io`，构建会根据仓库名自动配置子路径。

实际发布需要用户确认 GitHub 仓库名称与账号，本框架不会擅自创建或推送远程仓库。
