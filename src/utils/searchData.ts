import { Business } from '@/types/business';
import { searchPlaces, PlacesSearchResult } from './googlePlaces';

interface SearchOptions {
  skip?: number;
  limit?: number;
}

interface SearchResult {
  locations: Business[];
  total: number;
}

function locationToBusiness(place: PlacesSearchResult): Business {
  return {
    name: place.name,
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    address: place.formatted_address,
    categories: place.categories || [],
    phone: place.phone || '',
    website: place.website || ''
  };
}

export async function loadLocations(query: string, options?: SearchOptions): Promise<SearchResult> {
  console.log('Loading locations for query:', query);
  
  if (!query) {
    console.log('Empty query, returning empty results');
    return {
      locations: [],
      total: 0
    };
  }

  try {
    const places = await searchPlaces(query, 'Denver, Colorado');
    console.log(`Received ${places.length} places from Google Places API`);
    
    const businesses = places.map(locationToBusiness);
    console.log(`Transformed ${businesses.length} places to businesses`);

    const skip = options?.skip || 0;
    const limit = options?.limit || 10;
    const paginatedResults = businesses.slice(skip, skip + limit);

    return {
      locations: paginatedResults,
      total: businesses.length
    };
  } catch (error) {
    console.error('Error loading locations:', error);
    return {
      locations: [],
      total: 0
    };
  }
}

export async function loadContractors(_keyword: string, _location: string): Promise<Business[]> {
  // In a real app, this would fetch from an API or database
  return [];
}

export function loadSearchData(): { keywords: string[]; locations: string[] } {
  return {
    keywords: [],
    locations: []
  };
}
