import {Share} from 'react-native';
import {Place} from '../../entities/place/model/types';
import {TripItem} from '../../entities/trip/model/types';

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

