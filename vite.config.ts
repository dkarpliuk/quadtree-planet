import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

export default defineConfig({
  //ES workers so the landmass worker can use top-level await
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
    },
  },
});
