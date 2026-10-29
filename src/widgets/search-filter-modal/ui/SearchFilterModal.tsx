import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Check,
  Globe,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  X,
} from 'lucide-react-native';
import {
  SearchRadiusKm,
  SearchScopeMode,
} from '../../../entities/place/model/types';
import {CityAnchorPreset} from '../../../shared/config/categories';
import {
  CountryFilterPreset,
  SEARCH_RADIUS_OPTIONS,
  SEARCH_SCOPE_OPTIONS,
} from '../../../shared/config/searchOptions';

export interface SearchFilterModalProps {
  visible: boolean;
  scopeMode: SearchScopeMode;
  countryCode: string;
  countryPresets: CountryFilterPreset[];
  selectedCityLabel: string;
  cityPresets: CityAnchorPreset[];
  customCityInput: string;
  isSearchingCity: boolean;
  citySearchError: string | null;
  radiusKm: SearchRadiusKm;
  nearMeOriginLabel: string;
  onSelectScopeMode: (mode: SearchScopeMode) => void;
  onSelectCountryCode: (code: string) => void;
  onSelectCityPreset: (preset: CityAnchorPreset) => void;
  onChangeCustomCityInput: (value: string) => void;
  onApplyCustomCitySearch: () => void;
  onSelectRadiusKm: (radius: SearchRadiusKm) => void;
  onResetScope: () => void;
  onClose: () => void;
}

