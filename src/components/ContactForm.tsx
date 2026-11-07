import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'
import { useForm, useStore } from '@tanstack/react-form'
import { useServerFn } from '@tanstack/react-start'
import { contactSchema, type ContactErrors, type ContactField, type ContactValues } from '~/server/contact-schema'
import { sendContact } from '~/server/contact.functions'
import { contactCapture } from '~/lib/contact-capture'
import { useCopy, type Locale } from '~/i18n/config'
import type { ContactStatus } from './PortfolioPage'

type Props = {
  locale: Locale
  initialValues: { name: string; email: string; message: string }
  serverErrors: ContactErrors
  initialStatus: ContactStatus
  hasFlash: boolean
}

export default function ContactFormProvider(props: Props) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { mutations: { retry: false } } }))
  return <QueryClientProvider client={queryClient}><ContactForm {...props} /></QueryClientProvider>
}

function CharCountAnnouncer({ length, low, zero }: { length: number; low: string; zero: string }) {
  // Announce once each time a threshold is crossed (<=50 left, 0 left), even if a paste jumps past it.
  const stage = useRef<0 | 1 | 2>(0)
  const [text, setText] = useState('')
  useEffect(() => {
    const remaining = 500 - length
    const next = remaining <= 0 ? 2 : remaining <= 50 ? 1 : 0
    if (next > stage.current) setText(next === 2 ? zero : low)
    else if (next < stage.current) setText('')
    stage.current = next
  }, [length, low, zero])
  return <span className="sr-only" role="status" aria-live="polite">{text}</span>
}

