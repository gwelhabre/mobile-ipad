import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerParamList } from '../types';
import Sidebar from '../components/layout/Sidebar';

import HomeStack from './stacks/HomeStack';
import DiscoverStack from './stacks/DiscoverStack';
import RankingsStack from './stacks/RankingsStack';
import LiveStack from './stacks/LiveStack';
import WalletStack from './stacks/WalletStack';
import MarketplaceStack from './stacks/MarketplaceStack';
import CommunityStack from './stacks/CommunityStack';
import DJStack from './stacks/DJStack';
import VenueStack from './stacks/VenueStack';
import CompetitionsStack from './stacks/CompetitionsStack';
import ProfileStack from './stacks/ProfileStack';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function SidebarNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'permanent',
        drawerStyle: {
          width: 280,
          backgroundColor: '#0a0a0f',
        },
        overlayColor: 'transparent',
        sceneContainerStyle: {
          backgroundColor: '#0a0a0f',
        },
      }}
      defaultStatus="open"
    >
      <Drawer.Screen name="HomeStack" component={HomeStack} />
      <Drawer.Screen name="LiveStack" component={LiveStack} />
      <Drawer.Screen name="RankingsStack" component={RankingsStack} />
      <Drawer.Screen name="DiscoverStack" component={DiscoverStack} />
      <Drawer.Screen name="WalletStack" component={WalletStack} />
      <Drawer.Screen name="MarketplaceStack" component={MarketplaceStack} />
      <Drawer.Screen name="CommunityStack" component={CommunityStack} />
      <Drawer.Screen name="DJStack" component={DJStack} />
      <Drawer.Screen name="VenueStack" component={VenueStack} />
      <Drawer.Screen name="CompetitionsStack" component={CompetitionsStack} />
      <Drawer.Screen name="NotificationsStack" component={NotificationsScreen} />
      <Drawer.Screen name="ProfileStack" component={ProfileStack} />
    </Drawer.Navigator>
  );
}
