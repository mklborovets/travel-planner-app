import React from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Heart,
  LocateFixed,
  MapPin,
  Plus,
  SlidersHorizontal,
} from 'lucide-react-native';
import {PlaceCard} from '../entities/place/ui/PlaceCard';
import {
  PlaceCardItemViewModel,
  useFilteredPlaces,
} from '../features/filter-places/model/useFilteredPlaces';
import {CategoryChip} from '../shared/ui/CategoryChip';
import {EmptyState} from '../shared/ui/EmptyState';
import {SearchInput} from '../shared/ui/SearchInput';
import {HomeFilterModal} from '../widgets/home-filter-modal/ui/HomeFilterModal';

const keyExtractor = (item: PlaceCardItemViewModel) => item.id;

export const HomeScreen: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    filterCategories,
    selectedCategory,
    setSelectedCategory,
    onlyFavorites,
    handleToggleFavoritesOnly,
    sortBy,
    setSortBy,
    distanceAnchorMode,
    activeAnchorLabel,
    activeFiltersCount,
    cityPresets,
    customCityInput,
    setCustomCityInput,
    isSearchingCity,
    citySearchError,
    isFilterModalVisible,
    handleOpenFilterModal,
    handleCloseFilterModal,
    handleSelectGpsAnchor,
    handleSelectCityPreset,
    handleApplyCustomCitySearch,
    filteredPlaceCards,
    totalPlacesCount,
    isRefreshing,
    handlePullToRefresh,
    toggleFavorite,
    handleOpenPlaceDetails,
    handleOpenAddPlace,
    handleResetFilters,
  } = useFilteredPlaces();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <View className="px-4 pt-3 pb-2">
        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-extrabold text-slate-900">
              Saved Places
            </Text>
            <View className="mt-0.5 flex-row items-center">
              <Text className="text-xs font-medium text-slate-500">
                {filteredPlaceCards.length} of {totalPlacesCount}
              </Text>
              <Text className="mx-1.5 text-xs text-slate-300">|</Text>
              <Pressable
                onPress={handleOpenFilterModal}
                className="flex-row items-center">
                {distanceAnchorMode === 'gps' ? (
                  <LocateFixed size={11} color="#2563eb" />
                ) : (
                  <MapPin size={11} color="#2563eb" />
                )}
                <Text className="ml-1 text-xs font-semibold text-blue-600">
                  From: {activeAnchorLabel}
                </Text>
              </Pressable>
            </View>
          </View>
          <View className="flex-row items-center">
            <Pressable
              onPress={handleOpenFilterModal}
              className={
                activeFiltersCount > 0
                  ? 'mr-2 flex-row items-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5'
                  : 'mr-2 flex-row items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5'
              }>
              <SlidersHorizontal
                size={16}
                color={activeFiltersCount > 0 ? '#2563eb' : '#475569'}
              />
              {activeFiltersCount > 0 ? (
                <Text className="ml-1.5 text-xs font-bold text-blue-600">
                  {activeFiltersCount}
                </Text>
              ) : null}
            </Pressable>
            <Pressable
              onPress={handleToggleFavoritesOnly}
              className={
                onlyFavorites
                  ? 'mr-2 flex-row items-center rounded-xl border border-red-200 bg-red-50 px-3 py-2.5'
                  : 'mr-2 flex-row items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5'
              }>
              <Heart
                size={16}
                color={onlyFavorites ? '#ef4444' : '#64748b'}
                fill={onlyFavorites ? '#ef4444' : 'none'}
              />
            </Pressable>
            <Pressable
              onPress={handleOpenAddPlace}
              className="flex-row items-center rounded-xl bg-blue-600 px-3.5 py-2.5">
              <Plus size={16} color="#ffffff" />
              <Text className="ml-1 text-xs font-bold text-white">Add</Text>
            </Pressable>
          </View>
        </View>

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
          placeholder="Filter saved places by name or address..."
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 flex-row">
          {filterCategories.map(category => (
            <CategoryChip
              key={category.id}
              label={category.label}
              isSelected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPlaceCards}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handlePullToRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        renderItem={({item}) => (
          <PlaceCard
            title={item.title}
            address={item.address}
            categoryLabel={item.categoryLabel}
            categoryBadgeClassName={item.categoryBadgeClassName}
            categoryTextClassName={item.categoryTextClassName}
            distanceLabel={item.distanceLabel}
            isFavorite={item.isFavorite}
            onPress={() => handleOpenPlaceDetails(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No matching places"
            description="Try clearing your search filters or add a new custom place to your collection."
            actionLabel={
              totalPlacesCount > 0 ? 'Reset Filters' : 'Add Custom Place'
            }
            onActionPress={
              totalPlacesCount > 0 ? handleResetFilters : handleOpenAddPlace
            }
          />
        }
      />

      <HomeFilterModal
        visible={isFilterModalVisible}
        filterCategories={filterCategories}
        selectedCategory={selectedCategory}
        onlyFavorites={onlyFavorites}
        sortBy={sortBy}
        distanceAnchorMode={distanceAnchorMode}
        activeAnchorLabel={activeAnchorLabel}
        cityPresets={cityPresets}
        customCityInput={customCityInput}
        isSearchingCity={isSearchingCity}
        citySearchError={citySearchError}
        onSelectCategory={setSelectedCategory}
        onToggleFavoritesOnly={handleToggleFavoritesOnly}
        onSelectSortBy={setSortBy}
        onSelectGpsAnchor={handleSelectGpsAnchor}
        onSelectCityPreset={handleSelectCityPreset}
        onChangeCustomCityInput={setCustomCityInput}
        onApplyCustomCitySearch={handleApplyCustomCitySearch}
        onResetFilters={handleResetFilters}
        onClose={handleCloseFilterModal}
      />
    </SafeAreaView>
  );
};
