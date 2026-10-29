import {Coordinates, PlaceCategory} from '../../entities/place/model/types';

export type FilterCategory = PlaceCategory | 'all';

export type PlaceSortOption = 'distance' | 'title' | 'date';

export interface CategoryConfig {
  id: PlaceCategory;
  label: string;
  badgeClassName: string;
  textClassName: string;
  hexColor: string;
}

export const PLACE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'coffee',
    label: 'Coffee',
    badgeClassName: 'bg-amber-100',
    textClassName: 'text-amber-800',
    hexColor: '#d97706',
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    badgeClassName: 'bg-orange-100',
    textClassName: 'text-orange-800',
    hexColor: '#ea580c',
  },
  {
    id: 'museum',
    label: 'Museum',
    badgeClassName: 'bg-purple-100',
    textClassName: 'text-purple-800',
    hexColor: '#9333ea',
  },
  {
    id: 'park',
    label: 'Park',
    badgeClassName: 'bg-emerald-100',
    textClassName: 'text-emerald-800',
    hexColor: '#059669',
  },
  {
    id: 'sightseeing',
    label: 'Sightseeing',
    badgeClassName: 'bg-blue-100',
    textClassName: 'text-blue-800',
    hexColor: '#2563eb',
  },
  {
    id: 'hotel',
    label: 'Hotel',
    badgeClassName: 'bg-indigo-100',
    textClassName: 'text-indigo-800',
    hexColor: '#4f46e5',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    badgeClassName: 'bg-pink-100',
    textClassName: 'text-pink-800',
    hexColor: '#db2777',
  },
  {
    id: 'nature',
    label: 'Nature',
    badgeClassName: 'bg-teal-100',
    textClassName: 'text-teal-800',
    hexColor: '#0d9488',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    badgeClassName: 'bg-violet-100',
    textClassName: 'text-violet-800',
    hexColor: '#7c3aed',
  },
  {
    id: 'bar',
    label: 'Bar',
    badgeClassName: 'bg-rose-100',
    textClassName: 'text-rose-800',
    hexColor: '#e11d48',
  },
  {
    id: 'transport',
    label: 'Transport',
    badgeClassName: 'bg-cyan-100',
    textClassName: 'text-cyan-800',
    hexColor: '#0891b2',
  },
  {
    id: 'other',
    label: 'Other',
    badgeClassName: 'bg-slate-200',
    textClassName: 'text-slate-800',
    hexColor: '#475569',
  },
];

export const PRIMARY_PLACE_CATEGORIES: CategoryConfig[] =
  PLACE_CATEGORIES.slice(0, 5);

export const CATEGORY_MAP: Record<PlaceCategory, CategoryConfig> = {
  coffee: PLACE_CATEGORIES[0],
  restaurant: PLACE_CATEGORIES[1],
  museum: PLACE_CATEGORIES[2],
  park: PLACE_CATEGORIES[3],
  sightseeing: PLACE_CATEGORIES[4],
  hotel: PLACE_CATEGORIES[5],
  shopping: PLACE_CATEGORIES[6],
  nature: PLACE_CATEGORIES[7],
  entertainment: PLACE_CATEGORIES[8],
  bar: PLACE_CATEGORIES[9],
  transport: PLACE_CATEGORIES[10],
  other: PLACE_CATEGORIES[11],
};

export const FILTER_CATEGORIES: {id: FilterCategory; label: string}[] = [
  {id: 'all', label: 'All'},
  ...PLACE_CATEGORIES.map(category => ({
    id: category.id,
    label: category.label,
  })),
];

export const PLACE_SORT_OPTIONS: {id: PlaceSortOption; label: string}[] = [
  {id: 'distance', label: 'By Distance'},
  {id: 'title', label: 'By Name (A-Z)'},
  {id: 'date', label: 'By Date Added'},
];

export interface CityAnchorPreset {
  id: string;
  label: string;
  coordinates: Coordinates;
}

export const DISTANCE_ANCHOR_CITY_PRESETS: CityAnchorPreset[] = [
  {
    id: 'lviv',
    label: 'Lviv',
    coordinates: {latitude: 49.8397, longitude: 24.0297},
  },
  {
    id: 'kyiv',
    label: 'Kyiv',
    coordinates: {latitude: 50.4501, longitude: 30.5234},
  },
  {
    id: 'warsaw',
    label: 'Warsaw',
    coordinates: {latitude: 52.2297, longitude: 21.0122},
  },
  {
    id: 'rome',
    label: 'Rome',
    coordinates: {latitude: 41.9028, longitude: 12.4964},
  },
  {
    id: 'paris',
    label: 'Paris',
    coordinates: {latitude: 48.8566, longitude: 2.3522},
  },
];
