import {useCallback, useMemo} from 'react';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {Coordinates, Place} from '../../../entities/place/model/types';
import {useTripStore} from '../../../entities/trip/model/tripStore';
import {CATEGORY_MAP} from '../../../shared/config/categories';
import {
  calculateHaversineDistanceKm,
  formatDistance,
} from '../../../shared/lib/location';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../../shared/types/navigation';

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
}

export const useTripPlanner = () => {
  const navigation = useNavigation<TripScreenNavigationProp>();

  const title = useTripStore(state => state.title);
  const setTitle = useTripStore(state => state.setTitle);
  const items = useTripStore(state => state.items);
  const toggleVisited = useTripStore(state => state.toggleVisited);
  const removePlaceFromTrip = useTripStore(state => state.removePlaceFromTrip);
  const clearTrip = useTripStore(state => state.clearTrip);

  const places = usePlacesStore(state => state.places);
  const {coordinates: userCoordinates} = useCurrentLocation();

  const placesById = useMemo(() => {
    const dictionary: Record<string, Place> = {};
    places.forEach(place => {
      dictionary[place.id] = place;
    });
    return dictionary;
  }, [places]);

  const stops: TripStopViewModel[] = useMemo(() => {
    const sorted = [...items].sort((first, second) => first.order - second.order);
    const resolved: TripStopViewModel[] = [];

    sorted.forEach(item => {
      const place = placesById[item.placeId];
      if (!place) {
        return;
      }
      const categoryConfig = CATEGORY_MAP[place.category];
      const distanceKm = calculateHaversineDistanceKm(
        userCoordinates,
        place.coordinates,
      );
      resolved.push({
        placeId: place.id,
        stepNumber: resolved.length + 1,
        title: place.title,
        address: place.address,
        coordinates: place.coordinates,
        categoryLabel: categoryConfig.label,
        categoryBadgeClassName: categoryConfig.badgeClassName,
        categoryTextClassName: categoryConfig.textClassName,
        distanceLabel: formatDistance(distanceKm),
        isVisited: item.isVisited,
      });
    });

    return resolved;
  }, [items, placesById, userCoordinates]);

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
    stops,
    visitedCount,
    totalCount,
    progressPercent,
    toggleVisited,
    removePlaceFromTrip,
    clearTrip,
    handleOpenPlaceDetails,
    handleFocusStopOnMap,
    handleOpenTripOnMap,
    handleBrowsePlaces,
  };
};

