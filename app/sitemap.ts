
export const baseUrl = 'https://junnot-daniel.vercel.app'

export default async function sitemap() {
  let routes = ['',].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes]
}