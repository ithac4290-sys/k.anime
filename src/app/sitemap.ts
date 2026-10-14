import { MetadataRoute } from 'next';
import { getAllManga } from '@/lib/manga-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://k.animovie.uz';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const { mangas } = getAllManga();
    const mangaUrls: MetadataRoute.Sitemap = (mangas || []).map((manga) => ({
      url: `${baseUrl}/manga/${manga.slug}`,
      lastModified: new Date(manga.updated_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    return [...routes, ...mangaUrls];
  } catch {
    return routes;
  }
}
