import {apiClient} from '../../../shared/api/client';
import {
  NominatimSearchResult,
  Place,
  PlaceCategory,
} from '../model/types';

export const inferCategoryFromNominatimType = (
  rawType: string,
): PlaceCategory => {
  const normalized = rawType.toLowerCase();
  if (normalized.includes('cafe') || normalized.includes('coffee')) {
    return 'coffee';
  }
  if (
    normalized.includes('restaurant') ||
    normalized.includes('bar') ||
    normalized.includes('fast_food') ||
    normalized.includes('pub')
  ) {
    return 'restaurant';
  }
  if (
    normalized.includes('museum') ||
    normalized.includes('gallery') ||
    normalized.includes('arts')
  ) {
    return 'museum';
  }
  if (
    normalized.includes('park') ||
    normalized.includes('garden') ||
    normalized.includes('nature')
  ) {
    return 'park';
  }
  if (
    normalized.includes('attraction') ||
    normalized.includes('monument') ||
    normalized.includes('memorial') ||
    normalized.includes('castle') ||
    normalized.includes('theatre') ||
    normalized.includes('viewpoint')
  ) {
    return 'sightseeing';
  }
  return 'other';
};

export const mapNominatimResultToPlace = (
  result: NominatimSearchResult,
): Place => {
  const parts = result.display_name.split(',').map(part => part.trim());
  const extractedTitle =
    result.name && result.name.trim().length > 0
      ? result.name.trim()
      : parts[0] || 'Unnamed Place';
  const extractedAddress =
    parts.length > 1 ? parts.slice(1).join(', ') : result.display_name;

  return {
    id: `osm-${result.place_id}`,
    title: extractedTitle,
    address: extractedAddress,
    description: `Type: ${result.type}`,
    category: inferCategoryFromNominatimType(result.type),
    coordinates: {
      latitude: Number.parseFloat(result.lat) || 0,
      longitude: Number.parseFloat(result.lon) || 0,
    },
    isFavorite: false,
    createdAt: Date.now(),
  };
};

export const searchNominatimPlaces = async (
  query: string,
): Promise<NominatimSearchResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const response = await apiClient.get<NominatimSearchResult[]>('/search', {
    params: {
      q: trimmed,
      format: 'json',
      addressdetails: 1,
      limit: 15,
    },
  });
  return response.data;
};

