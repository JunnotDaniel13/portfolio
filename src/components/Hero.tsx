import { useEffect, useState, type MouseEvent } from 'react'
import { personal } from '~/data/portfolio'
import { useCopy, type Locale } from '~/i18n/config'
import { NoBreakHyphen } from './NoBreakHyphen'

export function Hero({ locale }: { locale: Locale }) {
  const t = useCopy()
  const [copyStatus, setCopyStatus] = useState('')

  function focusContact(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    document.getElementById('h-contact')?.focus({ preventScroll: true })
    document.getElementById('contact')?.scrollIntoView()
    history.pushState(null, '', '#contact')
  }

  const copied = copyStatus === t('hero.copied')

  useEffect(() => {
    if (!copyStatus) return
    const timer = window.setTimeout(() => setCopyStatus(''), 2500)
    return () => window.clearTimeout(timer)
  }, [copyStatus])

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(personal.email)
      setCopyStatus(t('hero.copied'))
    } catch {
      const element = document.getElementById('hero-email')
      if (element) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(element)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
      setCopyStatus(t('hero.copyFailed'))
    }
  }

  return (
    <div id="top" className="hero">
      <p className="mono status"><NoBreakHyphen>{t('hero.status')}</NoBreakHyphen></p>
      <h1><NoBreakHyphen>{t('hero.title')}</NoBreakHyphen></h1>
      <div className="actions">
        <a className="btn primary" href="#contact" onClick={focusContact}>{t('hero.write')}</a>
        <button className={`btn js-only${copied ? ' copied' : ''}`} type="button" onClick={copyEmail}>{copied ? <><span aria-hidden="true"></span>{t('hero.copied')}</> : t('hero.copy')}</button>
        <a className="btn" href={personal.resume[locale]} target="_blank" rel="noreferrer" hrefLang={locale}>{t('hero.resume')}<span className="sr-only"> {t('hero.newTab')}</span></a>
      </div>
      <a className="email" id="hero-email" href={`mailto:${personal.email}`}>{personal.email}</a>
      <span className="sr-only" role="status" aria-live="polite">{copyStatus}</span>
      <p className="lede"><NoBreakHyphen>{t('hero.lede')}</NoBreakHyphen></p>
    </div>
  )
}
