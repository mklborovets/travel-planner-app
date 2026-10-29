import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from '../../../shared/storage/storage';
import {TripItem, TripState} from './types';

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

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      title: 'Weekend in Lviv',
      items: INITIAL_TRIP_ITEMS,
      setTitle: (title: string) => {
        set({title});
      },
      addPlaceToTrip: (placeId: string) => {
        set(state => {
          const alreadyExists = state.items.some(
            item => item.placeId === placeId,
          );
          if (alreadyExists) {
            return state;
          }
          const nextOrder = state.items.length;
          const newItem: TripItem = {
            placeId,
            isVisited: false,
            order: nextOrder,
            addedAt: Date.now(),
          };
          return {
            items: [...state.items, newItem],
          };
        });
      },
      removePlaceFromTrip: (placeId: string) => {
        set(state => {
          const filtered = state.items
            .filter(item => item.placeId !== placeId)
            .sort((first, second) => first.order - second.order)
            .map((item, index) => ({
              ...item,
              order: index,
            }));
          return {items: filtered};
        });
      },
      toggleVisited: (placeId: string) => {
        set(state => ({
          items: state.items.map(item =>
            item.placeId === placeId
              ? {...item, isVisited: !item.isVisited}
              : item,
          ),
        }));
      },
      reorderTrip: (items: TripItem[]) => {
        const normalized = items.map((item, index) => ({
          ...item,
          order: index,
        }));
        set({items: normalized});
      },
      clearTrip: () => {
        set({items: []});
      },
      isPlaceInTrip: (placeId: string): boolean => {
        return get().items.some(item => item.placeId === placeId);
      },
    }),
    {
      name: 'trip-storage',
      storage: zustandStorage,
    },
  ),
);

