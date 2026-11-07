import { describe, expect, it, vi } from 'vitest'
import { readBodyLimited } from '../src/server/body'
import { createFlashCookie, readFlashCookie, flashCookieName, type ContactFlash } from '../src/server/flash'
import { sendContactMessage } from '../src/server/contact.server'
import { clearRateLimitsForTests } from '../src/server/request-security'

const env = { NODE_ENV: 'test', COOKIE_SECRET: 'test-secret' }

function chunked(parts: string[]) {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) { for (const part of parts) controller.enqueue(encoder.encode(part)); controller.close() },
  })
}

describe('bounded body reader', () => {
  it('reads a normal body', async () => {
    const request = new Request('http://x/', { method: 'POST', body: 'name=Alex' })
    expect(await readBodyLimited(request, 8192)).toBe('name=Alex')
  })
  it('rejects an over-long declared Content-Length without reading', async () => {
    const request = new Request('http://x/', { method: 'POST', body: 'a', headers: { 'content-length': '99999' } })
    expect(await readBodyLimited(request, 8192)).toBeNull()
  })
  it('rejects a chunked body that exceeds the limit even with no Content-Length', async () => {
    const request = new Request('http://x/', { method: 'POST', body: chunked(['a'.repeat(5000), 'b'.repeat(5000)]), duplex: 'half' } as RequestInit)
    expect(request.headers.get('content-length')).toBeNull()
    expect(await readBodyLimited(request, 8192)).toBeNull()
  })
})

describe('flash cookie', () => {
  const flash: ContactFlash = { values: { name: 'A', email: 'a@b.co', message: 'hello world' }, errors: {}, locale: 'en' }
  const read = (cookie: string) => readFlashCookie(cookie.split(';')[0], env)

  it('round-trips and carries an issued-at', () => {
    expect(read(createFlashCookie(flash, env))?.values.name).toBe('A')
  })
  it('rejects an expired cookie even with a valid signature', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const cookie = createFlashCookie(flash, env)
    vi.setSystemTime(new Date('2026-01-01T00:05:00Z'))
    expect(read(cookie)).toBeNull()
    vi.useRealTimers()
  })
  it('stays well under the ~4 kB browser cookie limit at the field caps', () => {
    const capped: ContactFlash = { ...flash, values: { name: 'n'.repeat(100), email: 'e'.repeat(254), message: 'm'.repeat(500) } }
    expect(createFlashCookie(capped, env).length).toBeLessThan(2048)
    expect(flashCookieName(env)).toBe('flash')
  })
})

describe('contact message ordering', () => {
  const request = () => new Request('http://localhost:3000/contact-submit', { method: 'POST', headers: { origin: 'http://localhost:3000' } })
  const transport = () => ({ sendEmail: vi.fn(async () => {}), sendTelegram: vi.fn(async () => {}) })

  it('treats a filled honeypot as silent success even when other fields are invalid, and never delivers', async () => {
    clearRateLimitsForTests()
    const t = transport()
    const result = await sendContactMessage({ name: '', email: 'not-an-email', message: 'x', website: 'spam' }, request(), t)
    expect(result).toEqual({ ok: true })
    expect(t.sendEmail).not.toHaveBeenCalled()
    expect(t.sendTelegram).not.toHaveBeenCalled()
  })
  it('still validates when the honeypot is empty', async () => {
    clearRateLimitsForTests()
    const result = await sendContactMessage({ name: '', email: 'bad', message: 'x', website: '' }, request(), transport())
    expect(result).toMatchObject({ ok: false, reason: 'validation' })
  })
})
