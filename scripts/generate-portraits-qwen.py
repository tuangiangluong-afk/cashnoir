#!/usr/bin/env python3
"""
Batch portrait generator using local ComfyUI + Qwen-Image-2.1 Turbo.
Generates bespoke noir portraits for all 100 unique characters into public/assets/portraits/cast/<id>.png and .webp.
"""
import json
import os
import subprocess
import sys
import time

COMFY_DIR = "/Users/marc/ComfyUI"
sys.path.insert(0, COMFY_DIR)
import generate_qwen_image as qwen  # noqa: E402

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULTS_JSON = os.path.join(PROJECT_DIR, "server", "data", "ecosystem", "defaults.json")
OUT_DIR = os.path.join(PROJECT_DIR, "public", "assets", "portraits", "cast")
os.makedirs(OUT_DIR, exist_ok=True)


def load_characters():
    with open(DEFAULTS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("characters", [])


def convert_to_webp(png_path, webp_path):
    try:
        subprocess.run(["cwebp", "-q", "85", png_path, "-o", webp_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception as e:
        print(f"⚠️ WebP conversion failed for {png_path}: {e}")
        return False


def main():
    characters = load_characters()
    print(f"Loaded {len(characters)} characters from defaults.json.")

    if not qwen.ensure_server():
        print("❌ ComfyUI failed to start.", file=sys.stderr)
        sys.exit(1)

    missing = []
    for c in characters:
        cid = c["id"]
        webp_path = os.path.join(OUT_DIR, f"{cid}.webp")
        if not (os.path.exists(webp_path) and os.path.getsize(webp_path) > 5_000):
            missing.append(c)

    print(f"Total characters: {len(characters)}. Missing portraits: {len(missing)}.")
    if not missing:
        print("✅ All 100 character portraits exist! Nothing to generate.")
        return

    limit = int(os.environ.get("LIMIT", str(len(missing))))
    print(f"Starting batch generation (up to {limit} portraits)...")

    generated = 0
    start_time = time.time()
    for c in missing[:limit]:
        cid = c["id"]
        png_path = os.path.join(OUT_DIR, f"{cid}.png")
        webp_path = os.path.join(OUT_DIR, f"{cid}.webp")

        prompt = (
            f"Dark neo-noir cinematic bust portrait painting, {c['portraitVisual']}, "
            "sitting across a dark wooden pawn shop counter at 3am, "
            "single warm amber tungsten desk lamp overhead lighting, deep pitch black background, "
            "gritty Rockstar Games GTA IV concept art style, realistic proportions, sharp face details, no text"
        )
        print(f"🎨 [{generated+1}/{min(len(missing), limit)}] Generating {cid} ({c['fullName']}, {c['age']}yo, {c['job']})...")
        t0 = time.time()
        res = qwen.generate(
            prompt_text=prompt,
            output_path=png_path,
            width=768,
            height=896,
            is_rgba=False,
        )
        if res and os.path.exists(png_path) and os.path.getsize(png_path) > 10_000:
            convert_to_webp(png_path, webp_path)
            dt = time.time() - t0
            generated += 1
            webp_size = os.path.getsize(webp_path) if os.path.exists(webp_path) else 0
            print(f"✅ [{generated}/{min(len(missing), limit)}] {cid} saved in {dt:.1f}s ({webp_size//1024} KB WebP).")
        else:
            print(f"❌ Failed to generate {cid}.")

    total_time = time.time() - start_time
    print(f"\n🎉 Finished: {generated} portrait(s) generated in {total_time/60:.1f} minutes.")


if __name__ == "__main__":
    main()
