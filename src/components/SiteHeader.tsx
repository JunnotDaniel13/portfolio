import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { personal, sections } from '~/data/portfolio'
import { useCopy, type Locale, type MessageKey } from '~/i18n/config'
import { themeStorageKey, type ThemeChoice } from '~/theme'

function EnvelopeIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
}

function MenuIcon({ open }: { open: boolean }) {
  // Visual state matches aria-expanded: hamburger when closed, close (X) when open.
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = useCopy()
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('work')
  const [theme, setTheme] = useState<ThemeChoice>('system')
  const menuRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const barRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Test/diagnostic marker: set once React has attached (the no-JS baseline never sets it).
    document.documentElement.dataset.hydrated = 'true'
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(themeStorageKey)
    if (stored === 'light' || stored === 'dark' || stored === 'system') setTheme(stored)
  }, [])

  useEffect(() => {
    const bar = barRef.current
    if (!bar || typeof ResizeObserver === 'undefined') return
    const update = () => {
      const hidden = matchMedia('(min-width:1100px)').matches || matchMedia('(max-height:480px)').matches
      document.documentElement.style.setProperty('--bar-h', hidden ? '0px' : `${bar.getBoundingClientRect().height}px`)
    }
    const observer = new ResizeObserver(update)
    observer.observe(bar)
    window.addEventListener('resize', update)
    update()
    return () => { observer.disconnect(); window.removeEventListener('resize', update) }
  }, [])

  useEffect(() => {
    const outside = (event: Event) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!menuRef.current?.contains(target) && !toggleRef.current?.contains(target)) setMenuOpen(false)
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    const desktop = matchMedia('(min-width:1100px)')
    const closeAtDesktop = () => { if (desktop.matches) setMenuOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    document.addEventListener('keydown', keydown)
    desktop.addEventListener('change', closeAtDesktop)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
      document.removeEventListener('keydown', keydown)
      desktop.removeEventListener('change', closeAtDesktop)
    }
  }, [menuOpen])

  useEffect(() => {
    const elements = sections.map(({ id }) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element))
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]?.target.id) setActive(visible[0].target.id)
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  function focusSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault()
    setMenuOpen(false)
    const section = document.getElementById(id)
    const heading = document.getElementById(`h-${id}`)
    heading?.focus({ preventScroll: true })
    section?.scrollIntoView()
    history.pushState(null, '', `#${id}`)
  }

  function chooseTheme(choice: ThemeChoice) {
    setTheme(choice)
    localStorage.setItem(themeStorageKey, choice)
    if (choice === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = choice
  }

  const otherLocale = locale === 'fr' ? 'en' : 'fr'
  const languageLink = <Link className="lang" to="/{-$locale}" params={{ locale: otherLocale === 'fr' ? 'fr' : undefined }} lang={otherLocale} hrefLang={otherLocale}>{otherLocale === 'fr' ? 'Français' : 'English'}</Link>
  const themeGroup = (id: string) => (
    <div role="group" aria-labelledby={id} className="theme-control js-only">
      <div className="legend" id={id}>{t('nav.theme')}</div>
      <div className="seg">
        {(['system', 'light', 'dark'] as const).map((choice) => (
          <button type="button" key={choice} aria-pressed={theme === choice} onClick={() => chooseTheme(choice)}>{t(`nav.${choice}`)}</button>
        ))}
      </div>
    </div>
  )
  const sectionLinks = (onNavigate = false) => sections.map(({ id, number }) => (
    <li key={id}>
      <a href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={onNavigate ? (event) => focusSection(event, id) : undefined}>
        <span className="n" aria-hidden="true">{number}</span><span>{t(`nav.${id}` as MessageKey)}</span>
      </a>
    </li>
  ))

  return (
    <>
      <header className="rail">
        <a className="name" href="#top" aria-label={t('nav.home')}>{personal.name}</a>
        <nav aria-label={t('nav.sections')}><ul>{sectionLinks(true)}</ul></nav>
        <div className="ctl">
          <a className="btn" href="#contact" onClick={(event) => focusSection(event, 'contact')}>{locale === 'fr' ? t('nav.contactMe') : t('nav.contact')}</a>
          <nav aria-label={t('nav.language')}>{languageLink}</nav>
          {themeGroup('theme-rail')}
        </div>
      </header>

      <header className="bar" ref={barRef}>
        <a className="logo" href="#top" aria-label={t('nav.monogram')}><span className="full">{personal.name}</span><span className="jd" aria-hidden="true">JD</span></a>
        <nav aria-label={t('nav.language')} className="bar-language">{languageLink}</nav>
        <a className="btn-i contact-shortcut" href="#contact" aria-label={locale === 'fr' ? t('nav.contactMe') : t('nav.contact')} onClick={(event) => focusSection(event, 'contact')}><EnvelopeIcon /><span className="contact-label">{locale === 'fr' ? t('nav.contactMe') : t('nav.contact')}</span></a>
        <button ref={toggleRef} className="btn-i menu-toggle js-only" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={t('nav.menu')} onClick={() => setMenuOpen((open) => !open)}><MenuIcon open={menuOpen} /></button>
      </header>

      <nav className="no-js-nav" aria-label={t('nav.sections')}><ul>{sectionLinks()}</ul></nav>
      <nav ref={menuRef} className="menu" id="mobile-menu" data-open={menuOpen} aria-label={t('nav.sections')}>
        <ul>{sectionLinks(true)}</ul>
        {themeGroup('theme-menu')}
      </nav>
    </>
  )
}

