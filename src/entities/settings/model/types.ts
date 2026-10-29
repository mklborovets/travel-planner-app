export type MapTheme = 'standard' | 'dark';

export interface SettingsState {
  mapTheme: MapTheme;
  toggleMapTheme: () => void;
  setMapTheme: (theme: MapTheme) => void;
}

