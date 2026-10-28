import base64
import hashlib
import json

def make_screenshot_payload(filepath):
    with open(filepath, "rb") as f:
        data = f.read()
    return {
        "bytes": len(data),
        "data_base64": base64.b64encode(data).decode("ascii"),
        "media_type": "image/png",
        "sha256": hashlib.sha256(data).hexdigest()
    }

if __name__ == "__main__":
    before = make_screenshot_payload("docs/design-references/shopify-editions-winter2026/desktop-top.png")
    after = make_screenshot_payload("docs/design-references/shopify-editions-winter2026/local-editions-route.png")
    payload = {
        "before": before,
        "after": after,
        "channel_threshold": 16
    }
    with open("docs/research/shopify-editions-winter2026/comparison_payload.json", "w") as out:
        json.dump(payload, out)
    print("Generated comparison payload. Before bytes:", before["bytes"], "After bytes:", after["bytes"])
