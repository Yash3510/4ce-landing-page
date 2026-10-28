# AstroDither — Page Brief & Architecture

## Overview
- **Source URL:** https://astrodither.robertborghesi.is/
- **Local Routes:** `/` (root route) and `/astrodither`
- **Owner / Creator:** Robert Borghesi LAB (`@dghez_`)
- **Category:** Audio-reactive 3D WebGPU & TSL (Three.js Shading Language) dithering and fluid simulation experiment

## Layout & Typography
- **Background:** `#080808`
- **Typography:** `Azeret Mono`, monospace (`--font-main: "Azeret Mono", monospace`)
- **Grid Layout:**
  - Desktop: 12-column grid (`main-grid`)
  - Mobile: 6-column grid
  - Padding: `2rem` mobile / `4rem` desktop
- **Header:**
  - Left: Robert Borghesi logo (`/images/logo.svg`) + `| LEARN MORE` toggle button
  - Right: `ASTRO DITHER` (cycles through onomatopoeic words on audio kick beat: `BOOM`, `TACK`, `TICK`, `CLAP`, `SNAP`, `THUMP`, `POP`, `CLICK`, `TAP`, `BANG`, etc.)
- **Bottom Bar:**
  - Left: Running session timer (`00:00:000`)
  - Right: Speed multiplier control (`CLICK FOR SPEED | 1:00x`), cycles through `[1, 2, 4, 10, 20]`
- **Enter Prompt:**
  - Initial state: Centered interactive prompt `[:: CLICK TO ENTER + ENABLE AUDIO ::]` following mouse
  - Transition on click: Slides down and fades out, kicks off audio fade-in and WebGL camera/scene opening transition
- **Info Sidebar:**
  - Triggered by `LEARN MORE`
  - Uses CSS radial gradient mask animation (`--size` animated with GSAP timeline from 0 to 100%)
  - Slows down 3D animation during reading

## Asset Inventory
- **3D Models:**
  - `/gl/models/hand.glb` (Draco-compressed robotic hand model)
  - `/gl/models/dust.glb` (Particle mesh geometry)
- **Textures:**
  - `/gl/images/turbolence-2.jpg` (Fluid turbulence map)
  - `/gl/images/icons.png` (Icon atlas texture)
  - `/gl/images/slow-hint.png` (Interaction hint texture)
- **Audio:**
  - `/audio/loop.mp3` (Ambient audio loop driving Howler WebAudio analyser and beat detection)
- **Loaders:**
  - `/three-static/draco/` (draco_decoder.wasm, draco_decoder.js, draco_wasm_wrapper.js)
  - `/three-static/basis/` (basis_transcoder.wasm, basis_transcoder.js)
- **Graphics & Branding:**
  - `/images/logo.svg`
  - `/favicon.svg`, `/favicon.ico`, `/favicon-96x96.png`, `/apple-touch-icon.png`
