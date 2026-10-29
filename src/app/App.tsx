import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Text className="text-xl font-bold text-slate-900">
          Places Travel Planner
        </Text>
      </View>
    </SafeAreaProvider>
  );
};

export default App;
