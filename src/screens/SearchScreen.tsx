import React from 'react';
import {ActivityIndicator, FlatList, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  SearchPlaceViewModel,
  usePlacesSearch,
} from '../features/search-places/model/usePlacesSearch';
import {EmptyState} from '../shared/ui/EmptyState';
import {SearchInput} from '../shared/ui/SearchInput';
import {SearchResultCard} from '../widgets/search-result-card/ui/SearchResultCard';

const keyExtractor = (item: SearchPlaceViewModel) => item.place.id;

export const SearchScreen: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    hasMinQueryLength,
    results,
    isLoading,
    isError,
    errorMessage,
    handleRetry,
    handleSavePlace,
    handleSaveAndAddToTrip,
    handleOpenResultDetails,
  } = usePlacesSearch();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <View className="px-4 pt-3 pb-2">
        <Text className="mb-1 text-2xl font-extrabold text-slate-900">
          Discover Places
        </Text>
        <Text className="mb-3 text-xs font-medium text-slate-500">
          Search worldwide locations via OpenStreetMap Nominatim
        </Text>

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
          placeholder="Search city, landmark, cafe or museum..."
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-3 text-sm font-medium text-slate-600">
            Searching OpenStreetMap...
          </Text>
        </View>
      ) : isError ? (
        <EmptyState
          title="Search failed"
          description={errorMessage}
          actionLabel="Try Again"
          onActionPress={handleRetry}
        />
      ) : !hasMinQueryLength ? (
        <EmptyState
          title="Start typing to search"
          description="Enter at least 2 characters to find places, cafes, parks and landmarks via OpenStreetMap."
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          renderItem={({item}) => (
            <SearchResultCard
              title={item.place.title}
              address={item.place.address}
              categoryLabel={item.categoryLabel}
              categoryBadgeClassName={item.categoryBadgeClassName}
              categoryTextClassName={item.categoryTextClassName}
              formattedCoordinates={item.formattedCoordinates}
              isSaved={item.isSaved}
              isInTrip={item.isInTrip}
              onPressCard={() => handleOpenResultDetails(item.place)}
              onSavePlace={() => handleSavePlace(item.place)}
              onAddToTrip={() => handleSaveAndAddToTrip(item.place)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No places found"
              description="We could not find any OpenStreetMap locations matching your query."
              actionLabel="Clear Search"
              onActionPress={handleClearSearch}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};
