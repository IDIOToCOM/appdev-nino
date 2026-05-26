import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';

import CarListScreen from '../screens/CarListScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import BookScreen from '../screens/BookScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpScreen from '../screens/HelpScreen';
import SavedScreen from '../screens/SavedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import WrongScreen from '../screens/WrongScreen';

const Stack = createStackNavigator<any>();

const MainNavigation = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.CAR_LIST}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name={ROUTES.CAR_LIST} component={CarListScreen} />
    <Stack.Screen name={ROUTES.CAR_DETAIL} component={CarDetailScreen} />
    <Stack.Screen name={ROUTES.BOOK} component={BookScreen} />
    <Stack.Screen name={ROUTES.MY_BOOKINGS} component={MyBookingsScreen} />
    <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    <Stack.Screen name={ROUTES.HELP} component={HelpScreen} />
    <Stack.Screen name={ROUTES.SAVED} component={SavedScreen} />
    <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
    <Stack.Screen name={ROUTES.WRONG} component={WrongScreen} />
  </Stack.Navigator>
);

export default MainNavigation;
