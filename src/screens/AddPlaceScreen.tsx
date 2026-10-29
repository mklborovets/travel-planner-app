import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Controller} from 'react-hook-form';
import {
  Check,
  Crosshair,
  LayoutGrid,
  RotateCcw,
  Search,
} from 'lucide-react-native';
import {useAddPlaceForm} from '../features/add-place/model/useAddPlaceForm';
import {CategoryChip} from '../shared/ui/CategoryChip';
import {CategoryPickerModal} from '../widgets/category-picker-modal/ui/CategoryPickerModal';

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
});

export const AddPlaceScreen: React.FC = () => {
  const {
    control,
    errors,
    isSubmitting,
    isResolvingLocation,
    resolutionStatusMessage,
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
    handleResolveCoordinatesFromAddress,
    handleClearAllFields,
    handleSubmitForm,
  } = useAddPlaceForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="flex-1 pr-2 text-xs font-medium text-slate-500">
            Provide either an address or coordinates — the other fills
            automatically.
          </Text>
          <Pressable
            onPress={handleClearAllFields}
            className="flex-row items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5">
            <RotateCcw size={13} color="#475569" />
            <Text className="ml-1.5 text-xs font-bold text-slate-700">
              Clear All
            </Text>
          </Pressable>
        </View>

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
          <View className="mb-1.5 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-slate-700">
              Address (or fill via Coordinates)
            </Text>
            <Pressable
              onPress={handleResolveCoordinatesFromAddress}
              disabled={isResolvingLocation}
              className="flex-row items-center rounded-lg bg-slate-200/80 px-2.5 py-1">
              <Search size={12} color="#334155" />
              <Text className="ml-1 text-xs font-semibold text-slate-700">
                Find Coordinates
              </Text>
            </Pressable>
          </View>
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
                id={category.id}
                label={category.label}
                isSelected={selectedCategory === category.id}
                onSelect={handleSelectCategory}
              />
            ))}
          </ScrollView>
        </View>

        <View className="mb-4">
          <Text className="mb-0.5 text-sm font-semibold text-slate-700">
            Coordinates (or fill via Address)
          </Text>
          <Text className="mb-2 text-xs text-slate-400">
            Tip: Paste &quot;49.84166, 24.03533&quot; into either box to fill
            both and auto-detect address
          </Text>

          <Pressable
            onPress={handleUseCurrentCoordinates}
            disabled={isResolvingLocation}
            className="mb-3 flex-row items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-2.5 px-3">
            {isResolvingLocation ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Crosshair size={15} color="#2563eb" />
            )}
            <Text className="ml-2 text-xs font-bold text-blue-700">
              Use Current GPS Location & Auto-Fill Address
            </Text>
          </Pressable>

          {resolutionStatusMessage ? (
            <Text className="mb-2 text-xs font-medium text-blue-600">
              {resolutionStatusMessage}
            </Text>
          ) : null}

          <View className="flex-row">
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
          disabled={isSubmitting}
          className="flex-row items-center justify-center rounded-xl bg-blue-600 py-4">
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Check size={18} color="#ffffff" />
          )}
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
