import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../shared/types/navigation';
import {BottomTabNavigator} from './BottomTabNavigator';
import {PlaceDetailsScreen} from '../../screens/PlaceDetailsScreen';
import {AddPlaceScreen} from '../../screens/AddPlaceScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerBackTitleVisible: false,
          headerTintColor: '#0f172a',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}>
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PlaceDetails"
          component={PlaceDetailsScreen}
          options={{title: 'Place Details'}}
        />
        <Stack.Screen
          name="AddPlace"
          component={AddPlaceScreen}
          options={{title: 'Add Place'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

