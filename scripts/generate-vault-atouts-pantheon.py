#!/usr/bin/env python3
"""
Batch image generator for Vault, Atouts (Jokers) & Pantheon using local ComfyUI + Qwen-Image-2.1 Turbo.
Generates dark-noir concept art for:
- Vault: vault-room, double-fond
- Jokers (15 atouts): blanchisseur, oeil-lynx, sang-froid, intimidation, assurance, vautour, a-l-aveugle, vitrine-armee, blanchisseur-express, radar, negociateur, reseau, fantome, collectionneur, double-fond
- Pantheon: codex-secrets, codex-crown, codex-art, codex-weapons, season-pass
"""
import os
import sys
import subprocess

COMFY_DIR = "/Users/marc/ComfyUI"
sys.path.insert(0, COMFY_DIR)
import generate_qwen_image as qwen  # noqa: E402

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAULT_DIR = os.path.join(PROJECT_DIR, "public", "assets", "vault")
JOKERS_DIR = os.path.join(PROJECT_DIR, "public", "assets", "jokers")
PANTHEON_DIR = os.path.join(PROJECT_DIR, "public", "assets", "pantheon")

os.makedirs(VAULT_DIR, exist_ok=True)
os.makedirs(JOKERS_DIR, exist_ok=True)
os.makedirs(PANTHEON_DIR, exist_ok=True)

PROMPTS = {
    # Vault (Coffre)
    ("vault", "vault-room"): (
        "Cinematic dark underground reinforced steel bank vault room, heavy round vault blast door ajar with golden interior lighting, "
        "safety deposit box walls, stacks of vintage bills on metal table, dramatic noir shadows, concept art"
    ),
    ("vault", "double-fond"): (
        "Secret false bottom compartment sliding open inside an antique dark walnut drawer, revealing hidden gold bullion, "
        "passport, and cipher documents, warm desk lamp keylight, film noir detail"
    ),

    # 15 Atouts (Jokers)
    ("jokers", "blanchisseur"): (
        "Piles of freshly pressed bank notes under a vintage heavy flat iron, Swiss bank deposit slips, dark mahogany desk, "
        "subtle amber spotlight, cinematic noir concept art"
    ),
    ("jokers", "oeil-lynx"): (
        "Dramatic close-up of a sharp predator golden eye piercing through dense smoky noir shadows, extreme focus, "
        "cinematic high-contrast chiaroscuro concept art"
    ),
    ("jokers", "sang-froid"): (
        "Calm steady hands holding a lit cigarette over a steel interrogation counter, ice cubes in glass of scotch, "
        "cigarette smoke curling in blue spotlight, cold stoic noir mood"
    ),
    ("jokers", "intimidation"): (
        "Imposing silhouette of a syndicate mob boss wearing fedora and wool overcoat, cigar smoke rising, backlit by street lamp, "
        "oppressive menacing noir atmosphere"
    ),
    ("jokers", "assurance"): (
        "Tarnished gold police detective badge half-tucked into a thick stack of hundred dollar bills on a scarred wooden table, "
        "corrupt noir concept art"
    ),
    ("jokers", "vautour"): (
        "Silhouette of a vulture perched atop a rusted iron street sign under cold pouring rain and foggy amber lamppost, "
        "dark gritty cinematic noir"
    ),
    ("jokers", "a-l-aveugle"): (
        "Blindfolded man in dark tailored suit feeling the engraved edges of a rare gold coin with sensitive fingertips, "
        "dramatic chiaroscuro lighting, cinematic noir"
    ),
    ("jokers", "vitrine-armee"): (
        "Heavy dark oak armory display case with glass doors, showing vintage revolvers and sawed-off shotguns mounted on velvet, "
        "dim atmospheric spotlight"
    ),
    ("jokers", "blanchisseur-express"): (
        "Steam rising from industrial vintage dry cleaning presses in a dark basement, stacks of wrapped currency behind clothes racks, "
        "gritty urban noir"
    ),
    ("jokers", "radar"): (
        "Vintage green phosphor circular CRT radar oscilloscope display glowing in the dark, clandestine blips on sweeping grid line, "
        "retro tech noir"
    ),
    ("jokers", "negociateur"): (
        "Firm handshake between two gloved hands across a worn counter under low hanging green banker lamp, leather satchel open with cash, "
        "secret deal noir"
    ),
    ("jokers", "reseau"): (
        "Detailed cork bulletin board covered with surveillance photos, coded ledger notes, and crisscrossing red string connections, "
        "detective conspiracy noir"
    ),
    ("jokers", "fantome"): (
        "Ghostly shadowy figure in long trenchcoat melting into thick night fog in a cobblestone alley, faint silhouette under wet reflections, "
        "atmospheric noir"
    ),
    ("jokers", "collectionneur"): (
        "Distinguished gentleman with brass jeweler loupe holding an unmounted flawless diamond up to a single tungsten spotlight, "
        "appraiser noir study"
    ),
    ("jokers", "double-fond"): (
        "Cutaway diagram view of a secret concealed velvet-lined hidden drawer compartment in antique furniture, "
        "holding diamonds and rolled secret treaties, noir illustration"
    ),

    # Panthéon (Collections & Pass)
    ("pantheon", "codex-secrets"): (
        "Manila folder stamped CONFIDENTIAL and REDACTED, microfilm rolls, brass cipher wheel on dark wooden desk, "
        "Cold War spy noir concept art"
    ),
    ("pantheon", "codex-crown"): (
        "Magnificent diamond and sapphire imperial crown resting on crimson velvet cushion in antique brass museum glass vitrine, "
        "regal treasure noir lighting"
    ),
    ("pantheon", "codex-art"): (
        "Magnificent Renaissance oil painting in ornate gilded Baroque frame being carefully inspected with a magnifying glass, "
        "art heist noir workshop"
    ),
    ("pantheon", "codex-weapons"): (
        "Pair of antique matched flintlock dueling pistols with engraved silver barrels nestled in fitted mahogany presentation case, "
        "heirloom weaponry noir"
    ),
    ("pantheon", "codex-cyber"): (
        "Encrypted black titanium cold-wallet hardware keys, severed fiber-optic cables, green terminal circuit board glowing in dark rain, "
        "cyber crime syndicate noir concept art"
    ),
    ("pantheon", "codex-relics"): (
        "Ancient tarnished gold reliquary chalice and wax-sealed Latin parchment scroll resting on dark stone altar under single amber shaft of light, "
        "sacred smuggling noir concept art"
    ),
    ("pantheon", "season-pass"): (
        "Black leather clandestine syndicate passport stamped with golden emblem, stack of boarding passes and confidential dossier, "
        "rainy night background, cinematic noir"
    ),
}

