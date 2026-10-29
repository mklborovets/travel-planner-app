import {Clipboard, Share} from 'react-native';
import {Place} from '../../entities/place/model/types';
import {TripItem} from '../../entities/trip/model/types';

export const copyTextToClipboard = (text: string): void => {
  try {
    Clipboard.setString(text);
  } catch {
    return;
  }
};

export const buildPlaceMapUrl = (
  latitude: number,
  longitude: number,
): string => {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

export const formatPlaceShareMessage = (place: Place): string => {
  const mapUrl = buildPlaceMapUrl(
    place.coordinates.latitude,
    place.coordinates.longitude,
  );
  const lines = [
    place.title,
    `Address: ${place.address}`,
    `Coordinates: ${place.coordinates.latitude.toFixed(5)}, ${place.coordinates.longitude.toFixed(5)}`,
    `Map: ${mapUrl}`,
  ];
  return lines.join('\n');
};

export const sharePlaceDetails = async (place: Place): Promise<void> => {
  const message = formatPlaceShareMessage(place);
  await Share.share({
    title: place.title,
    message,
  });
};

export const formatTripShareMessage = (
  tripTitle: string,
  items: TripItem[],
  placesById: Record<string, Place>,
): string => {
  const ordered = [...items].sort((first, second) => first.order - second.order);
  const lines = ordered
    .map((item, index) => {
      const place = placesById[item.placeId];
      if (!place) {
        return null;
      }
      const statusText = item.isVisited ? '[Visited]' : '[Planned]';
      return `${index + 1}. ${statusText} ${place.title} - ${place.address}`;
    })
    .filter((line): line is string => Boolean(line));

  return `${tripTitle}\n\n${lines.join('\n')}`;
};

export const shareTripSummary = async (
  tripTitle: string,
  items: TripItem[],
  placesById: Record<string, Place>,
): Promise<void> => {
  const message = formatTripShareMessage(tripTitle, items, placesById);
  await Share.share({
    title: tripTitle,
    message,
  });
};
