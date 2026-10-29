import React from 'react';
import {Animated, Pressable, Text, View} from 'react-native';
import {
  CheckSquare,
  GripVertical,
  Map,
  MapPin,
  Navigation,
  Square,
  Trash2,
} from 'lucide-react-native';
import {useDraggableTripRow} from '../../../features/trip-planner/model/useDraggableTripRow';

export interface TripItemRowProps {
  stepNumber: number;
  title: string;
  address: string;
  categoryLabel: string;
  categoryBadgeClassName: string;
  categoryTextClassName: string;
  distanceLabel: string;
  isVisited: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleVisited: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStateChange: (isDragging: boolean) => void;
  onPressDetails: () => void;
  onPressFocusMap: () => void;
  onPressRemove: () => void;
}

export const TripItemRow: React.FC<TripItemRowProps> = ({
  stepNumber,
  title,
  address,
  categoryLabel,
  categoryBadgeClassName,
  categoryTextClassName,
  distanceLabel,
  isVisited,
  canMoveUp,
  canMoveDown,
  onToggleVisited,
  onMoveUp,
  onMoveDown,
  onDragStateChange,
  onPressDetails,
  onPressFocusMap,
  onPressRemove,
}) => {
  const {translateY, isDragging, panHandlers} = useDraggableTripRow({
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    onDragStateChange,
  });

  return (
    <Animated.View
      style={{
        transform: [{translateY}, {scale: isDragging ? 1.02 : 1}],
        zIndex: isDragging ? 50 : 1,
      }}
      className={
        isDragging
          ? 'mb-3 rounded-2xl border-2 border-blue-600 bg-white p-4 shadow-md'
          : isVisited
            ? 'mb-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4'
            : 'mb-3 rounded-2xl border border-slate-200 bg-white p-4'
      }>
      <View className="flex-row items-center">
        <View
          {...panHandlers}
          className="mr-2.5 h-10 w-7 items-center justify-center rounded-lg bg-slate-100">
          <GripVertical
            size={16}
            color={isDragging ? '#2563eb' : '#64748b'}
          />
        </View>

        <Pressable
          onPress={onToggleVisited}
          hitSlop={8}
          className="mr-3 items-center justify-center">
          {isVisited ? (
            <CheckSquare size={22} color="#059669" />
          ) : (
            <Square size={22} color="#94a3b8" />
          )}
        </Pressable>

        <Pressable onPress={onPressDetails} className="flex-1 pr-2">
          <View className="mb-1.5 flex-row items-center">
            <View className="mr-2 rounded-md bg-slate-900 px-2 py-0.5">
              <Text className="text-xs font-bold text-white">
                #{stepNumber}
              </Text>
            </View>
            <View
              className={`rounded-full px-2.5 py-0.5 ${categoryBadgeClassName}`}>
              <Text className={`text-xs font-semibold ${categoryTextClassName}`}>
                {categoryLabel}
              </Text>
            </View>
            <View className="ml-2 flex-row items-center">
              <Navigation size={11} color="#64748b" />
              <Text className="ml-1 text-xs font-medium text-slate-500">
                {distanceLabel}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={1}
            className={
              isVisited
                ? 'text-base font-bold text-slate-400 line-through'
                : 'text-base font-bold text-slate-900'
            }>
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
        </Pressable>

        <View className="flex-row items-center">
          <Pressable
            onPress={onPressFocusMap}
            hitSlop={8}
            className="mr-1.5 h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
            <Map size={16} color="#2563eb" />
          </Pressable>
          <Pressable
            onPress={onPressRemove}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-xl bg-red-50">
            <Trash2 size={16} color="#dc2626" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};
