import {apiClient} from '../../../shared/api/client';
import {calculateBoundingBoxViewbox} from '../../../shared/lib/location';
import {
  Coordinates,
  NominatimReverseAddress,
  NominatimReverseResult,
  NominatimSearchOptions,
  NominatimSearchResult,
  Place,
  PlaceCategory,
  ReverseGeocodedLocation,
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
    normalized.includes('department_store') ||
    normalized.includes('convenience') ||
    normalized.includes('clothes') ||
    normalized.includes('furniture') ||
    normalized.includes('bakery')
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
    normalized.includes('viewpoint') ||
    normalized.includes('historic')
  ) {
    return 'sightseeing';
  }
  return 'other';
};

const isAdministrativeNoisePart = (part: string): boolean => {
  const lower = part.toLowerCase();
  if (/^\d{4,6}$/.test(part)) {
    return true;
  }
  const noiseKeywords = [
    'район',
    'громада',
    'область',
    'district',
    'oblast',
    'province',
    'county',
    'municipality',
    'voivodeship',
    'suburb',
  ];
  return noiseKeywords.some(keyword => lower.includes(keyword));
};

export const formatConciseNominatimAddress = (
  displayName: string,
  address?: NominatimReverseAddress,
): string => {
  const rawParts = displayName
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  const meaningfulParts = rawParts.filter(
    part => !isAdministrativeNoisePart(part),
  );

  if (meaningfulParts.length > 0) {
    const topParts = meaningfulParts.slice(0, 3);
    const locality = address?.city || address?.town || address?.village;
    if (
      locality &&
      !topParts.some(part => part.toLowerCase() === locality.toLowerCase()) &&
      topParts.length < 4
    ) {
      return [...topParts, locality].join(', ');
    }
    return topParts.join(', ');
  }

  return rawParts.slice(0, 3).join(', ') || displayName;
};

export const extractPlaceTitleFromNominatim = (
  name?: string,
  displayName?: string,
  address?: NominatimReverseAddress,
  namedetails?: Record<string, string>,
): string => {
  const candidateFromNameDetails =
    namedetails?.name ||
    namedetails?.['name:uk'] ||
    namedetails?.['name:en'] ||
    namedetails?.brand ||
    namedetails?.operator;

  const poiField =
    address?.amenity ||
    address?.shop ||
    address?.tourism ||
    address?.leisure ||
    address?.historic ||
    address?.building ||
    address?.office;

  if (name && name.trim().length > 0) {
    return name.trim();
  }
  if (candidateFromNameDetails && candidateFromNameDetails.trim().length > 0) {
    return candidateFromNameDetails.trim();
  }
  if (poiField && poiField.trim().length > 0 && poiField !== 'yes') {
    return poiField.trim();
  }

  const parts = displayName
    ? displayName
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
    : [];

  if (parts.length >= 2 && /^\d+[a-zA-Zа-яА-ЯіІїЇєЄґҐ/-]*$/.test(parts[0])) {
    if (parts[2] && !isAdministrativeNoisePart(parts[2])) {
      return parts[2];
    }
    return `${parts[1]}, ${parts[0]}`;
  }

  return parts[0] || 'Pinned Location';
};

export const mapNominatimResultToPlace = (
  result: NominatimSearchResult,
): Place => {
  const extractedTitle = extractPlaceTitleFromNominatim(
    result.name,
    result.display_name,
    result.address,
  );
  const extractedAddress = formatConciseNominatimAddress(
    result.display_name,
    result.address,
  );
  const rawCategorySource = [result.type, result.class]
    .filter(Boolean)
    .join(' ');

  return {
    id: `osm-${result.place_id}`,
    title: extractedTitle,
    address: extractedAddress,
    description: `Type: ${result.type}`,
    category: inferCategoryFromNominatimType(rawCategorySource),
    coordinates: {
      latitude: Number.parseFloat(result.lat) || 0,
      longitude: Number.parseFloat(result.lon) || 0,
    },
    isFavorite: false,
    createdAt: Date.now(),
  };
};

interface NominatimQueryParams {
  q: string;
  format: 'json';
  addressdetails: 1;
  limit: number;
  countrycodes?: string;
  viewbox?: string;
  bounded?: 1;
}

export const searchNominatimPlaces = async (
  query: string,
  options?: NominatimSearchOptions,
): Promise<NominatimSearchResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const params: NominatimQueryParams = {
    q: trimmed,
    format: 'json',
    addressdetails: 1,
    limit: 15,
  };

  if (options?.mode === 'country' && options.countryCode) {
    const cleanCode = options.countryCode.trim().toLowerCase();
    if (cleanCode.length === 2) {
      params.countrycodes = cleanCode;
    }
  } else if (
    (options?.mode === 'city_radius' || options?.mode === 'near_me') &&
    options.boundingCenter &&
    options.radiusKm
  ) {
    params.viewbox = calculateBoundingBoxViewbox(
      options.boundingCenter,
      options.radiusKm,
    );
    params.bounded = 1;
  }

  const response = await apiClient.get<NominatimSearchResult[]>('/search', {
    params,
  });
  return response.data;
};

export const reverseGeocodeCoordinates = async (
  coordinates: Coordinates,
): Promise<ReverseGeocodedLocation> => {
  const response = await apiClient.get<NominatimReverseResult>('/reverse', {
    params: {
      lat: coordinates.latitude,
      lon: coordinates.longitude,
      zoom: 18,
      format: 'json',
      addressdetails: 1,
      namedetails: 1,
      extratags: 1,
    },
  });

  const data = response.data;
  const resolvedTitle = extractPlaceTitleFromNominatim(
    data.name,
    data.display_name,
    data.address,
    data.namedetails,
  );

  const resolvedAddress = data.display_name
    ? formatConciseNominatimAddress(data.display_name, data.address)
    : `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;

  const rawCategorySource = [
    data.type,
    data.class,
    data.address?.amenity,
    data.address?.shop,
    data.address?.tourism,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    title: resolvedTitle,
    address: resolvedAddress,
    category: inferCategoryFromNominatimType(rawCategorySource),
  };
};
