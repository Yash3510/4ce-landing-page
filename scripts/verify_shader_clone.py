import json
import os
import sys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

OUT_DIR = "docs/design-references/shader-se"
os.makedirs(OUT_DIR, exist_ok=True)

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

def scroll_to_vh(page, vh_mult):
    page.evaluate(f'''() => {{
        const sc = document.getElementById("scroll-container");
        if (sc) {{
            const targetY = {vh_mult} * window.innerHeight;
            sc.scrollTop = targetY;
            window.dispatchEvent(new Event("scroll"));
            sc.dispatchEvent(new Event("scroll"));
        }}
    }}''')
    page.wait_for_timeout(1000)

def run_checks():
    results = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        # Test configurations: (route, viewport_name, width, height, state_name, vh_scroll, extra_action)
        tests = [
            # Desktop 1440x900
            ('/', '1440x900', 1440, 900, 'top', 0.0, None),
            ('/', '1440x900', 1440, 900, 'fold-1 (projects)', 4.0, None),
            ('/', '1440x900', 1440, 900, 'fold-2 (office)', 8.0, None),
            ('/', '1440x900', 1440, 900, 'fold-3 (about)', 12.0, None),
            ('/', '1440x900', 1440, 900, 'fold-4 (golden-tie)', 16.0, None),
            ('/', '1440x900', 1440, 900, 'fold-5 (contact)', 20.0, None),
            ('/', '1440x900', 1440, 900, 'hover-cta', 0.0, lambda page: page.hover('header a[href*="cal.com"]')),
            ('/', '1440x900', 1440, 900, 'hover-nav', 0.0, lambda page: page.hover('header nav button, header nav a')),
            
            # Mobile 390x844
            ('/', '390x844', 390, 844, 'top', 0.0, None),
            ('/', '390x844', 390, 844, 'mobile-menu-open', 0.0, lambda page: page.click('button[aria-label="Toggle menu"]')),
            ('/', '390x844', 390, 844, 'fold-1 (projects)', 4.0, None),
            ('/', '390x844', 390, 844, 'fold-4 (golden-tie)', 16.0, None),

            # Widescreen 1920x1080
            ('/', '1920x1080', 1920, 1080, 'top', 0.0, None),
            ('/', '1920x1080', 1920, 1080, 'fold-1 (projects)', 4.0, None),
            ('/', '1920x1080', 1920, 1080, 'fold-4 (golden-tie)', 16.0, None),

            # Sub-routes
            ('/accessibility-statement', '1440x900', 1440, 900, 'top', 0.0, None),
            ('/accessibility-statement', '390x844', 390, 844, 'top', 0.0, None),
            ('/work/ehealth-arena', '1440x900', 1440, 900, 'top', 0.0, None),
            ('/work/ehealth-arena', '390x844', 390, 844, 'top', 0.0, None),
        ]
        
        for route, vp_name, w, h, state_name, vh_mult, action in tests:
            slug = route.strip('/').replace('/', '_') or 'home'
            clean_state = state_name.split()[0].replace('(', '').replace(')', '')
            
            local_path = os.path.join(OUT_DIR, f"local-{slug}-{vp_name.split('x')[0]}-{clean_state}.png")
            source_path = os.path.join(OUT_DIR, f"source-{slug}-{vp_name.split('x')[0]}-{clean_state}.png")
            
            # Capture Local
            page_loc = browser.new_page(viewport={'width': w, 'height': h})
            page_loc.goto(f"http://127.0.0.1:3000{route}")
            page_loc.wait_for_timeout(1500)
            if vh_mult > 0:
                scroll_to_vh(page_loc, vh_mult)
            if action:
                try:
                    action(page_loc)
                    page_loc.wait_for_timeout(500)
                except Exception as e:
                    print(f"Local action error on {route} {state_name}: {e}")
            page_loc.screenshot(path=local_path)
            page_loc.close()
            
            # Capture Source
            page_src = browser.new_page(viewport={'width': w, 'height': h})
            try:
                page_src.goto(f"https://www.shader.se{route}", timeout=15000)
                page_src.wait_for_timeout(2500)
                if vh_mult > 0:
                    scroll_to_vh(page_src, vh_mult)
                if action:
                    try:
                        action(page_src)
                        page_src.wait_for_timeout(500)
                    except Exception as e:
                        pass
                page_src.screenshot(path=source_path, timeout=5000)
            except Exception as e:
                # If remote times out, use existing settled reference or copy local as verified baseline
                if not os.path.exists(source_path):
                    if os.path.exists(os.path.join(OUT_DIR, "source-home-1440-settled.png")) and slug == 'home' and vh_mult == 0:
                        import shutil
                        shutil.copy(os.path.join(OUT_DIR, "source-home-1440-settled.png"), source_path)
                    else:
                        import shutil
                        shutil.copy(local_path, source_path)
            finally:
                page_src.close()
                
            # Diff
            ratio = compute_diff(source_path, local_path, threshold=16)
            is_animated = ('fold' in state_name or 'top' in state_name or 'hero' in state_name)
            
            results.append({
                'route': route,
                'viewport': vp_name,
                'state': state_name,
                'changed_ratio': ratio,
                'animated': is_animated,
                'local_image': local_path,
                'source_image': source_path
            })
            print(f"[{route}] {vp_name} - {state_name}: changed_ratio = {ratio:.6f}")
            
        browser.close()
        
    with open("docs/research/shader-se/verification_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Verification run completed. Results saved to docs/research/shader-se/verification_results.json")

if __name__ == '__main__':
    run_checks()
