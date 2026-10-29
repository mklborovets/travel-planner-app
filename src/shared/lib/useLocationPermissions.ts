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

let cachedPermissionState: LocationPermissionState = 'checking';
let inFlightPermissionCheck: Promise<LocationPermissionState> | null = null;
const permissionListeners = new Set<
  (state: LocationPermissionState) => void
>();

const notifyPermissionListeners = (nextState: LocationPermissionState) => {
  cachedPermissionState = nextState;
  permissionListeners.forEach(listener => listener(nextState));
};

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
    useState<LocationPermissionState>(cachedPermissionState);

  useEffect(() => {
    permissionListeners.add(setPermissionState);
    return () => {
      permissionListeners.delete(setPermissionState);
    };
  }, []);

  const checkLocationPermission =
    useCallback(async (): Promise<LocationPermissionState> => {
      if (inFlightPermissionCheck) {
        return inFlightPermissionCheck;
      }
      const permission = getPlatformLocationPermission();
      if (!permission) {
        notifyPermissionListeners('unavailable');
        return 'unavailable';
      }
      inFlightPermissionCheck = (async () => {
        try {
          const result = await check(permission);
          const mapped = mapPermissionStatus(result);
          notifyPermissionListeners(mapped);
          return mapped;
        } catch {
          notifyPermissionListeners('unavailable');
          return 'unavailable';
        } finally {
          inFlightPermissionCheck = null;
        }
      })();
      return inFlightPermissionCheck;
    }, []);

  const requestLocationPermission =
    useCallback(async (): Promise<LocationPermissionState> => {
      const permission = getPlatformLocationPermission();
      if (!permission) {
        notifyPermissionListeners('unavailable');
        return 'unavailable';
      }
      try {
        const current = await check(permission);
        if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) {
          notifyPermissionListeners('granted');
          return 'granted';
        }
        if (current === RESULTS.BLOCKED) {
          notifyPermissionListeners('blocked');
          return 'blocked';
        }
        const requested = await request(permission);
        const mapped = mapPermissionStatus(requested);
        notifyPermissionListeners(mapped);
        return mapped;
      } catch {
        notifyPermissionListeners('unavailable');
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
    if (cachedPermissionState === 'checking') {
      checkLocationPermission();
    }
  }, [checkLocationPermission]);

  return {
    permissionState,
    isGranted: permissionState === 'granted',
    checkLocationPermission,
    requestLocationPermission,
    openPermissionSettings: handleOpenSettings,
  };
};

