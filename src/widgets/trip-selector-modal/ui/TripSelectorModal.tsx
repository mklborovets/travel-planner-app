import React from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {
  Check,
  Copy,
  Download,
  Plus,
  Route,
  Trash2,
  X,
} from 'lucide-react-native';
import {BottomSheetModal} from '../../../shared/ui/BottomSheetModal';

export interface TripSummaryOption {
  id: string;
  title: string;
  stopsCount: number;
  visitedCount: number;
  isActive: boolean;
}

export interface TripSelectorModalProps {
  visible: boolean;
  trips: TripSummaryOption[];
  newTripTitle: string;
  importTextInput: string;
  importError: string | null;
  importSuccessMessage: string | null;
  copiedTripId: string | null;
  canDeleteTrips: boolean;
  onChangeNewTripTitle: (value: string) => void;
  onChangeImportTextInput: (value: string) => void;
  onCreateTrip: () => void;
  onImportFromClipboard: () => void;
  onCopyTripExport: (tripId: string) => void;
  onSelectTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onClose: () => void;
}

export const TripSelectorModal: React.FC<TripSelectorModalProps> = ({
  visible,
  trips,
  newTripTitle,
  importTextInput,
  importError,
  importSuccessMessage,
  copiedTripId,
  canDeleteTrips,
  onChangeNewTripTitle,
  onChangeImportTextInput,
  onCreateTrip,
  onImportFromClipboard,
  onCopyTripExport,
  onSelectTrip,
  onDeleteTrip,
  onClose,
}) => {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      maxHeightClassName="max-h-[88%]">
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-extrabold text-slate-900">
            Your Trips ({trips.length})
          </Text>
          <Text className="text-xs font-medium text-slate-500">
            Switch active itinerary, create or import a shared trip
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
        <View className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Create or Import Trip
          </Text>
          <View className="flex-row items-center">
            <TextInput
              value={newTripTitle}
              onChangeText={onChangeNewTripTitle}
              placeholder="New trip name..."
              placeholderTextColor="#94a3b8"
              onSubmitEditing={onCreateTrip}
              returnKeyType="done"
              className="mr-2 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900"
            />
            <Pressable
              onPress={onCreateTrip}
              className="mr-2 flex-row items-center justify-center rounded-xl bg-blue-600 px-3 py-2.5">
              <Plus size={15} color="#ffffff" />
              <Text className="ml-1 text-xs font-bold text-white">
                Create
              </Text>
            </Pressable>
            <Pressable
              onPress={onImportFromClipboard}
              className="flex-row items-center justify-center rounded-xl bg-slate-900 px-3 py-2.5">
              <Download size={15} color="#ffffff" />
              <Text className="ml-1 text-xs font-bold text-white">
                Import
              </Text>
            </Pressable>
          </View>

          <TextInput
            value={importTextInput}
            onChangeText={onChangeImportTextInput}
            placeholder="Optional: Paste shared trip text here if not in clipboard..."
            placeholderTextColor="#94a3b8"
            className="mt-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
          />

          {importError ? (
            <Text className="mt-2 text-xs font-semibold text-red-600">
              {importError}
            </Text>
          ) : null}

          {importSuccessMessage ? (
            <Text className="mt-2 text-xs font-semibold text-emerald-600">
              {importSuccessMessage}
            </Text>
          ) : null}
        </View>

        {trips.map(trip => {
          const isCopied = copiedTripId === trip.id;
          return (
            <View
              key={trip.id}
              className={
                trip.isActive
                  ? 'mb-2.5 flex-row items-center justify-between rounded-2xl border-2 border-blue-600 bg-blue-50/60 p-3.5'
                  : 'mb-2.5 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5'
              }>
              <Pressable
                onPress={() => onSelectTrip(trip.id)}
                className="mr-2 flex-1 flex-row items-center">
                <View
                  className={
                    trip.isActive
                      ? 'mr-3 h-10 w-10 items-center justify-center rounded-xl bg-blue-600'
                      : 'mr-3 h-10 w-10 items-center justify-center rounded-xl bg-slate-100'
                  }>
                  <Route
                    size={18}
                    color={trip.isActive ? '#ffffff' : '#475569'}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className={
                      trip.isActive
                        ? 'text-base font-extrabold text-blue-700'
                        : 'text-base font-bold text-slate-900'
                    }>
                    {trip.title}
                  </Text>
                  <Text className="mt-0.5 text-xs font-medium text-slate-500">
                    {trip.visitedCount} / {trip.stopsCount} stops visited
                  </Text>
                </View>
              </Pressable>

              <View className="flex-row items-center">
                <Pressable
                  onPress={() => onCopyTripExport(trip.id)}
                  hitSlop={8}
                  className={
                    isCopied
                      ? 'mr-1.5 h-8 w-8 items-center justify-center rounded-lg bg-emerald-100'
                      : 'mr-1.5 h-8 w-8 items-center justify-center rounded-lg bg-slate-100'
                  }>
                  {isCopied ? (
                    <Check size={15} color="#059669" />
                  ) : (
                    <Copy size={14} color="#475569" />
                  )}
                </Pressable>
                {canDeleteTrips ? (
                  <Pressable
                    onPress={() => onDeleteTrip(trip.id)}
                    hitSlop={8}
                    className="h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                    <Trash2 size={15} color="#dc2626" />
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </BottomSheetModal>
  );
};
