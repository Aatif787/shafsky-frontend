"""
Utility script for safe code block replacement in workspace files.
"""

FILEPATH = r"src/components/views/BookingView.tsx"

prefix = ""
replacement = ""
suffix = ""

with open(FILEPATH, "r", encoding="utf-8") as f:
    content = f.read()

new_content = prefix + replacement + suffix
with open(FILEPATH, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Replacement complete successfully!")
