import {useCallback, useMemo, useState} from 'react';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {
  CATEGORY_MAP,
  FILTER_CATEGORIES,
  FilterCategory,
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

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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

  const filteredPlaceCards: PlaceCardItemViewModel[] = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return places
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
          userCoordinates,
          place.coordinates,
        );
        return {
          id: place.id,
          title: place.title,
          address: place.address,
          categoryLabel: categoryConfig.label,
          categoryBadgeClassName: categoryConfig.badgeClassName,
          categoryTextClassName: categoryConfig.textClassName,
          distanceLabel: formatDistance(distanceKm),
          isFavorite: place.isFavorite,
        };
      });
  }, [
    places,
    onlyFavorites,
    selectedCategory,
    searchQuery,
    userCoordinates,
  ]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleToggleFavoritesOnly = useCallback(() => {
    setOnlyFavorites(prev => !prev);
  }, []);

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
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    filterCategories: FILTER_CATEGORIES,
    selectedCategory,
    setSelectedCategory,
    onlyFavorites,
    handleToggleFavoritesOnly,
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
