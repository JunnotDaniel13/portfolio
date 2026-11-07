import { createHash } from 'node:crypto'
import { themeScript } from '~/theme'

const themeHash = createHash('sha256').update(themeScript).digest('base64')

export function applySecurityHeaders(request: Request, response: Response) {
  const headers = response.headers
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('Content-Security-Policy', "frame-ancestors 'none'; base-uri 'none'; object-src 'none'; form-action 'self'")
  headers.set('Content-Security-Policy-Report-Only', `default-src 'self'; script-src 'self' 'sha256-${themeHash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'; form-action 'self'`)

  const url = new URL(request.url)
  // Static files (/assets, /images, /fonts) are served by Nitro before this middleware runs; their cache headers
  // are configured in vite.config.ts (routeRules). Only dynamic HTML responses are handled here.
  if (url.searchParams.has('sent') || url.searchParams.has('error')) {
    headers.set('Cache-Control', 'no-store')
    headers.delete('ETag')
  } else if (url.pathname === '/' || url.pathname === '/fr' || url.pathname === '/fr/') {
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
    headers.delete('ETag')
  }
  return response
}
