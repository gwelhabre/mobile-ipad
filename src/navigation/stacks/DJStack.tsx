import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DJStackParamList } from '../../types';
import DJDashboardScreen from '../../screens/dj/DJDashboardScreen';
import DJAnalyticsScreen from '../../screens/dj/DJAnalyticsScreen';
import DJSetsScreen from '../../screens/dj/DJSetsScreen';
import DJDealsScreen from '../../screens/dj/DJDealsScreen';
import DJVideosScreen from '../../screens/dj/DJVideosScreen';

const Stack = createNativeStackNavigator<DJStackParamList>();

export default function DJStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DJDashboard" component={DJDashboardScreen} />
      <Stack.Screen name="DJAnalytics" component={DJAnalyticsScreen} />
      <Stack.Screen name="DJSets" component={DJSetsScreen} />
      <Stack.Screen name="DJDeals" component={DJDealsScreen} />
      <Stack.Screen name="DJVideos" component={DJVideosScreen} />
    </Stack.Navigator>
  );
}
