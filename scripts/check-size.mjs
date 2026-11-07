import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const root = process.cwd()
const assets = path.join(root, '.output', 'public', 'assets')
const files = (await readdir(assets)).filter((file) => file.endsWith('.js'))
const sizes = new Map()
for (const file of files) sizes.set(file, gzipSync(await readFile(path.join(assets, file)), { level: 9 }).byteLength)
function one(prefix) {
  const matches = files.filter((file) => file.startsWith(prefix))
  if (matches.length !== 1) throw new Error(`Expected one ${prefix}*.js asset, found: ${matches.join(', ') || 'none'}`)
  return matches[0]
}
const entry = one('index-')
const route = one('_-_locale_-')
const contact = one('ContactForm-')
const firstLoads = ['en-', 'fr-'].map((prefix) => {
  const catalog = one(prefix)
  return { catalog, bytes: sizes.get(entry) + sizes.get(route) + sizes.get(catalog) }
})
for (const { catalog, bytes } of firstLoads) console.log(`first load (${catalog}): ${bytes} bytes gz = ${entry} + ${route} + ${catalog}`)
console.log(`lazy contact: ${sizes.get(contact)} bytes gz (${contact})`)
for (const { bytes } of firstLoads) if (bytes > 130_000) throw new Error(`First-load JS gate failed: ${bytes} > 130000 bytes gz`)
if (sizes.get(contact) > 45_000) throw new Error(`Contact chunk gate failed: ${sizes.get(contact)} > 45000 bytes gz`)

for (const [file, cap] of [['geist-latin-wght-normal.woff2', 45 * 1024], ['geist-mono-latin-wght-normal.woff2', 30 * 1024]]) {
  const size = (await stat(path.join(root, 'src', 'assets', file))).size
  console.log(`${file}: ${size} bytes`)
  if (size > cap) throw new Error(`${file} exceeds ${cap} bytes`)
}
for (const file of await readdir(path.join(root, 'public', 'images'))) {
  const size = (await stat(path.join(root, 'public', 'images', file))).size
  const cap = file.startsWith('profile') ? 30 * 1024 : file.endsWith('.avif') ? 40 * 1024 : 60 * 1024
  if (size > cap) throw new Error(`${file} exceeds ${cap} bytes`)
}
console.log('All JavaScript, font and image size gates passed.')
