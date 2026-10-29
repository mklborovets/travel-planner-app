import {Coordinates, Place} from '../../entities/place/model/types';
import {TripItem} from '../../entities/trip/model/types';

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

export const calculateBoundingBoxViewbox = (
  center: Coordinates,
  radiusKm: number,
): string => {
  const latDelta = radiusKm / 111.32;
  const cosLat = Math.max(Math.cos(degreesToRadians(center.latitude)), 0.01);
  const lonDelta = radiusKm / (111.32 * cosLat);

  const minLon = Math.max(center.longitude - lonDelta, -180);
  const maxLon = Math.min(center.longitude + lonDelta, 180);
  const minLat = Math.max(center.latitude - latDelta, -90);
  const maxLat = Math.min(center.latitude + latDelta, 90);

  return `${minLon.toFixed(5)},${maxLat.toFixed(5)},${maxLon.toFixed(5)},${minLat.toFixed(5)}`;
};

export interface ParsedCoordinateStrings {
  latitude: string;
  longitude: string;
}

export const parseCoordinatePairInput = (
  rawInput: string,
): ParsedCoordinateStrings | null => {
  if (
    !rawInput.includes(',') &&
    !rawInput.includes(';') &&
    !/\s/.test(rawInput.trim())
  ) {
    return null;
  }

  const cleaned = rawInput.replace(/[()[\]]/g, '').trim();
  const match = cleaned.match(
    /^([+-]?\d+(?:\.\d+)?)\s*(?:[,;]|\s+)\s*([+-]?\d+(?:\.\d+)?)$/,
  );

  if (!match) {
    return null;
  }

  const latNum = Number(match[1]);
  const lonNum = Number(match[2]);

  if (
    Number.isNaN(latNum) ||
    Number.isNaN(lonNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lonNum < -180 ||
    lonNum > 180
  ) {
    return null;
  }

  return {
    latitude: match[1],
    longitude: match[2],
  };
};

export const buildNearestNeighborTripOrder = (
  items: TripItem[],
  placesById: Record<string, Place>,
  startPlaceId: string,
): TripItem[] => {
  const validItems = items.filter(item => Boolean(placesById[item.placeId]));
  if (validItems.length <= 1) {
    return items;
  }

  const remaining = [...validItems];
  const startIndex = remaining.findIndex(
    item => item.placeId === startPlaceId,
  );
  const firstItem =
    startIndex >= 0 ? remaining.splice(startIndex, 1)[0] : remaining.shift()!;

  const orderedChain: TripItem[] = [firstItem];

  while (remaining.length > 0) {
    const currentLast = orderedChain[orderedChain.length - 1];
    const currentPlace = placesById[currentLast.placeId];
    if (!currentPlace) {
      orderedChain.push(...remaining);
      break;
    }

    let closestIdx = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    remaining.forEach((candidate, idx) => {
      const candidatePlace = placesById[candidate.placeId];
      if (!candidatePlace) {
        return;
      }
      const dist = calculateHaversineDistanceKm(
        currentPlace.coordinates,
        candidatePlace.coordinates,
      );
      if (dist < closestDistance) {
        closestDistance = dist;
        closestIdx = idx;
      }
    });

    const nextStop = remaining.splice(closestIdx, 1)[0];
    orderedChain.push(nextStop);
  }

  return orderedChain.map((item, index) => ({
    ...item,
    order: index,
  }));
};
