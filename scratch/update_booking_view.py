with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace dark container background with light luxury cream
content = content.replace('className="min-h-screen bg-[#06090f] text-white py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto"', 'className="min-h-screen bg-[#FAF9F5] text-slate-900 py-8 sm:py-12 px-4 sm:px-8 max-w-5xl mx-auto"')
content = content.replace('className="p-6 sm:p-10 rounded-[36px] bg-[#0c131e] border border-white/10 shadow-2xl relative overflow-hidden"', 'className="p-6 sm:p-10 rounded-[36px] bg-white border border-slate-200 shadow-sm relative overflow-hidden text-slate-900"')

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\views\BookingView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated BookingView.tsx container backgrounds.")
