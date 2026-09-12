from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


SOURCE = Path(r"F:\王力宏的文件\作品集素材\5.15压缩作品集")
OUTPUT = Path("docs/curation/portfolio-2026-05")
CATEGORY_CODES = {
    "电商视觉设计": "EC",
    "节日热点": "FD",
    "商业设计合集": "CM",
    "自媒体封面设计": "SC",
}
CELL_W, CELL_H = 280, 390
THUMB_W, THUMB_H = 248, 326
COLS = 5


def font(size: int):
    paths = [
        Path(r"C:\Windows\Fonts\msyh.ttc"),
        Path(r"C:\Windows\Fonts\simhei.ttf"),
    ]
    for path in paths:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


OUTPUT.mkdir(parents=True, exist_ok=True)
inventory = []
title_font = font(28)
label_font = font(20)
small_font = font(15)

for category_dir in sorted(path for path in SOURCE.iterdir() if path.is_dir()):
    files = sorted(category_dir.glob("*.jpg"), key=lambda path: path.name)
    code = CATEGORY_CODES[category_dir.name]
    rows = (len(files) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * CELL_W, 70 + rows * CELL_H), "#eee9df")
    draw = ImageDraw.Draw(sheet)
    draw.text((18, 16), f"{category_dir.name}  /  {len(files)} 张", fill="#2b241f", font=title_font)

    for index, path in enumerate(files, start=1):
        item_id = f"{code}{index:02d}"
        with Image.open(path) as source:
            source = ImageOps.exif_transpose(source).convert("RGB")
            width, height = source.size
            thumb = ImageOps.contain(source, (THUMB_W, THUMB_H), Image.Resampling.LANCZOS)
        col = (index - 1) % COLS
        row = (index - 1) // COLS
        x = col * CELL_W
        y = 70 + row * CELL_H
        draw.rounded_rectangle((x + 8, y + 8, x + CELL_W - 8, y + CELL_H - 8), 10, fill="#fffdf8")
        image_x = x + (CELL_W - thumb.width) // 2
        image_y = y + 18 + (THUMB_H - thumb.height) // 2
        sheet.paste(thumb, (image_x, image_y))
        draw.text((x + 16, y + 350), item_id, fill="#8d3e24", font=label_font)
        draw.text((x + 78, y + 355), f"{width}×{height}  {path.stat().st_size // 1024}KB", fill="#6b625b", font=small_font)
        inventory.append({
            "id": item_id,
            "category": category_dir.name,
            "source": str(path),
            "filename": path.name,
            "width": width,
            "height": height,
            "bytes": path.stat().st_size,
        })

    sheet.save(OUTPUT / f"{code.lower()}-{category_dir.name}.jpg", quality=90, optimize=True)

(OUTPUT / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding="utf-8")

selection_path = OUTPUT / "selection.json"
if selection_path.exists():
    selection = json.loads(selection_path.read_text(encoding="utf-8"))
    selected_ids = {item_id for ids in selection["recommended"].values() for item_id in ids}
    selected = [item for item in inventory if item["id"] in selected_ids]
    rows = (len(selected) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * CELL_W, 70 + rows * CELL_H), "#eee9df")
    draw = ImageDraw.Draw(sheet)
    draw.text((18, 16), f"网站首批推荐  /  {len(selected)} 张", fill="#2b241f", font=title_font)
    homepage_ids = set(selection["homepage"])
    for index, item in enumerate(selected):
        path = Path(item["source"])
        with Image.open(path) as source:
            source = ImageOps.exif_transpose(source).convert("RGB")
            thumb = ImageOps.contain(source, (THUMB_W, THUMB_H), Image.Resampling.LANCZOS)
        col, row = index % COLS, index // COLS
        x, y = col * CELL_W, 70 + row * CELL_H
        color = "#8d3e24" if item["id"] in homepage_ids else "#5c7354"
        draw.rounded_rectangle((x + 8, y + 8, x + CELL_W - 8, y + CELL_H - 8), 10, fill="#fffdf8", outline=color, width=4)
        sheet.paste(thumb, (x + (CELL_W - thumb.width) // 2, y + 18 + (THUMB_H - thumb.height) // 2))
        draw.text((x + 16, y + 350), item["id"], fill=color, font=label_font)
        if item["id"] in homepage_ids:
            draw.text((x + 78, y + 354), "首页", fill=color, font=small_font)
    sheet.save(OUTPUT / "recommended-overview.jpg", quality=90, optimize=True)

print(f"Generated {len(inventory)} indexed items in {OUTPUT}")
