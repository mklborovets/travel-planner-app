import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import MapView, {MapPressEvent, Region} from 'react-native-maps';
import {
  CompositeNavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {reverseGeocodeCoordinates} from '../../../entities/place/api/placesApi';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {Coordinates, Place} from '../../../entities/place/model/types';
import {useSettingsStore} from '../../../entities/settings/model/settingsStore';
import {useTripStore} from '../../../entities/trip/model/tripStore';
import {CATEGORY_MAP} from '../../../shared/config/categories';
import {
  DARK_MAP_STYLE,
  STANDARD_MAP_STYLE,
} from '../../../shared/config/mapStyles';
import {
  calculateHaversineDistanceKm,
  DEFAULT_MAP_DELTA,
  formatCoordinates,
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

export interface TappedMapPointState {
  coordinates: Coordinates;
  formattedCoordinates: string;
  title: string;
  address: string;
  isLoadingAddress: boolean;
}

export const useMapExplorer = () => {
  const route = useRoute<MapScreenRouteProp>();
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView | null>(null);

  const places = usePlacesStore(state => state.places);
  const toggleFavorite = usePlacesStore(state => state.toggleFavorite);
  const tripItems = useTripStore(state => state.items);
  const mapTheme = useSettingsStore(state => state.mapTheme);

  const {
    coordinates: userCoordinates,
    isGranted: isLocationGranted,
    refreshLocation,
  } = useCurrentLocation();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    route.params?.selectedPlaceId ?? null,
  );
  const [tappedPoint, setTappedPoint] = useState<TappedMapPointState | null>(
    null,
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

  const currentRegionRef = useRef<Region>(initialRegion);
  const lastMarkerPressTimeRef = useRef<number>(0);

  useEffect(() => {
    if (route.params?.selectedPlaceId) {
      setSelectedPlaceId(route.params.selectedPlaceId);
      setTappedPoint(null);
    }
    if (route.params?.focusCoordinates && mapRef.current) {
      const nextRegion: Region = {
        latitude: route.params.focusCoordinates.latitude,
        longitude: route.params.focusCoordinates.longitude,
        latitudeDelta: 0.018,
        longitudeDelta: 0.018,
      };
      currentRegionRef.current = nextRegion;
      mapRef.current.animateToRegion(nextRegion, 450);
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

  const routeCoordinates: Coordinates[] = useMemo(() => {
    const placesById: Record<string, Place> = {};
    places.forEach(place => {
      placesById[place.id] = place;
    });
    return [...tripItems]
      .sort((first, second) => first.order - second.order)
      .map(item => placesById[item.placeId]?.coordinates)
      .filter((coords): coords is Coordinates => Boolean(coords));
  }, [places, tripItems]);

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

  const handleRegionChangeComplete = useCallback((region: Region) => {
    currentRegionRef.current = region;
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) {
      return;
    }
    const current = currentRegionRef.current;
    const nextRegion: Region = {
      ...current,
      latitudeDelta: Math.max(current.latitudeDelta * 0.5, 0.001),
      longitudeDelta: Math.max(current.longitudeDelta * 0.5, 0.001),
    };
    currentRegionRef.current = nextRegion;
    mapRef.current.animateToRegion(nextRegion, 250);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) {
      return;
    }
    const current = currentRegionRef.current;
    const nextRegion: Region = {
      ...current,
      latitudeDelta: Math.min(current.latitudeDelta * 2, 60),
      longitudeDelta: Math.min(current.longitudeDelta * 2, 60),
    };
    currentRegionRef.current = nextRegion;
    mapRef.current.animateToRegion(nextRegion, 250);
  }, []);

  const handleSelectMarker = useCallback((placeId: string) => {
    lastMarkerPressTimeRef.current = Date.now();
    setTappedPoint(null);
    setSelectedPlaceId(placeId);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPlaceId(null);
    setTappedPoint(null);
  }, []);

  const handleMapPress = useCallback(async (event: MapPressEvent) => {
    if (event.nativeEvent.action === 'marker-press') {
      return;
    }
    if (Date.now() - lastMarkerPressTimeRef.current < 350) {
      return;
    }

    const coordinates = event.nativeEvent.coordinate;
    const formatted = formatCoordinates(coordinates);

    setSelectedPlaceId(null);
    setTappedPoint({
      coordinates,
      formattedCoordinates: formatted,
      title: 'Pinned Location',
      address: formatted,
      isLoadingAddress: true,
    });

    try {
      const reversed = await reverseGeocodeCoordinates(coordinates);
      setTappedPoint(prev => {
        if (
          !prev ||
          prev.coordinates.latitude !== coordinates.latitude ||
          prev.coordinates.longitude !== coordinates.longitude
        ) {
          return prev;
        }
        return {
          ...prev,
          title: reversed.title,
          address: reversed.address,
          isLoadingAddress: false,
        };
      });
    } catch {
      setTappedPoint(prev => {
        if (!prev) {
          return null;
        }
        return {
          ...prev,
          isLoadingAddress: false,
        };
      });
    }
  }, []);

  const handleAddTappedPlace = useCallback(() => {
    if (!tappedPoint) {
      return;
    }
    const params = {
      initialCoordinates: tappedPoint.coordinates,
      initialTitle:
        tappedPoint.title !== 'Pinned Location' ? tappedPoint.title : '',
      initialAddress: tappedPoint.address,
    };
    setTappedPoint(null);
    navigation.navigate('AddPlace', params);
  }, [navigation, tappedPoint]);

  const handleCenterOnUser = useCallback(async () => {
    const latest = await refreshLocation();
    if (mapRef.current) {
      const nextRegion: Region = {
        latitude: latest.latitude,
        longitude: latest.longitude,
        latitudeDelta: DEFAULT_MAP_DELTA.latitudeDelta,
        longitudeDelta: DEFAULT_MAP_DELTA.longitudeDelta,
      };
      currentRegionRef.current = nextRegion;
      mapRef.current.animateToRegion(nextRegion, 450);
    }
  }, [refreshLocation]);

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
    routeCoordinates,
    selectedPreview,
    tappedPoint,
    isLocationGranted,
    customMapStyle:
      mapTheme === 'dark' ? DARK_MAP_STYLE : STANDARD_MAP_STYLE,
    handleRegionChangeComplete,
    handleZoomIn,
    handleZoomOut,
    handleSelectMarker,
    handleClearSelection,
    handleMapPress,
    handleAddTappedPlace,
    handleCenterOnUser,
    handleOpenSelectedDetails,
    handleToggleSelectedFavorite,
    handleOpenAddPlaceHere,
  };
};
