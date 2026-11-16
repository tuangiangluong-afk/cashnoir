#!/usr/bin/env python3
"""
Batch portrait generator using local ComfyUI + Qwen-Image-2.1 Turbo.
Generates bespoke noir portraits into public/assets/portraits/cast/<id>.png.
"""
import os
import re
import sys

COMFY_DIR = "/Users/marc/ComfyUI"
sys.path.insert(0, COMFY_DIR)
import generate_qwen_image as qwen  # noqa: E402

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAST_TS = os.path.join(PROJECT_DIR, "src", "data", "cast.ts")
OUT_DIR = os.path.join(PROJECT_DIR, "public", "assets", "portraits", "cast")
os.makedirs(OUT_DIR, exist_ok=True)


def parse_raw_cast():
    with open(CAST_TS, "r", encoding="utf-8") as f:
        src = f.read()
    entries = []
    # Match tuples in RAW_CAST: ['c001', 'First', 'Last', 'f', 36, 'job', ..., 'portraitVisual']
    pattern = re.compile(
        r"\['(c\d{3})',\s*'([^']+)',\s*'([^']+)',\s*'([mf])',\s*(\d+),\s*'([^']+)'[\s\S]*?'([^']+)'\s*\],"
    )
    for m in pattern.finditer(src):
        entries.append({
            "id": m.group(1),
            "name": f"{m.group(2)} {m.group(3)}",
            "gender": m.group(4),
            "age": int(m.group(5)),
            "job": m.group(6),
            "visual": m.group(7),
        })
    return entries


def main():
    limit = int(os.environ.get("LIMIT", "20"))
    entries = parse_raw_cast()
    print(f"Found {len(entries)} hand-crafted cast specs. Target limit={limit}.")

    if not qwen.ensure_server():
        print("ComfyUI failed to start.", file=sys.stderr)
        sys.exit(1)

    generated = 0
    for e in entries:
        if generated >= limit:
            break
        out_path = os.path.join(OUT_DIR, f"{e['id']}.png")
        if os.path.exists(out_path) and os.path.getsize(out_path) > 10_000:
            print(f"[SKIP] {e['id']} already exists.")
            continue

        prompt = (
            f"Dark neo-noir cinematic bust portrait painting, {e['visual']}, "
            "sitting across a dark wooden pawn shop counter at 3am, "
            "single warm amber tungsten desk lamp overhead lighting, deep pitch black background, "
            "gritty Rockstar Games GTA IV concept art style, realistic proportions, sharp face details, no text"
        )
        print(f"🎨 Generating {e['id']} ({e['name']}, {e['age']}yo)...")
        res = qwen.generate(
            prompt_text=prompt,
            output_path=out_path,
            width=768,
            height=896,
            is_rgba=False,
        )
        if res:
            generated += 1
            print(f"✅ [{generated}/{limit}] Saved {out_path}")

    print(f"Finished: {generated} portrait(s) generated.")


if __name__ == "__main__":
    main()
