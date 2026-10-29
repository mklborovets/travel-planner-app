import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from '../../../shared/storage/storage';
import {Trip, TripItem, TripState} from './types';

const INITIAL_TRIP_ITEMS: TripItem[] = [
  {
    placeId: 'lviv-opera-house',
    isVisited: false,
    order: 0,
    addedAt: 1700000005000,
  },
  {
    placeId: 'svit-kavy-rynok',
    isVisited: true,
    order: 1,
    addedAt: 1700000006000,
  },
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-lviv-weekend',
    title: 'Weekend in Lviv',
    items: INITIAL_TRIP_ITEMS,
    createdAt: 1700000005000,
  },
  {
    id: 'trip-green-escape',
    title: 'Parks & Coffee Walk',
    items: [
      {
        placeId: 'stryiskyi-park',
        isVisited: false,
        order: 0,
        addedAt: 1700000007000,
      },
    ],
    createdAt: 1700000007000,
  },
];

const normalizeOrder = (items: TripItem[]): TripItem[] => {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
};

const syncActiveTripFields = (
  trips: Trip[],
  activeTripId: string,
): {trips: Trip[]; activeTripId: string; title: string; items: TripItem[]} => {
  const active =
    trips.find(trip => trip.id === activeTripId) ?? trips[0] ?? INITIAL_TRIPS[0];
  const resolvedTrips = trips.length > 0 ? trips : [active];
  return {
    trips: resolvedTrips,
    activeTripId: active.id,
    title: active.title,
    items: active.items,
  };
};

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: INITIAL_TRIPS,
      activeTripId: INITIAL_TRIPS[0].id,
      title: INITIAL_TRIPS[0].title,
      items: INITIAL_TRIPS[0].items,
      createTrip: (rawTitle: string): Trip => {
        const cleanTitle = rawTitle.trim() || 'New Trip';
        const newTrip: Trip = {
          id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: cleanTitle,
          items: [],
          createdAt: Date.now(),
        };
        set(state => {
          const nextTrips = [newTrip, ...state.trips];
          return syncActiveTripFields(nextTrips, newTrip.id);
        });
        return newTrip;
      },
      selectTrip: (tripId: string) => {
        set(state => syncActiveTripFields(state.trips, tripId));
      },
      deleteTrip: (tripId: string) => {
        set(state => {
          if (state.trips.length <= 1) {
            return state;
          }
          const remaining = state.trips.filter(trip => trip.id !== tripId);
          const nextActiveId =
            state.activeTripId === tripId
              ? remaining[0].id
              : state.activeTripId;
          return syncActiveTripFields(remaining, nextActiveId);
        });
      },
      setTitle: (title: string) => {
        set(state => {
          const updatedTrips = state.trips.map(trip =>
            trip.id === state.activeTripId ? {...trip, title} : trip,
          );
          return syncActiveTripFields(updatedTrips, state.activeTripId);
        });
      },
      addPlaceToTrip: (placeId: string) => {
        set(state => {
          const alreadyExists = state.items.some(
            item => item.placeId === placeId,
          );
          if (alreadyExists) {
            return state;
          }
          const newItem: TripItem = {
            placeId,
            isVisited: false,
            order: state.items.length,
            addedAt: Date.now(),
          };
          const nextItems = [...state.items, newItem];
          const updatedTrips = state.trips.map(trip =>
            trip.id === state.activeTripId ? {...trip, items: nextItems} : trip,
          );
          return syncActiveTripFields(updatedTrips, state.activeTripId);
        });
      },
      removePlaceFromTrip: (placeId: string) => {
        set(state => {
          const filtered = normalizeOrder(
            state.items
              .filter(item => item.placeId !== placeId)
              .sort((first, second) => first.order - second.order),
          );
          const updatedTrips = state.trips.map(trip =>
            trip.id === state.activeTripId ? {...trip, items: filtered} : trip,
          );
          return syncActiveTripFields(updatedTrips, state.activeTripId);
        });
      },
      removePlaceFromAllTrips: (placeId: string) => {
        set(state => {
          const updatedTrips = state.trips.map(trip => ({
            ...trip,
            items: normalizeOrder(
              trip.items
                .filter(item => item.placeId !== placeId)
                .sort((first, second) => first.order - second.order),
            ),
          }));
          return syncActiveTripFields(updatedTrips, state.activeTripId);
        });
      },
      toggleVisited: (placeId: string) => {
        set(state => {
          const nextItems = state.items.map(item =>
            item.placeId === placeId
              ? {...item, isVisited: !item.isVisited}
              : item,
          );
          const updatedTrips = state.trips.map(trip =>
            trip.id === state.activeTripId ? {...trip, items: nextItems} : trip,
          );
          return syncActiveTripFields(updatedTrips, state.activeTripId);
        });
      },
      moveTripItem: (placeId: string, direction: 'up' | 'down') => {
        set(state => {
          const ordered = [...state.items].sort(
            (first, second) => first.order - second.order,
          );
          const currentIndex = ordered.findIndex(
            item => item.placeId === placeId,
          );
          if (currentIndex === -1) {
            return state;
          }
          const targetIndex =
            direction === 'up' ? currentIndex - 1 : currentIndex + 1;
          if (targetIndex < 0 || targetIndex >= ordered.length) {
            return state;
          }
          const swapped = [...ordered];
          const temp = swapped[currentIndex];
          swapped[currentIndex] = swapped[targetIndex];
          swapped[targetIndex] = temp;
          const normalized = normalizeOrder(swapped);
          const updatedTrips = state.trips.map(trip =>
            trip.id === state.activeTripId
              ? {...trip, items: normalized}
              : trip,
          );
          return syncActiveTripFields(updatedTrips, state.activeTripId);
        });
      },
      reorderTrip: (items: TripItem[]) => {
        const normalized = normalizeOrder(items);
        set(state => {
          const updatedTrips = state.trips.map(trip =>
            trip.id === state.activeTripId
              ? {...trip, items: normalized}
              : trip,
          );
          return syncActiveTripFields(updatedTrips, state.activeTripId);
        });
      },
      clearTrip: () => {
        set(state => {
          const updatedTrips = state.trips.map(trip =>
            trip.id === state.activeTripId ? {...trip, items: []} : trip,
          );
          return syncActiveTripFields(updatedTrips, state.activeTripId);
        });
      },
      isPlaceInTrip: (placeId: string): boolean => {
        return get().items.some(item => item.placeId === placeId);
      },
    }),
    {
      name: 'trip-storage',
      storage: zustandStorage,
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as Partial<TripState> | undefined;
        if (!typedPersisted) {
          return currentState;
        }
        if (
          Array.isArray(typedPersisted.trips) &&
          typedPersisted.trips.length > 0
        ) {
          const synced = syncActiveTripFields(
            typedPersisted.trips,
            typedPersisted.activeTripId ?? typedPersisted.trips[0].id,
          );
          return {
            ...currentState,
            ...synced,
          };
        }
        const migratedTrip: Trip = {
          id: 'trip-lviv-weekend',
          title: typedPersisted.title || 'Weekend in Lviv',
          items: Array.isArray(typedPersisted.items)
            ? typedPersisted.items
            : INITIAL_TRIP_ITEMS,
          createdAt: Date.now(),
        };
        const synced = syncActiveTripFields([migratedTrip], migratedTrip.id);
        return {
          ...currentState,
          ...synced,
        };
      },
    },
  ),
);
