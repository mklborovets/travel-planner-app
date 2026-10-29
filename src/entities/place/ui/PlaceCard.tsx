import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {Heart, MapPin, Navigation} from 'lucide-react-native';

export interface PlaceCardProps {
  title: string;
  address: string;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  distanceLabel?: string;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  title,
  address,
  categoryLabel,
  categoryBadgeClassName,
  categoryTextClassName,
  distanceLabel,
  isFavorite,
  onPress,
  onToggleFavorite,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="mb-2 flex-row items-center">
            <View className={`rounded-full px-2.5 py-0.5 ${categoryBadgeClassName}`}>
              <Text className={`text-xs font-semibold ${categoryTextClassName}`}>
                {categoryLabel}
              </Text>
            </View>
            {distanceLabel ? (
              <View className="ml-2 flex-row items-center">
                <Navigation size={12} color="#64748b" />
                <Text className="ml-1 text-xs font-medium text-slate-500">
                  {distanceLabel}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            numberOfLines={1}
            className="text-base font-bold text-slate-900">
            {title}
          </Text>
          <View className="mt-1 flex-row items-center">
            <MapPin size={13} color="#64748b" />
            <Text
              numberOfLines={1}
              className="ml-1 flex-1 text-xs text-slate-500">
              {address}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-full bg-slate-50">
          <Heart
            size={18}
            color={isFavorite ? '#ef4444' : '#94a3b8'}
            fill={isFavorite ? '#ef4444' : 'none'}
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

