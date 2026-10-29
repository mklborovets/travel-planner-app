import {useCallback, useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  mapNominatimResultToPlace,
  searchNominatimPlaces,
} from '../../../entities/place/api/placesApi';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {Place} from '../../../entities/place/model/types';
import {useTripStore} from '../../../entities/trip/model/tripStore';
import {useDebounce} from '../../../shared/lib/useDebounce';

export interface SearchPlaceViewModel {
  place: Place;
  isSaved: boolean;
  isInTrip: boolean;
}

export const usePlacesSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 450);

  const savedPlaces = usePlacesStore(state => state.places);
  const upsertPlace = usePlacesStore(state => state.upsertPlace);
  const tripItems = useTripStore(state => state.items);
  const addPlaceToTrip = useTripStore(state => state.addPlaceToTrip);

  const normalizedQuery = debouncedQuery.trim();

  const queryResult = useQuery({
    queryKey: ['nominatim-search', normalizedQuery],
    queryFn: () => searchNominatimPlaces(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
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
      return {
        place: mappedPlace,
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

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    debouncedQuery: normalizedQuery,
    results,
    isLoading: queryResult.isLoading || queryResult.isFetching,
    isError: queryResult.isError,
    errorMessage:
      queryResult.error instanceof Error
        ? queryResult.error.message
        : 'Unable to fetch places from OpenStreetMap.',
    refetch: queryResult.refetch,
    handleSavePlace,
    handleSaveAndAddToTrip,
  };
};
