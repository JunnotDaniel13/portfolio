type CapturedContact = {
  values: Partial<Record<'name' | 'email' | 'message' | 'website', string>>
  field?: string
  caret?: number | null
}

const captured: CapturedContact = { values: {} }
let composing = false

if (typeof document !== 'undefined') {
  document.addEventListener('input', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
    if (!target.closest('[data-contact-form]')) return
    if (target.name === 'name' || target.name === 'email' || target.name === 'message' || target.name === 'website') {
      captured.values[target.name] = target.value
      captured.field = target.name
      captured.caret = target.selectionStart
    }
  }, true)
  document.addEventListener('focusin', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
    if (target.closest('[data-contact-form]')) {
      captured.field = target.name
      captured.caret = target.selectionStart
    }
  }, true)
  document.addEventListener('compositionstart', () => { composing = true }, true)
  document.addEventListener('compositionend', () => { composing = false }, true)
}

export function contactCapture() {
  return {
    values: { ...captured.values },
    field: captured.field,
    caret: captured.caret,
    composing,
  }
}
