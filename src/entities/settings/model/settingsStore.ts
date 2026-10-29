import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from '../../../shared/storage/storage';
import {MapTheme, SettingsState} from './types';

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      mapTheme: 'standard',
      toggleMapTheme: () => {
        set(state => ({
          mapTheme: state.mapTheme === 'standard' ? 'dark' : 'standard',
        }));
      },
      setMapTheme: (theme: MapTheme) => {
        set({mapTheme: theme});
      },
    }),
    {
      name: 'settings-storage',
      storage: zustandStorage,
    },
  ),
);

