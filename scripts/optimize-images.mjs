import { mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const output = path.join(root, 'public', 'images')
await mkdir(output, { recursive: true })
const projects = [
  ['pulse.png', 'pulse'],
  ['crefin.jpg', 'financial'],
  ['travel.jpg', 'travel'],
  ['real-estate.jpg', 'real-estate'],
  ['ayla.jpg', 'newsroom'],
]

async function writeCapped(image, target, format, cap) {
  let quality = format === 'avif' ? 48 : 76
  let buffer
  while (quality >= 24) {
    buffer = format === 'avif'
      ? await image.clone().avif({ quality, effort: 4 }).toBuffer()
      : await image.clone().webp({ quality }).toBuffer()
    if (buffer.byteLength <= cap) break
    quality -= 4
  }
  if (!buffer || buffer.byteLength > cap) throw new Error(`Could not keep ${target} under ${cap} bytes`)
  await writeFile(target, buffer) // write the capped buffer as-is; re-encoding it through sharp would discard the cap
  return buffer.byteLength
}

for (const [source, name] of projects) {
  for (const width of [192, 480, 960]) {
    const height = Math.round(width * 10 / 16)
    const image = sharp(path.join(root, 'assets-src', 'projects', source)).resize(width, height, { fit: 'cover', position: 'top' })
    for (const format of ['avif', 'webp']) {
      const target = path.join(output, `${name}-${width}.${format}`)
      const size = await writeCapped(image, target, format, format === 'avif' ? 40 * 1024 : 60 * 1024)
      console.log(`${path.basename(target)}: ${size} bytes`)
    }
  }
}

const profile = sharp(path.join(root, 'assets-src', 'profile.png')).resize(220, 220, { fit: 'cover' })
for (const format of ['avif', 'webp']) {
  const target = path.join(output, `profile.${format}`)
  const size = await writeCapped(profile, target, format, 30 * 1024)
  console.log(`${path.basename(target)}: ${size} bytes`)
}

const files = await Promise.all(projects.flatMap(([, name]) => [192, 480, 960].flatMap((width) => ['avif', 'webp'].map(async (format) => stat(path.join(output, `${name}-${width}.${format}`))))))
if (files.some((file) => file.size === 0)) throw new Error('An optimized image is empty')
