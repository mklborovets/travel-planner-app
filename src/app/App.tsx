import React from 'react';
import {StatusBar} from 'react-native';
import {QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {queryClient} from '../shared/api/queryClient';
import {AppNavigator} from './navigation/AppNavigator';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
