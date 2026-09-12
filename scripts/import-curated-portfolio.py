"""Import the approved portfolio selection without modifying source artwork."""

from __future__ import annotations

import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CURATION = ROOT / "docs" / "curation" / "portfolio-2026-05"
INVENTORY_PATH = CURATION / "inventory.json"
SELECTION_PATH = CURATION / "selection.json"
MANIFEST_PATH = ROOT / "content" / "visuals-manifest.json"
PUBLIC_IMAGE_ROOT = ROOT / "public" / "images"

CATEGORY_CONFIG = {
    "商业设计合集": ("商业视觉", "commercial"),
    "电商视觉设计": ("电商主图", "ecommerce"),
    "节日热点": ("节日热点图", "festival"),
    "自媒体封面设计": ("自媒体封面", "social"),
}

TITLES = {
    "CM02": "成都慢生活",
    "CM04": "成都夜游地图",
    "CM05": "成都火锅地图",
    "CM09": "美好童行品牌视觉",
    "CM10": "年中狂欢·成都来造",
    "CM11": "美好生活·开心一下",
    "CM12": "你好，新学期",
    "CM13": "成都美食节",
    "CM14": "供应商大会",
    "CM16": "疯狂夜市",
    "CM18": "产地鲜果直送",
    "CM20": "清凉一夏低价 GO",
    "EC01": "东方甄选自营苹果干",
    "EC02": "大颗肉肠首图",
    "EC04": "一半以上都是肉",
    "EC07": "配方简单",
    "EC09": "肉肠 Q&A",
    "EC10": "每日坚果首图",
    "EC11": "大罐囤货·全家共享",
    "EC12": "科学搭配五种坚果",
    "EC14": "产品信息",
    "EC17": "酸甜软糯·果香满满",
    "EC19": "半颗苹果约一片苹果干",
    "EC21": "三蒸三晒·原汁原味",
    "EC23": "中老年舒适健步鞋",
    "EC27": "软弹缓震·稳步防滑",
    "EC29": "轻盈防晒服",
    "EC33": "一件搞定·多场景出行",
    "FD01": "立春",
    "FD03": "惊蛰",
    "FD05": "清明",
    "FD07": "立夏",
    "FD09": "芒种",
    "FD11": "夏至",
    "FD13": "立秋",
    "FD15": "白露",
    "FD17": "寒露",
    "FD21": "大雪",
    "FD26": "端午安康",
    "FD27": "中秋",
    "FD28": "童心未泯·未来可期",
    "FD29": "喜迎国庆",
    "FD31": "元宵",
    "FD33": "劳动节",
    "FD36": "清明踏青",
    "FD37": "重阳",
    "SC01": "GPW 电竞无线鼠标",
    "SC02": "GPW 轻至离谱",
    "SC03": "抗老紧致天花板",
    "SC04": "这套抗老真的有点猛",
    "SC07": "一年制硕士申请",
    "SC09": "长辈友好·轻松游",
    "SC10": "逃进山里",
    "SC11": "32 岁转做 AI 设计",
    "SC13": "公众号没人看",
    "SC15": "32 岁转行怎么投简历",
    "SC18": "副业知识库怎么搭",
    "SC19": "作品集这样做",
    "SC20": "爆款封面怎么做",
}

DESCRIPTION_TEMPLATES = {
    "商业视觉": "AI 辅助完成的商业视觉练习，围绕“{title}”处理主视觉、标题层级与场景氛围。",
    "电商主图": "AI 辅助电商视觉练习，以“{title}”呈现产品卖点、信息层级与使用场景。",
    "节日热点图": "AI 辅助节日视觉练习，以“{title}”为主题处理中文字体、自然意象与节日氛围。",
    "自媒体封面": "AI 辅助自媒体封面练习，以“{title}”测试标题层级、阅读动线与移动端识别度。",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    inventory = {item["id"]: item for item in load_json(INVENTORY_PATH)}
    selection = load_json(SELECTION_PATH)
    recommended = [
        item_id
        for source_category in CATEGORY_CONFIG
        for item_id in selection["recommended"][source_category]
    ]
    homepage = selection["homepage"]

    if len(recommended) != 59 or len(set(recommended)) != 59:
        raise ValueError("Expected exactly 59 unique recommended works.")
    if len(homepage) != 8 or not set(homepage).issubset(recommended):
        raise ValueError("Homepage selection must contain 8 recommended works.")

    missing_inventory = sorted(set(recommended) - inventory.keys())
    missing_titles = sorted(set(recommended) - TITLES.keys())
    if missing_inventory or missing_titles:
        raise ValueError(f"Missing inventory={missing_inventory}; titles={missing_titles}")

    ordered_ids = homepage + [item_id for item_id in recommended if item_id not in homepage]
    manifest = []

    for index, item_id in enumerate(ordered_ids, start=1):
        source_record = inventory[item_id]
        public_category, directory = CATEGORY_CONFIG[source_record["category"]]
        public_id = f"{item_id[:2].lower()}-{item_id[2:]}"
        relative_file = f"visuals/{directory}/{public_id}.jpg"
        source = Path(source_record["source"])
        destination = PUBLIC_IMAGE_ROOT / relative_file
        legacy_destination = PUBLIC_IMAGE_ROOT / f"visuals/{directory}/{item_id.lower()}.jpg"

        if not source.is_file():
            raise FileNotFoundError(source)

        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        if legacy_destination != destination and legacy_destination.is_file():
            legacy_destination.unlink()

        title = TITLES[item_id]
        manifest.append(
            {
                "id": public_id,
                "file": relative_file,
                "title": title,
                "alt": f"{public_category}作品《{title}》",
                "category": public_category,
                "era": "ai-assisted",
                "description": DESCRIPTION_TEMPLATES[public_category].format(title=title),
                "tools": ["AI 生图", "版式设计"],
                "year": 2026,
                "order": index * 10,
                "draft": False,
                "demo": False,
                "featured": item_id in homepage,
            }
        )

    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Imported {len(manifest)} selected works; {len(homepage)} are featured on the homepage.")


if __name__ == "__main__":
    main()
