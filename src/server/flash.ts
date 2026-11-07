import { createHmac, timingSafeEqual } from 'node:crypto'
import type { ContactErrors, ContactValues } from './contact-schema'
import type { Locale } from '~/i18n/config'

export type ContactFlash = {
  values: Pick<ContactValues, 'name' | 'email' | 'message'>
  errors: ContactErrors
  locale: Locale
  /** Issued-at (ms). The cookie is single-use and short-lived; reads reject anything older than FLASH_MAX_AGE_MS. */
  iat?: number
}

const FLASH_MAX_AGE_MS = 2 * 60 * 1000

function secret(env: Record<string, string | undefined>) {
  return env.COOKIE_SECRET || (env.NODE_ENV === 'production' ? '' : 'development-only-flash-secret')
}

export function flashCookieName(env: Record<string, string | undefined> = process.env) {
  return env.NODE_ENV === 'production' ? '__Host-flash' : 'flash'
}

export function createFlashCookie(flash: ContactFlash, env: Record<string, string | undefined> = process.env) {
  const payload = Buffer.from(JSON.stringify({ ...flash, iat: Date.now() })).toString('base64url')
  const signature = sign(payload, secret(env))
  const secure = env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${flashCookieName(env)}=${payload}.${signature}; HttpOnly; SameSite=Lax; Path=/; Max-Age=60${secure}`
}

export function clearFlashCookie(env: Record<string, string | undefined> = process.env) {
  const secure = env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${flashCookieName(env)}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
}

export function readFlashCookie(cookieHeader: string | undefined, env: Record<string, string | undefined> = process.env): ContactFlash | null {
  if (!cookieHeader) return null
  const name = flashCookieName(env)
  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  if (!entry) return null
  const [payload, signature, extra] = entry.slice(name.length + 1).split('.')
  if (!payload || !signature || extra) return null

  const expected = sign(payload, secret(env))
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as ContactFlash
    if ((parsed.locale !== 'en' && parsed.locale !== 'fr') || typeof parsed.values?.name !== 'string' || typeof parsed.values?.email !== 'string' || typeof parsed.values?.message !== 'string') return null
    if (typeof parsed.iat !== 'number' || Date.now() - parsed.iat > FLASH_MAX_AGE_MS || parsed.iat > Date.now() + 5_000) return null
    return parsed
  } catch {
    return null
  }
}

function sign(payload: string, key: string) {
  return createHmac('sha256', key).update(payload).digest('base64url')
}
