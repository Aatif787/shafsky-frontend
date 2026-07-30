"""
Utility script to search for wizardstep in transcript_full.jsonl.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "wizardstep" in line.lower():
            try:
                data = json.loads(line)
                t_type = data.get("type")
                print(f"Line {idx + 1}: type={t_type}, source={data.get('source')}")
                tcs = data.get("tool_calls", [])
                for tc_idx, tc in enumerate(tcs):
                    args = tc.get("args", {})
                    target = args.get("TargetFile", "")
                    repl = args.get("ReplacementContent", "")
                    if repl:
                        print(
                            f"  Tool Call {tc_idx + 1}: edits {target}, "
                            f"replacement len={len(repl)}"
                        )
            except (json.JSONDecodeError, KeyError, ValueError):
                pass
