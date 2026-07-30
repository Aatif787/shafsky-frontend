"""
Utility script to extract tool call content from transcript log line 436.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx + 1 == 436:
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    args = tc.get("Arguments", {})
                    content = args.get("ReplacementContent")
                    if content:
                        print("Found content in line 436!")
                        with open("scratch/wizard_code.tsx", "w", encoding="utf-8") as out:
                            out.write(content)
                        print("Saved to scratch/wizard_code.tsx")
            except (json.JSONDecodeError, KeyError, ValueError) as err:
                print("Error parsing line 436:", err)
            break
