import {useCallback, useMemo} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {useSettingsStore} from '../../../entities/settings/model/settingsStore';
import {useTripStore} from '../../../entities/trip/model/tripStore';
import {CATEGORY_MAP} from '../../../shared/config/categories';
import {
  calculateHaversineDistanceKm,
  formatCoordinates,
  formatDistance,
} from '../../../shared/lib/location';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
import {RootStackParamList} from '../../../shared/types/navigation';

type PlaceDetailsRouteProp = RouteProp<RootStackParamList, 'PlaceDetails'>;
type PlaceDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlaceDetails'
>;

export const usePlaceDetails = () => {
  const route = useRoute<PlaceDetailsRouteProp>();
  const navigation = useNavigation<PlaceDetailsNavigationProp>();
  const {placeId} = route.params;

  const place = usePlacesStore(state =>
    state.places.find(item => item.id === placeId),
  );
  const toggleFavorite = usePlacesStore(state => state.toggleFavorite);
  const removePlace = usePlacesStore(state => state.removePlace);

  const isInTrip = useTripStore(state =>
    state.items.some(item => item.placeId === placeId),
  );
  const addPlaceToTrip = useTripStore(state => state.addPlaceToTrip);
  const removePlaceFromTrip = useTripStore(state => state.removePlaceFromTrip);

  const {coordinates: userCoordinates} = useCurrentLocation();
  const distanceAnchorMode = useSettingsStore(
    state => state.distanceAnchorMode,
  );
  const customAnchorCoordinates = useSettingsStore(
    state => state.customAnchorCoordinates,
  );

  const originCoordinates =
    distanceAnchorMode === 'custom' ? customAnchorCoordinates : userCoordinates;

  const detailsViewModel = useMemo(() => {
    if (!place) {
      return null;
    }
    const categoryConfig = CATEGORY_MAP[place.category];
    const distanceKm = calculateHaversineDistanceKm(
      originCoordinates,
      place.coordinates,
    );
    return {
      id: place.id,
      title: place.title,
      address: place.address,
      description: place.description ?? 'No notes added for this location yet.',
      categoryLabel: categoryConfig.label,
      categoryBadgeClassName: categoryConfig.badgeClassName,
      categoryTextClassName: categoryConfig.textClassName,
      formattedCoordinates: formatCoordinates(place.coordinates),
      distanceLabel: formatDistance(distanceKm),
      isFavorite: place.isFavorite,
      isInTrip,
    };
  }, [place, originCoordinates, isInTrip]);

  const handleToggleFavorite = useCallback(() => {
    if (!place) {
      return;
    }
    toggleFavorite(place.id);
  }, [place, toggleFavorite]);

  const handleToggleTrip = useCallback(() => {
    if (!place) {
      return;
    }
    if (isInTrip) {
      removePlaceFromTrip(place.id);
    } else {
      addPlaceToTrip(place.id);
    }
  }, [place, isInTrip, removePlaceFromTrip, addPlaceToTrip]);

  const handleOpenOnMap = useCallback(() => {
    if (!place) {
      return;
    }
    navigation.navigate('MainTabs', {
      screen: 'MapTab',
      params: {
        focusCoordinates: place.coordinates,
        selectedPlaceId: place.id,
      },
    });
  }, [navigation, place]);

  const handleDeletePlace = useCallback(() => {
    if (!place) {
      return;
    }
    removePlaceFromTrip(place.id);
    removePlace(place.id);
    navigation.goBack();
  }, [place, removePlaceFromTrip, removePlace, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    detailsViewModel,
    handleToggleFavorite,
    handleToggleTrip,
    handleOpenOnMap,
    handleDeletePlace,
    handleGoBack,
  };
};
