#!/usr/bin/env python3
"""
Batch image generator for Empire & Pantheon using local ComfyUI + Qwen-Image-2.1 Turbo.
Generates dark-noir concept art for:
- Empire: Arsenal (uvLamp, armoredDoor, gpsJammer), City Assets (lookout, nightbar, warehouse), Districts (docks, finance, politics)
- Pantheon: Syndicates (cercle, cartel, moretti, horlogers, voleurs)
"""
import os
import sys
import subprocess

COMFY_DIR = "/Users/marc/ComfyUI"
sys.path.insert(0, COMFY_DIR)
import generate_qwen_image as qwen  # noqa: E402

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMPIRE_DIR = os.path.join(PROJECT_DIR, "public", "assets", "empire")
PANTHEON_DIR = os.path.join(PROJECT_DIR, "public", "assets", "pantheon")

os.makedirs(EMPIRE_DIR, exist_ok=True)
os.makedirs(PANTHEON_DIR, exist_ok=True)

PROMPTS = {
    # Empire Arsenal
    ("empire", "uvLamp"): (
        "Single noir game prop illustration of tactical forensic ultraviolet blacklight torch lamp on a dark desk, "
        "dramatic violet neon beam glow, cinematic lighting, Rockstar concept art style, dark noir background, isolated object"
    ),
    ("empire", "armoredDoor"): (
        "Heavy reinforced bank vault steel blast door with circular chrome locking wheel and heavy bolts, "
        "dark cinematic vault lighting, industrial noir concept art style, isolated composition"
    ),
    ("empire", "gpsJammer"): (
        "Military tactical RF signal and GPS jammer device, matte black metal chassis with three upright rubber antennas "
        "and glowing amber status LEDs, dark tabletop, noir lighting, isolated concept art"
    ),
    # Empire City Assets
    ("empire", "lookout"): (
        "Atmospheric cinematic noir shot of a mysterious trenchcoat-clad street scout lookout in a dark rainy alleyway "
        "under an amber street lamp, dramatic film noir shadows, concept art"
    ),
    ("empire", "nightbar"): (
        "Vintage neon sign of a hidden subterranean speakeasy bar glowing amber and crimson in a dark rainy brick alley, "
        "cinematic film noir concept art"
    ),
    ("empire", "warehouse"): (
        "Large dark industrial shipping warehouse and cargo hangar on harbor docks at night, wooden crates, maritime fog, "
        "cold moonlight reflections, noir concept art"
    ),
    # Empire Districts
    ("empire", "docks"): (
        "Gritty harbor docks with looming shipping cranes and rusty shipping containers in heavy rain, "
        "dark ocean water, cinematic noir establishing shot"
    ),
    ("empire", "finance"): (
        "Towering monolithic Art Deco corporate skyscrapers illuminated against dark rainy night sky, "
        "financial district, film noir architecture concept art"
    ),
    ("empire", "politics"): (
        "Imposing neoclassical marble government embassy building at night with dramatic columns "
        "and dark tinted diplomatic limousines parked outside, noir lighting"
    ),
    # Pantheon 5 Syndicates
    ("pantheon", "cercle"): (
        "Cinematic noir close-up of an underground casino crime lord, ivory poker chips and vintage cards on green baize, "
        "smoking cigar smoke, warm vintage lamp lighting, chiaroscuro"
    ),
    ("pantheon", "cartel"): (
        "Cinematic portrait of a rugged harbor cartel boss in dark pea coat standing before rusty shipyard docks, "
        "heavy anchor chain, gritty maritime noir aesthetic"
    ),
    ("pantheon", "moretti"): (
        "Classic Italian mafia godfather Don Moretti in dark pinstripe suit, black rose in lapel, "
        "antique stiletto knife on mahogany desk, dramatic chiaroscuro lighting"
    ),
    ("pantheon", "horlogers"): (
        "Master craftsman of the Guild of Watchmakers, elderly distinguished man examining a golden exposed tourbillon "
        "pocket watch with jeweler loupe, dark brass workshop"
    ),
    ("pantheon", "voleurs"): (
        "Stealthy master thief of the Shadow Guild, sleek black velvet hood and mask, "
        "holding slender chrome lockpicks, dark atmospheric shadows, cinematic noir"
    ),
}

def convert_to_webp(png_path, webp_path):
    try:
        subprocess.run(["cwebp", "-q", "85", png_path, "-o", webp_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"  ✓ Converted to {os.path.basename(webp_path)}")
    except Exception as e:
        print(f"  ⚠️ cwebp conversion failed: {e}")

def main():
    if not qwen.ensure_server():
        print("ComfyUI not available.", file=sys.stderr)
        sys.exit(1)
        
    total = len(PROMPTS)
    for idx, ((category, name), prompt) in enumerate(PROMPTS.items(), 1):
        target_dir = EMPIRE_DIR if category == "empire" else PANTHEON_DIR
        out_png = os.path.join(target_dir, f"{name}.png")
        out_webp = os.path.join(target_dir, f"{name}.webp")
        
        if os.path.exists(out_webp) and os.path.getsize(out_webp) > 5000:
            print(f"[{idx}/{total}] [SKIP] {category}/{name}.webp already exists.")
            continue
            
        print(f"[{idx}/{total}] 🎨 Generating {category}/{name}...")
        try:
            qwen.generate(prompt_text=prompt, output_path=out_png, width=768, height=768, is_rgba=False)
            if os.path.exists(out_png) and os.path.getsize(out_png) > 1000:
                convert_to_webp(out_png, out_webp)
        except Exception as e:
            print(f"❌ Error generating {category}/{name}: {e}")

    print("🎉 All Empire and Pantheon images generated successfully!")

if __name__ == "__main__":
    main()
