// Production entrypoint: refuse to boot with an unsafe configuration, then hand over to the Nitro server.
// Runs only at process start, never during `vite build` / prerender, so the Docker build needs no secrets.
// Keep these rules in sync with src/server/runtime.ts (tests/start.test.ts checks both).
const env = process.env
const problems = []
if (env.NODE_ENV === 'production') {
  if (!env.COOKIE_SECRET) problems.push('COOKIE_SECRET is required in production')
  if (!env.CLIENT_IP_HEADER && env.ALLOW_SHARED_RATE_LIMIT !== '1') {
    problems.push('CLIENT_IP_HEADER is required in production unless ALLOW_SHARED_RATE_LIMIT=1')
  }
}
if (problems.length) {
  console.error(`Refusing to start:\n - ${problems.join('\n - ')}`)
  process.exit(1)
}
if (process.argv.includes('--check')) process.exit(0) // validate only (used by tests); never starts the server
await import('../.output/server/index.mjs')
