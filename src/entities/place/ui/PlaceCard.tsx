import React, {memo} from 'react';
import {Pressable, Text, View} from 'react-native';
import {Heart, MapPin, Navigation, Route} from 'lucide-react-native';

export interface PlaceCardProps {
  placeId: string;
  title: string;
  address: string;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  distanceLabel?: string;
  isFavorite: boolean;
  isInTrip: boolean;
  onPress: (placeId: string) => void;
  onToggleFavorite: (placeId: string) => void;
  onToggleTrip: (placeId: string) => void;
}

const PlaceCardComponent: React.FC<PlaceCardProps> = ({
  placeId,
  title,
  address,
  categoryLabel,
  categoryBadgeClassName,
  categoryTextClassName,
  distanceLabel,
  isFavorite,
  isInTrip,
  onPress,
  onToggleFavorite,
  onToggleTrip,
}) => {
  return (
    <Pressable
      onPress={() => onPress(placeId)}
      className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="mb-2 flex-row items-center">
            <View
              className={`rounded-full px-2.5 py-0.5 ${categoryBadgeClassName}`}>
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
        <View className="flex-row items-center">
          <Pressable
            onPress={() => onToggleTrip(placeId)}
            hitSlop={8}
            className={
              isInTrip
                ? 'mr-1.5 h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50'
                : 'mr-1.5 h-9 w-9 items-center justify-center rounded-full bg-slate-50'
            }>
            <Route size={17} color={isInTrip ? '#059669' : '#94a3b8'} />
          </Pressable>
          <Pressable
            onPress={() => onToggleFavorite(placeId)}
            hitSlop={8}
            className={
              isFavorite
                ? 'h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50'
                : 'h-9 w-9 items-center justify-center rounded-full bg-slate-50'
            }>
            <Heart
              size={18}
              color={isFavorite ? '#ef4444' : '#94a3b8'}
              fill={isFavorite ? '#ef4444' : 'none'}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

export const PlaceCard = memo(PlaceCardComponent);
