import React from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {Search, X} from 'lucide-react-native';

export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder,
}) => {
  return (
    <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
      <Search size={18} color="#64748b" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        autoCapitalize="none"
        autoCorrect={false}
        className="ml-2.5 flex-1 text-base text-slate-900 p-0"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          className="ml-2 rounded-full bg-slate-100 p-1">
          <X size={14} color="#475569" />
        </Pressable>
      ) : null}
    </View>
  );
};

