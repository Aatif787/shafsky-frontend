"""
Utility script to find tool call edits to BookingView.tsx.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "replace_file_content" in line and "BookingView.tsx" in line:
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc_idx, tc in enumerate(tool_calls):
                    args = tc.get("Arguments", {})
                    target = args.get("TargetFile", "")
                    if "BookingView.tsx" in target:
                        repl = args.get("ReplacementContent", "")
                        target_content = args.get("TargetContent", "")[:60]
                        print(
                            f"Line {idx + 1}: edit to BookingView.tsx, "
                            f"replacement len={len(repl)}, targetContent={target_content}..."
                        )
            except (json.JSONDecodeError, KeyError, ValueError) as err:
                print(f"Line {idx + 1} failed to parse JSON: {err}")
