import {useCallback, useEffect, useState} from 'react';
import Geolocation from 'react-native-geolocation-service';
import {Coordinates} from '../../entities/place/model/types';
import {DEFAULT_COORDINATES} from './location';
import {useLocationPermissions} from './useLocationPermissions';

export const useCurrentLocation = () => {
  const {
    permissionState,
    isGranted,
    requestLocationPermission,
    openPermissionSettings,
  } = useLocationPermissions();

  const [coordinates, setCoordinates] =
    useState<Coordinates>(DEFAULT_COORDINATES);
  const [hasRealLocation, setHasRealLocation] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  const fetchCurrentPosition = useCallback(async () => {
    setIsLoadingLocation(true);
    const status = await requestLocationPermission();
    if (status !== 'granted') {
      setCoordinates(DEFAULT_COORDINATES);
      setHasRealLocation(false);
      setIsLoadingLocation(false);
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setHasRealLocation(true);
        setIsLoadingLocation(false);
      },
      () => {
        setCoordinates(DEFAULT_COORDINATES);
        setHasRealLocation(false);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }, [requestLocationPermission]);

  useEffect(() => {
    fetchCurrentPosition();
  }, [fetchCurrentPosition]);

  return {
    coordinates,
    hasRealLocation,
    isLoadingLocation,
    permissionState,
    isGranted,
    refreshLocation: fetchCurrentPosition,
    openPermissionSettings,
  };
};

