import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {LocateFixed, MapPin, Navigation, Sparkles, X} from 'lucide-react-native';
import {RouteStartCandidate} from '../../../entities/trip/model/types';
import {BottomSheetModal} from '../../../shared/ui/BottomSheetModal';

export type {RouteStartCandidate};

export interface RouteBuilderModalProps {
  visible: boolean;
  candidates: RouteStartCandidate[];
  onStartFromNearestToMe: () => void;
  onStartFromPlace: (placeId: string) => void;
  onClose: () => void;
}

export const RouteBuilderModal: React.FC<RouteBuilderModalProps> = ({
  visible,
  candidates,
  onStartFromNearestToMe,
  onStartFromPlace,
  onClose,
}) => {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      maxHeightClassName="max-h-[82%]">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-lg font-extrabold text-slate-900">
            Smart Route Builder
          </Text>
          <Text className="text-xs font-medium text-slate-500">
            Pick the first stop (#1) — each next stop will connect to the
            closest neighbour without zig-zags
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
          <X size={18} color="#475569" />
        </Pressable>
      </View>

      <Pressable
        onPress={onStartFromNearestToMe}
        className="mb-4 flex-row items-center rounded-2xl bg-blue-600 p-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <LocateFixed size={20} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-extrabold text-white">
            Start from Nearest Stop to Me
          </Text>
          <Text className="mt-0.5 text-xs text-blue-100">
            Finds the closest stop to your location, then chains step-by-step
          </Text>
        </View>
        <Sparkles size={18} color="#ffffff" />
      </Pressable>

      <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        Or Choose Starting Stop (#1) From List
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {candidates.map(candidate => (
          <Pressable
            key={candidate.placeId}
            onPress={() => onStartFromPlace(candidate.placeId)}
            className="mb-2.5 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <View className="mr-2 flex-1">
              <Text
                numberOfLines={1}
                className="text-sm font-bold text-slate-900">
                {candidate.title}
              </Text>
              <View className="mt-0.5 flex-row items-center">
                <MapPin size={12} color="#64748b" />
                <Text
                  numberOfLines={1}
                  className="ml-1 flex-1 text-xs text-slate-500">
                  {candidate.address}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
              <Navigation size={11} color="#2563eb" />
              <Text className="ml-1 text-xs font-bold text-blue-600">
                {candidate.distanceFromUserLabel}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheetModal>
  );
};
