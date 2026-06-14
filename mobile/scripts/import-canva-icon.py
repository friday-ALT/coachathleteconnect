#!/usr/bin/env python3
"""Build Expo app icon + splash from the committed Canva C source asset."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
PREVIEW = ASSETS / "previews"
SOURCE = ASSETS / "canva-icon-source.png"
BLACK = (0, 0, 0)
ICON_SIZE = 1024
# Keep a little breathing room so the C isn't flush against iOS rounded corners
MARK_SCALE = 0.88


def content_bbox(img: Image.Image, threshold: int = 24) -> tuple[int, int, int, int]:
    """Bounding box of non-background pixels (the letter C)."""
    rgb = img.convert("RGB")
    pixels = rgb.load()
    w, h = rgb.size
    xs: list[int] = []
    ys: list[int] = []
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if r > threshold or g > threshold or b > threshold:
                xs.append(x)
                ys.append(y)
    if not xs:
        return (0, 0, w, h)
    return (min(xs), min(ys), max(xs) + 1, max(ys) + 1)


def center_mark(img: Image.Image, *, size: int = ICON_SIZE, scale: float = MARK_SCALE) -> Image.Image:
    """Crop the letter, scale it, and paste dead-center on a black square."""
    box = content_bbox(img)
    mark = img.crop(box)
    target = int(size * scale)
    mark.thumbnail((target, target), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (size, size), BLACK)
    x = (size - mark.width) // 2
    y = (size - mark.height) // 2
    canvas.paste(mark, (x, y))
    return canvas


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


def build_splash(icon: Image.Image, *, width: int = 1284, height: int = 2778, mark_size: int = 480) -> Image.Image:
    """Center the C mark on a black splash canvas sized for modern phones."""
    splash = Image.new("RGB", (width, height), BLACK)
    mark = icon.resize((mark_size, mark_size), Image.Resampling.LANCZOS)
    sx = (splash.width - mark.width) // 2
    sy = (splash.height - mark.height) // 2
    splash.paste(mark, (sx, sy))
    return splash


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Source icon not found: {SOURCE}")

    base = Image.open(SOURCE).convert("RGB")
    if base.size != (ICON_SIZE, ICON_SIZE):
        base = base.resize((ICON_SIZE, ICON_SIZE), Image.Resampling.LANCZOS)

    icon = center_mark(base)
    adaptive = icon.copy()
    favicon = icon.resize((192, 192), Image.Resampling.LANCZOS)
    splash = build_splash(icon)

    save_icon(icon, ASSETS / "icon.png")
    save_icon(adaptive, ASSETS / "adaptive-icon.png")
    save_icon(favicon, ASSETS / "favicon.png")
    splash.save(ASSETS / "splash.png", "PNG", optimize=True)

    PREVIEW.mkdir(parents=True, exist_ok=True)
    save_icon(icon, PREVIEW / "icon-1024.png")
    save_icon(rounded_preview(icon, 226), PREVIEW / "icon-ios-rounded-512.png")
    save_icon(icon.resize((180, 180), Image.Resampling.LANCZOS), PREVIEW / "icon-home-180.png")
    save_icon(icon.resize((120, 120), Image.Resampling.LANCZOS), PREVIEW / "icon-small-120.png")
    save_icon(adaptive, PREVIEW / "adaptive-foreground-1024.png")
    splash.resize((428, 926), Image.Resampling.LANCZOS).save(PREVIEW / "splash-preview.png", optimize=True)

    print("Built CoachConnect branding assets:")
    for name in ["icon.png", "adaptive-icon.png", "favicon.png", "splash.png"]:
        path = ASSETS / name
        print(f"  {path} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
