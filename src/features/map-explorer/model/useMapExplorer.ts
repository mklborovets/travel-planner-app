import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import MapView, {
  MapPressEvent,
  PoiClickEvent,
  Region,
} from 'react-native-maps';
import {
  CompositeNavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  fetchStreetRouteSegment,
  getCachedStreetRouteSegment,
  reverseGeocodeCoordinates,
} from '../../../entities/place/api/placesApi';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {
  Coordinates,
  Place,
  PlaceCategory,
} from '../../../entities/place/model/types';
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
  category: PlaceCategory;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  isLoadingAddress: boolean;
}

export type RouteSegmentStatus = 'completed' | 'active_next' | 'upcoming';

export interface RouteSegmentViewModel {
  id: string;
  coordinates: Coordinates[];
  status: RouteSegmentStatus;
  strokeColor: string;
  strokeWidth: number;
  lineDashPattern?: number[];
}

const getSegmentVisualProps = (
  status: RouteSegmentStatus,
): Pick<
  RouteSegmentViewModel,
  'strokeColor' | 'strokeWidth' | 'lineDashPattern'
> => {
  if (status === 'completed') {
    return {
      strokeColor: '#10b981',
      strokeWidth: 4,
      lineDashPattern: undefined,
    };
  }
  if (status === 'active_next') {
    return {
      strokeColor: '#f59e0b',
      strokeWidth: 5,
      lineDashPattern: [12, 6, 3, 6],
    };
  }
  return {
    strokeColor: '#2563eb',
    strokeWidth: 4,
    lineDashPattern: [8, 5],
  };
};

