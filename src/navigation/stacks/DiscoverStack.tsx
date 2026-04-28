import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../../types';
import DJsScreen from '../../screens/discover/DJsScreen';
import DJProfileScreen from '../../screens/discover/DJProfileScreen';
import VenuesScreen from '../../screens/discover/VenuesScreen';
import EventsScreen from '../../screens/discover/EventsScreen';
import EventDetailScreen from '../../screens/discover/EventDetailScreen';
import SearchScreen from '../../screens/discover/SearchScreen';
import VenueBroadcastScreen from '../../screens/venue/VenueBroadcastScreen';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DJs" component={DJsScreen} />
      <Stack.Screen name="DJProfile" component={DJProfileScreen} />
      <Stack.Screen name="Venues" component={VenuesScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="VenueBroadcast" component={VenueBroadcastScreen} />
    </Stack.Navigator>
  );
}
