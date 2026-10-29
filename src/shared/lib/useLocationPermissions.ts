import {useCallback, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {
  check,
  openSettings,
  Permission,
  PermissionStatus,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';

export type LocationPermissionState =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'checking';

const getPlatformLocationPermission = (): Permission | null => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  }
  if (Platform.OS === 'android') {
    return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  }
  return null;
};

const mapPermissionStatus = (
  status: PermissionStatus,
): LocationPermissionState => {
  switch (status) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.UNAVAILABLE:
    default:
      return 'unavailable';
  }
};

export const useLocationPermissions = () => {
  const [permissionState, setPermissionState] =
    useState<LocationPermissionState>('checking');

  const checkLocationPermission =
    useCallback(async (): Promise<LocationPermissionState> => {
      const permission = getPlatformLocationPermission();
      if (!permission) {
        setPermissionState('unavailable');
        return 'unavailable';
      }
      try {
        const result = await check(permission);
        const mapped = mapPermissionStatus(result);
        setPermissionState(mapped);
        return mapped;
      } catch {
        setPermissionState('unavailable');
        return 'unavailable';
      }
    }, []);

  const requestLocationPermission =
    useCallback(async (): Promise<LocationPermissionState> => {
      const permission = getPlatformLocationPermission();
      if (!permission) {
        setPermissionState('unavailable');
        return 'unavailable';
      }
      try {
        const current = await check(permission);
        if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) {
          setPermissionState('granted');
          return 'granted';
        }
        if (current === RESULTS.BLOCKED) {
          setPermissionState('blocked');
          return 'blocked';
        }
        const requested = await request(permission);
        const mapped = mapPermissionStatus(requested);
        setPermissionState(mapped);
        return mapped;
      } catch {
        setPermissionState('unavailable');
        return 'unavailable';
      }
    }, []);

  const handleOpenSettings = useCallback(async (): Promise<void> => {
    try {
      await openSettings();
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    checkLocationPermission();
  }, [checkLocationPermission]);

  return {
    permissionState,
    isGranted: permissionState === 'granted',
    checkLocationPermission,
    requestLocationPermission,
    openPermissionSettings: handleOpenSettings,
  };
};
