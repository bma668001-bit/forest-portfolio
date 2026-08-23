# 个人作品与 AI 工作流网站

暖色未来编辑风的个人简历与作品网站框架。网站使用 Astro 静态生成，内容和页面代码分离，可免费部署到 GitHub Pages。

## 本地运行

环境要求：Node.js 22.12 或更高版本。

```powershell
npm install
npm run dev
```

常用检查：

```powershell
npm run check
npm run build
npm run test:e2e
```

## 内容放在哪里

| 内容 | 目录 | 格式 |
| --- | --- | --- |
| 个人信息与联系方式 | `src/data/profile/` | YAML |
| AI 工作流 | `src/data/workflows/` | Markdown |
| 视觉作品 | `src/data/visuals/` | YAML |
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

## 新增视觉作品

把压缩后的图片放进 `public/images/visuals/`，再在 `src/data/visuals/` 添加 YAML 文件：

```yaml
title: 节日热点海报
order: 30
draft: false
category: 节日热点图
year: 2025
featured: false
image:
  src: /images/visuals/festival-poster.webp
  alt: 红棕色节日热点海报
  width: 1200
  height: 1600
```

分类按钮由 `category` 自动生成，新分类不需要改页面。图片必须填写真实宽高，浏览器会据此预留空间，避免滚动时跳动。

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
