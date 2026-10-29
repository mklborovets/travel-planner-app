import {useCallback, useMemo, useState} from 'react';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {Coordinates, Place} from '../../../entities/place/model/types';
import {useSettingsStore} from '../../../entities/settings/model/settingsStore';
import {useTripStore} from '../../../entities/trip/model/tripStore';
import {CATEGORY_MAP} from '../../../shared/config/categories';
import {
  buildNearestNeighborTripOrder,
  calculateHaversineDistanceKm,
  formatDistance,
} from '../../../shared/lib/location';
import {
  copyTripExportToClipboard,
  parseImportedTripText,
  readTextFromClipboard,
  shareTripSummary,
} from '../../../shared/lib/share';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../../shared/types/navigation';
import {RouteStartCandidate} from '../../../widgets/route-builder-modal/ui/RouteBuilderModal';
import {TripSummaryOption} from '../../../widgets/trip-selector-modal/ui/TripSelectorModal';

type TripScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'TripTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export interface TripStopViewModel {
  placeId: string;
  stepNumber: number;
  title: string;
  address: string;
  coordinates: Coordinates;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  distanceLabel: string;
  isVisited: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const useTripPlanner = () => {
  const navigation = useNavigation<TripScreenNavigationProp>();

  const trips = useTripStore(state => state.trips);
  const activeTripId = useTripStore(state => state.activeTripId);
  const title = useTripStore(state => state.title);
  const setTitle = useTripStore(state => state.setTitle);
  const items = useTripStore(state => state.items);
  const createTrip = useTripStore(state => state.createTrip);
  const selectTrip = useTripStore(state => state.selectTrip);
  const deleteTrip = useTripStore(state => state.deleteTrip);
  const toggleVisited = useTripStore(state => state.toggleVisited);
  const moveTripItem = useTripStore(state => state.moveTripItem);
  const reorderTrip = useTripStore(state => state.reorderTrip);
  const removePlaceFromTrip = useTripStore(state => state.removePlaceFromTrip);
  const clearTrip = useTripStore(state => state.clearTrip);

  const places = usePlacesStore(state => state.places);
  const upsertPlace = usePlacesStore(state => state.upsertPlace);
  const {coordinates: userCoordinates} = useCurrentLocation();
  const distanceAnchorMode = useSettingsStore(
    state => state.distanceAnchorMode,
  );
  const customAnchorCoordinates = useSettingsStore(
    state => state.customAnchorCoordinates,
  );

  const [isTripSelectorVisible, setIsTripSelectorVisible] =
    useState<boolean>(false);
  const [isRouteBuilderVisible, setIsRouteBuilderVisible] =
    useState<boolean>(false);
  const [isAnyRowDragging, setIsAnyRowDragging] = useState<boolean>(false);
  const [newTripTitle, setNewTripTitle] = useState<string>('');
  const [importTextInput, setImportTextInput] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<
    string | null
  >(null);
  const [copiedTripId, setCopiedTripId] = useState<string | null>(null);

  const originCoordinates =
    distanceAnchorMode === 'custom' ? customAnchorCoordinates : userCoordinates;

  const placesById = useMemo(() => {
    const dictionary: Record<string, Place> = {};
    places.forEach(place => {
      dictionary[place.id] = place;
    });
    return dictionary;
  }, [places]);

  const tripSummaries: TripSummaryOption[] = useMemo(() => {
    return trips.map(trip => {
      const validItems = trip.items.filter(item =>
        Boolean(placesById[item.placeId]),
      );
      const visited = validItems.filter(item => item.isVisited).length;
      return {
        id: trip.id,
        title: trip.title,
        stopsCount: validItems.length,
        visitedCount: visited,
        isActive: trip.id === activeTripId,
      };
    });
  }, [trips, placesById, activeTripId]);

  const stops: TripStopViewModel[] = useMemo(() => {
    const sorted = [...items].sort(
      (first, second) => first.order - second.order,
    );
    const validPairs: {
      item: (typeof sorted)[number];
      place: Place;
    }[] = [];

    sorted.forEach(item => {
      const place = placesById[item.placeId];
      if (place) {
        validPairs.push({item, place});
      }
    });

    return validPairs.map(({item, place}, index) => {
      const categoryConfig = CATEGORY_MAP[place.category];
      const distanceKm = calculateHaversineDistanceKm(
        originCoordinates,
        place.coordinates,
      );
      return {
        placeId: place.id,
        stepNumber: index + 1,
        title: place.title,
        address: place.address,
        coordinates: place.coordinates,
        categoryLabel: categoryConfig.label,
        categoryBadgeClassName: categoryConfig.badgeClassName,
        categoryTextClassName: categoryConfig.textClassName,
        distanceLabel: formatDistance(distanceKm),
        isVisited: item.isVisited,
        canMoveUp: index > 0,
        canMoveDown: index < validPairs.length - 1,
      };
    });
  }, [items, placesById, originCoordinates]);

  const routeCandidates: RouteStartCandidate[] = useMemo(() => {
    return stops.map(stop => ({
      placeId: stop.placeId,
      title: stop.title,
      address: stop.address,
      distanceFromUserLabel: stop.distanceLabel,
    }));
  }, [stops]);

  const totalCount = stops.length;
  const visitedCount = useMemo(
    () => stops.filter(stop => stop.isVisited).length,
    [stops],
  );
  const progressPercent = useMemo(() => {
    if (totalCount === 0) {
      return 0;
    }
    return Math.round((visitedCount / totalCount) * 100);
  }, [visitedCount, totalCount]);

  const handleOpenTripSelector = useCallback(() => {
    setImportError(null);
    setImportSuccessMessage(null);
    setIsTripSelectorVisible(true);
  }, []);

  const handleCloseTripSelector = useCallback(() => {
    setIsTripSelectorVisible(false);
  }, []);

  const handleSelectTrip = useCallback(
    (tripId: string) => {
      selectTrip(tripId);
      setIsTripSelectorVisible(false);
    },
    [selectTrip],
  );

  const handleCreateNewTrip = useCallback(() => {
    const fallbackTitle = `Trip #${trips.length + 1}`;
    createTrip(newTripTitle.trim() || fallbackTitle);
    setNewTripTitle('');
    setImportError(null);
    setIsTripSelectorVisible(false);
  }, [createTrip, newTripTitle, trips.length]);

  const handleCopyTripExport = useCallback(
    (tripId: string) => {
      const targetTrip = trips.find(item => item.id === tripId);
      if (!targetTrip) {
        return;
      }
      copyTripExportToClipboard(
        targetTrip.title,
        targetTrip.items,
        placesById,
      );
      setCopiedTripId(tripId);
      setImportError(null);
      setImportSuccessMessage(
        `Copied "${targetTrip.title}" export to clipboard!`,
      );
      setTimeout(() => {
        setCopiedTripId(null);
      }, 2000);
    },
    [trips, placesById],
  );

  const handleImportFromClipboard = useCallback(async () => {
    setImportError(null);
    setImportSuccessMessage(null);

    const manualText = importTextInput.trim();
    const rawSource =
      manualText.length > 0 ? manualText : await readTextFromClipboard();

    const parsedResult = parseImportedTripText(rawSource);
    if (!parsedResult.ok) {
      setImportError(parsedResult.error);
      return;
    }

    const {payload} = parsedResult;
    const importedTripItems = payload.stops.map((stop, index) => {
      upsertPlace({
        id: stop.id,
        title: stop.title,
        address: stop.address,
        description: stop.description,
        category: stop.category,
        coordinates: stop.coordinates,
        isFavorite: false,
        createdAt: Date.now(),
      });
      return {
        placeId: stop.id,
        isVisited: stop.isVisited,
        order: index,
        addedAt: Date.now() + index,
      };
    });

    createTrip(payload.title);
    reorderTrip(importedTripItems);
    setImportTextInput('');
    setImportSuccessMessage(
      `Imported "${payload.title}" (${importedTripItems.length} stops)!`,
    );
  }, [importTextInput, upsertPlace, createTrip, reorderTrip]);

  const handleDeleteTrip = useCallback(
    (tripId: string) => {
      deleteTrip(tripId);
    },
    [deleteTrip],
  );

  const handleMoveStopUp = useCallback(
    (placeId: string) => {
      moveTripItem(placeId, 'up');
    },
    [moveTripItem],
  );

  const handleMoveStopDown = useCallback(
    (placeId: string) => {
      moveTripItem(placeId, 'down');
    },
    [moveTripItem],
  );

  const handleOpenRouteBuilder = useCallback(() => {
    setIsRouteBuilderVisible(true);
  }, []);

  const handleCloseRouteBuilder = useCallback(() => {
    setIsRouteBuilderVisible(false);
  }, []);

  const handleBuildRouteFromPlace = useCallback(
    (startPlaceId: string) => {
      const ordered = buildNearestNeighborTripOrder(
        items,
        placesById,
        startPlaceId,
      );
      reorderTrip(ordered);
      setIsRouteBuilderVisible(false);
    },
    [items, placesById, reorderTrip],
  );

  const handleBuildRouteFromNearestToMe = useCallback(() => {
    let closestPlaceId: string | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    items.forEach(item => {
      const place = placesById[item.placeId];
      if (!place) {
        return;
      }
      const dist = calculateHaversineDistanceKm(
        originCoordinates,
        place.coordinates,
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestPlaceId = place.id;
      }
    });

    if (closestPlaceId) {
      const ordered = buildNearestNeighborTripOrder(
        items,
        placesById,
        closestPlaceId,
      );
      reorderTrip(ordered);
    }
    setIsRouteBuilderVisible(false);
  }, [items, placesById, originCoordinates, reorderTrip]);

  const handleShareTrip = useCallback(async () => {
    await shareTripSummary(title, items, placesById);
  }, [title, items, placesById]);

  const handleOpenPlaceDetails = useCallback(
    (placeId: string) => {
      navigation.navigate('PlaceDetails', {placeId});
    },
    [navigation],
  );

  const handleFocusStopOnMap = useCallback(
    (placeId: string, coordinates: Coordinates) => {
      navigation.navigate('MapTab', {
        focusCoordinates: coordinates,
        selectedPlaceId: placeId,
        focusTimestamp: Date.now(),
      });
    },
    [navigation],
  );

  const handleOpenTripOnMap = useCallback(() => {
    const firstUnvisited = stops.find(stop => !stop.isVisited) ?? stops[0];
    if (firstUnvisited) {
      navigation.navigate('MapTab', {
        focusCoordinates: firstUnvisited.coordinates,
        selectedPlaceId: firstUnvisited.placeId,
        focusTimestamp: Date.now(),
      });
      return;
    }
    navigation.navigate('MapTab');
  }, [navigation, stops]);

  const handleBrowsePlaces = useCallback(() => {
    navigation.navigate('SearchTab');
  }, [navigation]);

  return {
    title,
    setTitle,
    tripSummaries,
    canDeleteTrips: trips.length > 1,
    isTripSelectorVisible,
    isRouteBuilderVisible,
    isAnyRowDragging,
    setIsAnyRowDragging,
    newTripTitle,
    setNewTripTitle,
    importTextInput,
    setImportTextInput,
    importError,
    importSuccessMessage,
    copiedTripId,
    routeCandidates,
    handleOpenTripSelector,
    handleCloseTripSelector,
    handleSelectTrip,
    handleCreateNewTrip,
    handleCopyTripExport,
    handleImportFromClipboard,
    handleDeleteTrip,
    stops,
    visitedCount,
    totalCount,
    progressPercent,
    toggleVisited,
    handleMoveStopUp,
    handleMoveStopDown,
    handleOpenRouteBuilder,
    handleCloseRouteBuilder,
    handleBuildRouteFromPlace,
    handleBuildRouteFromNearestToMe,
    handleShareTrip,
    removePlaceFromTrip,
    clearTrip,
    handleOpenPlaceDetails,
    handleFocusStopOnMap,
    handleOpenTripOnMap,
    handleBrowsePlaces,
  };
};
