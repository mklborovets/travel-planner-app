import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {
  ChevronRight,
  Heart,
  MapPin,
  Navigation,
  X,
} from 'lucide-react-native';

export interface MapPlacePreviewProps {
  title: string;
  address: string;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  distanceLabel: string;
  isFavorite: boolean;
  onClose: () => void;
  onOpenDetails: () => void;
  onToggleFavorite: () => void;
}

export const MapPlacePreview: React.FC<MapPlacePreviewProps> = ({
  title,
  address,
  categoryLabel,
  categoryBadgeClassName,
  categoryTextClassName,
  distanceLabel,
  isFavorite,
  onClose,
  onOpenDetails,
  onToggleFavorite,
}) => {
  return (
    <View className="absolute right-4 bottom-5 left-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className={`rounded-full px-2.5 py-0.5 ${categoryBadgeClassName}`}>
            <Text className={`text-xs font-semibold ${categoryTextClassName}`}>
              {categoryLabel}
            </Text>
          </View>
          <View className="ml-2.5 flex-row items-center">
            <Navigation size={12} color="#2563eb" />
            <Text className="ml-1 text-xs font-semibold text-blue-600">
              {distanceLabel}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={8}
            className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            <Heart
              size={16}
              color={isFavorite ? '#ef4444' : '#64748b'}
              fill={isFavorite ? '#ef4444' : 'none'}
            />
          </Pressable>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            <X size={16} color="#475569" />
          </Pressable>
        </View>
      </View>

      <Text numberOfLines={1} className="text-lg font-extrabold text-slate-900">
        {title}
      </Text>

      <View className="mt-1 mb-3.5 flex-row items-center">
        <MapPin size={13} color="#64748b" />
        <Text numberOfLines={1} className="ml-1 flex-1 text-xs text-slate-500">
          {address}
        </Text>
      </View>

      <Pressable
        onPress={onOpenDetails}
        className="flex-row items-center justify-center rounded-xl bg-blue-600 py-3">
        <Text className="text-sm font-bold text-white">View Place Details</Text>
        <ChevronRight size={16} color="#ffffff" />
      </Pressable>
    </View>
  );
};
