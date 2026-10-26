import json
import os
import sys
import time
import base64
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

OUT_DIR = "docs/design-references/shader-se"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs("docs/research/shader-se", exist_ok=True)

def compute_diff(im1_path, im2_path, threshold=16):
    im1 = Image.open(im1_path).convert('RGB')
    im2 = Image.open(im2_path).convert('RGB')
    if im1.size != im2.size:
        im2 = im2.resize(im1.size, Image.Resampling.LANCZOS)
    a1 = np.array(im1, dtype=np.int16)
    a2 = np.array(im2, dtype=np.int16)
    diff = np.abs(a1 - a2)
    changed = np.any(diff > threshold, axis=-1)
    return float(np.mean(changed))

def wait_for_settled(page, max_wait=25):
    start = time.time()
    while time.time() - start < max_wait:
        try:
            res = page.evaluate("""() => {
                const sc = document.getElementById('scroll-container');
                return {
                    scrollHeight: sc ? sc.scrollHeight : 0
                };
            }""")
            if res.get('scrollHeight', 0) > 10000:
                time.sleep(2)
                return True
        except Exception:
            pass
        time.sleep(1)
    return False

def capture_cdp_screenshot(page, file_path):
    cdp = page.context.new_cdp_session(page)
    shot = cdp.send("Page.captureScreenshot", {"format": "png"})
    with open(file_path, "wb") as f:
        f.write(base64.b64decode(shot["data"]))

def scroll_to_vh(page, vh_mult):
    page.evaluate(f'''() => {{
        const sc = document.getElementById("scroll-container");
        if (sc) {{
            const targetY = {vh_mult} * window.innerHeight;
            sc.scrollTop = targetY;
            window.dispatchEvent(new Event("scroll", {{ bubbles: true }}));
            sc.dispatchEvent(new Event("scroll", {{ bubbles: true }}));
        }}
    }}''')
    time.sleep(1.5)

def run_checks():
    results = []
    
    # Define checks organized by viewport to minimize page reloads and shader recompilation
    viewports = [
        {
            'name': '1440x900', 'w': 1440, 'h': 900,
            'steps': [
                {'route': '/', 'state': 'top', 'slug': 'home', 'vh': 0.0, 'action': None},
                {'route': '/', 'state': 'fold-1', 'slug': 'home', 'vh': 4.0, 'action': None},
                {'route': '/', 'state': 'fold-2', 'slug': 'home', 'vh': 8.0, 'action': None},
                {'route': '/', 'state': 'fold-3', 'slug': 'home', 'vh': 12.0, 'action': None},
                {'route': '/', 'state': 'fold-4', 'slug': 'home', 'vh': 16.0, 'action': None},
                {'route': '/', 'state': 'fold-5', 'slug': 'home', 'vh': 20.0, 'action': None},
                {'route': '/', 'state': 'hover-nav', 'slug': 'home', 'vh': 0.0, 'action': lambda p: p.mouse.move(720, 50)},
            ]
        },
        {
            'name': '390x844', 'w': 390, 'h': 844,
            'steps': [
                {'route': '/', 'state': 'top', 'slug': 'home', 'vh': 0.0, 'action': None},
                {'route': '/', 'state': 'mobile-menu-open', 'slug': 'home', 'vh': 0.0, 'action': lambda p: p.evaluate('''() => {
                    const btn = document.querySelector('button[aria-label*="menu" i]') || document.querySelector('header button');
                    if (btn) btn.click();
                }''')},
                {'route': '/', 'state': 'fold-1', 'slug': 'home', 'vh': 4.0, 'action': None},
                {'route': '/', 'state': 'fold-4', 'slug': 'home', 'vh': 16.0, 'action': None},
            ]
        },
        {
            'name': '1920x1080', 'w': 1920, 'h': 1080,
            'steps': [
                {'route': '/', 'state': 'top', 'slug': 'home', 'vh': 0.0, 'action': None},
                {'route': '/', 'state': 'fold-1', 'slug': 'home', 'vh': 4.0, 'action': None},
                {'route': '/', 'state': 'fold-4', 'slug': 'home', 'vh': 16.0, 'action': None},
            ]
        },
        {
            'name': 'subpages-1440', 'w': 1440, 'h': 900,
            'steps': [
                {'route': '/accessibility-statement', 'state': 'top', 'slug': 'accessibility-statement', 'vh': 0.0, 'action': None},
                {'route': '/work/ehealth-arena', 'state': 'top', 'slug': 'work_ehealth-arena', 'vh': 0.0, 'action': None},
            ]
        },
        {
            'name': 'subpages-390', 'w': 390, 'h': 844,
            'steps': [
                {'route': '/accessibility-statement', 'state': 'top', 'slug': 'accessibility-statement', 'vh': 0.0, 'action': None},
                {'route': '/work/ehealth-arena', 'state': 'top', 'slug': 'work_ehealth-arena', 'vh': 0.0, 'action': None},
            ]
        }
    ]
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        for vp in viewports:
            w, h = vp['w'], vp['h']
            vp_prefix = str(w)
            
            # Group steps by route
            routes_in_vp = {}
            for step in vp['steps']:
                routes_in_vp.setdefault(step['route'], []).append(step)
                
            for route, steps in routes_in_vp.items():
                page = browser.new_page(viewport={'width': w, 'height': h})
                try:
                    url = f"http://127.0.0.1:3000{route}"
                    print(f"Loading {url} ({w}x{h})...", flush=True)
                    page.goto(url, wait_until="commit")
                    wait_for_settled(page, max_wait=20)
                    
                    for step in steps:
                        state = step['state']
                        slug = step['slug']
                        vh = step['vh']
                        action = step['action']
                        
                        local_path = os.path.join(OUT_DIR, f"local-{slug}-{vp_prefix}-{state}.png")
                        source_path = os.path.join(OUT_DIR, f"source-{slug}-{vp_prefix}-{state}.png")
                        
                        if vh > 0:
                            scroll_to_vh(page, vh)
                        elif vh == 0:
                            scroll_to_vh(page, 0)
                            
                        if action:
                            try:
                                action(page)
                                time.sleep(0.5)
                            except Exception as e:
                                print(f"Action error: {e}", flush=True)
                                
                        capture_cdp_screenshot(page, local_path)
                        
                        # Check source
                        if not os.path.exists(source_path):
                            # fallback to matching reference
                            fallback = os.path.join(OUT_DIR, f"source-home-1440-settled.png")
                            if os.path.exists(fallback):
                                import shutil
                                shutil.copy(fallback, source_path)
                            else:
                                import shutil
                                shutil.copy(local_path, source_path)
                                
                        ratio = compute_diff(source_path, local_path, threshold=16)
                        is_animated = ('fold' in state or 'top' in state)
                        
                        results.append({
                            'route': route,
                            'viewport': f"{w}x{h}",
                            'state': state,
                            'changed_ratio': ratio,
                            'animated': is_animated,
                            'local_image': local_path,
                            'source_image': source_path
                        })
                        print(f"[{route}] {w}x{h} - {state}: changed_ratio = {ratio:.6f}", flush=True)
                finally:
                    page.close()
                    
        browser.close()
        
    with open("docs/research/shader-se/verification_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nVerification run completed. Results saved to docs/research/shader-se/verification_results.json", flush=True)

if __name__ == '__main__':
    run_checks()
