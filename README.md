# Quadtree Planet

A procedurally generated planet rendered in the browser, with a very high level of detail up close.

The surface is a cube-sphere: six faces, each a quadtree that subdivides adaptively based on the camera distance, so detail appears only where you look. Terrain height comes from procedural noise, and the whole LOD engine runs in a web worker to keep the frame smooth while geometry streams in.

Built with TypeScript, three.js and Vite.

![Planet](https://github.com/user-attachments/assets/c5e94537-b2b7-421a-9033-c91e82cae4e7)
