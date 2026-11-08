import { mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const output = path.join(root, 'public', 'images')
await mkdir(output, { recursive: true })
// [source file, output name]. The fallback <img> keeps the source's own format (jpg/png); WebP is served first.
const projects = [
  ['pulse.png', 'pulse'],
  ['crefin.jpg', 'financial'],
  ['travel.jpg', 'travel'],
  ['real-estate.jpg', 'real-estate'],
  ['ayla.jpg', 'newsroom'],
]

const encoders = {
  webp: (image, quality) => image.clone().webp({ quality }).toBuffer(),
  jpg: (image, quality) => image.clone().jpeg({ quality, mozjpeg: true }).toBuffer(),
  png: (image, quality) => image.clone().png({ palette: true, quality, effort: 8 }).toBuffer(),
}

async function writeCapped(image, target, format, cap) {
  let quality = format === 'webp' ? 76 : 82
  let buffer
  while (quality >= 24) {
    buffer = await encoders[format](image, quality)
    if (buffer.byteLength <= cap) break
    quality -= 4
  }
  if (!buffer || buffer.byteLength > cap) throw new Error(`Could not keep ${target} under ${cap} bytes`)
  await writeFile(target, buffer) // write the capped buffer as-is; re-encoding it through sharp would discard the cap
  return buffer.byteLength
}

const written = []
async function emit(image, name, ext, webpCap, fallbackCap) {
  for (const [format, cap] of [['webp', webpCap], [ext, fallbackCap]]) {
    const target = path.join(output, `${name}.${format}`)
    const size = await writeCapped(image, target, format, cap)
    written.push(target)
    console.log(`${path.basename(target)}: ${size} bytes`)
  }
}

for (const [source, name] of projects) {
  const ext = path.extname(source).slice(1)
  for (const width of [192, 480, 960]) {
    const height = Math.round(width * 10 / 16)
    const image = sharp(path.join(root, 'assets-src', 'projects', source)).resize(width, height, { fit: 'cover', position: 'top' })
    await emit(image, `${name}-${width}`, ext, 60 * 1024, 120 * 1024)
  }
}

const profile = sharp(path.join(root, 'assets-src', 'profile.png')).resize(220, 220, { fit: 'cover' })
await emit(profile, 'profile', 'png', 30 * 1024, 60 * 1024)

const files = await Promise.all(written.map((file) => stat(file)))
if (files.some((file) => file.size === 0)) throw new Error('An optimized image is empty')
