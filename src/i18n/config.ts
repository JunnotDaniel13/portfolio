import { createContext, createElement, useContext, type ReactNode } from 'react'
import type { Messages } from '~/locales/en'

export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'fr'
}

export function localePath(locale: Locale) {
  return locale === 'fr' ? '/fr' : '/'
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === 'fr') return (await import('~/locales/fr')).messages
  return (await import('~/locales/en')).messages
}

type LeafKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? LeafKeys<T[K], `${Prefix}${K}.`>
      : never
}[keyof T & string]

export type MessageKey = LeafKeys<Messages>

// Plain dotted-key lookup. The catalogs use no ICU features (no placeholders, plurals or rich text), so a
// dependency with a message-format parser would only add client JavaScript. Keys are type-checked (MessageKey).
const MessagesContext = createContext<Messages | null>(null)

export function MessagesProvider({ messages, children }: { messages: Messages; children: ReactNode }) {
  return createElement(MessagesContext.Provider, { value: messages }, children)
}

export function lookupMessage(messages: Messages, key: MessageKey): string {
  let node: unknown = messages
  for (const part of key.split('.')) node = (node as Record<string, unknown> | undefined)?.[part]
  if (typeof node !== 'string') throw new Error(`Missing message: ${key}`)
  return node
}

export function useCopy() {
  const messages = useContext(MessagesContext)
  if (!messages) throw new Error('useCopy must be used inside <MessagesProvider>')
  return (key: MessageKey) => lookupMessage(messages, key)
}

export const siteOrigin = import.meta.env.VITE_SITE_URL || 'https://junnot-daniel.vercel.app'
