import React from 'react';
import {FlatList, Pressable, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Map, Trash2} from 'lucide-react-native';
import {TripProgressBar} from '../entities/trip/ui/TripProgressBar';
import {
  TripStopViewModel,
  useTripPlanner,
} from '../features/trip-planner/model/useTripPlanner';
import {EmptyState} from '../shared/ui/EmptyState';
import {TripItemRow} from '../widgets/trip-item-card/ui/TripItemRow';

const keyExtractor = (item: TripStopViewModel) => item.placeId;

export const TripScreen: React.FC = () => {
  const {
    title,
    setTitle,
    stops,
    visitedCount,
    totalCount,
    progressPercent,
    toggleVisited,
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
        <View className="mb-3 flex-row items-center justify-between">
          <View className="mr-3 flex-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Trip Itinerary
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter trip name..."
              placeholderTextColor="#94a3b8"
              className="p-0 text-2xl font-extrabold text-slate-900"
            />
          </View>

          <View className="flex-row items-center">
            <Pressable
              onPress={handleOpenTripOnMap}
              className="mr-2 flex-row items-center rounded-xl bg-blue-600 px-3.5 py-2.5">
              <Map size={15} color="#ffffff" />
              <Text className="ml-1.5 text-xs font-bold text-white">
                View Map
              </Text>
            </Pressable>
            {totalCount > 0 ? (
              <Pressable
                onPress={clearTrip}
                className="h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <Trash2 size={16} color="#dc2626" />
              </Pressable>
            ) : null}
          </View>
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
            onToggleVisited={() => toggleVisited(item.placeId)}
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
    </SafeAreaView>
  );
};
