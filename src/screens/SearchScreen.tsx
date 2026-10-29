import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Globe, SlidersHorizontal} from 'lucide-react-native';
import {
  SearchPlaceViewModel,
  usePlacesSearch,
} from '../features/search-places/model/usePlacesSearch';
import {EmptyState} from '../shared/ui/EmptyState';
import {SearchInput} from '../shared/ui/SearchInput';
import {SearchFilterModal} from '../widgets/search-filter-modal/ui/SearchFilterModal';
import {SearchResultCard} from '../widgets/search-result-card/ui/SearchResultCard';

const keyExtractor = (item: SearchPlaceViewModel) => item.place.id;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
});

export const SearchScreen: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    handleClearSearch,
    scopeMode,
    setScopeMode,
    countryCode,
    setCountryCode,
    countryPresets,
    selectedCityLabel,
    selectedCityPresetId,
    cityPresets,
    customCityInput,
    setCustomCityInput,
    isSearchingCity,
    citySearchError,
    radiusKm,
    setRadiusKm,
    nearMeOriginLabel,
    scopeSummaryLabel,
    isScopeModalVisible,
    handleOpenScopeModal,
    handleCloseScopeModal,
    handleSelectCityPreset,
    handleApplyCustomCitySearch,
    handleResetScope,
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

  const renderResultItem = useCallback<ListRenderItem<SearchPlaceViewModel>>(
    ({item}) => (
      <SearchResultCard
        place={item.place}
        title={item.place.title}
        address={item.place.address}
        categoryLabel={item.categoryLabel}
        categoryBadgeClassName={item.categoryBadgeClassName}
        categoryTextClassName={item.categoryTextClassName}
        formattedCoordinates={item.formattedCoordinates}
        isSaved={item.isSaved}
        isInTrip={item.isInTrip}
        onPressCard={handleOpenResultDetails}
        onSavePlace={handleSavePlace}
        onAddToTrip={handleSaveAndAddToTrip}
      />
    ),
    [handleOpenResultDetails, handleSavePlace, handleSaveAndAddToTrip],
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <View className="px-4 pt-3 pb-2">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="mr-3 flex-1">
            <Text className="text-2xl font-extrabold text-slate-900">
              Discover Places
            </Text>
            <Pressable
              onPress={handleOpenScopeModal}
              className="mt-0.5 flex-row items-center">
              <Globe size={12} color="#2563eb" />
              <Text className="ml-1 text-xs font-semibold text-blue-600">
                Scope: {scopeSummaryLabel}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleOpenScopeModal}
            className={
              scopeMode !== 'worldwide'
                ? 'flex-row items-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5'
                : 'flex-row items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5'
            }>
            <SlidersHorizontal
              size={16}
              color={scopeMode !== 'worldwide' ? '#2563eb' : '#475569'}
            />
            <Text
              className={
                scopeMode !== 'worldwide'
                  ? 'ml-1.5 text-xs font-bold text-blue-600'
                  : 'ml-1.5 text-xs font-semibold text-slate-700'
              }>
              Search Scope
            </Text>
          </Pressable>
        </View>

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
            Searching OpenStreetMap ({scopeSummaryLabel})...
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
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={renderResultItem}
          ListEmptyComponent={
            <EmptyState
              title="No places found"
              description="We could not find any OpenStreetMap locations matching your query and spatial bounds."
              actionLabel={
                scopeMode !== 'worldwide'
                  ? 'Switch to Worldwide'
                  : 'Clear Search'
              }
              onActionPress={
                scopeMode !== 'worldwide'
                  ? handleResetScope
                  : handleClearSearch
              }
            />
          }
        />
      )}

      <SearchFilterModal
        visible={isScopeModalVisible}
        scopeMode={scopeMode}
        countryCode={countryCode}
        countryPresets={countryPresets}
        selectedCityLabel={selectedCityLabel}
        selectedCityPresetId={selectedCityPresetId}
        cityPresets={cityPresets}
        customCityInput={customCityInput}
        isSearchingCity={isSearchingCity}
        citySearchError={citySearchError}
        radiusKm={radiusKm}
        nearMeOriginLabel={nearMeOriginLabel}
        onSelectScopeMode={setScopeMode}
        onSelectCountryCode={setCountryCode}
        onSelectCityPreset={handleSelectCityPreset}
        onChangeCustomCityInput={setCustomCityInput}
        onApplyCustomCitySearch={handleApplyCustomCitySearch}
        onSelectRadiusKm={setRadiusKm}
        onResetScope={handleResetScope}
        onClose={handleCloseScopeModal}
      />
    </SafeAreaView>
  );
};
