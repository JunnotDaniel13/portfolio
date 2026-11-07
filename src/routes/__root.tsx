/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute, useParams } from '@tanstack/react-router'
import appCss from '~/styles/app.css?url'
import geistSans from '~/assets/geist-latin-wght-normal.woff2?url'
import { themeScript } from '~/theme'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#0b0d12' },
      { title: 'Jerenason Junnot Daniel — Full-stack JavaScript developer' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preload', href: geistSans, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
    scripts: [{ children: themeScript }],
  }),
  shellComponent: RootDocument,
  component: () => <Outlet />,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { locale } = useParams({ strict: false })
  return (
    <html lang={locale === 'fr' ? 'fr' : 'en'} suppressHydrationWarning>
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  )
}

function NotFound() {
  const { locale } = useParams({ strict: false })
  const fr = locale === 'fr'
  return (
    <main className="main error-page">
      <p className="mono">404</p>
      <h1>{fr ? 'Page introuvable' : 'Page not found'}</h1>
      <p>{fr ? 'La page demandée n’existe pas.' : 'The page you requested doesn’t exist.'}</p>
      <a className="btn" href={fr ? '/fr' : '/'}>{fr ? 'Retour à l’accueil' : 'Return home'}</a>
    </main>
  )
}
