"""
Utility script to check conversation log file sizes.
"""

import os

FULL_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)
LIGHT_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript.jsonl"
)

full_size = os.path.getsize(FULL_PATH) if os.path.exists(FULL_PATH) else "does not exist"
light_size = os.path.getsize(LIGHT_PATH) if os.path.exists(LIGHT_PATH) else "does not exist"

print("transcript_full.jsonl size:", full_size)
print("transcript.jsonl size:", light_size)
