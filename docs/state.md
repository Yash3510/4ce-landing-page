# State

_Last updated 2026-10-28 (branch `wp/native-landing`)._

## Home page
- `/` is a native Next.js page: `src/app/page.tsx` → `src/components/native/Landing.tsx`.
- Rendering is plain three.js (no React Three Fiber): `src/lib/native/engine.ts` (renderer, Lenis scroll, scene switching), `stages.ts` (hero, work reel, office, tie, contact), `crt.ts` (CRT post pass).
- Each `<section data-stage>` drives one scene; its scroll progress moves that scene's camera.
- Falls back to readable HTML when WebGL is unavailable; honours `prefers-reduced-motion`.

## Still mirrored (not native)
- `/work/[slug]`, `/accessibility-statement`, `/astrodither`, `/editions/winter2026` still serve copied static HTML.

## Assets and rights
- Models, textures, thumbnails and project data come from `public/sites/shader-se` and `src/lib/shader-se/projects.ts`.
- `docs/permissions/shader-se.md` does not show a grant from shader.se; treat this build as local experimentation only (unverified rights).

## Placeholders
- About intro copy, contact email and phone are marked `[Placeholder: …]` in `Landing.tsx`.
