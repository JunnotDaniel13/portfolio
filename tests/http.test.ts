import { describe, expect, it } from 'vitest'
import { applySecurityHeaders } from '~/server/http'

function responseFor(url: string) {
  const response = new Response('ok', { headers: { ETag: 'temporary' } })
  return applySecurityHeaders(new Request(url), response)
}

describe('HTTP security and caching', () => {
  it('ships the decided enforced and report-only policies', () => {
    const response = responseFor('http://localhost:3000/')
    expect(response.headers.get('content-security-policy')).toBe("frame-ancestors 'none'; base-uri 'none'; object-src 'none'; form-action 'self'")
    expect(response.headers.get('content-security-policy-report-only')).toContain("script-src 'self' 'sha256-")
    expect(response.headers.get('content-security-policy-report-only')).not.toContain('report-uri')
    expect(response.headers.get('x-frame-options')).toBe('DENY')
    expect(response.headers.get('cache-control')).toBe('public, max-age=0, must-revalidate')
    expect(response.headers.has('etag')).toBe(false)
  })

  it('uses no-store for contact outcomes (static-file caching is configured in vite.config.ts routeRules)', () => {
    expect(responseFor('http://localhost:3000/fr?error=1').headers.get('cache-control')).toBe('no-store')
  })
})
