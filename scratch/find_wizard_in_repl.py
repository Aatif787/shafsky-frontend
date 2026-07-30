"""
Utility script to search for wizardStep in replacement content.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "replace_file_content" in line or "multi_replace_file_content" in line:
            try:
                data = json.loads(line)
                tcs = data.get("tool_calls", [])
                for tc_idx, tc in enumerate(tcs):
                    args = tc.get("args", {})
                    repl = args.get("ReplacementContent", "")
                    if "wizardStep" in repl or "setWizardStep" in repl:
                        filename = f"scratch/wizard_repl_{idx + 1}.tsx"
                        print(f"Line {idx + 1}: Found in repl! Len={len(repl)}")
                        with open(filename, "w", encoding="utf-8") as out:
                            out.write(repl)
                        print(f"  Saved to {filename}")
            except (json.JSONDecodeError, KeyError, ValueError):
                pass

print("Search complete.")
