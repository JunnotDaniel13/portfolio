import { lazy, Suspense } from 'react'
import type { Messages } from '~/locales/en'
import { MessagesProvider, type Locale } from '~/i18n/config'
import type { ContactErrors } from '~/server/contact-schema'
import type { ContactFlash } from '~/server/flash'
import { SiteHeader } from './SiteHeader'
import { Hero } from './Hero'
import { AboutSection, ContactDetails, EducationSection, ExperienceSection, SiteFooter, SkillsSection, WorkSection } from './PortfolioSections'
import { SectionHeader } from './SectionHeader'
import '~/lib/contact-capture'

const LazyContactForm = lazy(() => import('./ContactForm'))

export type ContactStatus = 'sent' | 'error' | null

export function PortfolioPage({ locale, messages, flash, status }: {
  locale: Locale
  messages: Messages
  flash: ContactFlash | null
  status: ContactStatus
}) {
  const initialValues = flash?.values ?? { name: '', email: '', message: '' }
  const serverErrors: ContactErrors = flash?.errors ?? {}

  return (
    <MessagesProvider messages={messages}>
      <a className="skip" href="#main">{messages.nav.skip}</a>
      <SiteHeader locale={locale} />
      <main className="main" id="main" tabIndex={-1}>
        <Hero />
        <WorkSection />
        <ExperienceSection />
        <AboutSection />
        <SkillsSection />
        <EducationSection />
        <section id="contact" aria-labelledby="h-contact">
          <SectionHeader id="contact" number="06" titleKey="sections.contact" metaKey="sections.contactMeta" />
          <div className="contact">
            <ContactDetails />
            <Suspense fallback={null}>
              <LazyContactForm locale={locale} initialValues={initialValues} serverErrors={serverErrors} initialStatus={status} hasFlash={Boolean(flash)} />
            </Suspense>
          </div>
        </section>
        <SiteFooter />
      </main>
    </MessagesProvider>
  )
}
