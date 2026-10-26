# Page Brief: shader.se

## 1. Overview & Architecture
`shader.se` is an interactive 3D website built for a creative development studio based in Sweden.
- **Framework:** Next.js 16 (Turbopack, React 19)
- **3D Graphics & Canvas:** React Three Fiber v10 (alpha), Three.js (r186) with TSL (Three Shading Language / Node System) & WebGLRenderer.
- **Scroll Engine:** Lenis smooth scroll coupled to `#scroll-container` (fixed full-screen container).
- **UI & Accessibility:** Screen-reader overlay (`#a11y-overlay` with `.a11y-hidden` and `.a11y-skip-to-content`) mirrored by `@pmndrs/uikit` MSDF glyph rendering inside the 3D WebGL canvas.
- **Post-Processing Pipeline:** Fullscreen orthographic pass with CRT barrel lens distortion (`pw` / `Aj`), rounded CRT screen mask (`pQ` / `Az`), chromatic aberration (`px`), scanlines/vignette (`pS` / `AV`), bloom, and animated boot screen (`pR`).

## 2. Routes
1. `/` (Home):
   - Sections: `hero` (length 1), `projects` (length 1), `office` (length 1.8), `about-us` (length 7.34), `golden-tie-reveal` (length 1.7), `golden-tie` (length 6), `contact` (length 3.32). Total scroll length: ~21,580px (at 1440x900).
2. `/accessibility-statement` (Accessibility Statement):
   - Independent route with warm beige paper aesthetic (`#f3eee4`), desk rolodex header texture (`/textures/accessibility_statement.webp`), and WCAG 2.1 AA statement copy.
3. `/work/[slug]` (11 Case Study Projects):
   - `ehealth-arena`, `select-concept`, `gamily`, `alamance-foods`, `son`, `glasbolaget`, `spp-dream-generator`, `ica-nissen`, `norrkopings-hamn`, `heip`, `design-is-funny`.

## 3. Typography & Fonts
- **Primary Serif:** `STIX Two Text` (weights: 400 regular, 500 medium, 700 bold).
  - Web font files:
    - Latin: `public/sites/shader-se/_next/static/media/62c2ceb5e93c1826-s.p.0-v~mv8_r_vtm.woff2`
    - Extended Latin: `public/sites/shader-se/_next/static/media/1995f8c0ebebeccd-s.0x.kiioj.z-iv.woff2`
    - Cyrillic / Greek: `b1d5dad78a0d12b5-s.0wmksmakkl.p5.woff2`, `17381594d15ffe51-s.0sg3._y~9a-_p.woff2`, `f8ed89659f8cd9f4-s.02m7r2d_khdna.woff2`, `ea20f3f596d3a0b3-s.0jk93xy1yzrso.woff2`
  - MSDF Glyph Atlases (for WebGL text):
    - `public/sites/shader-se/fonts/stix_regular.json` + `stix_regular.webp`
    - `public/sites/shader-se/fonts/stix_medium.json` + `stix_medium.webp`
    - `public/sites/shader-se/fonts/stix_bold.json` + `stix_bold.webp`
- **Fallback:** `Times New Roman` (ascent-override: 72.67%, descent-override: 22.7%, line-gap-override: 23.84%, size-adjust: 104.86%).
- **System Monospace / Sans:** ui-sans-serif, system-ui, ui-monospace.

## 4. Color Palette
- **Hero Dark Atmosphere:** `#050508` to `#0d0f14` near-black with blue glow and smoke.
- **CRT Monitor Screen:** Phosphor glow `#fffae0` (screen on computer), Retro blue boot `#1e2078` with `#f7e8a4` amber text.
- **About Us & Paper Shell:** `#f3eee4` (warm aged paper), text `#1b1b1b`, lines `#222222` with 0.15 alpha.
- **Bank & Closed Deals:** Dark metallic gunmetal `#1a1c20`, gold accent `#e5b84c`.
- **Accent & Badges:** Blue `#3b82f6`, white `#ffffff`, dark muted `#444444`.

## 5. Assets Map
### 3D GLB Models (`public/sites/shader-se/models/`)
- `computer.glb` (77 KB) - Commodore SuperPET retro computer & monitor
- `deskbox.glb` (149 KB) - Office cubicle desks, monitors, chairs
- `shredder.glb` (21 KB) - Office paper shredder
- `phones.glb` (114 KB) - Brick cellphones & landlines
- `tie.glb` (12 KB) - Golden necktie
- `bank.glb` (191 KB) - Bank vault deposit boxes

### Images & Textures (`public/sites/shader-se/textures/`)
- CRT & Boot: `boot_screen.png`, `boot_screen_mobile.png`, `computer.webp`, `computer_narrow.webp`, `jake_computer.webp`
- Noise & Lighting: `smoke.webp`, `dirt.jpg`, `grunge.webp`, `rgba_noise.png`
- Characters & Team: `jacob_presenting.webp`, `simon_presenting.webp`, `simon_calling.webp`, `filip_footer_5.webp`
- Surfaces: `accessibility_statement.webp`, `bank_metal.webp`, `bank_scratches.webp`, `bank_wall.webp`
- Logos & Certs: `customers_logo_cloud.webp`, `footer_certificate.png`, `copyright_footer.png`
- Borders & Icons: `dashed_border_horizontal_dark.png`, `dashed_border_vertical_dark.png`, `dashed_frame.svg`, `scissors.png`, `icons/arrow_right_white.svg`, `icons/close_icon.svg`, `icons/external_link.svg`, `icons/menu.svg`, `icons/menu_dark.svg`, `icons/old_phone.svg`, `icons/pointing_hand_light.svg`, `icons/spinner.png`
- Vector Logos: `_next/static/media/logo.0ctv.ko5~mr~7.svg`, `logo_dark.0a~p9g3zi7_h6.svg`

## 6. Motion & Easing Curves
- **Lenis Smooth Scroll:** duration 0.8s, lock true, easing `bezier(0.48, 0.09, 0.22, 1)`.
- **Section Transitions:** duration 1.25s, lens distortion tweening from `sectionTransition` 0 to 1 and back.
- **Subpage Transition:**
  - Project subpage: spring `{ damping: 20, stiffness: 85 }`
  - Accessibility statement: tween `{ duration: 1.3 }`
  - Not found: spring `{ damping: 20, stiffness: 80 }`
- **Initial Boot Transition:** spring `{ damping: 8, stiffness: 30, delay: 0.5s }`