export const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  visible,
  scopeMode,
  countryCode,
  countryPresets,
  selectedCityLabel,
  cityPresets,
  customCityInput,
  isSearchingCity,
  citySearchError,
  radiusKm,
  nearMeOriginLabel,
  onSelectScopeMode,
  onSelectCountryCode,
  onSelectCityPreset,
  onChangeCustomCityInput,
  onApplyCustomCitySearch,
  onSelectRadiusKm,
  onResetScope,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-900/50">
        <View className="max-h-[88%] rounded-t-3xl bg-white px-5 pt-5 pb-7">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-extrabold text-slate-900">
                Spatial Search Settings
              </Text>
              <Text className="text-xs font-medium text-slate-500">
                Choose search region, country or bounding box radius
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
            <View className="mb-5">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Search Mode (4 Scenarios)
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {SEARCH_SCOPE_OPTIONS.map(option => {
                  const isSelected = scopeMode === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => onSelectScopeMode(option.id)}
                      className={
                        isSelected
                          ? 'mb-2.5 w-[48.5%] rounded-2xl border-2 border-blue-600 bg-blue-50/70 p-3'
                          : 'mb-2.5 w-[48.5%] rounded-2xl border border-slate-200 bg-slate-50 p-3'
                      }>
                      <View className="mb-1 flex-row items-center justify-between">
                        <Text
                          className={
                            isSelected
                              ? 'text-sm font-extrabold text-blue-700'
                              : 'text-sm font-bold text-slate-800'
                          }>
                          {option.label}
                        </Text>
                        {isSelected ? (
                          <Check size={15} color="#2563eb" />
                        ) : null}
                      </View>
                      <Text className="text-[11px] leading-4 text-slate-500">
                        {option.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {scopeMode === 'worldwide' ? (
              <View className="mb-4 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Globe size={20} color="#2563eb" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-bold text-slate-800">
                    Global OpenStreetMap Search
                  </Text>
                  <Text className="mt-0.5 text-xs text-slate-500">
                    Queries will match cities, streets and landmarks across all
                    countries without spatial bounds.
                  </Text>
                </View>
              </View>
            ) : null}

            {scopeMode === 'country' ? (
              <View className="mb-5">
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Country (ISO Code)
                </Text>
                <View className="mb-3 flex-row flex-wrap justify-between">
                  {countryPresets.map(country => {
                    const isSelected =
                      countryCode.toLowerCase() === country.code.toLowerCase();
                    return (
                      <Pressable
                        key={country.code}
                        onPress={() => onSelectCountryCode(country.code)}
                        className={
                          isSelected
                            ? 'mb-2 w-[48.5%] flex-row items-center justify-between rounded-xl border border-blue-600 bg-blue-600 px-3 py-2.5'
                            : 'mb-2 w-[48.5%] flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5'
                        }>
                        <Text
                          className={
                            isSelected
                              ? 'text-xs font-bold text-white'
                              : 'text-xs font-semibold text-slate-700'
                          }>
                          {country.label}
                        </Text>
                        {isSelected ? (
                          <Check size={14} color="#ffffff" />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
                <View className="flex-row items-center">
                  <Text className="mr-3 text-xs font-semibold text-slate-600">
                    Custom 2-letter ISO code:
                  </Text>
                  <TextInput
                    value={countryCode}
                    onChangeText={onSelectCountryCode}
                    maxLength={2}
                    autoCapitalize="none"
                    placeholder="ua"
                    placeholderTextColor="#94a3b8"
                    className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold uppercase text-slate-900"
                  />
                </View>
              </View>
            ) : null}

            {scopeMode === 'city_radius' ? (
              <View className="mb-5">
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target City Center ({selectedCityLabel})
                </Text>
                <View className="mb-2.5 flex-row flex-wrap">
                  {cityPresets.map(preset => {
                    const isSelected =
                      selectedCityLabel.toLowerCase() ===
                      preset.label.toLowerCase();
                    return (
                      <Pressable
                        key={preset.id}
                        onPress={() => onSelectCityPreset(preset)}
                        className={
                          isSelected
                            ? 'mr-2 mb-2 flex-row items-center rounded-xl border border-blue-600 bg-blue-600 px-3 py-2'
                            : 'mr-2 mb-2 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'
                        }>
                        <MapPin
                          size={13}
                          color={isSelected ? '#ffffff' : '#64748b'}
                        />
                        <Text
                          className={
                            isSelected
                              ? 'ml-1 text-xs font-bold text-white'
                              : 'ml-1 text-xs font-semibold text-slate-700'
                          }>
                          {preset.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View className="mb-3 flex-row items-center">
                  <TextInput
                    value={customCityInput}
                    onChangeText={onChangeCustomCityInput}
                    placeholder="Search any other city (e.g. Milan, Prague)..."
                    placeholderTextColor="#94a3b8"
                    onSubmitEditing={onApplyCustomCitySearch}
                    returnKeyType="search"
                    className="mr-2 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900"
                  />
                  <Pressable
                    onPress={onApplyCustomCitySearch}
                    disabled={isSearchingCity}
                    className="flex-row items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2.5">
                    {isSearchingCity ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Search size={14} color="#ffffff" />
                        <Text className="ml-1.5 text-xs font-bold text-white">
                          Set City
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
                {citySearchError ? (
                  <Text className="mb-2 text-xs font-medium text-red-600">
                    {citySearchError}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {scopeMode === 'near_me' ? (
              <View className="mb-5 flex-row items-center rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <LocateFixed size={20} color="#2563eb" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-bold text-slate-900">
                    Origin: {nearMeOriginLabel}
                  </Text>
                  <Text className="mt-0.5 text-xs text-slate-600">
                    Uses your active GPS coordinates or the custom Distance
                    Anchor selected on the Home screen.
                  </Text>
                </View>
              </View>
            ) : null}

            {scopeMode === 'city_radius' || scopeMode === 'near_me' ? (
              <View className="mb-5">
                <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bounding Box Radius (km)
                </Text>
                <View className="flex-row justify-between">
                  {SEARCH_RADIUS_OPTIONS.map(option => {
                    const isSelected = radiusKm === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => onSelectRadiusKm(option)}
                        className={
                          isSelected
                            ? 'w-[23.5%] items-center justify-center rounded-xl border border-blue-600 bg-blue-600 py-2.5'
                            : 'w-[23.5%] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5'
                        }>
                        <Text
                          className={
                            isSelected
                              ? 'text-xs font-bold text-white'
                              : 'text-xs font-semibold text-slate-700'
                          }>
                          {option} km
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View className="mt-2 flex-row items-center justify-between border-t border-slate-100 pt-3">
            <Pressable
              onPress={onResetScope}
              className="mr-3 flex-row items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5">
              <RotateCcw size={15} color="#475569" />
              <Text className="ml-1.5 text-xs font-bold text-slate-700">
                Worldwide
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-3.5">
              <Check size={16} color="#ffffff" />
              <Text className="ml-1.5 text-sm font-bold text-white">
                Apply Search Scope
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
