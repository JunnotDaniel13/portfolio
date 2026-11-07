import { describe, expect, it } from 'vitest'
import { clearFlashCookie, createFlashCookie, flashCookieName, readFlashCookie, type ContactFlash } from '~/server/flash'

const flash: ContactFlash = {
  values: { name: 'Alex', email: 'alex@example.com', message: 'A complete message' },
  errors: { email: 'email' },
  locale: 'fr',
}

describe('signed flash cookie', () => {
  it('round-trips valid payloads and rejects tampering', () => {
    const env = { NODE_ENV: 'development', COOKIE_SECRET: 'test-secret' }
    const cookie = createFlashCookie(flash, env)
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).not.toContain('Secure')
    expect(readFlashCookie(cookie.split(';')[0], env)).toMatchObject(flash)
    expect(readFlashCookie(cookie.split(';')[0], env)?.iat).toEqual(expect.any(Number))
    expect(readFlashCookie(`${cookie.split(';')[0]}tampered`, env)).toBeNull()
    expect(clearFlashCookie(env)).toContain('Max-Age=0')
  })

  it('uses the __Host- prefix and Secure in production', () => {
    const env = { NODE_ENV: 'production', COOKIE_SECRET: 'test-secret' }
    expect(flashCookieName(env)).toBe('__Host-flash')
    expect(createFlashCookie(flash, env)).toContain('Secure')
  })
})
