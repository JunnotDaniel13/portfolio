import { describe, expect, it } from 'vitest'
import { messages as en } from '~/locales/en'
import { messages as fr } from '~/locales/fr'
import { normalizedTechnologyNames, projects, skillGroups } from '~/data/portfolio'

function leaves(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix]
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, child]) => leaves(child, `${prefix}${key}.`))
}

describe('localized portfolio data', () => {
  it('has identical English and French message keys', () => {
    expect(leaves(fr).sort()).toEqual(leaves(en).sort())
  })

  it('has useful summaries, alt text and disclosure content in both locales', () => {
    for (const catalog of [en, fr]) {
      for (const project of projects) {
        const copy = catalog.projects[project.id]
        expect(copy.summary.length).toBeGreaterThan(40)
        expect(copy.alt.length).toBeGreaterThan(20)
        expect(copy.description.length).toBeGreaterThan(copy.summary.length + 40)
      }
    }
  })

  it('uses normalized technology display names', () => {
    const allowed = new Set<string>(normalizedTechnologyNames)
    for (const group of skillGroups) for (const skill of group.skills) expect(allowed.has(skill), skill).toBe(true)
    expect(skillGroups.flatMap((group) => group.skills)).not.toContain('Nextjs')
    expect(skillGroups.flatMap((group) => group.skills)).not.toContain('Php')
  })

  it('only ever has real, https project links (never empty hrefs)', () => {
    for (const project of projects) {
      if (!('demo' in project)) continue
      expect(project.demo, project.id).toMatch(/^https:\/\/[^\s]+$/)
    }
    expect(projects[0].id).toBe('pulse') // latest work first
  })

  it('has a demo-link label and a source-free Pulse entry in both locales', () => {
    for (const catalog of [en, fr]) expect(catalog.projects.demo.length).toBeGreaterThan(3)
    expect(projects.find((p) => p.id === 'pulse')).not.toHaveProperty('source')
  })
})
