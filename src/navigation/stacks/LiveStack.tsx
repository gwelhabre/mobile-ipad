import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LiveStackParamList } from '../../types';
import LiveDirectoryScreen from '../../screens/live/LiveDirectoryScreen';
import LiveStreamScreen from '../../screens/live/LiveStreamScreen';

const Stack = createNativeStackNavigator<LiveStackParamList>();

export default function LiveStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LiveDirectory" component={LiveDirectoryScreen} />
      <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
    </Stack.Navigator>
  );
}
