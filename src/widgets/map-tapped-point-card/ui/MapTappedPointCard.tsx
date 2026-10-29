import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {Compass, MapPin, Plus, X} from 'lucide-react-native';

export interface MapTappedPointCardProps {
  title: string;
  address: string;
  formattedCoordinates: string;
  isLoadingAddress: boolean;
  onAddPlace: () => void;
  onClose: () => void;
}

export const MapTappedPointCard: React.FC<MapTappedPointCardProps> = ({
  title,
  address,
  formattedCoordinates,
  isLoadingAddress,
  onAddPlace,
  onClose,
}) => {
  return (
    <View className="absolute right-4 bottom-5 left-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center rounded-full bg-slate-900 px-2.5 py-1">
          <Compass size={12} color="#ffffff" />
          <Text className="ml-1.5 text-xs font-bold text-white">
            Selected Map Point
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full bg-slate-100">
          <X size={16} color="#475569" />
        </Pressable>
      </View>

      {isLoadingAddress ? (
        <View className="my-2 flex-row items-center">
          <ActivityIndicator size="small" color="#2563eb" />
          <Text className="ml-2.5 text-xs font-medium text-slate-600">
            Resolving address via Nominatim Reverse Geocoding...
          </Text>
        </View>
      ) : (
        <>
          <Text
            numberOfLines={1}
            className="text-lg font-extrabold text-slate-900">
            {title}
          </Text>
          <View className="mt-1 flex-row items-center">
            <MapPin size={13} color="#64748b" />
            <Text
              numberOfLines={2}
              className="ml-1 flex-1 text-xs text-slate-500">
              {address}
            </Text>
          </View>
        </>
      )}

      <Text className="mt-1.5 mb-3.5 text-[11px] font-medium text-slate-400">
        Coordinates: {formattedCoordinates}
      </Text>

      <Pressable
        onPress={onAddPlace}
        className="flex-row items-center justify-center rounded-xl bg-blue-600 py-3">
        <Plus size={16} color="#ffffff" />
        <Text className="ml-1.5 text-sm font-bold text-white">
          Add This Place
        </Text>
      </Pressable>
    </View>
  );
};
