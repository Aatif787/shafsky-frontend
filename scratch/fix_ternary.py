with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace line 915 ") : (" with ") : (\n            <>"
content = content.replace("          ) : (", "          ) : (\n            <>")

# Replace line 1742 closing motion.div with "</>\n          )}"
target = """            </div>
          )}
        </motion.div>"""

replacement = """            </div>
          )}
            </>
          )}
        </motion.div>"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced closing ternary successfully.")
else:
    print("Target not found for closing ternary.")

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated BookingView.tsx ternary JSX syntax.")
