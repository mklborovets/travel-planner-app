export interface TripItem {
  placeId: string;
  isVisited: boolean;
  order: number;
  addedAt: number;
}

export interface TripState {
  title: string;
  items: TripItem[];
  setTitle: (title: string) => void;
  addPlaceToTrip: (placeId: string) => void;
  removePlaceFromTrip: (placeId: string) => void;
  toggleVisited: (placeId: string) => void;
  reorderTrip: (items: TripItem[]) => void;
  clearTrip: () => void;
  isPlaceInTrip: (placeId: string) => boolean;
}
