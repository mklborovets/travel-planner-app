import {PlaceCategory} from '../../entities/place/model/types';

export type FilterCategory = PlaceCategory | 'all';

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
    id: 'other',
    label: 'Other',
    badgeClassName: 'bg-slate-200',
    textClassName: 'text-slate-800',
    hexColor: '#475569',
  },
];

export const CATEGORY_MAP: Record<PlaceCategory, CategoryConfig> = {
  coffee: PLACE_CATEGORIES[0],
  restaurant: PLACE_CATEGORIES[1],
  museum: PLACE_CATEGORIES[2],
  park: PLACE_CATEGORIES[3],
  sightseeing: PLACE_CATEGORIES[4],
  other: PLACE_CATEGORIES[5],
};

export const FILTER_CATEGORIES: {id: FilterCategory; label: string}[] = [
  {id: 'all', label: 'All'},
  ...PLACE_CATEGORIES.map(category => ({
    id: category.id,
    label: category.label,
  })),
];

