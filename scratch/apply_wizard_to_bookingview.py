"""
Utility script to update BookingView with wizard content.
"""

TARGET_FILE = r"src/components/views/BookingView.tsx"
WIZARD_FILE = r"scratch/wizard_repl_436.tsx"

with open(TARGET_FILE, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = 2447

if lines[start_idx].strip() != "return (" or "PageContainer" not in lines[start_idx + 1]:
    for idx in range(2400, len(lines)):
        if lines[idx].strip() == "return (" and "PageContainer" in lines[idx + 1]:
            start_idx = idx
            break

end_idx = -1
for idx in range(start_idx, len(lines)):
    if lines[idx].strip() == "function FlightInput({":
        for search_idx in range(idx - 1, start_idx, -1):
            if lines[search_idx].strip() == ");":
                end_idx = search_idx
                break
        break

if end_idx != -1:
    with open(WIZARD_FILE, "r", encoding="utf-8") as w:
        wizard_content = w.read()

    new_lines = lines[:start_idx] + [wizard_content + "\n"] + lines[end_idx + 1:]

    with open(TARGET_FILE, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Successfully replaced main return statement in BookingView.tsx!")
