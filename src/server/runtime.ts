export type RuntimeEnv = Record<string, string | undefined>

export function assertRuntimeConfig(env: RuntimeEnv = process.env) {
  if (env.NODE_ENV !== 'production') return
  if (!env.COOKIE_SECRET) throw new Error('COOKIE_SECRET is required in production')
  if (!env.CLIENT_IP_HEADER && env.ALLOW_SHARED_RATE_LIMIT !== '1') {
    throw new Error('CLIENT_IP_HEADER is required in production unless ALLOW_SHARED_RATE_LIMIT=1')
  }
}

let checked = false
export function assertRuntimeConfigOnce() {
  if (checked) return
  assertRuntimeConfig()
  checked = true
}

export function resetRuntimeConfigCheckForTests() {
  checked = false
}
