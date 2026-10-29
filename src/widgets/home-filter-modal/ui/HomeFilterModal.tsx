import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowUpDown,
  Check,
  Heart,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  X,
} from 'lucide-react-native';
import {DistanceAnchorMode} from '../../../entities/settings/model/types';
import {
  CityAnchorPreset,
  FilterCategory,
  PLACE_SORT_OPTIONS,
  PlaceSortOption,
} from '../../../shared/config/categories';

export interface HomeFilterModalProps {
  visible: boolean;
  filterCategories: {id: FilterCategory; label: string}[];
  selectedCategory: FilterCategory;
  onlyFavorites: boolean;
  sortBy: PlaceSortOption;
  distanceAnchorMode: DistanceAnchorMode;
  activeAnchorLabel: string;
  cityPresets: CityAnchorPreset[];
  customCityInput: string;
  isSearchingCity: boolean;
  citySearchError: string | null;
  onSelectCategory: (category: FilterCategory) => void;
  onToggleFavoritesOnly: () => void;
  onSelectSortBy: (sort: PlaceSortOption) => void;
  onSelectGpsAnchor: () => void;
  onSelectCityPreset: (preset: CityAnchorPreset) => void;
  onChangeCustomCityInput: (value: string) => void;
  onApplyCustomCitySearch: () => void;
  onResetFilters: () => void;
  onClose: () => void;
}

export const HomeFilterModal: React.FC<HomeFilterModalProps> = ({
  visible,
  filterCategories,
  selectedCategory,
  onlyFavorites,
  sortBy,
  distanceAnchorMode,
  activeAnchorLabel,
  cityPresets,
  customCityInput,
  isSearchingCity,
  citySearchError,
  onSelectCategory,
  onToggleFavoritesOnly,
  onSelectSortBy,
  onSelectGpsAnchor,
  onSelectCityPreset,
  onChangeCustomCityInput,
  onApplyCustomCitySearch,
  onResetFilters,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-900/50">
        <View className="max-h-[88%] rounded-t-3xl bg-white px-5 pt-5 pb-7">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-extrabold text-slate-900">
                Filters & Distance Anchor
              </Text>
              <Text className="text-xs font-medium text-slate-500">
                Customize category, sorting and origin point
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
              <X size={18} color="#475569" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-5">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Distance Anchor (Origin Point)
              </Text>
              <View className="mb-2.5 flex-row flex-wrap">
                <Pressable
                  onPress={onSelectGpsAnchor}
                  className={
                    distanceAnchorMode === 'gps'
                      ? 'mr-2 mb-2 flex-row items-center rounded-xl border border-blue-600 bg-blue-600 px-3 py-2'
                      : 'mr-2 mb-2 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'
                  }>
                  <LocateFixed
                    size={14}
                    color={distanceAnchorMode === 'gps' ? '#ffffff' : '#475569'}
                  />
                  <Text
                    className={
                      distanceAnchorMode === 'gps'
                        ? 'ml-1.5 text-xs font-bold text-white'
                        : 'ml-1.5 text-xs font-semibold text-slate-700'
                    }>
                    Current GPS
                  </Text>
                </Pressable>

                {cityPresets.map(preset => {
                  const isSelected =
                    distanceAnchorMode === 'custom' &&
                    activeAnchorLabel.toLowerCase() ===
                      preset.label.toLowerCase();
                  return (
                    <Pressable
                      key={preset.id}
                      onPress={() => onSelectCityPreset(preset)}
                      className={
                        isSelected
                          ? 'mr-2 mb-2 flex-row items-center rounded-xl border border-blue-600 bg-blue-600 px-3 py-2'
                          : 'mr-2 mb-2 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'
                      }>
                      <MapPin
                        size={13}
                        color={isSelected ? '#ffffff' : '#64748b'}
                      />
                      <Text
                        className={
                          isSelected
                            ? 'ml-1 text-xs font-bold text-white'
                            : 'ml-1 text-xs font-semibold text-slate-700'
                        }>
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="flex-row items-center">
                <TextInput
                  value={customCityInput}
                  onChangeText={onChangeCustomCityInput}
                  placeholder="Or enter any city (e.g. Rome, Paris, Berlin)..."
                  placeholderTextColor="#94a3b8"
                  onSubmitEditing={onApplyCustomCitySearch}
                  returnKeyType="search"
                  className="mr-2 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                />
                <Pressable
                  onPress={onApplyCustomCitySearch}
                  disabled={isSearchingCity}
                  className="flex-row items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2.5">
                  {isSearchingCity ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Search size={14} color="#ffffff" />
                      <Text className="ml-1.5 text-xs font-bold text-white">
                        Set City
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
              {citySearchError ? (
                <Text className="mt-1 text-xs font-medium text-red-600">
                  {citySearchError}
                </Text>
              ) : null}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Sort Places By
              </Text>
              <View className="flex-row justify-between">
                {PLACE_SORT_OPTIONS.map(option => {
                  const isSelected = sortBy === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => onSelectSortBy(option.id)}
                      className={
                        isSelected
                          ? 'w-[31.5%] flex-row items-center justify-center rounded-xl border border-blue-600 bg-blue-50 py-2.5 px-2'
                          : 'w-[31.5%] flex-row items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-2'
                      }>
                      <ArrowUpDown
                        size={12}
                        color={isSelected ? '#2563eb' : '#64748b'}
                      />
                      <Text
                        numberOfLines={1}
                        className={
                          isSelected
                            ? 'ml-1 text-xs font-bold text-blue-700'
                            : 'ml-1 text-xs font-semibold text-slate-700'
                        }>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Favorites Filter
              </Text>
              <Pressable
                onPress={onToggleFavoritesOnly}
                className={
                  onlyFavorites
                    ? 'flex-row items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3'
                    : 'flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'
                }>
                <View className="flex-row items-center">
                  <Heart
                    size={17}
                    color={onlyFavorites ? '#ef4444' : '#64748b'}
                    fill={onlyFavorites ? '#ef4444' : 'none'}
                  />
                  <Text
                    className={
                      onlyFavorites
                        ? 'ml-2.5 text-sm font-bold text-red-600'
                        : 'ml-2.5 text-sm font-semibold text-slate-700'
                    }>
                    Show Only Favorite Places
                  </Text>
                </View>
                {onlyFavorites ? <Check size={17} color="#ef4444" /> : null}
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Categories ({filterCategories.length})
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {filterCategories.map(category => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => onSelectCategory(category.id)}
                      className={
                        isSelected
                          ? 'mb-2 w-[31.5%] flex-row items-center justify-center rounded-xl border border-blue-600 bg-blue-600 py-2.5 px-2'
                          : 'mb-2 w-[31.5%] flex-row items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-2'
                      }>
                      <Text
                        numberOfLines={1}
                        className={
                          isSelected
                            ? 'text-xs font-bold text-white'
                            : 'text-xs font-semibold text-slate-700'
                        }>
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View className="mt-2 flex-row items-center justify-between border-t border-slate-100 pt-3">
            <Pressable
              onPress={onResetFilters}
              className="mr-3 flex-row items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5">
              <RotateCcw size={15} color="#475569" />
              <Text className="ml-1.5 text-xs font-bold text-slate-700">
                Reset
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-3.5">
              <Check size={16} color="#ffffff" />
              <Text className="ml-1.5 text-sm font-bold text-white">
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

