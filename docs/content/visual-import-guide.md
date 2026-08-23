# 视觉作品批量导入指南

这套导入结构为约 60 张海报、电商主图、自媒体封面、活动排版和节日热点图准备。日常只维护图片与一份 JSON 清单，网站使用的 YAML 由脚本统一生成。

## 1. 整理图片

把图片放进 `public/images/visuals/`，可以按类型继续分文件夹，例如：

```text
public/images/visuals/
├─ posters/
├─ ecommerce/
├─ social-covers/
├─ event-layouts/
└─ festival/
```

- 优先使用 WebP 或 AVIF，照片类 JPEG 也可以，透明背景图可用 PNG。
- 普通展示图建议长边控制在 2000–2400px；单张尽量控制在 500KB 内。
- 文件名只用小写英文、数字和连字符，例如 `spring-festival-01.webp`。
- 不要用空格、中文、括号或 `最终版2` 这类难以长期维护的命名。
- 导入脚本会读取图片的真实宽高，清单里不用填写尺寸。

## 2. 编辑清单

打开 `content/visuals-manifest.json`。每个对象代表一张作品：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 全站唯一，只能使用小写英文、数字和连字符 |
| `file` | 是 | 相对 `public/images/` 的路径，例如 `visuals/posters/poster-01.webp` |
| `title` | 是 | 网站中显示的作品名 |
| `alt` | 是 | 对画面的简短客观描述，用于无障碍和图片加载失败场景 |
| `category` | 是 | 分类名，可直接新增；页面会自动生成筛选按钮 |
| `year` | 是 | 四位年份 |
| `order` | 是 | 正整数，越小越靠前；建议按 10 递增，方便日后插入 |
| `featured` | 否 | `true` 时进入首页精选，默认 `false` |
| `draft` | 否 | `true` 时暂不展示，默认 `false` |
| `projectId` | 否 | 对应 `src/data/projects/` 中的文件名，用来连接项目详情页 |

三个作品的示例：

```json
[
  {
    "id": "poster-2025-01",
    "file": "visuals/posters/poster-2025-01.webp",
    "title": "品牌活动主视觉",
    "alt": "米色纸张肌理上的咖啡色活动标题与人物剪影",
    "category": "海报",
    "year": 2025,
    "order": 10,
    "featured": true,
    "projectId": "brand-campaign"
  },
  {
    "id": "ecommerce-2025-01",
    "file": "visuals/ecommerce/ecommerce-2025-01.webp",
    "title": "咖啡产品主图",
    "alt": "深咖啡色背景中的咖啡包装与柔和侧光",
    "category": "电商主图",
    "year": 2025,
    "order": 20
  },
  {
    "id": "social-cover-2026-01",
    "file": "visuals/social-covers/social-cover-2026-01.webp",
    "title": "公众号专题封面",
    "alt": "暖灰背景上的衬线标题和红棕色几何图形",
    "category": "自媒体封面",
    "year": 2026,
    "order": 30,
    "draft": true
  }
]
```

## 3. 生成与校验

在项目根目录执行：

```powershell
npm run content:visuals
npm run content:visuals:check
npm run check
```

- `content:visuals` 只会写入 `src/data/visuals/generated/`，不会删除其他手写内容。
- `content:visuals:check` 是只读校验；缺图、重复 ID、非法路径、错误年份或生成文件过期都会直接报错。
- 生成目录里的 YAML 不要手工修改，下次导入会覆盖它们。

最后运行 `npm run dev`，打开 `/visuals/` 检查分类、顺序、标题和图片裁切，再确认首页精选数量是否合适。

## 4. 分批整理 60 张素材的建议

可以先每类选 6–12 张代表作，按“最能说明能力”而不是按“做过的全部内容”排序。只有需要讲过程的 3–6 个系列连接 `projectId`；其余作品保留图片、标题和一句准确的 `alt` 即可。这样网站既有作品密度，又不会让维护变成写 60 篇项目复盘。
