import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import WrongScreen from '../screens/WrongScreen';

const Stack = createStackNavigator<any>();

const AuthNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={Login}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name={ROUTES.REGISTER} component={Register} />
      <Stack.Screen name={ROUTES.WRONG} component={WrongScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
