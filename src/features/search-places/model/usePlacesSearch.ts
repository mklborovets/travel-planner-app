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
import {
  Coordinates,
  NominatimSearchOptions,
  Place,
  SearchRadiusKm,
  SearchScopeMode,
} from '../../../entities/place/model/types';
import {useSettingsStore} from '../../../entities/settings/model/settingsStore';
import {useTripStore} from '../../../entities/trip/model/tripStore';
import {
  CATEGORY_MAP,
  CityAnchorPreset,
  DISTANCE_ANCHOR_CITY_PRESETS,
} from '../../../shared/config/categories';
import {COUNTRY_FILTER_PRESETS} from '../../../shared/config/searchOptions';
import {
  DEFAULT_COORDINATES,
  formatCoordinates,
} from '../../../shared/lib/location';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
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

  const [scopeMode, setScopeMode] = useState<SearchScopeMode>('worldwide');
  const [countryCode, setCountryCode] = useState<string>('ua');
  const [selectedCityLabel, setSelectedCityLabel] = useState<string>('Lviv');
  const [selectedCityCoordinates, setSelectedCityCoordinates] =
    useState<Coordinates>(DEFAULT_COORDINATES);
  const [radiusKm, setRadiusKm] = useState<SearchRadiusKm>(15);
  const [isScopeModalVisible, setIsScopeModalVisible] =
    useState<boolean>(false);
  const [customCityInput, setCustomCityInput] = useState<string>('');
  const [isSearchingCity, setIsSearchingCity] = useState<boolean>(false);
  const [citySearchError, setCitySearchError] = useState<string | null>(null);

  const savedPlaces = usePlacesStore(state => state.places);
  const upsertPlace = usePlacesStore(state => state.upsertPlace);
  const tripItems = useTripStore(state => state.items);
  const addPlaceToTrip = useTripStore(state => state.addPlaceToTrip);

  const {coordinates: userCoordinates} = useCurrentLocation();
  const distanceAnchorMode = useSettingsStore(
    state => state.distanceAnchorMode,
  );
  const customAnchorLabel = useSettingsStore(state => state.customAnchorLabel);
  const customAnchorCoordinates = useSettingsStore(
    state => state.customAnchorCoordinates,
  );

  const nearMeCoordinates = useMemo(() => {
    return distanceAnchorMode === 'custom'
      ? customAnchorCoordinates
      : userCoordinates;
  }, [distanceAnchorMode, customAnchorCoordinates, userCoordinates]);

  const nearMeOriginLabel = useMemo(() => {
    return distanceAnchorMode === 'custom' ? customAnchorLabel : 'Current GPS';
  }, [distanceAnchorMode, customAnchorLabel]);

  const searchOptions: NominatimSearchOptions = useMemo(() => {
    if (scopeMode === 'country') {
      return {
        mode: 'country',
        countryCode,
      };
    }
    if (scopeMode === 'city_radius') {
      return {
        mode: 'city_radius',
        boundingCenter: selectedCityCoordinates,
        radiusKm,
      };
    }
    if (scopeMode === 'near_me') {
      return {
        mode: 'near_me',
        boundingCenter: nearMeCoordinates,
        radiusKm,
      };
    }
    return {mode: 'worldwide'};
  }, [
    scopeMode,
    countryCode,
    selectedCityCoordinates,
    radiusKm,
    nearMeCoordinates,
  ]);

  const scopeSummaryLabel = useMemo(() => {
    if (scopeMode === 'country') {
      return `Country: ${countryCode.toUpperCase() || 'UA'}`;
    }
    if (scopeMode === 'city_radius') {
      return `${selectedCityLabel} • ${radiusKm} km`;
    }
    if (scopeMode === 'near_me') {
      return `Near ${nearMeOriginLabel} • ${radiusKm} km`;
    }
    return 'Worldwide';
  }, [
    scopeMode,
    countryCode,
    selectedCityLabel,
    radiusKm,
    nearMeOriginLabel,
  ]);

  const normalizedQuery = debouncedQuery.trim();
  const hasMinQueryLength = normalizedQuery.length >= 2;

  const queryResult = useQuery({
    queryKey: [
      'nominatim-search',
      normalizedQuery,
      searchOptions.mode,
      searchOptions.countryCode,
      searchOptions.boundingCenter?.latitude,
      searchOptions.boundingCenter?.longitude,
      searchOptions.radiusKm,
    ],
    queryFn: () => searchNominatimPlaces(normalizedQuery, searchOptions),
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

  const handleOpenScopeModal = useCallback(() => {
    setCitySearchError(null);
    setIsScopeModalVisible(true);
  }, []);

  const handleCloseScopeModal = useCallback(() => {
    setIsScopeModalVisible(false);
  }, []);

  const handleSelectCityPreset = useCallback((preset: CityAnchorPreset) => {
    setCitySearchError(null);
    setSelectedCityLabel(preset.label);
    setSelectedCityCoordinates(preset.coordinates);
  }, []);

  const handleApplyCustomCitySearch = useCallback(async () => {
    const trimmed = customCityInput.trim();
    if (trimmed.length < 2) {
      setCitySearchError('Enter at least 2 characters for city name.');
      return;
    }
    setIsSearchingCity(true);
    setCitySearchError(null);
    try {
      const found = await searchNominatimPlaces(trimmed, {mode: 'worldwide'});
      if (found.length === 0) {
        setCitySearchError('City not found. Try another name.');
        setIsSearchingCity(false);
        return;
      }
      const first = found[0];
      const label =
        first.name && first.name.trim().length > 0
          ? first.name.trim()
          : first.display_name.split(',')[0].trim();
      setSelectedCityLabel(label);
      setSelectedCityCoordinates({
        latitude: Number.parseFloat(first.lat) || 0,
        longitude: Number.parseFloat(first.lon) || 0,
      });
      setCustomCityInput('');
    } catch {
      setCitySearchError('Failed to resolve city coordinates.');
    } finally {
      setIsSearchingCity(false);
    }
  }, [customCityInput]);

  const handleResetScope = useCallback(() => {
    setScopeMode('worldwide');
    setCitySearchError(null);
  }, []);

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
      navigation.navigate('PlaceDetails', {
        placeId: place.id,
        previewPlace: place,
      });
    },
    [navigation],
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
    scopeMode,
    setScopeMode,
    countryCode,
    setCountryCode,
    countryPresets: COUNTRY_FILTER_PRESETS,
    selectedCityLabel,
    cityPresets: DISTANCE_ANCHOR_CITY_PRESETS,
    customCityInput,
    setCustomCityInput,
    isSearchingCity,
    citySearchError,
    radiusKm,
    setRadiusKm,
    nearMeOriginLabel,
    scopeSummaryLabel,
    isScopeModalVisible,
    handleOpenScopeModal,
    handleCloseScopeModal,
    handleSelectCityPreset,
    handleApplyCustomCitySearch,
    handleResetScope,
    hasMinQueryLength,
    results,
    isLoading:
      hasMinQueryLength && (queryResult.isLoading || queryResult.isFetching),
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
