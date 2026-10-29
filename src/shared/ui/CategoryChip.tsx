import React, {memo} from 'react';
import {Pressable, Text} from 'react-native';

export interface CategoryChipProps<T extends string = string> {
  id?: T;
  label: string;
  isSelected: boolean;
  onSelect?: (id: T) => void;
  onPress?: () => void;
}

function CategoryChipComponent<T extends string = string>({
  id,
  label,
  isSelected,
  onSelect,
  onPress,
}: CategoryChipProps<T>) {
  return (
    <Pressable
      onPress={() => {
        if (onSelect && id !== undefined) {
          onSelect(id);
          return;
        }
        onPress?.();
      }}
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
}

export const CategoryChip = memo(
  CategoryChipComponent,
) as typeof CategoryChipComponent;
