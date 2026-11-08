import versions from '~/data/image-versions.json'

/** `/images/<file>?v=<content hash>`: immutable-cacheable, yet a changed image gets a new URL. */
export function imageUrl(file: string) {
  const version = (versions as Record<string, string>)[file]
  return version ? `/images/${file}?v=${version}` : `/images/${file}`
}

export function imageSrcSet(name: string, ext: string, widths: readonly number[] = [192, 480, 960]) {
  return widths.map((width) => `${imageUrl(`${name}-${width}.${ext}`)} ${width}w`).join(', ')
}
