import {useCallback, useEffect, useState} from 'react';
import Geolocation from 'react-native-geolocation-service';
import {Coordinates} from '../../entities/place/model/types';
import {DEFAULT_COORDINATES} from './location';
import {useLocationPermissions} from './useLocationPermissions';

interface SharedLocationSnapshot {
  coordinates: Coordinates;
  hasRealLocation: boolean;
  isLoadingLocation: boolean;
}

let sharedSnapshot: SharedLocationSnapshot = {
  coordinates: DEFAULT_COORDINATES,
  hasRealLocation: false,
  isLoadingLocation: false,
};

let hasInitialFetchStarted = false;
let inFlightPositionPromise: Promise<Coordinates> | null = null;
const snapshotListeners = new Set<
  (snapshot: SharedLocationSnapshot) => void
>();

const updateSharedSnapshot = (partial: Partial<SharedLocationSnapshot>) => {
  sharedSnapshot = {
    ...sharedSnapshot,
    ...partial,
  };
  snapshotListeners.forEach(listener => listener(sharedSnapshot));
};

export interface UseCurrentLocationOptions {
  autoFetch?: boolean;
}

export const useCurrentLocation = (options?: UseCurrentLocationOptions) => {
  const autoFetch = options?.autoFetch ?? true;
  const {
    permissionState,
    isGranted,
    requestLocationPermission,
    openPermissionSettings,
  } = useLocationPermissions();

  const [snapshot, setSnapshot] =
    useState<SharedLocationSnapshot>(sharedSnapshot);

  useEffect(() => {
    snapshotListeners.add(setSnapshot);
    return () => {
      snapshotListeners.delete(setSnapshot);
    };
  }, []);

  const fetchCurrentPosition = useCallback(async (): Promise<Coordinates> => {
    if (inFlightPositionPromise) {
      return inFlightPositionPromise;
    }

    hasInitialFetchStarted = true;
    updateSharedSnapshot({isLoadingLocation: true});

    inFlightPositionPromise = (async () => {
      try {
        const status = await requestLocationPermission();
        if (status !== 'granted') {
          updateSharedSnapshot({
            coordinates: DEFAULT_COORDINATES,
            hasRealLocation: false,
            isLoadingLocation: false,
          });
          return DEFAULT_COORDINATES;
        }

        return await new Promise<Coordinates>(resolve => {
          Geolocation.getCurrentPosition(
            position => {
              const nextCoordinates: Coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              updateSharedSnapshot({
                coordinates: nextCoordinates,
                hasRealLocation: true,
                isLoadingLocation: false,
              });
              resolve(nextCoordinates);
            },
            () => {
              updateSharedSnapshot({
                coordinates: DEFAULT_COORDINATES,
                hasRealLocation: false,
                isLoadingLocation: false,
              });
              resolve(DEFAULT_COORDINATES);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            },
          );
        });
      } finally {
        inFlightPositionPromise = null;
      }
    })();

    return inFlightPositionPromise;
  }, [requestLocationPermission]);

  useEffect(() => {
    if (autoFetch && !hasInitialFetchStarted) {
      fetchCurrentPosition();
    }
  }, [autoFetch, fetchCurrentPosition]);

  return {
    coordinates: snapshot.coordinates,
    hasRealLocation: snapshot.hasRealLocation,
    isLoadingLocation: snapshot.isLoadingLocation,
    permissionState,
    isGranted,
    refreshLocation: fetchCurrentPosition,
    openPermissionSettings,
  };
};
