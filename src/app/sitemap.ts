import { MetadataRoute } from 'next';

interface KeywordLocationPair {
  keyword: string;
  location: string;
}

// You'll need to implement this function to get your keyword-location combinations
async function getAllKeywordLocationPairs(): Promise<KeywordLocationPair[]> {
  // This is a placeholder - implement your own logic to get all combinations
  return [
    { keyword: 'Career coaching', location: 'Los Angeles County-California' },
    // Add more combinations
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use Vercel URL from environment or fallback to localhost for development
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  
  // Get all keyword-location pairs
  const pairs = await getAllKeywordLocationPairs();
  
  // Generate sitemap entries
  const routes = pairs.map(({ keyword, location }) => ({
    url: `${baseUrl}/${encodeURIComponent(keyword)}/${encodeURIComponent(location)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Add static routes
  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...routes,
  ];
} 