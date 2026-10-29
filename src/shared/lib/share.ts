import {
  NativeModules,
  Share,
  TurboModule,
  TurboModuleRegistry,
} from 'react-native';
import {
  Coordinates,
  Place,
  PlaceCategory,
} from '../../entities/place/model/types';
import {TripItem} from '../../entities/trip/model/types';
import {CATEGORY_MAP} from '../config/categories';

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

const TRIP_EXPORT_START_TAG = '---TRIP_DATA_START---';
const TRIP_EXPORT_END_TAG = '---TRIP_DATA_END---';

export interface ExportedTripStopData {
  id: string;
  title: string;
  address: string;
  description?: string;
  category: PlaceCategory;
  coordinates: Coordinates;
  isVisited: boolean;
}

export interface ExportedTripPayload {
  version: 1;
  title: string;
  stops: ExportedTripStopData[];
}

export type ParseTripImportResult =
  | {ok: true; payload: ExportedTripPayload}
  | {ok: false; error: string};

export const formatTripShareMessage = (
  tripTitle: string,
  items: TripItem[],
  placesById: Record<string, Place>,
): string => {
  const ordered = [...items].sort(
    (first, second) => first.order - second.order,
  );
  let visitedCount = 0;
  const exportedStops: ExportedTripStopData[] = [];

  const stopBlocks = ordered
    .map((item, index) => {
      const place = placesById[item.placeId];
      if (!place) {
        return null;
      }
      if (item.isVisited) {
        visitedCount += 1;
      }
      exportedStops.push({
        id: place.id,
        title: place.title,
        address: place.address,
        description: place.description,
        category: place.category,
        coordinates: place.coordinates,
        isVisited: item.isVisited,
      });

      const statusText = item.isVisited ? '[Visited]' : '[Planned]';
      const mapUrl = buildPlaceMapUrl(
        place.coordinates,
        place.title,
        place.address,
      );
      return [
        `#${index + 1} ${statusText} ${place.title}`,
        `   Address: ${place.address}`,
        `   Coordinates: ${place.coordinates.latitude.toFixed(5)}, ${place.coordinates.longitude.toFixed(5)}`,
        `   Map: ${mapUrl}`,
      ].join('\n');
    })
    .filter((block): block is string => Boolean(block));

  const payload: ExportedTripPayload = {
    version: 1,
    title: tripTitle,
    stops: exportedStops,
  };
  const serializedPayload = `${TRIP_EXPORT_START_TAG}\n${JSON.stringify(payload)}\n${TRIP_EXPORT_END_TAG}`;

  const header = `${tripTitle} (${visitedCount}/${stopBlocks.length} visited)`;
  if (stopBlocks.length === 0) {
    return `${header}\n\nNo stops added yet.\n\n${serializedPayload}`;
  }
  return `${header}\n\n${stopBlocks.join('\n\n')}\n\n${serializedPayload}`;
};

export const copyTripExportToClipboard = (
  tripTitle: string,
  items: TripItem[],
  placesById: Record<string, Place>,
): void => {
  const message = formatTripShareMessage(tripTitle, items, placesById);
  copyTextToClipboard(message);
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

const isValidCategory = (value: string): value is PlaceCategory => {
  return Object.prototype.hasOwnProperty.call(CATEGORY_MAP, value);
};

export const parseImportedTripText = (
  rawText: string,
): ParseTripImportResult => {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      ok: false,
      error:
        'Clipboard is empty. Copy an exported trip first or paste it into the field.',
    };
  }

  const startIdx = trimmed.indexOf(TRIP_EXPORT_START_TAG);
  const endIdx = trimmed.indexOf(TRIP_EXPORT_END_TAG);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonSegment = trimmed
      .slice(startIdx + TRIP_EXPORT_START_TAG.length, endIdx)
      .trim();
    try {
      const parsed = JSON.parse(jsonSegment) as Partial<ExportedTripPayload>;
      if (
        !parsed ||
        typeof parsed.title !== 'string' ||
        !Array.isArray(parsed.stops)
      ) {
        return {
          ok: false,
          error: 'Imported trip format is invalid: missing title or stops list.',
        };
      }

      const validStops: ExportedTripStopData[] = [];
      for (const stop of parsed.stops) {
        if (
          !stop ||
          typeof stop.title !== 'string' ||
          typeof stop.address !== 'string' ||
          !stop.coordinates ||
          typeof stop.coordinates.latitude !== 'number' ||
          typeof stop.coordinates.longitude !== 'number'
        ) {
          return {
            ok: false,
            error:
              'One or more stops in the imported trip have corrupted coordinates or titles.',
          };
        }
        validStops.push({
          id:
            typeof stop.id === 'string' && stop.id.trim().length > 0
              ? stop.id
              : `imported-${Date.now()}-${validStops.length}`,
          title: stop.title.trim(),
          address: stop.address.trim(),
          description:
            typeof stop.description === 'string' ? stop.description : undefined,
          category:
            typeof stop.category === 'string' && isValidCategory(stop.category)
              ? stop.category
              : 'sightseeing',
          coordinates: {
            latitude: stop.coordinates.latitude,
            longitude: stop.coordinates.longitude,
          },
          isVisited: Boolean(stop.isVisited),
        });
      }

      return {
        ok: true,
        payload: {
          version: 1,
          title: parsed.title.trim() || 'Imported Trip',
          stops: validStops,
        },
      };
    } catch {
      return {
        ok: false,
        error: 'Trip data block is corrupted (invalid JSON syntax).',
      };
    }
  }

  return {
    ok: false,
    error:
      'No valid Trip export data found. Use the Share or Copy Export button on a Trip first.',
  };
};
