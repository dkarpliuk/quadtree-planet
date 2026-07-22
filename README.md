# Quadtree Planet

A procedurally generated planet rendered in the browser, with a very high level of detail up close.

The surface is a cube-sphere: six faces, each a quadtree that subdivides adaptively based on the camera distance, so detail appears only where you look. Terrain height comes from procedural noise, and the whole LOD engine runs in a web worker to keep the frame smooth while geometry streams in.

Built with TypeScript, three.js and Vite.

![Planet](https://github.com/user-attachments/assets/c5e94537-b2b7-421a-9033-c91e82cae4e7)

## Structure

- `src/engine/` — the pure LOD core (runs in a worker): quadtree, sector math, cube-sphere transforms
- `src/layers/` — main-thread three.js adapters that turn engine geometry into meshes
- `src/planet.ts` — orchestrates the layers and paces updates
- `src/index.ts` — dev entry point (scene, camera, render loop)

