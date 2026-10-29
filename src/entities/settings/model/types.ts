import {Coordinates} from '../../place/model/types';

export type MapTheme = 'standard' | 'dark';

export type DistanceAnchorMode = 'gps' | 'custom';

export interface SettingsState {
  mapTheme: MapTheme;
  distanceAnchorMode: DistanceAnchorMode;
  customAnchorLabel: string;
  customAnchorCoordinates: Coordinates;
  toggleMapTheme: () => void;
  setMapTheme: (theme: MapTheme) => void;
  setGpsDistanceAnchor: () => void;
  setCustomDistanceAnchor: (label: string, coordinates: Coordinates) => void;
}
