import React from 'react';
import {Modal, Pressable, ScrollView, Text, View} from 'react-native';
import {Check, X} from 'lucide-react-native';
import {PlaceCategory} from '../../../entities/place/model/types';
import {CategoryConfig} from '../../../shared/config/categories';

export interface CategoryPickerModalProps {
  visible: boolean;
  categories: CategoryConfig[];
  selectedCategory: PlaceCategory;
  onSelectCategory: (category: PlaceCategory) => void;
  onClose: () => void;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  categories,
  selectedCategory,
  onSelectCategory,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-900/50">
        <View className="max-h-[80%] rounded-t-3xl bg-white px-5 pt-5 pb-8">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-extrabold text-slate-900">
                Select Place Category
              </Text>
              <Text className="text-xs font-medium text-slate-500">
                Choose from all {categories.length} available categories
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
              <X size={18} color="#475569" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-between">
              {categories.map(category => {
                const isSelected = category.id === selectedCategory;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => onSelectCategory(category.id)}
                    className={
                      isSelected
                        ? 'mb-2.5 w-[48.5%] flex-row items-center justify-between rounded-2xl border-2 border-blue-600 bg-blue-50/70 px-3.5 py-3'
                        : 'mb-2.5 w-[48.5%] flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3'
                    }>
                    <View className="flex-row items-center">
                      <View
                        style={{backgroundColor: category.hexColor}}
                        className="mr-2.5 h-3 w-3 rounded-full"
                      />
                      <Text
                        className={
                          isSelected
                            ? 'text-sm font-bold text-blue-700'
                            : 'text-sm font-semibold text-slate-800'
                        }>
                        {category.label}
                      </Text>
                    </View>
                    {isSelected ? <Check size={16} color="#2563eb" /> : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
