import React from 'react';
import {FlatList, Pressable, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Heart, Plus} from 'lucide-react-native';
import {PlaceCard} from '../entities/place/ui/PlaceCard';
import {
  PlaceCardItemViewModel,
  useFilteredPlaces,
} from '../features/filter-places/model/useFilteredPlaces';
import {CategoryChip} from '../shared/ui/CategoryChip';
import {EmptyState} from '../shared/ui/EmptyState';
import {SearchInput} from '../shared/ui/SearchInput';

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
    filteredPlaceCards,
    totalPlacesCount,
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
            <Text className="text-xs font-medium text-slate-500">
              {filteredPlaceCards.length} of {totalPlacesCount} locations
            </Text>
          </View>
          <View className="flex-row items-center">
            <Pressable
              onPress={handleToggleFavoritesOnly}
              className={
                onlyFavorites
                  ? 'mr-2.5 flex-row items-center rounded-xl bg-red-50 border border-red-200 px-3 py-2.5'
                  : 'mr-2.5 flex-row items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5'
              }>
              <Heart
                size={16}
                color={onlyFavorites ? '#ef4444' : '#64748b'}
                fill={onlyFavorites ? '#ef4444' : 'none'}
              />
              <Text
                className={
                  onlyFavorites
                    ? 'ml-1.5 text-xs font-semibold text-red-600'
                    : 'ml-1.5 text-xs font-semibold text-slate-700'
                }>
                Favorites
              </Text>
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
    </SafeAreaView>
  );
};
