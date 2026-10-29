export type PlaceCategory =
  | 'coffee'
  | 'restaurant'
  | 'museum'
  | 'park'
  | 'sightseeing'
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

export interface NominatimSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  name?: string;
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