function ContactForm({ locale, initialValues, serverErrors, initialStatus, hasFlash }: Props) {
  const t = useCopy()
  const send = useServerFn(sendContact)
  const [hydrated, setHydrated] = useState(false)
  const [cleared, setCleared] = useState<Partial<Record<ContactField, boolean>>>({})
  const [success, setSuccess] = useState(initialStatus === 'sent')
  const [summaryVisible, setSummaryVisible] = useState(initialStatus === 'error' && hasFlash)
  const [errorText, setErrorText] = useState(initialStatus === 'error' && !hasFlash ? t('contact.genericError') : '')
  const [defaults] = useState<ContactValues>(() => {
    const captured = contactCapture().values
    return {
      name: captured.name ?? initialValues.name,
      email: captured.email ?? initialValues.email,
      message: captured.message ?? initialValues.message,
      website: captured.website ?? '',
      locale,
    }
  })
  const mutation = useMutation({ mutationFn: (values: ContactValues) => send({ data: values }) })

  const form = useForm({
    defaultValues: defaults,
    validators: { onChange: contactSchema },
    onSubmit: async ({ value, formApi }) => {
      if (mutation.isPending) return // aria-disabled does not block activation; guard here
      setSuccess(false)
      setSummaryVisible(false)
      setErrorText('')
      try {
        const result = await mutation.mutateAsync(value)
        if (!result.ok) {
          setErrorText(result.reason === 'rate' ? t('contact.rateLimit') : t('contact.failed'))
          return
        }
        setSuccess(true)
        // reset() with explicit empty values restores pristine/untouched state; setFieldValue would mark
        // each field touched and run the validator, showing an error under every input.
        formApi.reset({ name: '', email: '', message: '', website: '', locale })
        setCleared({ name: true, email: true, message: true })
      } catch {
        setErrorText(t('contact.failed'))
      }
    },
  })

  // form-level validation marks every field "touched"; only reveal errors on fields the user left/edited, or after a submit attempt.
  const submitAttempts = useStore(form.store, (state) => state.submissionAttempts)
  const shouldShow = (meta: { isBlurred: boolean; isDirty: boolean }) => submitAttempts > 0 || meta.isBlurred || meta.isDirty

  useLayoutEffect(() => {
    const captured = contactCapture()
    if (!captured.field || captured.composing) return
    const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-contact-form] [name="${captured.field}"]`)
    if (!field) return
    field.focus({ preventScroll: true })
    if (typeof captured.caret === 'number') field.setSelectionRange(captured.caret, captured.caret)
  }, [])

  useEffect(() => {
    setHydrated(true)
    if (initialStatus) {
      document.getElementById('contact-status')?.focus({ preventScroll: true })
      const url = new URL(window.location.href)
      url.searchParams.delete('sent')
      url.searchParams.delete('error')
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }, [initialStatus])

  function fieldError(field: ContactField, value: string, touched: boolean, hasIssues: boolean) {
    if (touched && hasIssues) {
      if (field === 'name') return t('contact.requiredName')
      if (field === 'email') return t('contact.invalidEmail')
      return value.length > 500 ? t('contact.longMessage') : t('contact.shortMessage')
    }
    if (cleared[field]) return undefined
    const code = serverErrors[field]
    if (code === 'required') return t('contact.requiredName')
    if (code === 'email') return t('contact.invalidEmail')
    if (code === 'short') return t('contact.shortMessage')
    if (code === 'long') return t('contact.longMessage')
    return undefined
  }

  const clearServerError = (field: ContactField) => setCleared((current) => ({ ...current, [field]: true }))
  const describedBy = (field: ContactField, error: string | undefined) => {
    const ids = [`${field}-hint`]
    if (error) ids.push(`${field}-error`)
    return ids.join(' ')
  }

  return (
    <form
      method="post"
      action="/contact-submit"
      data-contact-form
      data-form-hydrated={hydrated ? 'true' : undefined}
      noValidate={hydrated}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit().then(() => {
          requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-contact-form] [aria-invalid="true"]')?.focus())
        })
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="contact-website">{t('contact.website')}</label>
        <form.Field name="website">{(field) => (
          <input id="contact-website" name={field.name} tabIndex={-1} autoComplete="off" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />
        )}</form.Field>
      </div>

      {/* #contact-status is the focus target after a redirect/submit. It holds two persistent regions that exist
          (empty) from first render, so changes are announced reliably; roles never change at runtime. */}
      <div
        id="contact-status"
        tabIndex={-1}
        className={success || errorText || summaryVisible ? `statusbox${success ? ' success' : ''}` : 'statusbox empty-status'}
      >
        <div role="status">{success && <p>{t('contact.success')}</p>}</div>
        <div role="alert">
          {errorText && <p>{errorText}</p>}
          {summaryVisible && (
            <>
              <h3>{t('contact.errorSummary')}</h3>
              <ul>{(['name', 'email', 'message'] as const).filter((field) => serverErrors[field]).map((field) => (
                <li key={field}><a href={`#contact-${field}`}>{fieldError(field, '', false, false)}</a></li>
              ))}</ul>
            </>
          )}
        </div>
      </div>

      <form.Field name="name">{(field) => {
        const error = fieldError('name', field.state.value, shouldShow(field.state.meta), field.state.meta.errors.length > 0)
        return <div>
          <label htmlFor="contact-name">{t('contact.name')}</label>
          <p className="hint" id="name-hint">{t('contact.nameHint')}</p>
          <input id="contact-name" name={field.name} autoComplete="name" required maxLength={100} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { clearServerError('name'); field.handleChange(event.target.value) }} aria-invalid={Boolean(error)} aria-describedby={describedBy('name', error)} />
          {error && <p className="err" id="name-error">{error}</p>}
        </div>
      }}</form.Field>

      <form.Field name="email">{(field) => {
        const error = fieldError('email', field.state.value, shouldShow(field.state.meta), field.state.meta.errors.length > 0)
        return <div>
          <label htmlFor="contact-email">{t('contact.emailField')}</label>
          <p className="hint" id="email-hint">{t('contact.emailHint')}</p>
          <input id="contact-email" name={field.name} type="email" autoComplete="email" required maxLength={254} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { clearServerError('email'); field.handleChange(event.target.value) }} aria-invalid={Boolean(error)} aria-describedby={describedBy('email', error)} />
          {error && <p className="err" id="email-error">{error}</p>}
        </div>
      }}</form.Field>

      <form.Field name="message">{(field) => {
        const error = fieldError('message', field.state.value, shouldShow(field.state.meta), field.state.meta.errors.length > 0)
        const remaining = 500 - field.state.value.length
        return <div>
          <label htmlFor="contact-message">{t('contact.message')}</label>
          <p className={remaining <= 50 ? 'hint warn' : 'hint'} id="message-hint">{t('contact.messageHint')}</p>
          <textarea id="contact-message" name={field.name} required minLength={10} maxLength={500} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { clearServerError('message'); field.handleChange(event.target.value) }} aria-invalid={Boolean(error)} aria-describedby={describedBy('message', error)} />
          <CharCountAnnouncer length={field.state.value.length} low={t('contact.remaining50')} zero={t('contact.remaining0')} />
          {error && <p className="err" id="message-error">{error}</p>}
        </div>
      }}</form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>{(isSubmitting) => (
        <div><button className="btn primary submit" type="submit" aria-disabled={isSubmitting || mutation.isPending}>{isSubmitting || mutation.isPending ? t('contact.sending') : t('contact.send')}</button></div>
      )}</form.Subscribe>
    </form>
  )
}