export const useMapExplorer = () => {
  const route = useRoute<MapScreenRouteProp>();
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView | null>(null);

  const places = usePlacesStore(state => state.places);
  const addPlace = usePlacesStore(state => state.addPlace);
  const upsertPlace = usePlacesStore(state => state.upsertPlace);
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
  const [previewPlace, setPreviewPlace] = useState<Place | null>(
    route.params?.previewPlace ?? null,
  );
  const [tappedPoint, setTappedPoint] = useState<TappedMapPointState | null>(
    null,
  );
  const [routeSegments, setRouteSegments] = useState<RouteSegmentViewModel[]>(
    [],
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
  const [visibleRegion, setVisibleRegion] = useState<Region>(initialRegion);
  const lastMarkerPressTimeRef = useRef<number>(0);

  useEffect(() => {
    if (route.params?.selectedPlaceId) {
      setSelectedPlaceId(route.params.selectedPlaceId);
      setPreviewPlace(route.params.previewPlace ?? null);
      setTappedPoint(null);
    }
    if (route.params?.focusCoordinates && mapRef.current) {
      const nextRegion: Region = {
        latitude: route.params.focusCoordinates.latitude,
        longitude: route.params.focusCoordinates.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      currentRegionRef.current = nextRegion;
      setVisibleRegion(nextRegion);
      mapRef.current.animateToRegion(nextRegion, 450);
    }
  }, [
    route.params?.focusCoordinates,
    route.params?.selectedPlaceId,
    route.params?.previewPlace,
    route.params?.focusTimestamp,
  ]);

  const markers: MapMarkerViewModel[] = useMemo(() => {
    const combinedPlaces =
      previewPlace && !places.some(item => item.id === previewPlace.id)
        ? [...places, previewPlace]
        : places;
    const shouldCullByViewport = combinedPlaces.length > 40;
    const activeTripPlaceIds = new Set(tripItems.map(item => item.placeId));
    const latBuffer = visibleRegion.latitudeDelta * 0.75;
    const lngBuffer = visibleRegion.longitudeDelta * 0.75;

    const visiblePlaces = shouldCullByViewport
      ? combinedPlaces.filter(place => {
          if (
            place.id === selectedPlaceId ||
            activeTripPlaceIds.has(place.id)
          ) {
            return true;
          }
          const withinLat =
            Math.abs(place.coordinates.latitude - visibleRegion.latitude) <=
            latBuffer;
          const withinLng =
            Math.abs(place.coordinates.longitude - visibleRegion.longitude) <=
            lngBuffer;
          return withinLat && withinLng;
        })
      : combinedPlaces;

    return visiblePlaces.map(place => {
      const categoryConfig = CATEGORY_MAP[place.category];
      return {
        id: place.id,
        title: place.title,
        address: place.address,
        coordinate: place.coordinates,
        pinColor: categoryConfig.hexColor,
      };
    });
  }, [places, previewPlace, tripItems, selectedPlaceId, visibleRegion]);

  const orderedTripStops = useMemo(() => {
    const placesById: Record<string, Place> = {};
    places.forEach(place => {
      placesById[place.id] = place;
    });
    return [...tripItems]
      .sort((first, second) => first.order - second.order)
      .map(item => {
        const place = placesById[item.placeId];
        if (!place) {
          return null;
        }
        return {
          placeId: item.placeId,
          isVisited: item.isVisited,
          coordinates: place.coordinates,
        };
      })
      .filter(
        (
          stop,
        ): stop is {
          placeId: string;
          isVisited: boolean;
          coordinates: Coordinates;
        } => Boolean(stop),
      );
  }, [places, tripItems]);

  useEffect(() => {
    if (orderedTripStops.length < 2) {
      setRouteSegments([]);
      return;
    }

    let isCancelled = false;

    const firstUnvisitedDestinationSegmentIndex = orderedTripStops.findIndex(
      (stop, idx) => idx > 0 && !stop.isVisited,
    ) - 1;

    const resolveSegmentStatus = (
      index: number,
      fromVisited: boolean,
      toVisited: boolean,
    ): RouteSegmentStatus => {
      if (fromVisited && toVisited) {
        return 'completed';
      }
      if (firstUnvisitedDestinationSegmentIndex >= 0) {
        return index === firstUnvisitedDestinationSegmentIndex
          ? 'active_next'
          : 'upcoming';
      }
      return index === 0 ? 'active_next' : 'upcoming';
    };

    const initialSegments: RouteSegmentViewModel[] = [];
    let needsRemoteFetch = false;

    for (let index = 0; index < orderedTripStops.length - 1; index += 1) {
      const fromStop = orderedTripStops[index];
      const toStop = orderedTripStops[index + 1];
      const pairKey = `${fromStop.placeId}->${toStop.placeId}`;
      const cachedCoords = getCachedStreetRouteSegment(
        fromStop.coordinates,
        toStop.coordinates,
      );
      if (!cachedCoords) {
        needsRemoteFetch = true;
      }
      const status = resolveSegmentStatus(
        index,
        fromStop.isVisited,
        toStop.isVisited,
      );
      initialSegments.push({
        id: `${pairKey}-${index}`,
        coordinates: cachedCoords ?? [fromStop.coordinates, toStop.coordinates],
        status,
        ...getSegmentVisualProps(status),
      });
    }
    setRouteSegments(initialSegments);

    if (!needsRemoteFetch) {
      return;
    }

    const loadStreetSegments = async () => {
      const resolved = await Promise.all(
        initialSegments.map(async (segment, index) => {
          const fromStop = orderedTripStops[index];
          const toStop = orderedTripStops[index + 1];
          const streetCoords = await fetchStreetRouteSegment(
            fromStop.coordinates,
            toStop.coordinates,
          );
          return {
            ...segment,
            coordinates: streetCoords,
          };
        }),
      );
      if (!isCancelled) {
        setRouteSegments(resolved);
      }
    };

    loadStreetSegments();

    return () => {
      isCancelled = true;
    };
  }, [orderedTripStops]);

  const selectedPreview: SelectedPlacePreviewViewModel | null = useMemo(() => {
    if (!selectedPlaceId) {
      return null;
    }
    const found =
      places.find(item => item.id === selectedPlaceId) ??
      (previewPlace?.id === selectedPlaceId ? previewPlace : undefined);
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
  }, [selectedPlaceId, places, previewPlace, userCoordinates]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    currentRegionRef.current = region;
    setVisibleRegion(region);
  }, []);

  const handleResetNorth = useCallback(() => {
    if (!mapRef.current) {
      return;
    }
    mapRef.current.animateCamera(
      {
        heading: 0,
        pitch: 0,
      },
      {duration: 300},
    );
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
    setVisibleRegion(nextRegion);
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
    setVisibleRegion(nextRegion);
    mapRef.current.animateToRegion(nextRegion, 250);
  }, []);

  const handleSelectMarker = useCallback((placeId: string) => {
    lastMarkerPressTimeRef.current = Date.now();
    setTappedPoint(null);
    setSelectedPlaceId(placeId);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPlaceId(null);
    setPreviewPlace(null);
    setTappedPoint(null);
  }, []);

  const resolvePointAtCoordinates = useCallback(
    async (coordinates: Coordinates, poiHintName?: string) => {
      const formatted = formatCoordinates(coordinates);
      const cleanHint = poiHintName?.replace(/\n/g, ' ').trim();
      const defaultCategoryConfig = CATEGORY_MAP.sightseeing;

      setSelectedPlaceId(null);
      setPreviewPlace(null);
      setTappedPoint({
        coordinates,
        formattedCoordinates: formatted,
        title: cleanHint || 'Pinned Location',
        address: formatted,
        category: 'sightseeing',
        categoryLabel: defaultCategoryConfig.label,
        categoryBadgeClassName: defaultCategoryConfig.badgeClassName,
        categoryTextClassName: defaultCategoryConfig.textClassName,
        isLoadingAddress: true,
      });

      try {
        const reversed = await reverseGeocodeCoordinates(
          coordinates,
          cleanHint,
        );
        const categoryConfig = CATEGORY_MAP[reversed.category];
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
            category: reversed.category,
            categoryLabel: categoryConfig.label,
            categoryBadgeClassName: categoryConfig.badgeClassName,
            categoryTextClassName: categoryConfig.textClassName,
            isLoadingAddress: false,
          };
        });
      } catch {
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
            isLoadingAddress: false,
          };
        });
      }
    },
    [],
  );

  const handleMapPress = useCallback(
    async (event: MapPressEvent) => {
      if (event.nativeEvent.action === 'marker-press') {
        return;
      }
      if (Date.now() - lastMarkerPressTimeRef.current < 350) {
        return;
      }
      await resolvePointAtCoordinates(event.nativeEvent.coordinate);
    },
    [resolvePointAtCoordinates],
  );

  const handlePoiPress = useCallback(
    async (event: PoiClickEvent) => {
      lastMarkerPressTimeRef.current = Date.now();
      await resolvePointAtCoordinates(
        event.nativeEvent.coordinate,
        event.nativeEvent.name,
      );
    },
    [resolvePointAtCoordinates],
  );

  const handleQuickSaveTappedPlace = useCallback(() => {
    if (!tappedPoint) {
      return;
    }
    const created = addPlace({
      title: tappedPoint.title || 'Pinned Location',
      address: tappedPoint.address || tappedPoint.formattedCoordinates,
      category: tappedPoint.category,
      coordinates: tappedPoint.coordinates,
    });
    setTappedPoint(null);
    setSelectedPlaceId(created.id);
  }, [addPlace, tappedPoint]);

  const handleAddTappedPlace = useCallback(() => {
    if (!tappedPoint) {
      return;
    }
    const params = {
      initialCoordinates: tappedPoint.coordinates,
      initialTitle:
        tappedPoint.title !== 'Pinned Location' ? tappedPoint.title : '',
      initialAddress: tappedPoint.address,
      initialCategory: tappedPoint.category,
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
      setVisibleRegion(nextRegion);
      mapRef.current.animateToRegion(nextRegion, 450);
    }
  }, [refreshLocation]);

  const handleOpenSelectedDetails = useCallback(() => {
    if (!selectedPlaceId) {
      return;
    }
    const isAlreadySaved = places.some(item => item.id === selectedPlaceId);
    navigation.navigate('PlaceDetails', {
      placeId: selectedPlaceId,
      previewPlace:
        !isAlreadySaved && previewPlace?.id === selectedPlaceId
          ? previewPlace
          : undefined,
    });
  }, [navigation, places, previewPlace, selectedPlaceId]);

  const handleToggleSelectedFavorite = useCallback(() => {
    if (!selectedPlaceId) {
      return;
    }
    const isAlreadySaved = places.some(item => item.id === selectedPlaceId);
    if (!isAlreadySaved && previewPlace?.id === selectedPlaceId) {
      upsertPlace({...previewPlace, isFavorite: true});
      return;
    }
    toggleFavorite(selectedPlaceId);
  }, [places, previewPlace, selectedPlaceId, toggleFavorite, upsertPlace]);

  const handleOpenAddPlaceHere = useCallback(() => {
    navigation.navigate('AddPlace');
  }, [navigation]);

  const hasBottomCard = Boolean(selectedPreview || tappedPoint);

  return {
    mapRef,
    initialRegion,
    markers,
    routeSegments,
    selectedPreview,
    tappedPoint,
    hasBottomCard,
    isLocationGranted,
    customMapStyle:
      mapTheme === 'dark' ? DARK_MAP_STYLE : STANDARD_MAP_STYLE,
    handleRegionChangeComplete,
    handleResetNorth,
    handleZoomIn,
    handleZoomOut,
    handleSelectMarker,
    handleClearSelection,
    handleMapPress,
    handlePoiPress,
    handleQuickSaveTappedPlace,
    handleAddTappedPlace,
    handleCenterOnUser,
    handleOpenSelectedDetails,
    handleToggleSelectedFavorite,
    handleOpenAddPlaceHere,
  };
};
