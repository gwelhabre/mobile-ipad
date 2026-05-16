import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../../types';
import WalletScreen from '../../screens/wallet/WalletScreen';
import AddFundsScreen from '../../screens/wallet/AddFundsScreen';
import PayoutScreen from '../../screens/wallet/PayoutScreen';
import WhishSetupScreen from '../../screens/wallet/WhishSetupScreen';

const Stack = createNativeStackNavigator<WalletStackParamList>();

export default function WalletStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="AddFunds" component={AddFundsScreen} />
      <Stack.Screen name="Payout" component={PayoutScreen} />
      <Stack.Screen name="WhishSetup" component={WhishSetupScreen} />
    </Stack.Navigator>
  );
}
