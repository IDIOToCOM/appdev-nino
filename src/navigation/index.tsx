import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import AuthNav from './AuthNav';
import MainNav from './MainNav';

const AppNav = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const auth = useSelector((state: any) => state.auth);
  const isLoggedIn = !!auth?.data;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('dark-content', true);
    }
  }, [isDarkMode]);

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainNav /> : <AuthNav />}
    </NavigationContainer>
  );
};

export default AppNav;
