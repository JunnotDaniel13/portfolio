import type { RuntimeEnv } from './runtime'

const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 5
const MAX_KEYS = 10_000

type Bucket = { count: number; expiresAt: number }
const buckets = new Map<string, Bucket>()

export function checkRateLimit(key: string, now = Date.now()) {
  for (const [storedKey, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(storedKey)
  }
  if (buckets.size >= MAX_KEYS && !buckets.has(key)) {
    const oldest = buckets.keys().next().value as string | undefined
    if (oldest) buckets.delete(oldest)
  }

  const current = buckets.get(key)
  if (!current || current.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + WINDOW_MS })
    return true
  }
  if (current.count >= LIMIT) return false
  current.count += 1
  return true
}

export function clearRateLimitsForTests() {
  buckets.clear()
}

export function clientIp(request: Request, env: RuntimeEnv = process.env) {
  const header = env.CLIENT_IP_HEADER?.trim().toLowerCase()
  if (header) return request.headers.get(header)?.trim() || 'unknown'
  if (env.NODE_ENV !== 'production') return 'local'
  return 'shared'
}

export function originAllowed(request: Request, env: RuntimeEnv = process.env) {
  const origin = request.headers.get('origin')
  if (!origin || origin === 'null') {
    return request.headers.get('sec-fetch-site') === 'same-origin'
  }

  const allowed = new Set<string>()
  if (env.SITE_URL) allowed.add(normalizeOrigin(env.SITE_URL))
  for (const value of env.ALLOWED_ORIGINS?.split(',') ?? []) {
    if (value.trim()) allowed.add(normalizeOrigin(value))
  }
  if (env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000')
    allowed.add('http://127.0.0.1:3000')
    allowed.add('http://localhost:3001')
    allowed.add('http://127.0.0.1:3001')
  }

  try {
    return allowed.has(normalizeOrigin(origin))
  } catch {
    return false
  }
}

function normalizeOrigin(value: string) {
  const url = new URL(value.trim())
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Unsupported origin')
  return url.origin
}
