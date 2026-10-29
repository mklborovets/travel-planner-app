import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from '../../../shared/storage/storage';
import {CreatePlacePayload, Place, PlacesState} from './types';

const INITIAL_PLACES: Place[] = [
  {
    id: 'lviv-opera-house',
    title: 'Lviv National Opera',
    address: 'Svobody Ave, 28, Lviv',
    description: 'Historic opera and ballet theatre in the heart of Lviv.',
    category: 'sightseeing',
    coordinates: {
      latitude: 49.8441,
      longitude: 24.0262,
    },
    isFavorite: true,
    createdAt: 1700000001000,
  },
  {
    id: 'stryiskyi-park',
    title: 'Stryiskyi Park',
    address: 'Stryiska St, Lviv',
    description: 'One of the oldest and most scenic landscape parks in Lviv.',
    category: 'park',
    coordinates: {
      latitude: 49.8261,
      longitude: 24.0265,
    },
    isFavorite: false,
    createdAt: 1700000002000,
  },
  {
    id: 'svit-kavy-rynok',
    title: 'Svit Kavy',
    address: 'Katedralna Square, 6, Lviv',
    description: 'Specialty coffee roastery near Latin Cathedral.',
    category: 'coffee',
    coordinates: {
      latitude: 49.8408,
      longitude: 24.0306,
    },
    isFavorite: true,
    createdAt: 1700000003000,
  },
];

export const usePlacesStore = create<PlacesState>()(
  persist(
    (set, get) => ({
      places: INITIAL_PLACES,
      addPlace: (payload: CreatePlacePayload, customId?: string): Place => {
        const existingPlace = customId
          ? get().places.find(item => item.id === customId)
          : undefined;
        if (existingPlace) {
          return existingPlace;
        }
        const newPlace: Place = {
          id:
            customId ??
            `place-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: payload.title.trim(),
          address: payload.address.trim(),
          description: payload.description?.trim() || undefined,
          category: payload.category,
          coordinates: payload.coordinates,
          isFavorite: false,
          createdAt: Date.now(),
        };
        set(state => ({
          places: [newPlace, ...state.places],
        }));
        return newPlace;
      },
      upsertPlace: (place: Place) => {
        set(state => {
          const exists = state.places.some(item => item.id === place.id);
          if (exists) {
            return {
              places: state.places.map(item =>
                item.id === place.id ? place : item,
              ),
            };
          }
          return {
            places: [place, ...state.places],
          };
        });
      },
      removePlace: (placeId: string) => {
        set(state => ({
          places: state.places.filter(place => place.id !== placeId),
        }));
      },
      toggleFavorite: (placeId: string) => {
        set(state => ({
          places: state.places.map(place =>
            place.id === placeId
              ? {...place, isFavorite: !place.isFavorite}
              : place,
          ),
        }));
      },
      getPlaceById: (placeId: string): Place | undefined => {
        return get().places.find(place => place.id === placeId);
      },
    }),
    {
      name: 'places-storage',
      storage: zustandStorage,
    },
  ),
);

