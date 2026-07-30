"""
Utility script to view specific line details in transcript_full.jsonl.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx + 1 == 436:
            data = json.loads(line)
            tcs = data.get("tool_calls", [])
            if tcs:
                tc = tcs[0]
                args = tc.get("args", {})
                print("arg keys:", list(args.keys()))
                for k, v in args.items():
                    print(f"Key: {k}, Type: {type(v)}")
                    if isinstance(v, str) and len(v) > 1000:
                        snippet = v[:100].replace("\n", " ")
                        print(f"  Length: {len(v)}, Snippet: {snippet}...")
                        with open("scratch/wizard_code.tsx", "w", encoding="utf-8") as out:
                            out.write(v)
                        print("Saved to scratch/wizard_code.tsx")
            break
