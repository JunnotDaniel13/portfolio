import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'

const cachedChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const config = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    viewport: { width: 1280, height: 800 },
    launchOptions: cachedChromium ? { executablePath: cachedChromium } : undefined,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: false, // a reused server carries rate-limiter state between runs; fail loudly if the port is busy
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})

if (!cachedChromium && !existsSync('/home/jeren/.cache/ms-playwright')) {
  console.warn('Playwright browser cache was not found; install Chromium with npx playwright install chromium.')
}

export default config
