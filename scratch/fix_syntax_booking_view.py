with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Remove stray line 1745
    if i == 1744 and line.strip() == ")}":
        continue
    # Fix line 915
    if line.strip() == ") : (":
        new_lines.append("          ) : (\n")
        continue
    new_lines.append(line)

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Fixed syntax lines in BookingView.tsx")
