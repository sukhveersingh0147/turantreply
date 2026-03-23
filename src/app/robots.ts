import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/overview/', '/admin/', '/api/'],
    },
    sitemap: 'https://turantreply.com/sitemap.xml',
  }
}
