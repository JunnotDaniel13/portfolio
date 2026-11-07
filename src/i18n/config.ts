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

// Career start: May 2023. Completed years of experience, recomputed on every load so it ticks up each May.
const CAREER_START = { year: 2023, month: 4 } // month is 0-based (May)

export function yearsOfExperience(now = new Date()) {
  const years = now.getFullYear() - CAREER_START.year - (now.getMonth() < CAREER_START.month ? 1 : 0)
  return Math.max(years, 1)
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  const { messages } = locale === 'fr' ? await import('~/locales/fr') : await import('~/locales/en')
  const years = String(yearsOfExperience())
  return { ...messages, about: { ...messages.about, first: messages.about.first.replace('{years}', years) } }
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
