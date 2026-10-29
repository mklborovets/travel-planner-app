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
    normalized.includes('bar') ||
    normalized.includes('pub') ||
    normalized.includes('nightclub') ||
    normalized.includes('biergarten')
  ) {
    return 'bar';
  }
  if (
    normalized.includes('restaurant') ||
    normalized.includes('fast_food') ||
    normalized.includes('food_court')
  ) {
    return 'restaurant';
  }
  if (
    normalized.includes('hotel') ||
    normalized.includes('hostel') ||
    normalized.includes('guest_house') ||
    normalized.includes('motel') ||
    normalized.includes('apartment')
  ) {
    return 'hotel';
  }
  if (
    normalized.includes('shop') ||
    normalized.includes('mall') ||
    normalized.includes('supermarket') ||
    normalized.includes('marketplace') ||
    normalized.includes('department_store')
  ) {
    return 'shopping';
  }
  if (
    normalized.includes('museum') ||
    normalized.includes('gallery') ||
    normalized.includes('arts')
  ) {
    return 'museum';
  }
  if (normalized.includes('park') || normalized.includes('garden')) {
    return 'park';
  }
  if (
    normalized.includes('nature') ||
    normalized.includes('peak') ||
    normalized.includes('forest') ||
    normalized.includes('beach') ||
    normalized.includes('water') ||
    normalized.includes('cliff')
  ) {
    return 'nature';
  }
  if (
    normalized.includes('cinema') ||
    normalized.includes('theme_park') ||
    normalized.includes('zoo') ||
    normalized.includes('stadium') ||
    normalized.includes('aquarium') ||
    normalized.includes('theatre')
  ) {
    return 'entertainment';
  }
  if (
    normalized.includes('station') ||
    normalized.includes('airport') ||
    normalized.includes('aerodrome') ||
    normalized.includes('bus_stop') ||
    normalized.includes('ferry') ||
    normalized.includes('terminal')
  ) {
    return 'transport';
  }
  if (
    normalized.includes('attraction') ||
    normalized.includes('monument') ||
    normalized.includes('memorial') ||
    normalized.includes('castle') ||
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
