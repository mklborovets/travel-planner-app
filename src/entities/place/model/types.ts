export type PlaceCategory =
  | 'coffee'
  | 'restaurant'
  | 'museum'
  | 'park'
  | 'sightseeing'
  | 'hotel'
  | 'shopping'
  | 'nature'
  | 'entertainment'
  | 'bar'
  | 'transport'
  | 'other';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  title: string;
  address: string;
  description?: string;
  category: PlaceCategory;
  coordinates: Coordinates;
  isFavorite: boolean;
  createdAt: number;
}

export interface NominatimReverseAddress {
  amenity?: string;
  shop?: string;
  tourism?: string;
  leisure?: string;
  historic?: string;
  building?: string;
  office?: string;
  road?: string;
  house_number?: string;
  pedestrian?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface NominatimSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class?: string;
  name?: string;
  address?: NominatimReverseAddress;
}

export type SearchScopeMode =
  | 'worldwide'
  | 'country'
  | 'city_radius'
  | 'near_me';

export type SearchRadiusKm = 5 | 15 | 30 | 50;

export interface NominatimSearchOptions {
  mode: SearchScopeMode;
  countryCode?: string;
  boundingCenter?: Coordinates;
  radiusKm?: SearchRadiusKm;
}

export interface NominatimReverseResult {
  place_id?: number;
  display_name?: string;
  name?: string;
  type?: string;
  class?: string;
  address?: NominatimReverseAddress;
  namedetails?: Record<string, string>;
}

export interface ReverseGeocodedLocation {
  title: string;
  address: string;
  category: PlaceCategory;
}

export interface CreatePlacePayload {
  title: string;
  address: string;
  description?: string;
  category: PlaceCategory;
  coordinates: Coordinates;
}

export interface PlacesState {
  places: Place[];
  addPlace: (payload: CreatePlacePayload, customId?: string) => Place;
  upsertPlace: (place: Place) => void;
  removePlace: (placeId: string) => void;
  toggleFavorite: (placeId: string) => void;
  getPlaceById: (placeId: string) => Place | undefined;
}
