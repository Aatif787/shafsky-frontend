"""
Utility script to debug search matches in log files.
"""

P_FULL = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript_full.jsonl"
)
P_SIMPLE = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs\transcript.jsonl"
)

for name, path in [("full", P_FULL), ("simple", P_SIMPLE)]:
    print(f"=== Searching in {name} ===")
    count = 0
    with open(path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if "wizard" in line.lower():
                count += 1
                if count <= 5:
                    snippet = line[:150].replace("\n", " ")
                    print(f"Match {count} on line {idx + 1}: {snippet}...")
    print(f"Total matches in {name}: {count}")
