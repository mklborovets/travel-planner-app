import React from 'react';
import {FlatList, Pressable, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ChevronDown,
  Map,
  Route,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import {TripProgressBar} from '../entities/trip/ui/TripProgressBar';
import {
  TripStopViewModel,
  useTripPlanner,
} from '../features/trip-planner/model/useTripPlanner';
import {EmptyState} from '../shared/ui/EmptyState';
import {RouteBuilderModal} from '../widgets/route-builder-modal/ui/RouteBuilderModal';
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
    isRouteBuilderVisible,
    isAnyRowDragging,
    setIsAnyRowDragging,
    newTripTitle,
    setNewTripTitle,
    importTextInput,
    setImportTextInput,
    importError,
    importSuccessMessage,
    copiedTripId,
    routeCandidates,
    handleOpenTripSelector,
    handleCloseTripSelector,
    handleSelectTrip,
    handleCreateNewTrip,
    handleCopyTripExport,
    handleImportFromClipboard,
    handleDeleteTrip,
    stops,
    visitedCount,
    totalCount,
    progressPercent,
    toggleVisited,
    handleMoveStopUp,
    handleMoveStopDown,
    handleOpenRouteBuilder,
    handleCloseRouteBuilder,
    handleBuildRouteFromPlace,
    handleBuildRouteFromNearestToMe,
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
        <View className="mb-2.5 flex-row items-center justify-between">
          <View className="mr-3 flex-1">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Active Trip Itinerary
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter trip name..."
              placeholderTextColor="#94a3b8"
              className="p-0 text-2xl font-extrabold text-slate-900"
            />
          </View>

          <Pressable
            onPress={handleOpenTripSelector}
            className="h-10 flex-shrink-0 flex-row items-center rounded-xl border border-blue-200 bg-blue-50 px-3">
            <Route size={14} color="#2563eb" />
            <Text
              style={{fontVariant: ['tabular-nums']}}
              className="mx-1.5 text-xs font-bold text-blue-700">
              Trips ({tripSummaries.length})
            </Text>
            <ChevronDown size={14} color="#2563eb" />
          </Pressable>
        </View>

        <View className="mb-3 flex-row items-center">
          {totalCount > 1 ? (
            <Pressable
              onPress={handleOpenRouteBuilder}
              className="mr-2 h-10 flex-1 flex-row items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-3">
              <Sparkles size={14} color="#4f46e5" />
              <Text className="ml-1.5 text-xs font-bold text-indigo-700">
                Build Route
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleOpenTripOnMap}
            className="mr-2 h-10 flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 px-3">
            <Map size={14} color="#ffffff" />
            <Text className="ml-1.5 text-xs font-bold text-white">
              View on Map
            </Text>
          </Pressable>

          {totalCount > 0 ? (
            <>
              <Pressable
                onPress={handleShareTrip}
                className="mr-2 h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <Share2 size={16} color="#2563eb" />
              </Pressable>
              <Pressable
                onPress={clearTrip}
                className="h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <Trash2 size={16} color="#dc2626" />
              </Pressable>
            </>
          ) : null}
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
        scrollEnabled={!isAnyRowDragging}
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
            onDragStateChange={setIsAnyRowDragging}
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
        importTextInput={importTextInput}
        importError={importError}
        importSuccessMessage={importSuccessMessage}
        copiedTripId={copiedTripId}
        canDeleteTrips={canDeleteTrips}
        onChangeNewTripTitle={setNewTripTitle}
        onChangeImportTextInput={setImportTextInput}
        onCreateTrip={handleCreateNewTrip}
        onImportFromClipboard={handleImportFromClipboard}
        onCopyTripExport={handleCopyTripExport}
        onSelectTrip={handleSelectTrip}
        onDeleteTrip={handleDeleteTrip}
        onClose={handleCloseTripSelector}
      />

      <RouteBuilderModal
        visible={isRouteBuilderVisible}
        candidates={routeCandidates}
        onStartFromNearestToMe={handleBuildRouteFromNearestToMe}
        onStartFromPlace={handleBuildRouteFromPlace}
        onClose={handleCloseRouteBuilder}
      />
    </SafeAreaView>
  );
};
