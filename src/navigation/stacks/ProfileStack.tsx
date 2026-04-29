import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import SettingsScreen from '../../screens/profile/SettingsScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../../screens/profile/ChangePasswordScreen';
import DeleteAccountScreen from '../../screens/profile/DeleteAccountScreen';
import BlockedUsersScreen from '../../screens/profile/BlockedUsersScreen';
import EventPlannerDashboardScreen from '../../screens/eventPlanner/EventPlannerDashboardScreen';
import InfoScreen from '../../screens/info/InfoScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
      <Stack.Screen name="EventPlannerDashboard" component={EventPlannerDashboardScreen} />
      <Stack.Screen name="Info" component={InfoScreen} />
    </Stack.Navigator>
  );
}
