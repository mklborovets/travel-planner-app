import {useCallback, useMemo, useState} from 'react';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {searchNominatimPlaces} from '../../../entities/place/api/placesApi';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {useSettingsStore} from '../../../entities/settings/model/settingsStore';
import {
  CATEGORY_MAP,
  CityAnchorPreset,
  DISTANCE_ANCHOR_CITY_PRESETS,
  FILTER_CATEGORIES,
  FilterCategory,
  PlaceSortOption,
} from '../../../shared/config/categories';
import {
  calculateHaversineDistanceKm,
  formatDistance,
} from '../../../shared/lib/location';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../../shared/types/navigation';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export interface PlaceCardItemViewModel {
  id: string;
  title: string;
  address: string;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  distanceLabel: string;
  isFavorite: boolean;
}

export const useFilteredPlaces = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const places = usePlacesStore(state => state.places);
  const toggleFavorite = usePlacesStore(state => state.toggleFavorite);
  const {coordinates: userCoordinates, refreshLocation} = useCurrentLocation();

  const distanceAnchorMode = useSettingsStore(
    state => state.distanceAnchorMode,
  );
  const customAnchorLabel = useSettingsStore(state => state.customAnchorLabel);
  const customAnchorCoordinates = useSettingsStore(
    state => state.customAnchorCoordinates,
  );
  const setGpsDistanceAnchor = useSettingsStore(
    state => state.setGpsDistanceAnchor,
  );
  const setCustomDistanceAnchor = useSettingsStore(
    state => state.setCustomDistanceAnchor,
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<PlaceSortOption>('distance');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFilterModalVisible, setIsFilterModalVisible] =
    useState<boolean>(false);
  const [customCityInput, setCustomCityInput] = useState<string>('');
  const [isSearchingCity, setIsSearchingCity] = useState<boolean>(false);
  const [citySearchError, setCitySearchError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshLocation();
    }, [refreshLocation]),
  );

  const handlePullToRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshLocation();
    setIsRefreshing(false);
  }, [refreshLocation]);

  const activeAnchorCoordinates = useMemo(() => {
    return distanceAnchorMode === 'custom'
      ? customAnchorCoordinates
      : userCoordinates;
  }, [distanceAnchorMode, customAnchorCoordinates, userCoordinates]);

  const activeAnchorLabel = useMemo(() => {
    return distanceAnchorMode === 'custom' ? customAnchorLabel : 'Current GPS';
  }, [distanceAnchorMode, customAnchorLabel]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') {
      count += 1;
    }
    if (onlyFavorites) {
      count += 1;
    }
    if (sortBy !== 'distance') {
      count += 1;
    }
    if (distanceAnchorMode === 'custom') {
      count += 1;
    }
    return count;
  }, [selectedCategory, onlyFavorites, sortBy, distanceAnchorMode]);

  const filteredPlaceCards: PlaceCardItemViewModel[] = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const matched = places
      .filter(place => {
        if (onlyFavorites && !place.isFavorite) {
          return false;
        }
        if (
          selectedCategory !== 'all' &&
          place.category !== selectedCategory
        ) {
          return false;
        }
        if (normalizedSearch.length > 0) {
          const matchesTitle = place.title
            .toLowerCase()
            .includes(normalizedSearch);
          const matchesAddress = place.address
            .toLowerCase()
            .includes(normalizedSearch);
          const matchesDescription = place.description
            ? place.description.toLowerCase().includes(normalizedSearch)
            : false;
          return matchesTitle || matchesAddress || matchesDescription;
        }
        return true;
      })
      .map(place => {
        const categoryConfig = CATEGORY_MAP[place.category];
        const distanceKm = calculateHaversineDistanceKm(
          activeAnchorCoordinates,
          place.coordinates,
        );
        return {
          place,
          distanceKm,
          viewModel: {
            id: place.id,
            title: place.title,
            address: place.address,
            categoryLabel: categoryConfig.label,
            categoryBadgeClassName: categoryConfig.badgeClassName,
            categoryTextClassName: categoryConfig.textClassName,
            distanceLabel: formatDistance(distanceKm),
            isFavorite: place.isFavorite,
          },
        };
      });

    matched.sort((first, second) => {
      if (sortBy === 'distance') {
        return first.distanceKm - second.distanceKm;
      }
      if (sortBy === 'title') {
        return first.place.title.localeCompare(second.place.title);
      }
      return second.place.createdAt - first.place.createdAt;
    });

    return matched.map(item => item.viewModel);
  }, [
    places,
    onlyFavorites,
    selectedCategory,
    searchQuery,
    activeAnchorCoordinates,
    sortBy,
  ]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleToggleFavoritesOnly = useCallback(() => {
    setOnlyFavorites(prev => !prev);
  }, []);

  const handleOpenFilterModal = useCallback(() => {
    setCitySearchError(null);
    setIsFilterModalVisible(true);
  }, []);

  const handleCloseFilterModal = useCallback(() => {
    setIsFilterModalVisible(false);
  }, []);

  const handleSelectGpsAnchor = useCallback(() => {
    setCitySearchError(null);
    setGpsDistanceAnchor();
  }, [setGpsDistanceAnchor]);

  const handleSelectCityPreset = useCallback(
    (preset: CityAnchorPreset) => {
      setCitySearchError(null);
      setCustomDistanceAnchor(preset.label, preset.coordinates);
    },
    [setCustomDistanceAnchor],
  );

  const handleApplyCustomCitySearch = useCallback(async () => {
    const trimmed = customCityInput.trim();
    if (trimmed.length < 2) {
      setCitySearchError('Enter at least 2 characters for city name.');
      return;
    }
    setIsSearchingCity(true);
    setCitySearchError(null);
    try {
      const results = await searchNominatimPlaces(trimmed);
      if (results.length === 0) {
        setCitySearchError('City not found. Try another name.');
        setIsSearchingCity(false);
        return;
      }
      const first = results[0];
      const label =
        first.name && first.name.trim().length > 0
          ? first.name.trim()
          : first.display_name.split(',')[0].trim();
      setCustomDistanceAnchor(label, {
        latitude: Number.parseFloat(first.lat) || 0,
        longitude: Number.parseFloat(first.lon) || 0,
      });
      setCustomCityInput('');
    } catch {
      setCitySearchError('Failed to look up city coordinates.');
    } finally {
      setIsSearchingCity(false);
    }
  }, [customCityInput, setCustomDistanceAnchor]);

  const handleOpenPlaceDetails = useCallback(
    (placeId: string) => {
      navigation.navigate('PlaceDetails', {placeId});
    },
    [navigation],
  );

  const handleOpenAddPlace = useCallback(() => {
    navigation.navigate('AddPlace');
  }, [navigation]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOnlyFavorites(false);
    setSortBy('distance');
    setGpsDistanceAnchor();
    setCitySearchError(null);
  }, [setGpsDistanceAnchor]);

  return {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    filterCategories: FILTER_CATEGORIES,
    selectedCategory,
    setSelectedCategory,
    onlyFavorites,
    handleToggleFavoritesOnly,
    sortBy,
    setSortBy,
    distanceAnchorMode,
    activeAnchorLabel,
    activeFiltersCount,
    cityPresets: DISTANCE_ANCHOR_CITY_PRESETS,
    customCityInput,
    setCustomCityInput,
    isSearchingCity,
    citySearchError,
    isFilterModalVisible,
    handleOpenFilterModal,
    handleCloseFilterModal,
    handleSelectGpsAnchor,
    handleSelectCityPreset,
    handleApplyCustomCitySearch,
    filteredPlaceCards,
    totalPlacesCount: places.length,
    isRefreshing,
    handlePullToRefresh,
    toggleFavorite,
    handleOpenPlaceDetails,
    handleOpenAddPlace,
    handleResetFilters,
  };
};
