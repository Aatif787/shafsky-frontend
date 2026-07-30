"""
Utility script to extract wizard steps from transcript logs.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)

found_count = 0
with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "wizard-step" in line:
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc_idx, tc in enumerate(tool_calls):
                    args = tc.get("Arguments", {})
                    content = args.get("ReplacementContent")
                    if content and "wizard-step" in content:
                        found_count += 1
                        filename = f"scratch/wizard_code_{found_count}.tsx"
                        with open(filename, "w", encoding="utf-8") as out:
                            out.write(content)
                        print(
                            f"Match {found_count}: Found in line {idx + 1}, "
                            f"tool call {tc_idx + 1}. Saved to {filename}"
                        )
            except (json.JSONDecodeError, KeyError, ValueError):
                pass

print(f"Scan complete. Found {found_count} matches.")
