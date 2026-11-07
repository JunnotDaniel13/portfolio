import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { contactErrorCodes, contactSchema, type ContactValues } from '~/server/contact-schema'
import { emailTemplate, escapeHtml, sendContactMessage, type ContactTransport } from '~/server/contact.server'
import { checkRateLimit, clearRateLimitsForTests, clientIp, originAllowed } from '~/server/request-security'
import { assertRuntimeConfig, resetRuntimeConfigCheckForTests } from '~/server/runtime'

const values: ContactValues = { name: 'Alex Martin', email: 'alex@example.com', message: 'Hello, this is a valid message.', locale: 'en', website: '' }
const oldEnv = { ...process.env }

function request(headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/contact-submit', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', ...headers },
  })
}

const successfulTransport: ContactTransport = {
  sendEmail: vi.fn(async () => {}),
  sendTelegram: vi.fn(async () => {}),
}

beforeEach(() => {
  clearRateLimitsForTests()
  resetRuntimeConfigCheckForTests()
  process.env.NODE_ENV = 'test'
})

afterEach(() => {
  process.env = { ...oldEnv }
  vi.restoreAllMocks()
})

describe('contact schema and template', () => {
  it('accepts valid input and returns field error codes', () => {
    expect(contactSchema.safeParse(values).success).toBe(true)
    expect(contactErrorCodes({ ...values, email: 'broken', message: 'Hi' })).toEqual({ email: 'email', message: 'short' })
    expect(contactErrorCodes({ ...values, message: 'x'.repeat(501) })).toEqual({ message: 'long' })
  })

  it('escapes every HTML-significant character in the email template', () => {
    expect(escapeHtml('<script>"&\'')).toBe('&lt;script&gt;&quot;&amp;&#39;')
    expect(emailTemplate({ ...values, name: '<img src=x>', message: '<script>alert(1)</script>' })).not.toContain('<script>')
  })
})

describe('request security', () => {
  it('enforces the origin allow-list and same-origin fallback', () => {
    expect(originAllowed(request())).toBe(true)
    expect(originAllowed(request({ origin: 'https://attacker.example' }))).toBe(false)
    expect(originAllowed(request({ origin: 'null' }))).toBe(false)
    expect(originAllowed(new Request('http://localhost:3000', { headers: { 'sec-fetch-site': 'same-origin' } }))).toBe(true)
    expect(originAllowed(new Request('http://localhost:3000'))).toBe(false)
    expect(originAllowed(request({ origin: 'https://portfolio.example' }), { SITE_URL: 'https://portfolio.example/base' })).toBe(true)
  })

  it('honours only the configured client-IP header and caps attempts', () => {
    process.env.CLIENT_IP_HEADER = 'x-real-ip'
    const first = request({ 'x-real-ip': '192.0.2.1', 'x-forwarded-for': '192.0.2.99' })
    expect(clientIp(first)).toBe('192.0.2.1')
    for (let attempt = 0; attempt < 5; attempt += 1) expect(checkRateLimit(clientIp(request({ 'x-real-ip': '192.0.2.1', 'x-forwarded-for': `192.0.2.${attempt + 10}` })))).toBe(true)
    expect(checkRateLimit('192.0.2.1')).toBe(false)
    expect(checkRateLimit('192.0.2.2')).toBe(true)
  })

  it('refuses unsafe production configuration at the server hook', () => {
    expect(() => assertRuntimeConfig({ NODE_ENV: 'production' })).toThrow('COOKIE_SECRET')
    expect(() => assertRuntimeConfig({ NODE_ENV: 'production', COOKIE_SECRET: 'secret' })).toThrow('CLIENT_IP_HEADER')
    expect(() => assertRuntimeConfig({ NODE_ENV: 'production', COOKIE_SECRET: 'secret', ALLOW_SHARED_RATE_LIMIT: '1' })).not.toThrow()
  })
})

describe('contact delivery', () => {
  it('delivers through the shared transport abstraction', async () => {
    const result = await sendContactMessage(values, request(), successfulTransport)
    expect(result).toEqual({ ok: true })
    expect(successfulTransport.sendEmail).toHaveBeenCalledWith(values)
    expect(successfulTransport.sendTelegram).toHaveBeenCalledWith(values)
  })

  it('succeeds when at least one channel works and never delivers a honeypot hit', async () => {
    const partial: ContactTransport = { sendEmail: vi.fn(async () => {}), sendTelegram: vi.fn(async () => { throw new Error('down') }) }
    expect((await sendContactMessage(values, request(), partial)).ok).toBe(true)
    expect((await sendContactMessage({ ...values, website: 'spam' }, request(), partial)).ok).toBe(true)
    expect(partial.sendEmail).toHaveBeenCalledTimes(1)
  })

  it('returns validation, rate-limit and origin failures without leaking details', async () => {
    expect(await sendContactMessage({ ...values, email: 'bad' }, request(), successfulTransport)).toMatchObject({ ok: false, reason: 'validation' })
    expect(await sendContactMessage(values, request({ origin: 'https://attacker.example' }), successfulTransport)).toEqual({ ok: false, reason: 'origin' })
    process.env.CLIENT_IP_HEADER = 'x-real-ip'
    for (let attempt = 0; attempt < 5; attempt += 1) await sendContactMessage(values, request({ 'x-real-ip': '192.0.2.8' }), successfulTransport)
    expect(await sendContactMessage(values, request({ 'x-real-ip': '192.0.2.8' }), successfulTransport)).toEqual({ ok: false, reason: 'rate' })
  })
})
