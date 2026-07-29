#!/usr/bin/env python3
"""Génère les icônes de l'app (écran d'accueil iOS + manifeste web).

    pip install pillow && python3 tools/make-icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

WORK = 2048  # on dessine en grand puis on réduit, pour des bords nets
OUT = Path(__file__).resolve().parent.parent / "icons"

BG_TOP = (28, 36, 52)
BG_BOTTOM = (11, 14, 19)
PAPER = (246, 242, 232)
PAPER_SHADE = (214, 209, 196)
FILTER = (216, 164, 66)
FILTER_SHADE = (183, 134, 44)
EMBER = (255, 122, 24)
EMBER_CORE = (255, 214, 130)


def background(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = (y / (size - 1)) ** 0.85
        draw.line(
            [(0, y), (size, y)],
            fill=tuple(round(a + (b - a) * t) for a, b in zip(BG_TOP, BG_BOTTOM)) + (255,),
        )
    return img


def cigarette(size: int, length: float, thickness: float) -> Image.Image:
    """Dessine une cigarette horizontale centrée, braise à gauche."""
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    cx = cy = size / 2
    left, right = cx - length / 2, cx + length / 2
    top, bottom = cy - thickness / 2, cy + thickness / 2
    radius = thickness / 2

    ember_end = left + length * 0.055
    filter_start = left + length * 0.70

    # Halo de la braise, sous la cigarette.
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    halo = thickness * 1.6
    ImageDraw.Draw(glow).ellipse(
        [left - halo, cy - halo, left + halo, cy + halo], fill=EMBER + (150,)
    )
    layer.alpha_composite(glow.filter(ImageFilter.GaussianBlur(thickness * 0.62)))

    # Corps en papier.
    draw.rounded_rectangle([left, top, right, bottom], radius=radius, fill=PAPER + (255,))
    draw.line(
        [(ember_end + thickness * 0.5, bottom - thickness * 0.14),
         (filter_start, bottom - thickness * 0.14)],
        fill=PAPER_SHADE + (255,), width=round(thickness * 0.09),
    )

    # Filtre : arrondi à droite, carré à gauche pour épouser le papier.
    draw.rounded_rectangle([filter_start, top, right, bottom], radius=radius, fill=FILTER + (255,))
    draw.rectangle([filter_start, top, filter_start + radius, bottom], fill=FILTER + (255,))
    for offset in (0.055, 0.105):
        x = filter_start + length * offset
        draw.line([(x, top), (x, bottom)], fill=FILTER_SHADE + (255,), width=round(thickness * 0.055))

    # Braise incandescente au bout.
    draw.rounded_rectangle([left, top, ember_end + radius, bottom], radius=radius, fill=EMBER + (255,))
    draw.rectangle([ember_end, top, ember_end + radius, bottom], fill=EMBER + (255,))
    draw.ellipse(
        [left + thickness * 0.06, cy - thickness * 0.24,
         left + thickness * 0.44, cy + thickness * 0.24],
        fill=EMBER_CORE + (255,),
    )

    return layer


def build(size: int, scale: float) -> Image.Image:
    # On dessine et on fait tourner la cigarette sur un canvas élargi : le halo
    # déborde alors hors champ au lieu d'être coupé net par le bord.
    pad = round(WORK * 0.5)
    canvas = WORK + pad * 2
    body = cigarette(canvas, length=WORK * 0.68 * scale, thickness=WORK * 0.125 * scale)
    body = body.rotate(20, resample=Image.BICUBIC).crop((pad, pad, pad + WORK, pad + WORK))

    icon = background(WORK)
    icon.alpha_composite(body)
    return icon.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Une icône maskable doit tenir dans un cercle de sûreté : on réduit le motif.
    targets = [
        ("apple-touch-icon.png", 180, 1.0),
        ("icon-192.png", 192, 1.0),
        ("icon-512.png", 512, 1.0),
        ("icon-maskable-512.png", 512, 0.66),
    ]
    for name, size, scale in targets:
        build(size, scale).convert("RGB").save(OUT / name, "PNG", optimize=True)
        print(f"→ icons/{name} ({size}×{size})")


if __name__ == "__main__":
    main()
