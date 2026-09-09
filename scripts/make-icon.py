"""
Site icon from Santi Vet Care's own Instagram profile logo.

The source is the 150x150 JPEG Instagram serves for the account avatar, which
is the only resolution publicly available. It is a circular badge sitting on a
white square. This script:

  - masks everything outside the badge to full transparency, so the icon has no
    background of its own (the brief is explicit about this)
  - upscales with LANCZOS for the larger icon sizes

The white *inside* the badge is part of the clinic's logo and is kept.

Limitation, recorded in the README: 150x150 is thin for a 180px touch icon.
Ask the clinic for the original artwork and re-run this against it.
"""
from PIL import Image, ImageDraw, ImageFilter

SRC = "_research/ig-profile.jpg"
src = Image.open(SRC).convert("RGBA")
w, h = src.size

# Supersample so the mask edge is clean rather than stair-stepped.
SS = 8
mask = Image.new("L", (w * SS, h * SS), 0)
d = ImageDraw.Draw(mask)
# The badge is inset by roughly one pixel at this size; keep a hair of margin.
inset = 1 * SS
d.ellipse([inset, inset, w * SS - inset, h * SS - inset], fill=255)
mask = mask.resize((w, h), Image.LANCZOS)

out = src.copy()
out.putalpha(mask)

# Trim to the badge's bounding box so no transparent padding is baked in.
out = out.crop(out.getbbox())

for size, name in [(512, "public/icon-512.png"), (180, "src/app/apple-icon.png"), (96, "src/app/icon.png")]:
    resized = out.resize((size, size), Image.LANCZOS)
    if size > 150:
        # Gentle sharpen to recover a little edge definition after upscaling.
        resized = resized.filter(ImageFilter.UnsharpMask(radius=1.6, percent=95, threshold=2))
    resized.save(name)
    print(f"wrote {name} ({size}x{size})")
