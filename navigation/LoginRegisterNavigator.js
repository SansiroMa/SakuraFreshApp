import React, { Component } from 'react';
import {
  AppRegistry
} from 'react-native';

import Login from '../screens/Login';
import Secured from '../screens/Secured';
import Register from '../screens/Register';
import AppNavigator from './AppNavigator';
import SettingsScreen from '../screens/SettingsScreen';

export default class LoginRegisterNavigator extends Component {

  state = {
    isLoggedIn: false,
    isRegisterNeeded: false,
    isGuestModel: false,
  }

  render() {

    if (this.state.isLoggedIn) 
    {
        // return <Secured 
        //             onLogoutPress={() => this.setState({isLoggedIn: false})}
        //         />;
        return <AppNavigator loginType={"LoggedIn"}/>
    }
    else if (this.state.isGuestModel)
    {
        return <AppNavigator loginType={"Guest"}/>
    }
    else if (this.state.isRegisterNeeded)
    {
        return <Register 
                onRegisterPress={() => this.setState({isRegisterNeeded: false})}
                />;
    }
    else
    {
        return <Login 
                onLoginPress={() => this.setState({isLoggedIn: true})}
                onGuestUserPress={() => this.setState({isGuestModel: true})}
                //   onRegisterPress={() => this.setState({isRegisterNeeded: true})}
                />;
    }

  }

}

AppRegistry.registerComponent(LoginRegisterNavigator , () => LoginRegisterNavigator );