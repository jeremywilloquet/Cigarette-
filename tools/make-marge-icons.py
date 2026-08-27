#!/usr/bin/env python3
"""Génère les icônes du calculateur de marge (écran d'accueil iOS + manifeste).

    pip install pillow && python3 tools/make-marge-icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

WORK = 2048  # on dessine en grand puis on réduit, pour des bords nets
OUT = Path(__file__).resolve().parent.parent / "marge" / "icons"

GREEN_TOP = (52, 92, 70)      # vert moyen
GREEN_BOTTOM = (30, 58, 46)   # vert profond
OCRE = (198, 142, 23)
OCRE_SHADE = (156, 110, 16)
PAPER = (243, 239, 226)


def background(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = (y / (size - 1)) ** 0.85
        draw.line(
            [(0, y), (size, y)],
            fill=tuple(round(a + (b - a) * t) for a, b in zip(GREEN_TOP, GREEN_BOTTOM)) + (255,),
        )
    return img


def euro_sign(draw: ImageDraw.ImageDraw, cx: float, cy: float, size: float, fill) -> None:
    """Un « € » tracé à la main : l'arc ouvert à droite, barré de deux traits.

    Dessiné géométriquement plutôt qu'avec une police, pour que le script
    tourne sans dépendre d'un fichier de fonte installé sur la machine.
    """
    radius = size / 2
    stroke = max(2, round(size * 0.155))

    draw.arc(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        start=38, end=322, fill=fill, width=stroke,
    )
    for offset in (-0.30, 0.16):
        bar_y = cy + radius * offset
        half = stroke / 2
        draw.rounded_rectangle(
            [cx - radius * 1.20, bar_y - half, cx + radius * 0.34, bar_y + half],
            radius=half, fill=fill,
        )


def price_tag(size: int, scale: float) -> Image.Image:
    """Une étiquette de prix : pointe percée d'un œillet, penchée comme au stand."""
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    length = size * 0.64 * scale
    height = size * 0.40 * scale
    cx = cy = size / 2
    left, right = cx - length / 2, cx + length / 2
    top, bottom = cy - height / 2, cy + height / 2

    tip = height * 0.80          # longueur de la pointe, à gauche
    radius = height * 0.16       # arrondi du corps, à droite
    body_left = left + tip

    def tag(offset: float, fill):
        """Le corps arrondi plus la pointe triangulaire, en une seule forme."""
        o = offset
        draw.rounded_rectangle(
            [body_left + o, top + o, right + o, bottom + o], radius=radius, fill=fill
        )
        # On carre le flanc gauche du corps pour que la pointe s'y raccorde net.
        draw.rectangle([body_left + o, top + o, body_left + radius + o, bottom + o], fill=fill)
        # La pointe rejoint le corps exactement là où le flanc a été carré,
        # sinon son arête arrive sous le bord haut et laisse une marche.
        draw.polygon(
            [(left + o, cy + o), (body_left + o, top + o), (body_left + o, bottom + o)],
            fill=fill,
        )

    tag(height * 0.045, (20, 40, 31, 105))   # ombre portée
    tag(0, OCRE + (255,))

    # L'œillet perforé, près de la pointe.
    hole = height * 0.105
    hx = left + tip * 0.62
    draw.ellipse([hx - hole, cy - hole, hx + hole, cy + hole], fill=GREEN_BOTTOM + (255,))

    # Le prix inscrit sur l'étiquette.
    euro_sign(draw, (body_left + right) / 2 + radius * 0.5, cy, height * 0.50, GREEN_BOTTOM + (255,))

    # On penche l'étiquette : suspendue, elle ne pend jamais droite.
    return layer.rotate(-16, resample=Image.BICUBIC, center=(cx, cy))


def build(size: int, scale: float) -> Image.Image:
    icon = background(WORK)
    icon.alpha_composite(price_tag(WORK, scale))
    return icon.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Une icône maskable doit tenir dans un cercle de sûreté : on réduit le motif.
    targets = [
        ("apple-touch-icon.png", 180, 1.0),
        ("icon-192.png", 192, 1.0),
        ("icon-512.png", 512, 1.0),
        ("icon-maskable-512.png", 512, 0.70),
    ]
    for name, size, scale in targets:
        build(size, scale).convert("RGB").save(OUT / name, "PNG", optimize=True)
        print(f"→ marge/icons/{name} ({size}×{size})")


if __name__ == "__main__":
    main()
