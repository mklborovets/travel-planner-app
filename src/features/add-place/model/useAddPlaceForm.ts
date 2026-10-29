import {useCallback, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {usePlacesStore} from '../../../entities/place/model/placesStore';
import {PlaceCategory} from '../../../entities/place/model/types';
import {
  CATEGORY_MAP,
  PLACE_CATEGORIES,
  PRIMARY_PLACE_CATEGORIES,
} from '../../../shared/config/categories';
import {DEFAULT_COORDINATES} from '../../../shared/lib/location';
import {useCurrentLocation} from '../../../shared/lib/useCurrentLocation';
import {RootStackParamList} from '../../../shared/types/navigation';
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
  const {coordinates: currentCoordinates} = useCurrentLocation();

  const [isCategoryModalVisible, setIsCategoryModalVisible] =
    useState<boolean>(false);

  const initialCoordinates =
    route.params?.initialCoordinates ?? DEFAULT_COORDINATES;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors, isSubmitting},
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      title: '',
      address: '',
      description: '',
      category: 'sightseeing',
      latitude: initialCoordinates.latitude.toFixed(5),
      longitude: initialCoordinates.longitude.toFixed(5),
    },
  });

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

  const handleUseCurrentCoordinates = useCallback(() => {
    setValue('latitude', currentCoordinates.latitude.toFixed(5), {
      shouldValidate: true,
    });
    setValue('longitude', currentCoordinates.longitude.toFixed(5), {
      shouldValidate: true,
    });
  }, [currentCoordinates, setValue]);

  const onValidSubmit = useCallback(
    (values: PlaceFormValues) => {
      const created = addPlace({
        title: values.title,
        address: values.address,
        description: values.description,
        category: values.category,
        coordinates: {
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
        },
      });
      navigation.replace('PlaceDetails', {placeId: created.id});
    },
    [addPlace, navigation],
  );

  const handleSubmitForm = handleSubmit(onValidSubmit);

  return {
    control,
    errors,
    isSubmitting,
    categories: PLACE_CATEGORIES,
    quickCategories,
    selectedCategory,
    selectedCategoryLabel: selectedCategoryConfig.label,
    isCategoryModalVisible,
    handleSelectCategory,
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleSelectCategoryFromModal,
    handleUseCurrentCoordinates,
    handleSubmitForm,
  };
};
