import React from 'react';
import {Pressable, Text} from 'react-native';

export interface CategoryChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={
        isSelected
          ? 'mr-2 rounded-full bg-blue-600 px-4 py-2'
          : 'mr-2 rounded-full border border-slate-200 bg-white px-4 py-2'
      }>
      <Text
        className={
          isSelected
            ? 'text-xs font-semibold text-white'
            : 'text-xs font-medium text-slate-700'
        }>
        {label}
      </Text>
    </Pressable>
  );
};
