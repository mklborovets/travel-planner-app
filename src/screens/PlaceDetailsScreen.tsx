import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {
  Check,
  Compass,
  Copy,
  Heart,
  Map,
  MapPin,
  Navigation,
  Route,
  Share2,
  Trash2,
} from 'lucide-react-native';
import {usePlaceDetails} from '../features/place-details/model/usePlaceDetails';
import {EmptyState} from '../shared/ui/EmptyState';

export const PlaceDetailsScreen: React.FC = () => {
  const {
    detailsViewModel,
    isAddressCopied,
    isCoordinatesCopied,
    handleCopyAddress,
    handleCopyCoordinates,
    handleSharePlace,
    handleToggleFavorite,
    handleToggleTrip,
    handleOpenOnMap,
    handleDeletePlace,
    handleGoBack,
  } = usePlaceDetails();

  if (!detailsViewModel) {
    return (
      <View className="flex-1 bg-slate-50">
        <EmptyState
          title="Place not found"
          description="This location may have been removed from your saved list."
          actionLabel="Go Back"
          onActionPress={handleGoBack}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{padding: 16, paddingBottom: 36}}>
      <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
        <View className="mb-3 flex-row items-center justify-between">
          <View
            className={`rounded-full px-3 py-1 ${detailsViewModel.categoryBadgeClassName}`}>
            <Text
              className={`text-xs font-bold ${detailsViewModel.categoryTextClassName}`}>
              {detailsViewModel.categoryLabel}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Navigation size={14} color="#2563eb" />
            <Text className="ml-1 text-xs font-semibold text-blue-600">
              {detailsViewModel.distanceLabel} away
            </Text>
          </View>
        </View>

        <Text className="mb-2 text-2xl font-extrabold text-slate-900">
          {detailsViewModel.title}
        </Text>

        <View className="mb-3 flex-row items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
          <View className="mr-2 flex-1 flex-row items-start">
            <MapPin size={16} color="#64748b" />
            <Text className="ml-2 flex-1 text-sm leading-5 text-slate-600">
              {detailsViewModel.address}
            </Text>
          </View>
          <Pressable
            onPress={handleCopyAddress}
            hitSlop={8}
            className={
              isAddressCopied
                ? 'flex-row items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5'
                : 'flex-row items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5'
            }>
            {isAddressCopied ? (
              <>
                <Check size={13} color="#059669" />
                <Text className="ml-1 text-xs font-bold text-emerald-700">
                  Copied
                </Text>
              </>
            ) : (
              <>
                <Copy size={13} color="#475569" />
                <Text className="ml-1 text-xs font-semibold text-slate-700">
                  Copy
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
          <View className="mr-2 flex-1 flex-row items-center">
            <Compass size={16} color="#475569" />
            <Text className="ml-2 text-xs font-medium text-slate-600">
              Coordinates: {detailsViewModel.formattedCoordinates}
            </Text>
          </View>
          <Pressable
            onPress={handleCopyCoordinates}
            hitSlop={8}
            className={
              isCoordinatesCopied
                ? 'flex-row items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5'
                : 'flex-row items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5'
            }>
            {isCoordinatesCopied ? (
              <>
                <Check size={13} color="#059669" />
                <Text className="ml-1 text-xs font-bold text-emerald-700">
                  Copied
                </Text>
              </>
            ) : (
              <>
                <Copy size={13} color="#475569" />
                <Text className="ml-1 text-xs font-semibold text-slate-700">
                  Copy
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
        <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
          Notes & Description
        </Text>
        <Text className="text-base leading-6 text-slate-700">
          {detailsViewModel.description}
        </Text>
      </View>

      <View className="space-y-3">
        <Pressable
          onPress={handleToggleFavorite}
          className={
            detailsViewModel.isFavorite
              ? 'mb-3 flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 py-3.5'
              : 'mb-3 flex-row items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5'
          }>
          <Heart
            size={18}
            color={detailsViewModel.isFavorite ? '#ef4444' : '#334155'}
            fill={detailsViewModel.isFavorite ? '#ef4444' : 'none'}
          />
          <Text
            className={
              detailsViewModel.isFavorite
                ? 'ml-2 text-sm font-bold text-red-600'
                : 'ml-2 text-sm font-bold text-slate-800'
            }>
            {detailsViewModel.isFavorite
              ? 'Remove from Favorites'
              : 'Add to Favorites'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleToggleTrip}
          className={
            detailsViewModel.isInTrip
              ? 'mb-3 flex-row items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-3.5'
              : 'mb-3 flex-row items-center justify-center rounded-xl bg-blue-600 py-3.5'
          }>
          <Route
            size={18}
            color={detailsViewModel.isInTrip ? '#059669' : '#ffffff'}
          />
          <Text
            className={
              detailsViewModel.isInTrip
                ? 'ml-2 text-sm font-bold text-emerald-700'
                : 'ml-2 text-sm font-bold text-white'
            }>
            {detailsViewModel.isInTrip ? 'Remove from Trip' : 'Add to Trip'}
          </Text>
        </Pressable>

        <View className="mb-3 flex-row">
          <Pressable
            onPress={handleOpenOnMap}
            className="mr-2 flex-1 flex-row items-center justify-center rounded-xl bg-slate-900 py-3.5">
            <Map size={18} color="#ffffff" />
            <Text className="ml-2 text-sm font-bold text-white">
              Open on Map
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSharePlace}
            className="ml-2 flex-1 flex-row items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-3.5">
            <Share2 size={18} color="#2563eb" />
            <Text className="ml-2 text-sm font-bold text-blue-700">
              Share Place
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleDeletePlace}
          className="flex-row items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5">
          <Trash2 size={17} color="#dc2626" />
          <Text className="ml-2 text-sm font-semibold text-red-600">
            Delete Saved Place
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};
