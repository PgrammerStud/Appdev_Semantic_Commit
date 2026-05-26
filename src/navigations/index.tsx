import React, { useEffect } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import AuthNav from './AuthNav';
import MainNav from './MainNav';

const Navigation: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { isLoggedIn = false } = useSelector((state: any) => state.auth || {});

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#000000', true);
    }
    StatusBar.setBarStyle('dark-content', true);
  }, [isDarkMode]);

  return isLoggedIn ? <MainNav /> : <AuthNav />;
};

export default Navigation;