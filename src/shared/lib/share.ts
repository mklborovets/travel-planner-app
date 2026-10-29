import {
  NativeModules,
  Share,
  TurboModule,
  TurboModuleRegistry,
} from 'react-native';
import {Coordinates, Place} from '../../entities/place/model/types';
import {TripItem} from '../../entities/trip/model/types';

interface NativeClipboardSpec extends TurboModule {
  getString: () => Promise<string>;
  setString: (content: string) => void;
}

let inMemoryClipboardFallback = '';

const getNativeClipboardModule = (): NativeClipboardSpec | null => {
  try {
    const turbo = TurboModuleRegistry.get<NativeClipboardSpec>('Clipboard');
    if (turbo) {
      return turbo;
    }
  } catch {}
  const legacy = (NativeModules as {Clipboard?: NativeClipboardSpec}).Clipboard;
  return legacy ?? null;
};

export const copyTextToClipboard = (text: string): void => {
  inMemoryClipboardFallback = text;
  try {
    const clipboardModule = getNativeClipboardModule();
    clipboardModule?.setString(text);
  } catch {
    return;
  }
};

export const readTextFromClipboard = async (): Promise<string> => {
  try {
    const clipboardModule = getNativeClipboardModule();
    if (clipboardModule?.getString) {
      const text = await clipboardModule.getString();
      if (text && text.trim().length > 0) {
        return text;
      }
    }
  } catch {
    return inMemoryClipboardFallback;
  }
  return inMemoryClipboardFallback;
};

export const buildPlaceMapUrl = (
  coordinates: Coordinates,
  title?: string,
  address?: string,
): string => {
  const cleanTitle = title?.trim();
  const cleanAddress = address?.trim();
  const searchTarget =
    cleanTitle && cleanAddress
      ? `${cleanTitle}, ${cleanAddress}`
      : cleanTitle ||
        cleanAddress ||
        `${coordinates.latitude},${coordinates.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    searchTarget,
  )}`;
};

export const formatPlaceShareMessage = (place: Place): string => {
  const mapUrl = buildPlaceMapUrl(
    place.coordinates,
    place.title,
    place.address,
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
  const ordered = [...items].sort(
    (first, second) => first.order - second.order,
  );
  let visitedCount = 0;

  const stopBlocks = ordered
    .map((item, index) => {
      const place = placesById[item.placeId];
      if (!place) {
        return null;
      }
      if (item.isVisited) {
        visitedCount += 1;
      }
      const statusText = item.isVisited ? '[Visited]' : '[Planned]';
      const mapUrl = buildPlaceMapUrl(
        place.coordinates,
        place.title,
        place.address,
      );
      return [
        `#${index + 1} ${statusText} ${place.title}`,
        `   Address: ${place.address}`,
        `   Map: ${mapUrl}`,
      ].join('\n');
    })
    .filter((block): block is string => Boolean(block));

  const header = `${tripTitle} (${visitedCount}/${stopBlocks.length} visited)`;
  if (stopBlocks.length === 0) {
    return `${header}\n\nNo stops added yet.`;
  }
  return `${header}\n\n${stopBlocks.join('\n\n')}`;
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
