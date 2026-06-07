#!/usr/bin/env python3
"""Revolut-inspired CoachConnect icon — geometric deconstructed C, 3D bevel, bottom fade."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
PREVIEW = ROOT / "assets" / "previews"

BLACK = (0, 0, 0, 255)
SIZE = 1024


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def draw_deconstructed_c(
    canvas_size: int,
    *,
    cx: float = 0.50,
    cy: float = 0.48,
    scale: float = 0.70,
    stroke: float = 0.108,
    gap: float = 0.022,
) -> Image.Image:
    """Revolut-style split-stem C — rounded caps, open right side."""
    s = canvas_size
    mask = Image.new("L", (s, s), 0)
    draw = ImageDraw.Draw(mask)

    sw = max(int(s * stroke), 8)
    g = max(int(s * gap), 6)
    cap = sw // 2
    ox = int(s * cx)
    oy = int(s * cy)
    rx = int(s * scale * 0.36)
    ry = int(s * scale * 0.42)

    stem_l = ox - rx
    stem_r = stem_l + sw
    top = oy - ry
    bot = oy + ry
    bowl_l = stem_r + g

    # Left stem — detached block like Revolut's R
    draw.rounded_rectangle([stem_l, top, stem_r, bot], radius=cap, fill=255)

    # Thick C arc (270° ring segment, opening on the right)
    outer = [bowl_l - cap, top, ox + rx + cap, bot]
    inner = [bowl_l + sw - cap, top + sw, ox + rx - sw + cap, bot - sw]

    ring = Image.new("L", (s, s), 0)
    rd = ImageDraw.Draw(ring)
    rd.pieslice(outer, start=68, end=292, fill=255)
    rd.pieslice(inner, start=68, end=292, fill=0)

    # Keep only the left-side arc — trim the open right
    trim = Image.new("L", (s, s), 255)
    ImageDraw.Draw(trim).rectangle([ox + rx - sw, top - 4, s, bot + 4], fill=0)
    ring = ImageChops.multiply(ring, trim)
    mask = ImageChops.lighter(mask, ring)

    # Rounded end caps where the C opens (top-right and bottom-right tips)
    cap_r = cap
    top_cap_cx = ox + rx - sw // 2
    bot_cap_cx = top_cap_cx
    top_cap_cy = top + cap_r
    bot_cap_cy = bot - cap_r
    draw = ImageDraw.Draw(mask)
    draw.ellipse(
        [top_cap_cx - cap_r, top_cap_cy - cap_r, top_cap_cx + cap_r, top_cap_cy + cap_r],
        fill=255,
    )
    draw.ellipse(
        [bot_cap_cx - cap_r, bot_cap_cy - cap_r, bot_cap_cx + cap_r, bot_cap_cy + cap_r],
        fill=255,
    )

    return mask


def apply_vertical_shade(mask: Image.Image) -> Image.Image:
    """White body with subtle top-to-bottom tonal shift like Revolut."""
    s = mask.size[0]
    pixels = mask.load()
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    out = layer.load()

    ys = [y for y in range(s) if any(pixels[x, y] for x in range(s))]
    if not ys:
        return layer
    y_min, y_max = min(ys), max(ys)
    span = max(y_max - y_min, 1)

    for y in range(s):
        for x in range(s):
            a = pixels[x, y]
            if a == 0:
                continue
            t = (y - y_min) / span
            tone = int(_lerp(255, 228, t**0.85))
            out[x, y] = (tone, tone, tone, a)

    return layer


def apply_bottom_fade(layer: Image.Image, start: float = 0.62, end: float = 0.98) -> Image.Image:
    """Dissolve lower portion into the background."""
    s = layer.size[0]
    pixels = layer.load()
    ys = [y for y in range(s) if any(pixels[x, y][3] for x in range(s))]
    if not ys:
        return layer
    y_min, y_max = min(ys), max(ys)
    fade_start = y_min + (y_max - y_min) * start
    fade_end = y_min + (y_max - y_min) * end

    for y in range(s):
        for x in range(s):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if y <= fade_start:
                continue
            if y >= fade_end:
                pixels[x, y] = (r, g, b, 0)
                continue
            t = (y - fade_start) / (fade_end - fade_start)
            pixels[x, y] = (r, g, b, int(a * (1.0 - t**1.25)))

    return layer


def add_bevel_and_shadow(
    mask: Image.Image,
    *,
    bg: tuple[int, int, int, int] = BLACK,
) -> Image.Image:
    """Embossed 3D look — highlight, depth edge, soft drop shadow."""
    s = mask.size[0]
    canvas = Image.new("RGBA", (s, s), bg)

    # Soft drop shadow
    shadow = mask.filter(ImageFilter.GaussianBlur(radius=18))
    shadow_layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    shadow_layer.paste((12, 12, 12, 140), (0, 0), shadow)
    canvas.paste(shadow_layer, (5, 12), shadow_layer)

    # Dark edge (bottom-right depth)
    dark = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    dark.paste((0, 0, 0, 70), (3, 4), mask)
    canvas = Image.alpha_composite(canvas, dark)

    # Main letter body
    body = apply_vertical_shade(mask)
    body = apply_bottom_fade(body)
    canvas = Image.alpha_composite(canvas, body)

    # Top-left highlight bevel
    highlight = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    highlight.paste((255, 255, 255, 48), (-4, -4), mask)
    canvas = Image.alpha_composite(canvas, highlight)

    return canvas


def render_icon(
    size: int,
    *,
    background: tuple[int, int, int, int] | None = BLACK,
) -> Image.Image:
    mask = draw_deconstructed_c(size)
    if background is None:
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        letter = add_bevel_and_shadow(mask, bg=(0, 0, 0, 0))
        canvas.alpha_composite(letter)
        return canvas

    return add_bevel_and_shadow(mask, bg=background)


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.name == "icon.png":
        rgb = Image.new("RGB", img.size, BLACK[:3])
        rgb.paste(img, mask=img.split()[3])
        rgb.save(path, "PNG", optimize=True)
        return
    img.save(path, "PNG", optimize=True)


def rounded_preview(img: Image.Image, corner_radius: int) -> Image.Image:
    size = img.size[0]
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=corner_radius, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    icon = render_icon(1024)
    adaptive = render_icon(1024, background=None)
    favicon = render_icon(192)
    splash_mark = render_icon(480)
    splash = Image.new("RGB", (1284, 2778), BLACK[:3])
    sx = (splash.width - splash_mark.width) // 2
    sy = (splash.height - splash_mark.height) // 2 - 120
    splash.paste(splash_mark, (sx, sy), splash_mark)

    save_png(icon, ASSETS / "icon.png")
    save_png(adaptive, ASSETS / "adaptive-icon.png")
    save_png(favicon, ASSETS / "favicon.png")
    splash.save(ASSETS / "splash.png", "PNG", optimize=True)

    save_png(icon, PREVIEW / "icon-1024.png")
    save_png(rounded_preview(icon, 226), PREVIEW / "icon-ios-rounded-512.png")
    save_png(icon.resize((180, 180), Image.Resampling.LANCZOS), PREVIEW / "icon-home-180.png")
    save_png(icon.resize((120, 120), Image.Resampling.LANCZOS), PREVIEW / "icon-small-120.png")
    save_png(adaptive, PREVIEW / "adaptive-foreground-1024.png")
    save_png(splash.resize((428, 926), Image.Resampling.LANCZOS), PREVIEW / "splash-preview.png")

    print("Generated Revolut-style icons:")
    for name in ["icon.png", "adaptive-icon.png", "favicon.png", "splash.png"]:
        path = ASSETS / name
        print(f"  {path} ({path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
