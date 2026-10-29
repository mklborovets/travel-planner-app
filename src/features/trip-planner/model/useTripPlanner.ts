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
  calculateHaversineDistanceKm,
  formatDistance,
} from '../../../shared/lib/location';
import {shareTripSummary} from '../../../shared/lib/share';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../../shared/types/navigation';
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
  const {coordinates: userCoordinates} = useCurrentLocation();
  const distanceAnchorMode = useSettingsStore(
    state => state.distanceAnchorMode,
  );
  const customAnchorCoordinates = useSettingsStore(
    state => state.customAnchorCoordinates,
  );

  const [isTripSelectorVisible, setIsTripSelectorVisible] =
    useState<boolean>(false);
  const [newTripTitle, setNewTripTitle] = useState<string>('');

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
    setIsTripSelectorVisible(false);
  }, [createTrip, newTripTitle, trips.length]);

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

  const handleSortByDistance = useCallback(() => {
    const sortedByDistance = [...items].sort((first, second) => {
      const firstPlace = placesById[first.placeId];
      const secondPlace = placesById[second.placeId];
      if (!firstPlace || !secondPlace) {
        return 0;
      }
      const firstDist = calculateHaversineDistanceKm(
        originCoordinates,
        firstPlace.coordinates,
      );
      const secondDist = calculateHaversineDistanceKm(
        originCoordinates,
        secondPlace.coordinates,
      );
      return firstDist - secondDist;
    });
    reorderTrip(sortedByDistance);
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
    newTripTitle,
    setNewTripTitle,
    handleOpenTripSelector,
    handleCloseTripSelector,
    handleSelectTrip,
    handleCreateNewTrip,
    handleDeleteTrip,
    stops,
    visitedCount,
    totalCount,
    progressPercent,
    toggleVisited,
    handleMoveStopUp,
    handleMoveStopDown,
    handleSortByDistance,
    handleShareTrip,
    removePlaceFromTrip,
    clearTrip,
    handleOpenPlaceDetails,
    handleFocusStopOnMap,
    handleOpenTripOnMap,
    handleBrowsePlaces,
  };
};
