import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Controller} from 'react-hook-form';
import {Check, Crosshair, LayoutGrid} from 'lucide-react-native';
import {useAddPlaceForm} from '../features/add-place/model/useAddPlaceForm';
import {CategoryChip} from '../shared/ui/CategoryChip';
import {CategoryPickerModal} from '../widgets/category-picker-modal/ui/CategoryPickerModal';

export const AddPlaceScreen: React.FC = () => {
  const {
    control,
    errors,
    categories,
    quickCategories,
    selectedCategory,
    isCategoryModalVisible,
    handleSelectCategory,
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleSelectCategoryFromModal,
    handleLatitudeInputChange,
    handleLongitudeInputChange,
    handleUseCurrentCoordinates,
    handleSubmitForm,
  } = useAddPlaceForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{padding: 16, paddingBottom: 40}}
        keyboardShouldPersistTaps="handled">
        <View className="mb-4">
          <Text className="mb-1.5 text-sm font-semibold text-slate-700">
            Title *
          </Text>
          <Controller
            control={control}
            name="title"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. High Castle Viewpoint"
                placeholderTextColor="#94a3b8"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
              />
            )}
          />
          {errors.title ? (
            <Text className="mt-1 text-xs font-medium text-red-600">
              {errors.title.message}
            </Text>
          ) : null}
        </View>

        <View className="mb-4">
          <Text className="mb-1.5 text-sm font-semibold text-slate-700">
            Address *
          </Text>
          <Controller
            control={control}
            name="address"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Zamkova Hill, Lviv"
                placeholderTextColor="#94a3b8"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
              />
            )}
          />
          {errors.address ? (
            <Text className="mt-1 text-xs font-medium text-red-600">
              {errors.address.message}
            </Text>
          ) : null}
        </View>

        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-slate-700">
              Category *
            </Text>
            <Pressable
              onPress={handleOpenCategoryModal}
              className="flex-row items-center rounded-lg bg-slate-200/80 px-2.5 py-1">
              <LayoutGrid size={13} color="#334155" />
              <Text className="ml-1.5 text-xs font-semibold text-slate-700">
                More Categories...
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row">
            {quickCategories.map(category => (
              <CategoryChip
                key={category.id}
                label={category.label}
                isSelected={selectedCategory === category.id}
                onPress={() => handleSelectCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View className="mb-4">
          <View className="mb-1.5 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-slate-700">
                Coordinates *
              </Text>
              <Text className="text-[11px] text-slate-400">
                Tip: Paste &quot;49.84166, 24.03533&quot; to auto-fill both fields
              </Text>
            </View>
            <Pressable
              onPress={handleUseCurrentCoordinates}
              className="flex-row items-center rounded-lg bg-blue-50 px-2.5 py-1.5">
              <Crosshair size={14} color="#2563eb" />
              <Text className="ml-1.5 text-xs font-semibold text-blue-600">
                Use Current Location
              </Text>
            </Pressable>
          </View>

          <View className="flex-row space-x-3">
            <View className="mr-2 flex-1">
              <Text className="mb-1 text-xs text-slate-500">Latitude</Text>
              <Controller
                control={control}
                name="latitude"
                render={({field: {onBlur, value}}) => (
                  <TextInput
                    value={value}
                    onChangeText={handleLatitudeInputChange}
                    onBlur={onBlur}
                    keyboardType="numbers-and-punctuation"
                    placeholder="49.83970"
                    placeholderTextColor="#94a3b8"
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-900"
                  />
                )}
              />
              {errors.latitude ? (
                <Text className="mt-1 text-xs font-medium text-red-600">
                  {errors.latitude.message}
                </Text>
              ) : null}
            </View>

            <View className="ml-2 flex-1">
              <Text className="mb-1 text-xs text-slate-500">Longitude</Text>
              <Controller
                control={control}
                name="longitude"
                render={({field: {onBlur, value}}) => (
                  <TextInput
                    value={value}
                    onChangeText={handleLongitudeInputChange}
                    onBlur={onBlur}
                    keyboardType="numbers-and-punctuation"
                    placeholder="24.02970"
                    placeholderTextColor="#94a3b8"
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-900"
                  />
                )}
              />
              {errors.longitude ? (
                <Text className="mt-1 text-xs font-medium text-red-600">
                  {errors.longitude.message}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-1.5 text-sm font-semibold text-slate-700">
            Description / Notes
          </Text>
          <Controller
            control={control}
            name="description"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Optional notes, opening hours, tips..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="min-h-[100px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
              />
            )}
          />
          {errors.description ? (
            <Text className="mt-1 text-xs font-medium text-red-600">
              {errors.description.message}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={handleSubmitForm}
          className="flex-row items-center justify-center rounded-xl bg-blue-600 py-4">
          <Check size={18} color="#ffffff" />
          <Text className="ml-2 text-base font-bold text-white">
            Save Place
          </Text>
        </Pressable>
      </ScrollView>

      <CategoryPickerModal
        visible={isCategoryModalVisible}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategoryFromModal}
        onClose={handleCloseCategoryModal}
      />
    </KeyboardAvoidingView>
  );
};
