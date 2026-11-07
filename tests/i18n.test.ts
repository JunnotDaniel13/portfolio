import { describe, expect, it } from 'vitest'
import { lookupMessage, type MessageKey } from '../src/i18n/config'
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
  it('uses no ICU placeholders (so a plain lookup is correct)', () => {
    for (const key of leafKeys(en)) expect(lookupMessage(en, key as MessageKey), key).not.toMatch(/\{[a-zA-Z]+/)
  })
})
