import React from 'react';
import {Pressable, Text, View} from 'react-native';
import MapView from 'react-native-maps';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocateFixed, Plus} from 'lucide-react-native';
import {PlaceMarker} from '../entities/place/ui/PlaceMarker';
import {useMapExplorer} from '../features/map-explorer/model/useMapExplorer';
import {MapPlacePreview} from '../widgets/map-place-preview/ui/MapPlacePreview';

export const MapScreen: React.FC = () => {
  const {
    mapRef,
    initialRegion,
    markers,
    selectedPreview,
    isLocationGranted,
    customMapStyle,
    handleSelectMarker,
    handleClearSelection,
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
        customMapStyle={customMapStyle}
        onPress={handleClearSelection}>
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
      </MapView>

      <SafeAreaView
        edges={['top']}
        pointerEvents="box-none"
        className="absolute top-0 right-0 left-0 px-4 pt-3">
        <View
          pointerEvents="box-none"
          className="flex-row items-center justify-between">
          <View className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm">
            <Text className="text-sm font-extrabold text-slate-900">
              Places Map
            </Text>
            <Text className="text-xs font-medium text-slate-500">
              {markers.length} saved markers
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
    </View>
  );
};
