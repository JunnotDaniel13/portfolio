import { createServerFn } from '@tanstack/react-start'
import { getRequest, getRequestHeader, setResponseHeader } from '@tanstack/react-start/server'
import { contactSchema } from './contact-schema'
import { sendContactMessage } from './contact.server'
import { clearFlashCookie, readFlashCookie } from './flash'

export const sendContact = createServerFn({ method: 'POST' })
  .validator(contactSchema)
  .handler(async ({ data }) => {
    return sendContactMessage(data, getRequest())
  })

export const readContactFlash = createServerFn({ method: 'GET' })
  .handler(async () => {
    const flash = readFlashCookie(getRequestHeader('cookie'))
    if (flash) setResponseHeader('Set-Cookie', clearFlashCookie())
    return flash
  })
