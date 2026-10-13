import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** The one page search engines should know about. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: 'daily', priority: 1 }];
}