def convert_to_webp(src_png, dst_webp):
    try:
        subprocess.run(["cwebp", "-q", "82", src_png, "-o", dst_webp], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception:
        try:
            from PIL import Image
            im = Image.open(src_png)
            im.save(dst_webp, "WEBP", quality=82)
            return True
        except Exception as e:
            print(f"  ❌ WebP conversion failed: {e}")
            return False

def main():
    if not qwen.ensure_server():
        print("ComfyUI not available.", file=sys.stderr)
        sys.exit(1)

    total = len(PROMPTS)
    print(f"🚀 Starting batch generation of {total} images (Vault, Atouts, Pantheon)...")

    for i, ((folder, key), prompt) in enumerate(PROMPTS.items(), 1):
        target_dir = VAULT_DIR if folder == "vault" else JOKERS_DIR if folder == "jokers" else PANTHEON_DIR
        out_png = os.path.join(target_dir, f"{key}.png")
        out_webp = os.path.join(target_dir, f"{key}.webp")

        if os.path.exists(out_webp) and os.path.getsize(out_webp) > 5000:
            print(f"[{i}/{total}] [SKIP] {folder}/{key}.webp already exists.")
            continue

        print(f"[{i}/{total}] 🎨 Generating {folder}/{key}...")
        try:
            qwen.generate(
                prompt_text=prompt,
                output_path=out_png,
                width=768,
                height=768,
                is_rgba=False,
            )
            if os.path.exists(out_png) and os.path.getsize(out_png) > 1000:
                if convert_to_webp(out_png, out_webp):
                    print(f"  ✓ Converted to {key}.webp ({os.path.getsize(out_webp) // 1024} KB)")
        except Exception as e:
            print(f"  ❌ Error generating {folder}/{key}: {e}")

    print("🎉 All Vault, Atouts, and Pantheon images generated successfully!")

if __name__ == "__main__":
    main()
