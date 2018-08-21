import React from 'react';
import { createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import GuestTabNavigator from './GuestTabNavigator';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import Login from '../screens/Login';

export default createSwitchNavigator(
  {
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html
  AuthLoading: AuthLoadingScreen,
  Main: MainTabNavigator,
  Guest: GuestTabNavigator,
  Auth: Login,
  },
  {
    initialRouteName: 'AuthLoading',
  }
);