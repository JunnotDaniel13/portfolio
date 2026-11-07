import { describe, expect, it } from 'vitest'
import { loadMessages, lookupMessage, yearsOfExperience, type MessageKey } from '../src/i18n/config'
import { messages as en } from '../src/locales/en'
import { messages as fr } from '../src/locales/fr'

function leafKeys(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return [prefix]
  return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) => leafKeys(v, prefix ? `${prefix}.${k}` : k))
}

describe('message lookup', () => {
  it('resolves nested dotted keys', () => {
    expect(lookupMessage(en, 'nav.skip' as MessageKey)).toBe(en.nav.skip)
  })
  it('throws on a missing key instead of rendering undefined', () => {
    expect(() => lookupMessage(en, 'nav.nope' as MessageKey)).toThrow(/Missing message/)
  })
  it('en and fr catalogs have identical keys and no empty strings', () => {
    const enKeys = leafKeys(en).sort()
    expect(leafKeys(fr).sort()).toEqual(enKeys)
    for (const key of enKeys) {
      expect(lookupMessage(en, key as MessageKey).trim(), `en ${key}`).not.toBe('')
      expect(lookupMessage(fr, key as MessageKey).trim(), `fr ${key}`).not.toBe('')
    }
  })
  it('leaves no unresolved placeholders once messages are loaded', async () => {
    for (const locale of ['en', 'fr'] as const) {
      const loaded = await loadMessages(locale)
      for (const key of leafKeys(loaded)) expect(lookupMessage(loaded, key as MessageKey), `${locale} ${key}`).not.toMatch(/\{[a-zA-Z]+/)
    }
  })
})

describe('yearsOfExperience (career start May 2023)', () => {
  it('counts completed years and ticks up each May', () => {
    expect(yearsOfExperience(new Date(2024, 3, 30))).toBe(1) // before May 2024 → floor at 1
    expect(yearsOfExperience(new Date(2024, 4, 1))).toBe(1)
    expect(yearsOfExperience(new Date(2025, 3, 30))).toBe(1)
    expect(yearsOfExperience(new Date(2025, 4, 1))).toBe(2)
    expect(yearsOfExperience(new Date(2026, 10, 7))).toBe(3)
    expect(yearsOfExperience(new Date(2027, 4, 1))).toBe(4)
  })
})
