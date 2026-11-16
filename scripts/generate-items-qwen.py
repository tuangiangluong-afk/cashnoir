#!/usr/bin/env python3
"""
Batch item prop generator using local ComfyUI + Qwen-Image-2.1 Turbo.
Generates matching dark-noir tabletop item PNGs in public/assets/items/<kind>.png.
"""
import os
import sys

COMFY_DIR = "/Users/marc/ComfyUI"
sys.path.insert(0, COMFY_DIR)
import generate_qwen_image as qwen  # noqa: E402

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(PROJECT_DIR, "public", "assets", "items")
os.makedirs(OUT_DIR, exist_ok=True)

ITEMS = {
    "usb": "heavy titanium encrypted USB flash drive with scratched serial number",
    "diamond": "large uncut raw blue diamond crystal resting on dark velvet",
    "katana": "antique Japanese samurai katana sword half-drawn from black lacquered scabbard",
    "faberge": "ornate ruby-red enamel and carved 24k gold imperial Faberge egg",
    "violin": "antique amber-varnished Stradivarius cello violin body resting diagonally",
    "icon": "aged medieval Byzantine gold-leaf religious painting on cracked dark wood panel",
    "chalice": "hammered medieval silver chalice goblet set with deep red cabochon rubies",
    "mask": "polished black obsidian Aztec ritual funerary mask inlaid with turquoise",
    "drone": "compact matte black folding tactical stealth micro-drone with infrared lens",
    "ring": "heavy 18k gold heraldic signet ring with worn family crest",
    "dossier": "blood-red classified manila folder tied with black elastic and stamped CONFIDENTIAL",
    "kevlar": "discreet black tactical Kevlar bulletproof vest folded neatly",
    "plate": "bent green diplomatic metal license plate CMD with gold trim and torn bolts",
}


def main():
    if not qwen.ensure_server():
        print("ComfyUI not available.", file=sys.stderr)
        sys.exit(1)
    for kind, desc in ITEMS.items():
        out_path = os.path.join(OUT_DIR, f"{kind}.png")
        if os.path.exists(out_path) and os.path.getsize(out_path) > 10_000:
            print(f"[SKIP] {kind}.png exists.")
            continue
        prompt = (
            f"Single noir game prop illustration of {desc}, centered on a pitch black #000000 background, "
            "dramatic warm amber desk lamp top-left lighting, realistic painted Rockstar concept art style, "
            "clean silhouette, isolated object, no hands, no text"
        )
        print(f"🎨 Generating item {kind}.png...")
        qwen.generate(prompt_text=prompt, output_path=out_path, width=768, height=768, is_rgba=False)


if __name__ == "__main__":
    main()
