import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { PortfolioPage } from '~/components/PortfolioPage'
import { isLocale, loadMessages, localePath, siteOrigin } from '~/i18n/config'
import { readContactFlash } from '~/server/contact.functions'

export const Route = createFileRoute('/{-$locale}/')({
  beforeLoad: ({ params }) => {
    if (params.locale === 'en') {
      throw redirect({ to: '/{-$locale}', params: { locale: undefined }, statusCode: 301 })
    }
    if (params.locale !== undefined && !isLocale(params.locale)) throw notFound()
    return { locale: params.locale === 'fr' ? 'fr' as const : 'en' as const }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    ...(search.sent === '1' ? { sent: true as const } : {}),
    ...(search.error === '1' ? { error: true as const } : {}),
  }),
  loader: async ({ context }) => {
    const [messages, flash] = await Promise.all([
      loadMessages(context.locale),
      readContactFlash(),
    ])
    return { messages, flash }
  },
  head: ({ loaderData, match }) => {
    if (!loaderData) throw new Error('Localized messages were not loaded')
    const locale = match.context.locale
    const canonical = `${siteOrigin}${localePath(locale)}`
    const description = loaderData.messages.seo.description
    return {
      meta: [
        { title: loaderData.messages.seo.title },
        { name: 'description', content: description },
        { property: 'og:title', content: loaderData.messages.seo.title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonical },
        { property: 'og:locale', content: locale === 'fr' ? 'fr_FR' : 'en_US' },
        { name: 'twitter:card', content: 'summary' },
      ],
      links: [
        { rel: 'canonical', href: canonical },
        { rel: 'alternate', hrefLang: 'en', href: `${siteOrigin}/` },
        { rel: 'alternate', hrefLang: 'fr', href: `${siteOrigin}/fr` },
        { rel: 'alternate', hrefLang: 'x-default', href: `${siteOrigin}/` },
      ],
      scripts: [{
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Jerenason Junnot Daniel',
          alternateName: 'Junnot Daniel',
          url: siteOrigin,
          email: 'mailto:jerenasonjunnot@gmail.com',
          jobTitle: 'Full-stack JavaScript developer',
          worksFor: { '@type': 'Organization', name: 'FINAMAD' },
          sameAs: [
            'https://github.com/junnot-daniel',
            'https://github.com/junnotdaniel13',
            'https://www.linkedin.com/in/junnot-daniel',
            'https://twitter.com/junnotdaniel',
          ],
        }).replace(/</g, '\\u003c'),
      }],
    }
  },
  component: Home,
})

function Home() {
  const { messages, flash } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  const search = Route.useSearch()
  const status = search.sent ? 'sent' : search.error ? 'error' : null
  return <PortfolioPage locale={locale} messages={messages} flash={flash} status={status} />
}
