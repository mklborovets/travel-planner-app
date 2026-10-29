import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import MapView, {Region} from 'react-native-maps';
import {
  CompositeNavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {Coordinates} from '../../../entities/place/model/types';
import {useSettingsStore} from '../../../entities/settings/model/settingsStore';
import {CATEGORY_MAP} from '../../../shared/config/categories';
import {
  DARK_MAP_STYLE,
  STANDARD_MAP_STYLE,
} from '../../../shared/config/mapStyles';
import {
  calculateHaversineDistanceKm,
  DEFAULT_MAP_DELTA,
  formatDistance,
} from '../../../shared/lib/location';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../../shared/types/navigation';

type MapScreenRouteProp = RouteProp<MainTabParamList, 'MapTab'>;
type MapScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'MapTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export interface MapMarkerViewModel {
  id: string;
  title: string;
  address: string;
  coordinate: Coordinates;
  pinColor: string;
}

export interface SelectedPlacePreviewViewModel {
  id: string;
  title: string;
  address: string;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  distanceLabel: string;
  isFavorite: boolean;
}

export const useMapExplorer = () => {
  const route = useRoute<MapScreenRouteProp>();
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView | null>(null);

  const places = usePlacesStore(state => state.places);
  const toggleFavorite = usePlacesStore(state => state.toggleFavorite);
  const mapTheme = useSettingsStore(state => state.mapTheme);

  const {
    coordinates: userCoordinates,
    isGranted: isLocationGranted,
    refreshLocation,
  } = useCurrentLocation();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    route.params?.selectedPlaceId ?? null,
  );

  const initialRegion: Region = useMemo(() => {
    const target = route.params?.focusCoordinates ?? userCoordinates;
    return {
      latitude: target.latitude,
      longitude: target.longitude,
      latitudeDelta: DEFAULT_MAP_DELTA.latitudeDelta,
      longitudeDelta: DEFAULT_MAP_DELTA.longitudeDelta,
    };
  }, [route.params?.focusCoordinates, userCoordinates]);

  useEffect(() => {
    if (route.params?.selectedPlaceId) {
      setSelectedPlaceId(route.params.selectedPlaceId);
    }
    if (route.params?.focusCoordinates && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: route.params.focusCoordinates.latitude,
          longitude: route.params.focusCoordinates.longitude,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        },
        450,
      );
    }
  }, [route.params?.focusCoordinates, route.params?.selectedPlaceId]);

  const markers: MapMarkerViewModel[] = useMemo(() => {
    return places.map(place => {
      const categoryConfig = CATEGORY_MAP[place.category];
      return {
        id: place.id,
        title: place.title,
        address: place.address,
        coordinate: place.coordinates,
        pinColor: categoryConfig.hexColor,
      };
    });
  }, [places]);

  const selectedPreview: SelectedPlacePreviewViewModel | null = useMemo(() => {
    if (!selectedPlaceId) {
      return null;
    }
    const found = places.find(item => item.id === selectedPlaceId);
    if (!found) {
      return null;
    }
    const categoryConfig = CATEGORY_MAP[found.category];
    const distanceKm = calculateHaversineDistanceKm(
      userCoordinates,
      found.coordinates,
    );
    return {
      id: found.id,
      title: found.title,
      address: found.address,
      categoryLabel: categoryConfig.label,
      categoryBadgeClassName: categoryConfig.badgeClassName,
      categoryTextClassName: categoryConfig.textClassName,
      distanceLabel: formatDistance(distanceKm),
      isFavorite: found.isFavorite,
    };
  }, [selectedPlaceId, places, userCoordinates]);

  const handleSelectMarker = useCallback((placeId: string) => {
    setSelectedPlaceId(placeId);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPlaceId(null);
  }, []);

  const handleCenterOnUser = useCallback(async () => {
    await refreshLocation();
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userCoordinates.latitude,
          longitude: userCoordinates.longitude,
          latitudeDelta: DEFAULT_MAP_DELTA.latitudeDelta,
          longitudeDelta: DEFAULT_MAP_DELTA.longitudeDelta,
        },
        450,
      );
    }
  }, [refreshLocation, userCoordinates]);

  const handleOpenSelectedDetails = useCallback(() => {
    if (!selectedPlaceId) {
      return;
    }
    navigation.navigate('PlaceDetails', {placeId: selectedPlaceId});
  }, [navigation, selectedPlaceId]);

  const handleToggleSelectedFavorite = useCallback(() => {
    if (!selectedPlaceId) {
      return;
    }
    toggleFavorite(selectedPlaceId);
  }, [selectedPlaceId, toggleFavorite]);

  const handleOpenAddPlaceHere = useCallback(() => {
    navigation.navigate('AddPlace', {
      initialCoordinates: userCoordinates,
    });
  }, [navigation, userCoordinates]);

  return {
    mapRef,
    initialRegion,
    markers,
    selectedPreview,
    isLocationGranted,
    customMapStyle:
      mapTheme === 'dark' ? DARK_MAP_STYLE : STANDARD_MAP_STYLE,
    handleSelectMarker,
    handleClearSelection,
    handleCenterOnUser,
    handleOpenSelectedDetails,
    handleToggleSelectedFavorite,
    handleOpenAddPlaceHere,
  };
};

