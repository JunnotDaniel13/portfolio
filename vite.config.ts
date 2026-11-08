import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart(),
    nitro({
      // Static files are served by Nitro before the Start middleware runs, so their headers are set here.
      // /assets/* are content-hashed (Nitro already marks them immutable). /images/* keep stable filenames but are
      // always requested with `?v=<content hash>` (src/lib/images.ts, written by scripts/optimize-images.mjs), so a
      // changed image gets a new URL and a long immutable cache is safe.
      routeRules: {
        '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
      },
    }),
    viteReact(),
  ],
})
