"""
Utility script to extract tool call arguments from log step 390.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx + 1 == 390:
            try:
                data = json.loads(line)
                print("Keys in 390:", list(data.keys()))
                tcs = data.get("tool_calls", [])
                print("Tool calls count:", len(tcs))
                if tcs:
                    tc = tcs[0]
                    args = tc.get("args", {})
                    print("args keys:", list(args.keys()))
                    for k, v in args.items():
                        if isinstance(v, str) and len(v) > 2000:
                            print(f"Key: {k}, length: {len(v)}")
                            with open("scratch/wizard_code_390.tsx", "w", encoding="utf-8") as out:
                                out.write(v)
                            print("Saved to scratch/wizard_code_390.tsx")
            except (json.JSONDecodeError, KeyError, ValueError) as err:
                print("JSON parsing error:", err)
            break
