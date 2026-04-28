import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompetitionsStackParamList } from '../../types';
import CompetitionsScreen from '../../screens/competitions/CompetitionsScreen';
import CompetitionDetailScreen from '../../screens/competitions/CompetitionDetailScreen';

const Stack = createNativeStackNavigator<CompetitionsStackParamList>();

export default function CompetitionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Competitions" component={CompetitionsScreen} />
      <Stack.Screen name="CompetitionDetail" component={CompetitionDetailScreen} />
    </Stack.Navigator>
  );
}
