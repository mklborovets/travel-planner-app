import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {MapPin} from 'lucide-react-native';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onActionPress,
}) => {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-blue-50">
        <MapPin size={26} color="#2563eb" />
      </View>
      <Text className="mb-1.5 text-center text-lg font-bold text-slate-900">
        {title}
      </Text>
      <Text className="mb-5 text-center text-sm leading-5 text-slate-500">
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          className="rounded-xl bg-blue-600 px-5 py-3">
          <Text className="text-sm font-semibold text-white">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
