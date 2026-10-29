import React from 'react';
import {Pressable, Text, View} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Compass, LocateFixed, Minus, Plus} from 'lucide-react-native';
import {PlaceMarker} from '../entities/place/ui/PlaceMarker';
import {useMapExplorer} from '../features/map-explorer/model/useMapExplorer';
import {MapPlacePreview} from '../widgets/map-place-preview/ui/MapPlacePreview';
import {MapTappedPointCard} from '../widgets/map-tapped-point-card/ui/MapTappedPointCard';

export const MapScreen: React.FC = () => {
  const {
    mapRef,
    initialRegion,
    markers,
    routeSegments,
    selectedPreview,
    tappedPoint,
    hasBottomCard,
    isLocationGranted,
    customMapStyle,
    handleRegionChangeComplete,
    handleResetNorth,
    handleZoomIn,
    handleZoomOut,
    handleSelectMarker,
    handleClearSelection,
    handleMapPress,
    handlePoiPress,
    handleQuickSaveTappedPlace,
    handleAddTappedPlace,
    handleCenterOnUser,
    handleOpenSelectedDetails,
    handleToggleSelectedFavorite,
    handleOpenAddPlaceHere,
  } = useMapExplorer();

  return (
    <View className="flex-1 bg-slate-100">
      <MapView
        ref={mapRef}
        style={{flex: 1}}
        initialRegion={initialRegion}
        showsUserLocation={isLocationGranted}
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={customMapStyle}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        onPoiClick={handlePoiPress}>
        {routeSegments.map(segment => (
          <Polyline
            key={segment.id}
            coordinates={segment.coordinates}
            strokeColor={segment.isCompleted ? '#10b981' : '#2563eb'}
            strokeWidth={4}
            lineDashPattern={segment.isCompleted ? undefined : [8, 5]}
          />
        ))}

        {markers.map(marker => (
          <PlaceMarker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.address}
            pinColor={marker.pinColor}
            onPress={() => handleSelectMarker(marker.id)}
          />
        ))}

        {tappedPoint ? (
          <Marker
            coordinate={tappedPoint.coordinates}
            title={tappedPoint.title}
            description={tappedPoint.address}
            pinColor="#0f172a"
          />
        ) : null}
      </MapView>

      <SafeAreaView
        edges={['top']}
        pointerEvents="box-none"
        className="absolute top-0 right-0 left-0 px-4 pt-3">
        <View
          pointerEvents="box-none"
          className="flex-row items-center justify-between">
          <View className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Text className="text-sm font-extrabold text-slate-900">
              Places Map
            </Text>
            <Text className="text-xs font-medium text-slate-500">
              {markers.length} markers • Tap map or POI
            </Text>
          </View>

          <View className="flex-row items-center">
            <Pressable
              onPress={handleCenterOnUser}
              className="mr-2.5 h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <LocateFixed size={20} color="#2563eb" />
            </Pressable>
            <Pressable
              onPress={handleOpenAddPlaceHere}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-sm">
              <Plus size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <View
        pointerEvents="box-none"
        className={
          hasBottomCard
            ? 'absolute right-4 bottom-56 items-center'
            : 'absolute right-4 bottom-6 items-center'
        }>
        <Pressable
          onPress={handleResetNorth}
          className="mb-2 h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Compass size={20} color="#2563eb" />
        </Pressable>
        <Pressable
          onPress={handleZoomIn}
          className="mb-2 h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Plus size={20} color="#0f172a" />
        </Pressable>
        <Pressable
          onPress={handleZoomOut}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Minus size={20} color="#0f172a" />
        </Pressable>
      </View>

      {selectedPreview ? (
        <MapPlacePreview
          title={selectedPreview.title}
          address={selectedPreview.address}
          categoryLabel={selectedPreview.categoryLabel}
          categoryBadgeClassName={selectedPreview.categoryBadgeClassName}
          categoryTextClassName={selectedPreview.categoryTextClassName}
          distanceLabel={selectedPreview.distanceLabel}
          isFavorite={selectedPreview.isFavorite}
          onClose={handleClearSelection}
          onOpenDetails={handleOpenSelectedDetails}
          onToggleFavorite={handleToggleSelectedFavorite}
        />
      ) : null}

      {!selectedPreview && tappedPoint ? (
        <MapTappedPointCard
          title={tappedPoint.title}
          address={tappedPoint.address}
          categoryLabel={tappedPoint.categoryLabel}
          categoryBadgeClassName={tappedPoint.categoryBadgeClassName}
          categoryTextClassName={tappedPoint.categoryTextClassName}
          formattedCoordinates={tappedPoint.formattedCoordinates}
          isLoadingAddress={tappedPoint.isLoadingAddress}
          onQuickSavePlace={handleQuickSaveTappedPlace}
          onAddPlace={handleAddTappedPlace}
          onClose={handleClearSelection}
        />
      ) : null}
    </View>
  );
};
