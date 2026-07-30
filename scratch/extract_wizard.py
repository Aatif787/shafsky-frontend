"""
Utility script to extract step 1 wizard code from transcript log.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)

found = False
with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "wizard-step1" in line:
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    args = tc.get("Arguments", {})
                    content = args.get("ReplacementContent")
                    if content and "wizard-step1" in content:
                        print(f"Found replacement content on line {idx + 1}!")
                        with open("scratch/wizard_code.tsx", "w", encoding="utf-8") as out:
                            out.write(content)
                        print("Wrote content to scratch/wizard_code.tsx")
                        found = True
                        break
            except (json.JSONDecodeError, KeyError, ValueError):
                pass
        if found:
            break

if not found:
    print("Could not find any match in transcript_full.jsonl")
