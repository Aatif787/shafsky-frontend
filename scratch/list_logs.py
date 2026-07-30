"""
Utility script to list log files in system generated logs directory.
"""

import os

DIR_PATH = (
    r"C:\Users\aariz\.gemini\antigravity-ide\brain"
    r"\65860740-bbf0-4fc8-9a5d-45152250bb8f\.system_generated\logs"
)

if os.path.exists(DIR_PATH):
    print("Files in logs dir:", os.listdir(DIR_PATH))
else:
    print("Directory does not exist")
