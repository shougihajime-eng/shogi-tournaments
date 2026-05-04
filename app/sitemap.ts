import type { MetadataRoute } from 'next'

const BASE_URL = 'https://shogi-tournaments.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${BASE_URL}/?region=tokyo`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/?region=kanto`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    }
  ]
}
