import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RankingsScreen from '../../screens/rankings/RankingsScreen';

const Stack = createNativeStackNavigator();

export default function RankingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Rankings" component={RankingsScreen} />
    </Stack.Navigator>
  );
}
