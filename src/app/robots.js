// Next.js App Router auto-generates /robots.txt from this file.
// Allows all public pages, blocks the admin panel from indexing.

const BASE_URL = 'https://poudhyalfarms.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
