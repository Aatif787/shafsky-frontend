"""
Utility script to find 'wizard' occurrences in transcript.jsonl.
"""

import json

LOG_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript.jsonl"
)

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "wizard" in line.lower():
            print(f"Line {idx + 1} has 'wizard'")
            try:
                data = json.loads(line)
                print(f"  Type: {data.get('type')}, Source: {data.get('source')}")
            except (json.JSONDecodeError, KeyError, ValueError) as err:
                print("  JSON parse error:", err)
