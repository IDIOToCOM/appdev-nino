import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';
import { UTO } from '../theme/uto';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import WrongScreen from '../screens/WrongScreen';

const Stack = createStackNavigator<any>();

const screenOptions = {
  headerStyle: {
    backgroundColor: UTO.white,
    borderBottomColor: UTO.border,
  },
  headerTintColor: UTO.navy,
  headerTitleStyle: {
    fontWeight: '600' as const,
    color: UTO.text,
  },
};

const AuthNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.LOGIN}
      screenOptions={screenOptions}
    >
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.REGISTER}
        component={Register}
        options={{ title: 'Create account', headerShown: true }}
      />
      <Stack.Screen
        name={ROUTES.WRONG}
        component={WrongScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
