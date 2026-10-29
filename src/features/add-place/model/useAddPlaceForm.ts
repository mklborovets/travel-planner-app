import {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  formatConciseNominatimAddress,
  reverseGeocodeCoordinates,
  searchNominatimPlaces,
} from '../../../entities/place/api/placesApi';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {Coordinates, PlaceCategory} from '../../../entities/place/model/types';
import {
  CATEGORY_MAP,
  PLACE_CATEGORIES,
  PRIMARY_PLACE_CATEGORIES,
} from '../../../shared/config/categories';
import {
  DEFAULT_COORDINATES,
  formatCoordinates,
  parseCoordinatePairInput,
} from '../../../shared/lib/location';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
import {RootStackParamList} from '../../../shared/types/navigation';
import {
  EMPTY_PLACE_FORM_VALUES,
  useAddPlaceDraftStore,
} from './addPlaceDraftStore';
import {placeFormSchema, PlaceFormValues} from './placeSchema';

type AddPlaceRouteProp = RouteProp<RootStackParamList, 'AddPlace'>;
type AddPlaceNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddPlace'
>;

export const useAddPlaceForm = () => {
  const navigation = useNavigation<AddPlaceNavigationProp>();
  const route = useRoute<AddPlaceRouteProp>();
  const addPlace = usePlacesStore(state => state.addPlace);
  const {refreshLocation} = useCurrentLocation();

  const getValidDraft = useAddPlaceDraftStore(state => state.getValidDraft);
  const saveDraft = useAddPlaceDraftStore(state => state.saveDraft);
  const clearDraft = useAddPlaceDraftStore(state => state.clearDraft);

  const [isCategoryModalVisible, setIsCategoryModalVisible] =
    useState<boolean>(false);
  const [isResolvingLocation, setIsResolvingLocation] =
    useState<boolean>(false);
  const [resolutionStatusMessage, setResolutionStatusMessage] = useState<
    string | null
  >(null);

  const initialDefaultValues = useMemo((): PlaceFormValues => {
    if (route.params?.initialCoordinates) {
      return {
        title: route.params.initialTitle ?? '',
        address: route.params.initialAddress ?? '',
        description: '',
        category: route.params.initialCategory ?? 'sightseeing',
        latitude: route.params.initialCoordinates.latitude.toFixed(5),
        longitude: route.params.initialCoordinates.longitude.toFixed(5),
      };
    }
    return getValidDraft();
  }, [route.params, getValidDraft]);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    watch,
    formState: {errors, isSubmitting},
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: initialDefaultValues,
  });

  useEffect(() => {
    if (route.params?.initialCoordinates) {
      return;
    }
    const subscription = watch(values => {
      saveDraft({
        title: values.title ?? '',
        address: values.address ?? '',
        description: values.description ?? '',
        category: values.category ?? 'sightseeing',
        latitude: values.latitude ?? '',
        longitude: values.longitude ?? '',
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, saveDraft, route.params?.initialCoordinates]);

  const selectedCategory = watch('category');
  const selectedCategoryConfig = CATEGORY_MAP[selectedCategory];

  const quickCategories = useMemo(() => {
    const isPrimary = PRIMARY_PLACE_CATEGORIES.some(
      item => item.id === selectedCategory,
    );
    if (isPrimary) {
      return PRIMARY_PLACE_CATEGORIES;
    }
    return [selectedCategoryConfig, ...PRIMARY_PLACE_CATEGORIES.slice(0, 4)];
  }, [selectedCategory, selectedCategoryConfig]);

  const autoFillAddressFromCoordinates = useCallback(
    async (coordinates: Coordinates) => {
      setIsResolvingLocation(true);
      setResolutionStatusMessage('Resolving address from coordinates...');
      try {
        const reversed = await reverseGeocodeCoordinates(coordinates);
        const currentAddress = getValues('address').trim();
        const currentTitle = getValues('title').trim();
        if (!currentAddress && reversed.address) {
          setValue('address', reversed.address, {shouldValidate: true});
        }
        if (
          !currentTitle &&
          reversed.title &&
          reversed.title !== 'Pinned Location'
        ) {
          setValue('title', reversed.title, {shouldValidate: true});
        }
        if (reversed.category !== 'other') {
          setValue('category', reversed.category, {shouldValidate: true});
        }
        setResolutionStatusMessage('Address auto-filled from coordinates.');
      } catch {
        setResolutionStatusMessage(null);
      } finally {
        setIsResolvingLocation(false);
      }
    },
    [getValues, setValue],
  );

  const handleResolveCoordinatesFromAddress = useCallback(async () => {
    const rawAddress = getValues('address').trim();
    const rawTitle = getValues('title').trim();
    const query = rawAddress || rawTitle;
    if (query.length < 3) {
      setResolutionStatusMessage(
        'Enter an address or title first to find coordinates.',
      );
      return;
    }
    setIsResolvingLocation(true);
    setResolutionStatusMessage('Looking up coordinates from address...');
    try {
      const results = await searchNominatimPlaces(query, {mode: 'worldwide'});
      if (results.length === 0) {
        setResolutionStatusMessage(
          'Could not find exact coordinates in OpenStreetMap.',
        );
        setIsResolvingLocation(false);
        return;
      }
      const first = results[0];
      const lat = Number.parseFloat(first.lat);
      const lon = Number.parseFloat(first.lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        setValue('latitude', lat.toFixed(5), {shouldValidate: true});
        setValue('longitude', lon.toFixed(5), {shouldValidate: true});
        if (!rawAddress) {
          setValue(
            'address',
            formatConciseNominatimAddress(first.display_name, first.address),
            {shouldValidate: true},
          );
        }
        setResolutionStatusMessage('Coordinates filled from address.');
      }
    } catch {
      setResolutionStatusMessage('Failed to look up coordinates.');
    } finally {
      setIsResolvingLocation(false);
    }
  }, [getValues, setValue]);

  const handleSelectCategory = useCallback(
    (category: PlaceCategory) => {
      setValue('category', category, {shouldValidate: true});
    },
    [setValue],
  );

  const handleOpenCategoryModal = useCallback(() => {
    setIsCategoryModalVisible(true);
  }, []);

  const handleCloseCategoryModal = useCallback(() => {
    setIsCategoryModalVisible(false);
  }, []);

  const handleSelectCategoryFromModal = useCallback(
    (category: PlaceCategory) => {
      setValue('category', category, {shouldValidate: true});
      setIsCategoryModalVisible(false);
    },
    [setValue],
  );

  const handleLatitudeInputChange = useCallback(
    (rawText: string) => {
      const parsedPair = parseCoordinatePairInput(rawText);
      if (parsedPair) {
        setValue('latitude', parsedPair.latitude, {shouldValidate: true});
        setValue('longitude', parsedPair.longitude, {shouldValidate: true});
        autoFillAddressFromCoordinates({
          latitude: Number(parsedPair.latitude),
          longitude: Number(parsedPair.longitude),
        });
        return;
      }
      setValue('latitude', rawText, {shouldValidate: true});
    },
    [setValue, autoFillAddressFromCoordinates],
  );

  const handleLongitudeInputChange = useCallback(
    (rawText: string) => {
      const parsedPair = parseCoordinatePairInput(rawText);
      if (parsedPair) {
        setValue('latitude', parsedPair.latitude, {shouldValidate: true});
        setValue('longitude', parsedPair.longitude, {shouldValidate: true});
        autoFillAddressFromCoordinates({
          latitude: Number(parsedPair.latitude),
          longitude: Number(parsedPair.longitude),
        });
        return;
      }
      setValue('longitude', rawText, {shouldValidate: true});
    },
    [setValue, autoFillAddressFromCoordinates],
  );

  const handleUseCurrentCoordinates = useCallback(async () => {
    setIsResolvingLocation(true);
    setResolutionStatusMessage('Fetching current GPS coordinates...');
    const latest = await refreshLocation();
    setValue('latitude', latest.latitude.toFixed(5), {
      shouldValidate: true,
    });
    setValue('longitude', latest.longitude.toFixed(5), {
      shouldValidate: true,
    });
    await autoFillAddressFromCoordinates(latest);
  }, [refreshLocation, setValue, autoFillAddressFromCoordinates]);

  const handleClearAllFields = useCallback(() => {
    clearDraft();
    reset(EMPTY_PLACE_FORM_VALUES);
    setResolutionStatusMessage(null);
  }, [clearDraft, reset]);

  const onValidSubmit = useCallback(
    async (values: PlaceFormValues) => {
      let resolvedAddress = values.address.trim();
      const rawLat = values.latitude.trim();
      const rawLon = values.longitude.trim();
      const hasCoords = rawLat.length > 0 && rawLon.length > 0;

      let resolvedCoordinates: Coordinates = hasCoords
        ? {
            latitude: Number(rawLat),
            longitude: Number(rawLon),
          }
        : DEFAULT_COORDINATES;

      if (hasCoords && resolvedAddress.length < 3) {
        try {
          const reversed = await reverseGeocodeCoordinates(resolvedCoordinates);
          resolvedAddress =
            reversed.address || formatCoordinates(resolvedCoordinates);
        } catch {
          resolvedAddress = formatCoordinates(resolvedCoordinates);
        }
      } else if (!hasCoords && resolvedAddress.length >= 3) {
        try {
          const found = await searchNominatimPlaces(resolvedAddress, {
            mode: 'worldwide',
          });
          if (found.length > 0) {
            resolvedCoordinates = {
              latitude:
                Number.parseFloat(found[0].lat) || DEFAULT_COORDINATES.latitude,
              longitude:
                Number.parseFloat(found[0].lon) ||
                DEFAULT_COORDINATES.longitude,
            };
          }
        } catch {
          resolvedCoordinates = DEFAULT_COORDINATES;
        }
      }

      const created = addPlace({
        title: values.title,
        address: resolvedAddress || formatCoordinates(resolvedCoordinates),
        description: values.description,
        category: values.category,
        coordinates: resolvedCoordinates,
      });

      clearDraft();
      navigation.replace('PlaceDetails', {placeId: created.id});
    },
    [addPlace, clearDraft, navigation],
  );

  const handleSubmitForm = handleSubmit(onValidSubmit);

  return {
    control,
    errors,
    isSubmitting,
    isResolvingLocation,
    resolutionStatusMessage,
    categories: PLACE_CATEGORIES,
    quickCategories,
    selectedCategory,
    selectedCategoryLabel: selectedCategoryConfig.label,
    isCategoryModalVisible,
    handleSelectCategory,
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleSelectCategoryFromModal,
    handleLatitudeInputChange,
    handleLongitudeInputChange,
    handleUseCurrentCoordinates,
    handleResolveCoordinatesFromAddress,
    handleClearAllFields,
    handleSubmitForm,
  };
};
