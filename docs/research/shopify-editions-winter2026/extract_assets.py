import urllib.request
import re

req = urllib.request.Request("https://www.shopify.com/editions/winter2026", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

# Find all 3D assets, theatre files, ktx2, glb, images
found = set()
patterns = [
    r'(https://[^\s"\'\\]+?\.(?:ktx2|glb|theatre-project-state[^\s"\'\\]*?\.json|webp|png|jpg))',
    r'(https://cdn\.shopify\.com/[^\s"\'\\]+)',
    r'(https://editions-winter-2026\.myshopify\.com/[^\s"\'\\]+)'
]

for p in patterns:
    for m in re.finditer(p, html):
        u = m.group(1).rstrip('\\",;')
        if any(keyword in u for keyword in [
            "Scene", "theatre", "Hero", "Sidekick", "Agentic", "Online", 
            "Retail", "Marketing", "Checkout", "Operations", "ShopApp", 
            "B2B", "Finance", "Shipping", "Developer", "models", "ktx2"
        ]):
            found.add(u)

print(f"Total relevant assets found: {len(found)}")
for u in sorted(found):
    print(u)
