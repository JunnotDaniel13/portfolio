import type { ContactErrors, ContactValues } from './contact-schema'
import { contactErrorCodes, validateContact } from './contact-schema'
import { assertRuntimeConfigOnce } from './runtime'
import { checkRateLimit, clientIp, originAllowed } from './request-security'

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: 'validation' | 'rate' | 'failed' | 'origin' | 'too_large'; errors?: ContactErrors }

export type ContactTransport = {
  sendEmail: (values: ContactValues) => Promise<void>
  sendTelegram: (values: ContactValues) => Promise<void>
}

const defaultTransport: ContactTransport = {
  sendEmail,
  sendTelegram,
}

export async function sendContactMessage(
  input: unknown,
  request: Request,
  transport: ContactTransport = defaultTransport,
): Promise<ContactResult> {
  assertRuntimeConfigOnce()
  const length = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(length) && length > 8192) return { ok: false, reason: 'too_large' }
  if (!originAllowed(request)) return { ok: false, reason: 'origin' }
  if (!checkRateLimit(clientIp(request))) return { ok: false, reason: 'rate' }

  // Honeypot first: a bot that fills it gets the same silent success whether or not its other fields are valid.
  if (isRecord(input) && typeof input.website === 'string' && input.website.trim() !== '') return { ok: true }

  const parsed = validateContact(input)
  if (!parsed.success) return { ok: false, reason: 'validation', errors: contactErrorCodes(input) }
  const values = parsed.data

  const deliveries = await Promise.allSettled([
    transport.sendEmail(values),
    transport.sendTelegram(values),
  ])
  if (deliveries.some((result) => result.status === 'fulfilled')) return { ok: true }

  console.error('Contact delivery failed on both configured channels')
  return { ok: false, reason: 'failed' }
}

async function sendTelegram(values: ContactValues) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) throw new Error('Telegram is not configured')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `New portfolio message\n\nName: ${values.name}\nEmail: ${values.email}\n\n${values.message}`,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error('Telegram delivery failed')
}

async function sendEmail(values: ContactValues) {
  const address = process.env.EMAIL_ADDRESS
  const passkey = process.env.GMAIL_PASSKEY
  if (!address || !passkey) throw new Error('Email is not configured')

  const { default: nodemailer } = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: address, pass: passkey },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  })
  await transporter.sendMail({
    from: `"Portfolio" <${address}>`,
    to: address,
    subject: `New portfolio message from ${values.name.replace(/[\r\n]/g, ' ')}`,
    text: `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`,
    html: emailTemplate(values),
    replyTo: values.email,
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character)
}

export function emailTemplate(values: Pick<ContactValues, 'name' | 'email' | 'message'>) {
  return `<div style="font-family:Arial,sans-serif;color:#14161c;max-width:600px;margin:auto"><h2>New portfolio message</h2><p><strong>Name:</strong> ${escapeHtml(values.name)}</p><p><strong>Email:</strong> ${escapeHtml(values.email)}</p><p><strong>Message:</strong></p><blockquote style="border-left:4px solid #0f766e;padding-left:12px;white-space:pre-wrap">${escapeHtml(values.message)}</blockquote></div>`
}
