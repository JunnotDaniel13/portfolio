import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

async function theme(page: import('@playwright/test').Page, value: 'light' | 'dark') {
  await page.addInitScript((choice) => localStorage.setItem('portfolio-theme', choice), value)
}


async function ready(page: import('@playwright/test').Page, form = false) {
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true')
  if (form) await expect(page.locator('form[data-contact-form]')).toHaveAttribute('data-form-hydrated', 'true')
}

test('locale routing, canonical redirect and 404', async ({ page, request }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Junnot Daniel/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.goto('/fr')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  const redirect = await request.get('/en', { maxRedirects: 0 })
  expect(redirect.status()).toBe(301)
  expect(redirect.headers().location).toBe('/')
  expect((await request.get('/de')).status()).toBe(404)
  expect((await request.get('/robots.txt')).status()).toBe(200)
  expect((await request.get('/sitemap.xml')).status()).toBe(200)
})

for (const locale of ['', '/fr']) {
  for (const color of ['light', 'dark'] as const) {
    for (const width of [320, 1280]) {
      test(`axe ${locale || '/en'} ${color} ${width}px`, async ({ page }) => {
        await theme(page, color)
        await page.setViewportSize({ width, height: width === 320 ? 640 : 800 })
        await page.goto(locale || '/')
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
        expect(results.violations).toEqual([])
      })
    }
  }
}

test('mobile navigation, theme control, reflow and persistent contact', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 256 })
  await page.goto('/fr')
  await ready(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const menu = page.getByRole('button', { name: 'Menu' })
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await page.locator('#mobile-menu').getByRole('button', { name: 'Sombre' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()

  await page.setViewportSize({ width: 360, height: 640 })
  await page.goto('/fr')
  await page.locator('#education').scrollIntoViewIfNeeded()
  await page.locator('.contact-shortcut').click()
  await expect(page.locator('#h-contact')).toBeFocused()
})

test('hero fold gates in English and French', async ({ page }) => {
  await mkdir('docs/design/built', { recursive: true })
  for (const locale of ['', '/fr']) {
    for (const width of [320, 360]) {
      await page.setViewportSize({ width, height: 640 })
      await page.goto(locale || '/')
      const cta = await page.getByRole('link', { name: locale ? 'Écrire un message' : 'Write a message' }).boundingBox()
      const email = await page.locator('#hero-email').boundingBox()
      expect(cta && cta.y + cta.height <= 640).toBe(true)
      expect(email && email.y + email.height <= 640).toBe(true)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(locale || '/')
    const firstProject = await page.locator('.proj h3').first().boundingBox()
    expect(firstProject && firstProject.y < 800).toBe(true)
    await page.screenshot({ path: `docs/design/built/desktop${locale || '-en'}-800.png`, fullPage: false })
  }
})

test('open menu, details and error states are accessible', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await page.goto('/fr')
  await page.getByRole('button', { name: 'Menu' }).click()
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'docs/design/built/mobile-menu-fr.png' })

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await page.getByText('Details', { exact: false }).first().click()
  await expect(page.locator('details').first()).toHaveAttribute('open', '')
  await page.goto('/?error=1#contact-status')
  await expect(page.locator('#contact-status')).toContainText('Your message wasn’t confirmed')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
  await page.goto('/?sent=1#contact-status')
  await expect(page.locator('#contact-status')).toContainText('Thank you')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
})

test('enhanced form validates and preserves a no-delivery honeypot flow', async ({ page }) => {
  await page.goto('/')
  await ready(page, true)
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('#contact-name')).toBeFocused()
  await expect(page.locator('#name-error')).toBeVisible()
  await page.locator('#contact-name').fill('Alex Martin')
  await page.locator('#contact-email').fill('alex@example.com')
  await page.locator('#contact-message').fill('This is a complete test message.')
  await page.locator('#contact-website').fill('spam', { force: true }) // visually hidden honeypot; fill() keeps React state in sync
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.locator('#contact-status')).toContainText('Thank you')
  await expect(page.locator('#contact-name')).toHaveValue('')
})

test('no-JS form completes the native 303 flow', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:3000/')
  await page.locator('#contact-name').fill('Alex Martin')
  await page.locator('#contact-email').fill('alex@example.com')
  await page.locator('#contact-message').fill('This is a complete test message.')
  await page.locator('#contact-website').evaluate((input: HTMLInputElement) => { input.value = 'spam' })
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page).toHaveURL(/\?sent=1#contact-status$/)
  await expect(page.locator('#contact-status')).toContainText('Thank you')
  await context.close()
})

test('reduced motion and forced colors remain operable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  await ready(page)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'true')
})

test('submit button keeps focus and stays legible while sending (aria-disabled, not disabled)', async ({ page }) => {
  await page.route('**/_serverFn/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    await route.continue()
  })
  await page.goto('/')
  await ready(page, true)
  await page.locator('#contact-name').fill('Alex Martin')
  await page.locator('#contact-email').fill('alex@example.com')
  await page.locator('#contact-message').fill('This is a complete test message.')
  await page.locator('#contact-website').fill('spam', { force: true })
  const send = page.getByRole('button', { name: 'Send message' })
  await send.click()
  const sending = page.getByRole('button', { name: 'Sending…' })
  await expect(sending).toHaveAttribute('aria-disabled', 'true')
  await expect(sending).not.toHaveAttribute('disabled', /.*/)
  await expect(sending).toBeFocused()
  await expect(page.locator('#contact-status [role=status]')).toContainText('Thank you')
})

test('menu icon reflects the open state and status regions keep fixed roles', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await page.goto('/')
  await ready(page)
  const toggle = page.getByRole('button', { name: 'Menu' })
  const before = await toggle.locator('path').getAttribute('d')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(await toggle.locator('path').getAttribute('d')).not.toBe(before)
  const roles = await page.locator('#contact-status > div').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('role')))
  expect(roles).toEqual(['status', 'alert'])
})

test('Pulse is the first project, with a real live-demo link and no empty links', async ({ page }) => {
  for (const [path, label] of [['/', 'Live demo'], ['/fr', 'Démo en ligne']] as const) {
    await page.goto(path)
    const first = page.locator('#work article').first()
    await expect(first.getByRole('heading', { name: 'Pulse' })).toBeVisible()
    const link = first.getByRole('link', { name: new RegExp(label) })
    await expect(link).toHaveAttribute('href', 'https://pulse-dashboard-theta-swart.vercel.app/')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noreferrer/)
    await expect(link).toHaveAccessibleName(/Pulse/)
    const empty = await page.locator('a').evaluateAll((anchors) => anchors.filter((a) => !a.getAttribute('href')?.trim()).length)
    expect(empty).toBe(0)
  }
})
