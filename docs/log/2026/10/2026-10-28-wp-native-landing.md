# 2026-10-28 · wp/native-landing

## What changed
Replaced the root route that streamed `public/sites/shader-se/index.html` with a native page: boot screen, header, scroll sections, five three.js scenes and a CRT post-processing pass.

## Why
The home page only served a copied static bundle; it now runs from source in this repo.

## Files
- `src/app/page.tsx` (new), `src/app/route.ts` (removed), `src/app/layout.tsx`, `src/app/globals.css`
- `src/components/native/Landing.tsx`
- `src/lib/native/engine.ts`, `src/lib/native/stages.ts`, `src/lib/native/crt.ts`

## How it was verified
- `npm run check` → lint clean, TypeScript clean, build succeeded (`/` prerendered static).
- Dev server in headless Chromium at 1440×900 and 390×844: boot screen, hero, work reel, office, About, tie and contact each render; no console errors; no horizontal overflow at 390px.

## Decisions
- Plain three.js instead of React Three Fiber: `three` and `lenis` were already dependencies, so no new packages.
- Scene switching uses a CRT collapse transition rather than cross-rendering two scenes.

## Docs updated
- `docs/state.md` (created).

## Known limits
- Other routes are still mirrored (no issue filed; local experiment).
- Rights to the shader.se assets are unverified; do not deploy.
- Placeholder copy for About intro and contact details.
