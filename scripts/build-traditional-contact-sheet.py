from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


SOURCE = Path(r"F:\王力宏的文件\作品集素材\活动排版")
OUTPUT = Path("docs/curation/traditional-layout")
COLS = 4
CELL_W = 400
CELL_H = 470
THUMB_W = 360
THUMB_H = 390


def load_font(size: int):
    for path in (Path(r"C:\Windows\Fonts\msyh.ttc"), Path(r"C:\Windows\Fonts\simhei.ttf")):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def sort_key(path: Path):
    try:
        return (0, int(path.stem))
    except ValueError:
        return (1, path.name.lower())


files = sorted(
    [path for path in SOURCE.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}],
    key=sort_key,
)
OUTPUT.mkdir(parents=True, exist_ok=True)

rows = (len(files) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CELL_W, 90 + rows * CELL_H), "#e9e0d2")
draw = ImageDraw.Draw(sheet)
title_font = load_font(32)
label_font = load_font(22)
meta_font = load_font(16)
draw.text((24, 22), f"AI 前传统活动排版 / {len(files)} 张", fill="#2b211b", font=title_font)

for index, path in enumerate(files, start=1):
    with Image.open(path) as source:
        source = ImageOps.exif_transpose(source).convert("RGB")
        width, height = source.size
        thumb = ImageOps.contain(source, (THUMB_W, THUMB_H), Image.Resampling.LANCZOS)

    col = (index - 1) % COLS
    row = (index - 1) // COLS
    x = col * CELL_W
    y = 90 + row * CELL_H
    draw.rounded_rectangle((x + 12, y + 10, x + CELL_W - 12, y + CELL_H - 12), 12, fill="#fffaf2")
    image_x = x + (CELL_W - thumb.width) // 2
    image_y = y + 24 + (THUMB_H - thumb.height) // 2
    sheet.paste(thumb, (image_x, image_y))
    draw.text((x + 22, y + 422), f"{index:02d}", fill="#9a4f30", font=label_font)
    draw.text((x + 76, y + 427), f"{width} × {height} · {path.name}", fill="#6b5e53", font=meta_font)

output_path = OUTPUT / "traditional-layout-contact-sheet.jpg"
sheet.save(output_path, quality=92, optimize=True)

selected = {
    "4.jpg": "四季视觉 · 场景合成",
    "6.jpg": "端午活动 · 插画主视觉",
    "7.jpg": "周年庆典 · 企业视觉",
    "10.jpg": "泰国商品节 · 活动主视觉",
    "13.jpg": "橙风破浪 · 产品海报",
    "14.jpg": "品牌周 · 商业活动",
    "17.jpg": "五一活动 · 信息长图",
    "18.jpg": "春节活动 · 促销排版",
}
selected_files = [path for path in files if path.name in selected]
selected_sheet = Image.new("RGB", (COLS * CELL_W, 100 + 2 * CELL_H), "#e9e0d2")
selected_draw = ImageDraw.Draw(selected_sheet)
selected_draw.text((24, 22), "建议入选 / AI 前传统设计基础 · 8 张", fill="#2b211b", font=title_font)

for index, path in enumerate(selected_files, start=1):
    with Image.open(path) as source:
        source = ImageOps.exif_transpose(source).convert("RGB")
        thumb = ImageOps.contain(source, (THUMB_W, THUMB_H), Image.Resampling.LANCZOS)
    col = (index - 1) % COLS
    row = (index - 1) // COLS
    x = col * CELL_W
    y = 100 + row * CELL_H
    selected_draw.rounded_rectangle(
        (x + 12, y + 10, x + CELL_W - 12, y + CELL_H - 12),
        12,
        fill="#fffaf2",
        outline="#9a4f30",
        width=4,
    )
    image_x = x + (CELL_W - thumb.width) // 2
    image_y = y + 24 + (THUMB_H - thumb.height) // 2
    selected_sheet.paste(thumb, (image_x, image_y))
    selected_draw.text((x + 22, y + 420), path.stem.zfill(2), fill="#9a4f30", font=label_font)
    selected_draw.text((x + 70, y + 425), selected[path.name], fill="#4c4037", font=meta_font)

selected_path = OUTPUT / "traditional-layout-selected.jpg"
selected_sheet.save(selected_path, quality=92, optimize=True)
print(output_path.resolve())
print(selected_path.resolve())
