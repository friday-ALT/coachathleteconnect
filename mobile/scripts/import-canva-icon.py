#!/usr/bin/env python3
"""Import the Canva C icon from the user screenshot into Expo app assets."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
PREVIEW = ASSETS / "previews"

# Main canvas — exact black square on the right (no Canva toolbar chrome)
SOURCE = Path(
    "/Users/ethanpage/.cursor/projects/Users-ethanpage-Documents-CoachAthleteConnect/assets/"
    "Screenshot_2026-06-07_at_5.27.23_PM-b87e1b48-d98d-43d2-bb2d-fa2bc9f3859e.png"
)
CROP = (528, 96, 918, 486)
BLACK = (0, 0, 0)


def square_crop(img: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    cropped = img.crop(box)
    w, h = cropped.size
    side = min(w, h)
    cx, cy = w // 2, h // 2
    return cropped.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2))


def save_icon(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.name == "icon.png":
        rgb = img.convert("RGB")
        rgb.save(path, "PNG", optimize=True)
        return
    img.save(path, "PNG", optimize=True)


def rounded_preview(img: Image.Image, corner_radius: int) -> Image.Image:
    size = img.size[0]
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=corner_radius, fill=255)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Source screenshot not found: {SOURCE}")

    base = square_crop(Image.open(SOURCE).convert("RGB"), CROP)
    icon = base.resize((1024, 1024), Image.Resampling.LANCZOS)

    # Android adaptive foreground — same artwork; background color set in app.json
    adaptive = icon.copy()
    favicon = icon.resize((192, 192), Image.Resampling.LANCZOS)
    splash_mark = icon.resize((480, 480), Image.Resampling.LANCZOS)
    splash = Image.new("RGB", (1284, 2778), BLACK)
    sx = (splash.width - splash_mark.width) // 2
    sy = (splash.height - splash_mark.height) // 2 - 120
    splash.paste(splash_mark, (sx, sy))

    save_icon(icon, ASSETS / "icon.png")
    save_icon(adaptive, ASSETS / "adaptive-icon.png")
    save_icon(favicon, ASSETS / "favicon.png")
    splash.save(ASSETS / "splash.png", "PNG", optimize=True)

    save_icon(icon, PREVIEW / "icon-1024.png")
    save_icon(rounded_preview(icon, 226), PREVIEW / "icon-ios-rounded-512.png")
    save_icon(icon.resize((180, 180), Image.Resampling.LANCZOS), PREVIEW / "icon-home-180.png")
    save_icon(icon.resize((120, 120), Image.Resampling.LANCZOS), PREVIEW / "icon-small-120.png")
    save_icon(adaptive, PREVIEW / "adaptive-foreground-1024.png")
    splash.resize((428, 926), Image.Resampling.LANCZOS).save(PREVIEW / "splash-preview.png", optimize=True)

    print("Imported Canva icon:")
    for name in ["icon.png", "adaptive-icon.png", "favicon.png", "splash.png"]:
        path = ASSETS / name
        print(f"  {path} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
