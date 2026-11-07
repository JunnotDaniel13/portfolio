import { createFileRoute } from '@tanstack/react-router'
import { sendContactMessage } from '~/server/contact.server'
import { contactErrorCodes } from '~/server/contact-schema'
import { createFlashCookie } from '~/server/flash'
import { localePath } from '~/i18n/config'
import { readBodyLimited } from '~/server/body'

const MAX_BODY_BYTES = 8192

export const Route = createFileRoute('/contact-submit')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get('content-type') ?? ''
        // Read at most 8 kB, streaming, so a chunked body cannot bypass the Content-Length check.
        const text = contentType.includes('application/x-www-form-urlencoded') ? await readBodyLimited(request, MAX_BODY_BYTES) : null
        if (text === null) return redirectWithError('en')
        const locale = new URLSearchParams(text).get('locale') === 'fr' ? 'fr' : 'en'
        const params = new URLSearchParams(text)
        const input = {
          name: params.get('name') ?? '',
          email: params.get('email') ?? '',
          message: params.get('message') ?? '',
          locale: params.get('locale') ?? '',
          website: params.get('website') ?? '',
        }
        const result = await sendContactMessage(input, request)
        if (result.ok) return redirect(locale, 'sent')

        if (result.reason === 'validation') {
          const headers = new Headers({
            Location: `${localePath(locale)}?error=1#contact-status`,
            'Cache-Control': 'no-store',
            'Set-Cookie': createFlashCookie({
              // Truncate to the field caps so the signed cookie stays well under the ~4 kB browser limit.
              values: { name: input.name.slice(0, 100), email: input.email.slice(0, 254), message: input.message.slice(0, 500) },
              errors: contactErrorCodes(input),
              locale,
            }),
          })
          return new Response(null, { status: 303, headers })
        }
        if (result.reason === 'origin') return new Response('Forbidden', { status: 403, headers: { 'Cache-Control': 'no-store' } })
        return redirectWithError(locale)
      },
    },
  },
})

function redirect(locale: 'en' | 'fr', outcome: 'sent' | 'error') {
  return new Response(null, {
    status: 303,
    headers: { Location: `${localePath(locale)}?${outcome}=1#contact-status`, 'Cache-Control': 'no-store' },
  })
}

function redirectWithError(locale: 'en' | 'fr') {
  return redirect(locale, 'error')
}
