import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VenueStackParamList } from '../../types';
import VenueDashboardScreen from '../../screens/venue/VenueDashboardScreen';
import VenueDealsScreen from '../../screens/venue/VenueDealsScreen';
import VenuePostEventScreen from '../../screens/venue/VenuePostEventScreen';
import VenueAnalyticsScreen from '../../screens/venue/VenueAnalyticsScreen';
import VenueBroadcastScreen from '../../screens/venue/VenueBroadcastScreen';
import DJsScreen from '../../screens/discover/DJsScreen';

const Stack = createNativeStackNavigator<VenueStackParamList>();

export default function VenueStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VenueDashboard" component={VenueDashboardScreen} />
      <Stack.Screen name="VenueDeals" component={VenueDealsScreen} />
      <Stack.Screen name="VenuePostEvent" component={VenuePostEventScreen} />
      <Stack.Screen name="VenueAnalytics" component={VenueAnalyticsScreen} />
      <Stack.Screen name="VenueFindDJs" component={DJsScreen} />
      <Stack.Screen name="VenueBroadcast" component={VenueBroadcastScreen} />
    </Stack.Navigator>
  );
}
