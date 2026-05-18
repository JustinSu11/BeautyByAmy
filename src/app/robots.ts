import type { MetadataRoute } from 'next'

const SITE_URL = 'https://iibeautybyamyii.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/login', '/waiver'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
