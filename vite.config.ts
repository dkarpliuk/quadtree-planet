import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const resolvePath = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolvePath('./src/core'),
      '@enums': resolvePath('./src/enums'),
      '@helpers': resolvePath('./src/helpers'),
      '@noise': resolvePath('./src/noise'),
    },
  },
});
