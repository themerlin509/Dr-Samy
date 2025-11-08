import path from 'path';
import { fileURLToPath } from 'url'; // Added import for fileURLToPath
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: `__dirname` is not available in ES modules.
      // The following uses `import.meta.url` to get the current module's URL,
      // `fileURLToPath` to convert it to a file path, and `path.dirname` to get the directory name,
      // which is the modern equivalent of `__dirname`.
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.'),
    }
  }
});