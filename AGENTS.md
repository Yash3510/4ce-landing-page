# 4CE Landing Page Guidelines

## Project Overview
Interactive 3D workstation landing page built with Next.js 16 (App Router, React 19, TypeScript strict), React Three Fiber, Three.js, and Tailwind CSS v4.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **3D & Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Motion:** Lenis Smooth Scroll
- **UI & Styling:** Tailwind CSS v4, shadcn/ui (`cn()` utility)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Responsive: mobile-first

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
