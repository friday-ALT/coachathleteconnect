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
    sy = (splash.height - mark.height) // 2 - int(height * 0.04)
    splash.paste(mark, (sx, sy))
    return splash


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Source icon not found: {SOURCE}")

    base = Image.open(SOURCE).convert("RGB")
    if base.size != (1024, 1024):
        base = base.resize((1024, 1024), Image.Resampling.LANCZOS)

    icon = base
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
