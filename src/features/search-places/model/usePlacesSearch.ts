import {useCallback, useMemo, useState} from 'react';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {
  mapNominatimResultToPlace,
  searchNominatimPlaces,
} from '../../../entities/place/api/placesApi';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {Place} from '../../../entities/place/model/types';
import {useTripStore} from '../../../entities/trip/model/tripStore';
import {CATEGORY_MAP} from '../../../shared/config/categories';
import {formatCoordinates} from '../../../shared/lib/location';
import {useDebounce} from '../../../shared/lib/useDebounce';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../../shared/types/navigation';

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'SearchTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export interface SearchPlaceViewModel {
  place: Place;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  formattedCoordinates: string;
  isSaved: boolean;
  isInTrip: boolean;
}

export const usePlacesSearch = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 450);

  const savedPlaces = usePlacesStore(state => state.places);
  const upsertPlace = usePlacesStore(state => state.upsertPlace);
  const tripItems = useTripStore(state => state.items);
  const addPlaceToTrip = useTripStore(state => state.addPlaceToTrip);

  const normalizedQuery = debouncedQuery.trim();
  const hasMinQueryLength = normalizedQuery.length >= 2;

  const queryResult = useQuery({
    queryKey: ['nominatim-search', normalizedQuery],
    queryFn: () => searchNominatimPlaces(normalizedQuery),
    enabled: hasMinQueryLength,
  });

  const savedIdsSet = useMemo(
    () => new Set(savedPlaces.map(place => place.id)),
    [savedPlaces],
  );

  const tripIdsSet = useMemo(
    () => new Set(tripItems.map(item => item.placeId)),
    [tripItems],
  );

  const results: SearchPlaceViewModel[] = useMemo(() => {
    if (!queryResult.data) {
      return [];
    }
    return queryResult.data.map(rawItem => {
      const mappedPlace = mapNominatimResultToPlace(rawItem);
      const categoryConfig = CATEGORY_MAP[mappedPlace.category];
      return {
        place: mappedPlace,
        categoryLabel: categoryConfig.label,
        categoryBadgeClassName: categoryConfig.badgeClassName,
        categoryTextClassName: categoryConfig.textClassName,
        formattedCoordinates: formatCoordinates(mappedPlace.coordinates),
        isSaved: savedIdsSet.has(mappedPlace.id),
        isInTrip: tripIdsSet.has(mappedPlace.id),
      };
    });
  }, [queryResult.data, savedIdsSet, tripIdsSet]);

  const handleSavePlace = useCallback(
    (place: Place) => {
      upsertPlace(place);
    },
    [upsertPlace],
  );

  const handleSaveAndAddToTrip = useCallback(
    (place: Place) => {
      upsertPlace(place);
      addPlaceToTrip(place.id);
    },
    [upsertPlace, addPlaceToTrip],
  );

  const handleOpenResultDetails = useCallback(
    (place: Place) => {
      upsertPlace(place);
      navigation.navigate('PlaceDetails', {placeId: place.id});
    },
    [upsertPlace, navigation],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleRetry = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  return {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    hasMinQueryLength,
    results,
    isLoading: hasMinQueryLength && (queryResult.isLoading || queryResult.isFetching),
    isError: hasMinQueryLength && queryResult.isError,
    errorMessage:
      queryResult.error instanceof Error
        ? queryResult.error.message
        : 'Unable to fetch places from OpenStreetMap.',
    handleRetry,
    handleSavePlace,
    handleSaveAndAddToTrip,
    handleOpenResultDetails,
  };
};
