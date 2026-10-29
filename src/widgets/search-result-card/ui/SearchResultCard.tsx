import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {Bookmark, Check, MapPin, Plus, Route} from 'lucide-react-native';

export interface SearchResultCardProps {
  title: string;
  address: string;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  formattedCoordinates: string;
  isSaved: boolean;
  isInTrip: boolean;
  onPressCard: () => void;
  onSavePlace: () => void;
  onAddToTrip: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  title,
  address,
  categoryLabel,
  categoryBadgeClassName,
  categoryTextClassName,
  formattedCoordinates,
  isSaved,
  isInTrip,
  onPressCard,
  onSavePlace,
  onAddToTrip,
}) => {
  return (
    <Pressable
      onPress={onPressCard}
      className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <View className={`rounded-full px-2.5 py-0.5 ${categoryBadgeClassName}`}>
          <Text className={`text-xs font-semibold ${categoryTextClassName}`}>
            {categoryLabel}
          </Text>
        </View>
        <Text className="text-xs font-medium text-slate-400">
          {formattedCoordinates}
        </Text>
      </View>

      <Text className="text-base font-bold text-slate-900">{title}</Text>

      <View className="mt-1 mb-3 flex-row items-start">
        <MapPin size={14} color="#64748b" />
        <Text
          numberOfLines={2}
          className="ml-1.5 flex-1 text-xs leading-4 text-slate-500">
          {address}
        </Text>
      </View>

      <View className="flex-row items-center space-x-2">
        <Pressable
          onPress={onSavePlace}
          disabled={isSaved}
          className={
            isSaved
              ? 'mr-2 flex-1 flex-row items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-2.5'
              : 'mr-2 flex-1 flex-row items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5'
          }>
          {isSaved ? (
            <Check size={15} color="#059669" />
          ) : (
            <Bookmark size={15} color="#334155" />
          )}
          <Text
            className={
              isSaved
                ? 'ml-1.5 text-xs font-bold text-emerald-700'
                : 'ml-1.5 text-xs font-bold text-slate-700'
            }>
            {isSaved ? 'Saved' : 'Save Place'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onAddToTrip}
          disabled={isInTrip}
          className={
            isInTrip
              ? 'flex-1 flex-row items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-2.5'
              : 'flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-2.5'
          }>
          {isInTrip ? (
            <Route size={15} color="#2563eb" />
          ) : (
            <Plus size={15} color="#ffffff" />
          )}
          <Text
            className={
              isInTrip
                ? 'ml-1.5 text-xs font-bold text-blue-700'
                : 'ml-1.5 text-xs font-bold text-white'
            }>
            {isInTrip ? 'In Trip' : 'Save + Add to Trip'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

