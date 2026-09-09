"""
Open Graph card — public/og.png, 1200x675 (16:9, per the image-ratio rule).

Built from the clinic's own wordmark and the site's gate/poleng shape language.
No stock photography, no invented claims: the card carries the name, the
clinic's own tagline from its logo, and the district. Nothing else.

Run:  python scripts/generate-og.py
"""

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 675
SS = 2  # supersample, then downsample for clean edges

PAPER = (250, 250, 248, 255)
INK = (20, 20, 20, 255)
INK2 = (74, 74, 69, 255)
INK3 = (99, 99, 92, 255)
ACCENT = (240, 161, 26, 255)
ACCENT_SOFT = (253, 240, 217, 255)

img = Image.new("RGBA", (W * SS, H * SS), PAPER)
d = ImageDraw.Draw(img)


def s(v):
    return int(v * SS)


def poleng(y, height, unit, opacity):
    """Alternating modular squares — the rhythm strip, not literal cloth."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    cols = W // unit + 1
    for c in range(cols):
        if c % 2:
            continue
        ld.rectangle(
            [s(c * unit), s(y), s(c * unit + unit), s(y + height)],
            fill=INK[:3] + (int(255 * opacity),),
        )
    img.alpha_composite(layer)


def gate(cx, cy, w, h, gap, fill):
    """The candi bentar: one form cleaved in two, stepping in and up."""
    half = (w - gap) / 2
    bottom = cy + h / 2
    base = h * 0.13
    steps = [(1.0, 0.0), (0.9, 0.22), (0.76, 0.44), (0.6, 0.63), (0.44, 0.79), (0.3, 0.91)]

    for x_inner, direction in ((cx - gap / 2, -1), (cx + gap / 2, 1)):
        def xo(wf):
            return x_inner + direction * half * wf

        def ya(hf):
            return bottom - base - (h - base) * hf

        pts = [(x_inner, bottom), (xo(1), bottom)]
        for i, (wf, hf) in enumerate(steps):
            pts.append((xo(wf), ya(hf)))
            if i + 1 < len(steps):
                pts.append((xo(steps[i + 1][0]), ya(hf)))
        pts.append((x_inner, ya(steps[-1][1])))
        d.polygon([(s(x), s(y)) for x, y in pts], fill=fill)


def dog(cx, cy, scale, fill):
    """Rounded, hanging ears — the one feature that separates the dog from the
    cat at a glance. Never triangular, or the two glyphs read identically."""
    u = scale / 100
    d.ellipse([s(cx - 52 * u), s(cy - 46 * u), s(cx - 20 * u), s(cy + 18 * u)], fill=fill)
    d.ellipse([s(cx + 20 * u), s(cy - 46 * u), s(cx + 52 * u), s(cy + 18 * u)], fill=fill)
    d.ellipse([s(cx - 40 * u), s(cy - 34 * u), s(cx + 40 * u), s(cy + 44 * u)], fill=fill)


def cat(cx, cy, scale, fill):
    u = scale / 100
    d.ellipse([s(cx - 38 * u), s(cy - 38 * u), s(cx + 38 * u), s(cy + 42 * u)], fill=fill)
    d.polygon(
        [(s(cx - 36 * u), s(cy - 8 * u)), (s(cx - 32 * u), s(cy - 62 * u)), (s(cx - 2 * u), s(cy - 28 * u))],
        fill=fill,
    )
    d.polygon(
        [(s(cx + 36 * u), s(cy - 8 * u)), (s(cx + 32 * u), s(cy - 62 * u)), (s(cx + 2 * u), s(cy - 28 * u))],
        fill=fill,
    )


# ---------------------------------------------------------------- composition
poleng(0, 26, 26, 0.07)
poleng(H - 26, 26, 26, 0.07)

gate(900, 356, 520, 384, 150, ACCENT_SOFT)
dog(808, 366, 138, INK)
cat(992, 366, 128, INK)

# The accent rule under the wordmark: the one saturated field on the card.
d.rectangle([s(74), s(246), s(74 + 96), s(246 + 12)], fill=ACCENT)

font_mark = ImageFont.truetype("_research/fonts/archivo-700.ttf", s(76))
font_tag = ImageFont.truetype("_research/fonts/archivo-700.ttf", s(23))
font_meta = ImageFont.truetype("_research/fonts/archivo-400.ttf", s(25))

d.text((s(74), s(150)), "SANTI VET CARE", font=font_mark, fill=INK)
d.text((s(74), s(292)), "PRAKTEK DOKTER HEWAN BERSAMA", font=font_tag, fill=INK2)
d.text((s(74), s(360)), "Denpasar Utara, Bali", font=font_meta, fill=INK3)
d.text((s(74), s(400)), "Anjing dan kucing", font=font_meta, fill=INK3)

out = img.convert("RGB").resize((W, H), Image.LANCZOS)
out.save("public/og.png", optimize=True)
print(f"wrote public/og.png ({W}x{H}, 16:9)")
