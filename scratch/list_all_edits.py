"""
Utility script to list all BookingView.tsx edits in transcript.jsonl.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript.jsonl"
)

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "BookingView.tsx" in line:
            try:
                data = json.loads(line)
                t_type = data.get("type")
                if t_type in ("CODE_ACTION", "PLANNER_RESPONSE"):
                    content = data.get("content", "")
                    snippet = content[:150].replace("\n", " ")
                    print(
                        f"Line {idx + 1}: type={t_type}, "
                        f"len={len(content)}, snippet={snippet}..."
                    )
            except (json.JSONDecodeError, KeyError, ValueError):
                pass
