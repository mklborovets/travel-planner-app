import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Compass, Map, Route, Search} from 'lucide-react-native';
import {MainTabParamList} from '../../shared/types/navigation';
import {HomeScreen} from '../../screens/HomeScreen';
import {MapScreen} from '../../screens/MapScreen';
import {SearchScreen} from '../../screens/SearchScreen';
import {TripScreen} from '../../screens/TripScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderHomeIcon = ({color, size}: {color: string; size: number}) => (
  <Compass color={color} size={size} />
);

const renderMapIcon = ({color, size}: {color: string; size: number}) => (
  <Map color={color} size={size} />
);

const renderSearchIcon = ({color, size}: {color: string; size: number}) => (
  <Search color={color} size={size} />
);

const renderTripIcon = ({color, size}: {color: string; size: number}) => (
  <Route color={color} size={size} />
);

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Places',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          title: 'Map',
          tabBarIcon: renderMapIcon,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          title: 'Search',
          tabBarIcon: renderSearchIcon,
        }}
      />
      <Tab.Screen
        name="TripTab"
        component={TripScreen}
        options={{
          title: 'Trip',
          tabBarIcon: renderTripIcon,
        }}
      />
    </Tab.Navigator>
  );
};

