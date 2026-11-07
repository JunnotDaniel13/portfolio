import { copyFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const output = path.join(root, 'src', 'assets')
await mkdir(output, { recursive: true })
const fonts = [
  ['node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2', 'geist-latin-wght-normal.woff2', 45 * 1024],
  ['node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2', 'geist-mono-latin-wght-normal.woff2', 30 * 1024],
]
for (const [source, name, cap] of fonts) {
  const target = path.join(output, name)
  await copyFile(path.join(root, source), target)
  const size = (await stat(target)).size
  if (size > cap) throw new Error(`${name} is ${size} bytes; cap is ${cap}`)
  console.log(`${name}: ${size} bytes`)
}
