# 3D Floor Plan Editor (Next.js + TypeScript)

A modern, client-side floor plan editor that pairs a 2D HTML5 canvas drawing experience with a live 3D view powered by React Three Fiber. Draw walls with snapping, place doors and windows with normalized offsets, overlay trace images, and use undo/redo and JSON import/export to manage your designs.

## Features
- **2D Canvas Editor** with 0.5 m snapping grid, single canvas pointer handling, and trace-image overlay.
- **Wall authoring** with editable thickness and height plus opening placement (doors/windows) along wall length.
- **3D Visualization** using BoxGeometry walls (2.5 m default height), ground plane, ambient/directional light, and OrbitControls.
- **History controls** with undo/redo backed by serialized state snapshots.
- **JSON import/export** for portable floor plan data.

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 to use the editor. Draw walls by clicking start/end points; select walls to adjust properties and add openings.

## Tech stack
- Next.js (App Router), TypeScript, Tailwind CSS
- React Three Fiber, Drei, Three.js
- Lucide React for icons, Inter font

## Project structure
- `app/` — App Router pages and global styles
- `components/editor/` — 2D canvas editor
- `components/three/` — 3D viewport components
- `lib/` — state + history utilities
- `types/` — shared floor plan types

## Notes
- This is a client-side only experience; all editing and rendering happen in the browser.
- Import/export uses clean JSON for walls, openings, and trace image metadata.
