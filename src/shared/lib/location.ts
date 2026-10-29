import {Coordinates} from '../../entities/place/model/types';

export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 49.8397,
  longitude: 24.0297,
};

export const DEFAULT_MAP_DELTA = {
  latitudeDelta: 0.045,
  longitudeDelta: 0.045,
};

const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const calculateHaversineDistanceKm = (
  origin: Coordinates,
  destination: Coordinates,
): number => {
  const earthRadiusKm = 6371;
  const deltaLat = degreesToRadians(destination.latitude - origin.latitude);
  const deltaLon = degreesToRadians(destination.longitude - origin.longitude);
  const originLatRad = degreesToRadians(origin.latitude);
  const destinationLatRad = degreesToRadians(destination.latitude);

  const halfChordLengthSquared =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(originLatRad) *
      Math.cos(destinationLatRad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(halfChordLengthSquared),
      Math.sqrt(1 - halfChordLengthSquared),
    );

  return earthRadiusKm * angularDistance;
};

export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

export const formatCoordinates = (coordinates: Coordinates): string => {
  return `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
};

