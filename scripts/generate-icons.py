import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_PATH = os.path.join(BASE_DIR, "public", "logo.png")
RES_DIR = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")

def create_master_icon(size=1024, is_round=False):
    """
    Creates a luxury modern app icon using the smstreat logo.
    Deep maroon royal gradient + gold metallic ring + white inner badge + crisp smstreat logo.
    """
    # 1. Base maroon gradient
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Top-left to bottom-right deep royal crimson gradient
    c1 = (70, 4, 15, 255)   # #46040f
    c2 = (30, 0, 6, 255)    # #1e0006
    for y in range(size):
        r = int(c1[0] + (c2[0] - c1[0]) * (y / size))
        g = int(c1[1] + (c2[1] - c1[1]) * (y / size))
        b = int(c1[2] + (c2[2] - c1[2]) * (y / size))
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # Mask for round or rounded squircle
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    if is_round:
        mask_draw.ellipse([(0, 0), (size - 1, size - 1)], fill=255)
    else:
        # Modern continuous rounded squircle (~22% radius)
        corner_r = int(size * 0.22)
        mask_draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=corner_r, fill=255)

    img.putalpha(mask)

    # 2. Golden rim highlight
    rim = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)
    rim_thickness = max(4, int(size * 0.035))
    if is_round:
        rim_draw.ellipse(
            [(rim_thickness // 2, rim_thickness // 2), 
             (size - 1 - rim_thickness // 2, size - 1 - rim_thickness // 2)],
            outline=(245, 180, 20, 220), width=rim_thickness
        )
    else:
        corner_r = int(size * 0.22)
        rim_draw.rounded_rectangle(
            [(rim_thickness // 2, rim_thickness // 2), 
             (size - 1 - rim_thickness // 2, size - 1 - rim_thickness // 2)],
            radius=corner_r,
            outline=(245, 180, 20, 220), width=rim_thickness
        )
    img = Image.alpha_composite(img, rim)

    # 3. Soft golden radiant glow in center
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = size // 2, size // 2
    glow_r = int(size * 0.42)
    glow_draw.ellipse(
        [(cx - glow_r, cy - glow_r), (cx + glow_r, cy + glow_r)],
        fill=(251, 191, 36, 40)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(int(size * 0.08)))
    img = Image.alpha_composite(img, glow)

    # 4. White circular badge for smstreat logo
    badge_size = int(size * 0.72)
    badge_x = (size - badge_size) // 2
    badge_y = (size - badge_size) // 2

    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    badge_draw = ImageDraw.Draw(badge)
    # Circular white card
    badge_draw.ellipse(
        [(badge_x, badge_y), (badge_x + badge_size, badge_y + badge_size)],
        fill=(255, 255, 255, 255),
        outline=(230, 160, 15, 240),
        width=max(3, int(size * 0.02))
    )
    img = Image.alpha_composite(img, badge)

    # 5. Load and paste the smstreat logo inside white badge
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_inner_size = int(badge_size * 0.86)
    logo_resized = logo.resize((logo_inner_size, logo_inner_size), Image.Resampling.LANCZOS)

    paste_x = (size - logo_inner_size) // 2
    paste_y = (size - logo_inner_size) // 2

    img.paste(logo_resized, (paste_x, paste_y), logo_resized)
    return img

def create_foreground_icon(size=432):
    """
    Creates Android adaptive icon foreground (transparent background).
    Safe zone: inner 66% (285px out of 432px).
    """
    fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    badge_size = int(size * 0.58)
    badge_x = (size - badge_size) // 2
    badge_y = (size - badge_size) // 2

    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(badge)
    
    # Outer gold glow
    b_draw.ellipse(
        [(badge_x - 8, badge_y - 8), (badge_x + badge_size + 8, badge_y + badge_size + 8)],
        fill=(245, 180, 20, 80)
    )
    badge = badge.filter(ImageFilter.GaussianBlur(8))
    fg = Image.alpha_composite(fg, badge)

    # White circular emblem
    b_draw2 = ImageDraw.Draw(fg)
    b_draw2.ellipse(
        [(badge_x, badge_y), (badge_x + badge_size, badge_y + badge_size)],
        fill=(255, 255, 255, 255),
        outline=(245, 180, 20, 255),
        width=max(3, int(size * 0.015))
    )

    # Logo
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_inner = int(badge_size * 0.86)
    logo_resized = logo.resize((logo_inner, logo_inner), Image.Resampling.LANCZOS)

    paste_x = (size - logo_inner) // 2
    paste_y = (size - logo_inner) // 2
    fg.paste(logo_resized, (paste_x, paste_y), logo_resized)
    return fg

def create_splash_screen(w, h):
    """
    Creates a full screen splash image for all phone orientations.
    """
    splash = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(splash)

    # Deep maroon background
    c1 = (55, 2, 10, 255)
    c2 = (25, 0, 5, 255)
    for y in range(h):
        r = int(c1[0] + (c2[0] - c1[0]) * (y / h))
        g = int(c1[1] + (c2[1] - c1[1]) * (y / h))
        b = int(c1[2] + (c2[2] - c1[2]) * (y / h))
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Center logo badge
    min_dim = min(w, h)
    badge_size = int(min_dim * 0.42)
    bx = (w - badge_size) // 2
    by = (h - badge_size) // 2

    # Circular badge
    draw.ellipse(
        [(bx, by), (bx + badge_size, by + badge_size)],
        fill=(255, 255, 255, 255),
        outline=(245, 180, 20, 255),
        width=max(4, int(min_dim * 0.015))
    )

    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_inner = int(badge_size * 0.86)
    logo_resized = logo.resize((logo_inner, logo_inner), Image.Resampling.LANCZOS)

    px = (w - logo_inner) // 2
    py = (h - logo_inner) // 2
    splash.paste(logo_resized, (px, py), logo_resized)
    return splash

def main():
    print("Generating master icons...")
    master_square = create_master_icon(1024, is_round=False)
    master_round = create_master_icon(1024, is_round=True)
    master_fg = create_foreground_icon(432)

    # Mipmap densities
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }

    for folder, (icon_sz, fg_sz) in densities.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)

        # 1. ic_launcher.png
        sq = master_square.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        sq.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")

        # 2. ic_launcher_round.png
        rd = master_round.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        rd.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

        # 3. ic_launcher_foreground.png
        fg = master_fg.resize((fg_sz, fg_sz), Image.Resampling.LANCZOS)
        fg.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

        print(f"Generated {folder}: {icon_sz}x{icon_sz} icons & {fg_sz}x{fg_sz} foreground")

    # Splash screens
    splash_sizes = {
        "drawable": (480, 800),
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280),
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
    }

    for folder, (w, h) in splash_sizes.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        sp = create_splash_screen(w, h)
        sp.save(os.path.join(folder_path, "splash.png"), "PNG")
        print(f"Generated {folder}/splash.png ({w}x{h})")

    # Update background xml to luxury maroon
    bg_xml = os.path.join(RES_DIR, "values", "ic_launcher_background.xml")
    with open(bg_xml, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#2b0007</color>\n</resources>\n')

    # Remove the capacitor robot vector from drawable-v24 so adaptive icons use the newly generated foreground PNGs
    v24_fg = os.path.join(RES_DIR, "drawable-v24", "ic_launcher_foreground.xml")
    if os.path.exists(v24_fg):
        os.remove(v24_fg)
        print("Removed legacy drawable-v24/ic_launcher_foreground.xml")

    print("ALL ANDROID ICONS & SPLASH ASSETS UPDATED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
