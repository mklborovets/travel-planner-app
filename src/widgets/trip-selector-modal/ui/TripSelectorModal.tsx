import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Check, Plus, Route, Trash2, X} from 'lucide-react-native';

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
  canDeleteTrips: boolean;
  onChangeNewTripTitle: (value: string) => void;
  onCreateTrip: () => void;
  onSelectTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onClose: () => void;
}

export const TripSelectorModal: React.FC<TripSelectorModalProps> = ({
  visible,
  trips,
  newTripTitle,
  canDeleteTrips,
  onChangeNewTripTitle,
  onCreateTrip,
  onSelectTrip,
  onDeleteTrip,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-900/50">
        <View className="max-h-[85%] rounded-t-3xl bg-white px-5 pt-5 pb-7">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-extrabold text-slate-900">
                Your Trips ({trips.length})
              </Text>
              <Text className="text-xs font-medium text-slate-500">
                Switch active itinerary or create a new trip
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
              <X size={18} color="#475569" />
            </Pressable>
          </View>

          <View className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Create New Trip
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={newTripTitle}
                onChangeText={onChangeNewTripTitle}
                placeholder="e.g. Rome Summer Vacation..."
                placeholderTextColor="#94a3b8"
                onSubmitEditing={onCreateTrip}
                returnKeyType="done"
                className="mr-2 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900"
              />
              <Pressable
                onPress={onCreateTrip}
                className="flex-row items-center justify-center rounded-xl bg-blue-600 px-3.5 py-2.5">
                <Plus size={16} color="#ffffff" />
                <Text className="ml-1 text-xs font-bold text-white">
                  Create
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {trips.map(trip => (
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
                  {trip.isActive ? (
                    <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Check size={16} color="#2563eb" />
                    </View>
                  ) : null}
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
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
