import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {
  copyTextToClipboard,
  sharePlaceDetails,
} from '../../../shared/lib/share';
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
  const {placeId, previewPlace} = route.params;

  const savedPlace = usePlacesStore(state =>
    state.places.find(item => item.id === placeId),
  );
  const isSaved = Boolean(savedPlace);
  const place = savedPlace ?? previewPlace;

  const upsertPlace = usePlacesStore(state => state.upsertPlace);
  const toggleFavorite = usePlacesStore(state => state.toggleFavorite);
  const removePlace = usePlacesStore(state => state.removePlace);

  const isInTrip = useTripStore(state =>
    state.items.some(item => item.placeId === placeId),
  );
  const addPlaceToTrip = useTripStore(state => state.addPlaceToTrip);
  const removePlaceFromTrip = useTripStore(state => state.removePlaceFromTrip);
  const removePlaceFromAllTrips = useTripStore(
    state => state.removePlaceFromAllTrips,
  );

  const {coordinates: userCoordinates} = useCurrentLocation();
  const distanceAnchorMode = useSettingsStore(
    state => state.distanceAnchorMode,
  );
  const customAnchorCoordinates = useSettingsStore(
    state => state.customAnchorCoordinates,
  );

  const [isAddressCopied, setIsAddressCopied] = useState<boolean>(false);
  const [isCoordinatesCopied, setIsCoordinatesCopied] =
    useState<boolean>(false);
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const coordinatesFeedbackTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
      }
      if (coordinatesFeedbackTimerRef.current) {
        clearTimeout(coordinatesFeedbackTimerRef.current);
      }
    };
  }, []);

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
      isSaved,
      isFavorite: savedPlace ? savedPlace.isFavorite : false,
      isInTrip,
    };
  }, [place, savedPlace, isSaved, originCoordinates, isInTrip]);

  const handleCopyAddress = useCallback(() => {
    if (!place) {
      return;
    }
    copyTextToClipboard(place.address);
    setIsAddressCopied(true);
    if (copyFeedbackTimerRef.current) {
      clearTimeout(copyFeedbackTimerRef.current);
    }
    copyFeedbackTimerRef.current = setTimeout(() => {
      setIsAddressCopied(false);
    }, 2000);
  }, [place]);

  const handleCopyCoordinates = useCallback(() => {
    if (!place) {
      return;
    }
    copyTextToClipboard(formatCoordinates(place.coordinates));
    setIsCoordinatesCopied(true);
    if (coordinatesFeedbackTimerRef.current) {
      clearTimeout(coordinatesFeedbackTimerRef.current);
    }
    coordinatesFeedbackTimerRef.current = setTimeout(() => {
      setIsCoordinatesCopied(false);
    }, 2000);
  }, [place]);

  const handleSharePlace = useCallback(async () => {
    if (!place) {
      return;
    }
    await sharePlaceDetails(place);
  }, [place]);

  const handleSavePlace = useCallback(() => {
    if (!place) {
      return;
    }
    upsertPlace(place);
  }, [place, upsertPlace]);

  const handleToggleFavorite = useCallback(() => {
    if (!place) {
      return;
    }
    if (!isSaved) {
      upsertPlace({...place, isFavorite: true});
      return;
    }
    toggleFavorite(place.id);
  }, [place, isSaved, upsertPlace, toggleFavorite]);

  const handleToggleTrip = useCallback(() => {
    if (!place) {
      return;
    }
    if (isInTrip) {
      removePlaceFromTrip(place.id);
    } else {
      if (!isSaved) {
        upsertPlace(place);
      }
      addPlaceToTrip(place.id);
    }
  }, [
    place,
    isInTrip,
    isSaved,
    upsertPlace,
    removePlaceFromTrip,
    addPlaceToTrip,
  ]);

  const handleOpenOnMap = useCallback(() => {
    if (!place) {
      return;
    }
    navigation.navigate('MainTabs', {
      screen: 'MapTab',
      params: {
        focusCoordinates: place.coordinates,
        selectedPlaceId: place.id,
        previewPlace: isSaved ? undefined : place,
        focusTimestamp: Date.now(),
      },
    });
  }, [navigation, place, isSaved]);

  const handleDeletePlace = useCallback(() => {
    if (!place) {
      return;
    }
    removePlaceFromAllTrips(place.id);
    removePlace(place.id);
    navigation.goBack();
  }, [place, removePlaceFromAllTrips, removePlace, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    detailsViewModel,
    isAddressCopied,
    isCoordinatesCopied,
    handleCopyAddress,
    handleCopyCoordinates,
    handleSharePlace,
    handleSavePlace,
    handleToggleFavorite,
    handleToggleTrip,
    handleOpenOnMap,
    handleDeletePlace,
    handleGoBack,
  };
};
