import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { assertRuntimeConfig } from '../src/server/runtime'

function boot(env: Record<string, string>) {
  // PATH only: the guard must decide from the environment it is given. The server import never runs when it refuses.
  return spawnSync(process.execPath, ['scripts/start.mjs', '--check'], { env: { PATH: process.env.PATH ?? '', ...env }, encoding: 'utf8', timeout: 4000 })
}

describe('production boot guard (scripts/start.mjs)', () => {
  it('refuses without COOKIE_SECRET', () => {
    const result = boot({ NODE_ENV: 'production', CLIENT_IP_HEADER: 'x-real-ip' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('COOKIE_SECRET')
  })
  it('refuses without CLIENT_IP_HEADER unless the shared-limit opt-out is set', () => {
    const result = boot({ NODE_ENV: 'production', COOKIE_SECRET: 'x' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('CLIENT_IP_HEADER')
  })
  it('agrees with the in-app rules in src/server/runtime.ts', () => {
    const cases: Record<string, string>[] = [
      { NODE_ENV: 'production' },
      { NODE_ENV: 'production', COOKIE_SECRET: 'x' },
      { NODE_ENV: 'production', COOKIE_SECRET: 'x', CLIENT_IP_HEADER: 'x-real-ip' },
      { NODE_ENV: 'production', COOKIE_SECRET: 'x', ALLOW_SHARED_RATE_LIMIT: '1' },
    ]
    for (const env of cases) {
      let appRefuses = false
      try { assertRuntimeConfig(env) } catch { appRefuses = true }
      const result = boot(env)
      // --check exits 0 for a passing config without starting the server.
      const scriptRefuses = result.status === 1 && result.stderr.includes('Refusing to start')
      expect(scriptRefuses, JSON.stringify(env)).toBe(appRefuses)
    }
  })
})
