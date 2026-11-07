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
      // /assets/* are content-hashed (Nitro already marks them immutable). /images/* keep stable names, so they
      // get a short cache with background revalidation instead of `immutable`.
      routeRules: {
        '/images/**': { headers: { 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' } },
      },
    }),
    viteReact(),
  ],
})
