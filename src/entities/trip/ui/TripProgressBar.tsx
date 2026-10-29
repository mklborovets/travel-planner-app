import React from 'react';
import {Text, View} from 'react-native';
import {CheckCircle2} from 'lucide-react-native';

export interface TripProgressBarProps {
  visitedCount: number;
  totalCount: number;
  progressPercent: number;
}

export const TripProgressBar: React.FC<TripProgressBarProps> = ({
  visitedCount,
  totalCount,
  progressPercent,
}) => {
  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <CheckCircle2 size={16} color="#2563eb" />
          <Text className="ml-2 text-sm font-semibold text-slate-800">
            Trip Progress
          </Text>
        </View>
        <Text className="text-sm font-bold text-blue-600">
          {visitedCount} / {totalCount} visited
        </Text>
      </View>
      <View className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <View
          style={{width: `${progressPercent}%`}}
          className="h-full rounded-full bg-blue-600"
        />
      </View>
    </View>
  );
};

