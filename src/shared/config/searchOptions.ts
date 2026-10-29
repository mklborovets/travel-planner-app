import {
  SearchRadiusKm,
  SearchScopeMode,
} from '../../entities/place/model/types';

export interface SearchScopeOption {
  id: SearchScopeMode;
  label: string;
  description: string;
}

export const SEARCH_SCOPE_OPTIONS: SearchScopeOption[] = [
  {
    id: 'worldwide',
    label: 'Worldwide',
    description: 'Global search across all countries',
  },
  {
    id: 'country',
    label: 'By Country',
    description: 'Restrict results to a specific country code',
  },
  {
    id: 'city_radius',
    label: 'City + Radius',
    description: 'Search within a bounding box around a city',
  },
  {
    id: 'near_me',
    label: 'Near Me',
    description: 'Search within a radius from GPS or anchor',
  },
];

export interface CountryFilterPreset {
  code: string;
  label: string;
}

export const COUNTRY_FILTER_PRESETS: CountryFilterPreset[] = [
  {code: 'ua', label: 'Ukraine (UA)'},
  {code: 'pl', label: 'Poland (PL)'},
  {code: 'it', label: 'Italy (IT)'},
  {code: 'fr', label: 'France (FR)'},
  {code: 'de', label: 'Germany (DE)'},
  {code: 'es', label: 'Spain (ES)'},
  {code: 'gb', label: 'United Kingdom (GB)'},
  {code: 'us', label: 'United States (US)'},
];

export const SEARCH_RADIUS_OPTIONS: SearchRadiusKm[] = [5, 15, 30, 50];
