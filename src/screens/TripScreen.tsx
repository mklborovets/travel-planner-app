import React from 'react';
import {FlatList, Pressable, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowUpDown,
  ChevronDown,
  Map,
  Route,
  Share2,
  Trash2,
} from 'lucide-react-native';
import {TripProgressBar} from '../entities/trip/ui/TripProgressBar';
import {
  TripStopViewModel,
  useTripPlanner,
} from '../features/trip-planner/model/useTripPlanner';
import {EmptyState} from '../shared/ui/EmptyState';
import {TripItemRow} from '../widgets/trip-item-card/ui/TripItemRow';
import {TripSelectorModal} from '../widgets/trip-selector-modal/ui/TripSelectorModal';

const keyExtractor = (item: TripStopViewModel) => item.placeId;

export const TripScreen: React.FC = () => {
  const {
    title,
    setTitle,
    tripSummaries,
    canDeleteTrips,
    isTripSelectorVisible,
    newTripTitle,
    setNewTripTitle,
    handleOpenTripSelector,
    handleCloseTripSelector,
    handleSelectTrip,
    handleCreateNewTrip,
    handleDeleteTrip,
    stops,
    visitedCount,
    totalCount,
    progressPercent,
    toggleVisited,
    handleMoveStopUp,
    handleMoveStopDown,
    handleSortByDistance,
    handleShareTrip,
    removePlaceFromTrip,
    clearTrip,
    handleOpenPlaceDetails,
    handleFocusStopOnMap,
    handleOpenTripOnMap,
    handleBrowsePlaces,
  } = useTripPlanner();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <View className="px-4 pt-3 pb-2">
        <View className="mb-2 flex-row items-center justify-between">
          <Pressable
            onPress={handleOpenTripSelector}
            className="flex-row items-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5">
            <Route size={13} color="#2563eb" />
            <Text className="mx-1.5 text-xs font-bold text-blue-700">
              Switch Trip ({tripSummaries.length})
            </Text>
            <ChevronDown size={14} color="#2563eb" />
          </Pressable>

          <View className="flex-row items-center">
            {totalCount > 1 ? (
              <Pressable
                onPress={handleSortByDistance}
                className="mr-2 flex-row items-center rounded-xl border border-slate-200 bg-white px-2.5 py-2">
                <ArrowUpDown size={14} color="#334155" />
                <Text className="ml-1 text-xs font-semibold text-slate-700">
                  Sort by km
                </Text>
              </Pressable>
            ) : null}

            {totalCount > 0 ? (
              <Pressable
                onPress={handleShareTrip}
                className="mr-2 h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50">
                <Share2 size={15} color="#2563eb" />
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleOpenTripOnMap}
              className="mr-2 flex-row items-center rounded-xl bg-blue-600 px-3 py-2">
              <Map size={14} color="#ffffff" />
              <Text className="ml-1 text-xs font-bold text-white">Map</Text>
            </Pressable>

            {totalCount > 0 ? (
              <Pressable
                onPress={clearTrip}
                className="h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <Trash2 size={15} color="#dc2626" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <View className="mb-3">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter trip name..."
            placeholderTextColor="#94a3b8"
            className="p-0 text-2xl font-extrabold text-slate-900"
          />
        </View>

        <TripProgressBar
          visitedCount={visitedCount}
          totalCount={totalCount}
          progressPercent={progressPercent}
        />
      </View>

      <FlatList
        data={stops}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        renderItem={({item}) => (
          <TripItemRow
            stepNumber={item.stepNumber}
            title={item.title}
            address={item.address}
            categoryLabel={item.categoryLabel}
            categoryBadgeClassName={item.categoryBadgeClassName}
            categoryTextClassName={item.categoryTextClassName}
            distanceLabel={item.distanceLabel}
            isVisited={item.isVisited}
            canMoveUp={item.canMoveUp}
            canMoveDown={item.canMoveDown}
            onToggleVisited={() => toggleVisited(item.placeId)}
            onMoveUp={() => handleMoveStopUp(item.placeId)}
            onMoveDown={() => handleMoveStopDown(item.placeId)}
            onPressDetails={() => handleOpenPlaceDetails(item.placeId)}
            onPressFocusMap={() =>
              handleFocusStopOnMap(item.placeId, item.coordinates)
            }
            onPressRemove={() => removePlaceFromTrip(item.placeId)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Your trip itinerary is empty"
            description="Search for places or open any saved location to add stops to your travel route."
            actionLabel="Discover Places"
            onActionPress={handleBrowsePlaces}
          />
        }
      />

      <TripSelectorModal
        visible={isTripSelectorVisible}
        trips={tripSummaries}
        newTripTitle={newTripTitle}
        canDeleteTrips={canDeleteTrips}
        onChangeNewTripTitle={setNewTripTitle}
        onCreateTrip={handleCreateNewTrip}
        onSelectTrip={handleSelectTrip}
        onDeleteTrip={handleDeleteTrip}
        onClose={handleCloseTripSelector}
      />
    </SafeAreaView>
  );
};
