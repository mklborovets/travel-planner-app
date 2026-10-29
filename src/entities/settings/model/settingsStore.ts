import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {DEFAULT_COORDINATES} from '../../../shared/lib/location';
import {zustandStorage} from '../../../shared/storage/storage';
import {Coordinates} from '../../place/model/types';
import {MapTheme, SettingsState} from './types';

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      mapTheme: 'standard',
      distanceAnchorMode: 'gps',
      customAnchorLabel: 'Lviv',
      customAnchorCoordinates: DEFAULT_COORDINATES,
      toggleMapTheme: () => {
        set(state => ({
          mapTheme: state.mapTheme === 'standard' ? 'dark' : 'standard',
        }));
      },
      setMapTheme: (theme: MapTheme) => {
        set({mapTheme: theme});
      },
      setGpsDistanceAnchor: () => {
        set({distanceAnchorMode: 'gps'});
      },
      setCustomDistanceAnchor: (label: string, coordinates: Coordinates) => {
        set({
          distanceAnchorMode: 'custom',
          customAnchorLabel: label,
          customAnchorCoordinates: coordinates,
        });
      },
    }),
    {
      name: 'settings-storage',
      storage: zustandStorage,
    },
  ),
);
