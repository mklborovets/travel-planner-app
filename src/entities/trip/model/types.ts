export interface TripItem {
  placeId: string;
  isVisited: boolean;
  order: number;
  addedAt: number;
}

export interface Trip {
  id: string;
  title: string;
  items: TripItem[];
  createdAt: number;
}

export interface TripSummaryOption {
  id: string;
  title: string;
  stopsCount: number;
  visitedCount: number;
  isActive: boolean;
}

export interface RouteStartCandidate {
  placeId: string;
  title: string;
  address: string;
  distanceFromUserLabel: string;
}

export interface TripState {
  trips: Trip[];
  activeTripId: string;
  title: string;
  items: TripItem[];
  createTrip: (title: string) => Trip;
  selectTrip: (tripId: string) => void;
  deleteTrip: (tripId: string) => void;
  setTitle: (title: string) => void;
  addPlaceToTrip: (placeId: string) => void;
  removePlaceFromTrip: (placeId: string) => void;
  removePlaceFromAllTrips: (placeId: string) => void;
  toggleVisited: (placeId: string) => void;
  moveTripItem: (placeId: string, direction: 'up' | 'down') => void;
  reorderTrip: (items: TripItem[]) => void;
  clearTrip: () => void;
  isPlaceInTrip: (placeId: string) => boolean;
}
