import React, { Component } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    View,
    // Button,
    StyleSheet,
    Image,
    AsyncStorage,
} from 'react-native';

import { Button,Icon  } from 'react-native-elements';

export default class Login extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
          username: '',
          password: '',
          isLoggingIn: false,
          message: ''
        };
      }

      _signInAsync = async () => {
        await AsyncStorage.setItem('userToken', 'abc');
        this.props.navigation.navigate('Main');
      };

      _onGuestUserPress = async () => {
        // await AsyncStorage.setItem('userToken', 'abc');
        this.props.navigation.navigate('Main');
      };
      
    render() {
        return (
            <ScrollView style={{padding: 20}}>
                {/* Header*/ }
                <View style={styles.welcomeContainer}>
                    <Image
                    source={
                        __DEV__
                        ? require('../assets/images/sakura.png')
                        : require('../assets/images/sakura.png')
                    }
                    style={styles.welcomeImage}
                    />
                </View>

                <Text 
                    style={{fontSize: 27}}>
                    Login
                </Text>

                <View style={styles.container}>
                    <TextInput
                        value={this.state.username}
                        onChangeText={(username) => this.setState({ username })}
                        placeholder={'Username'}
                        style={styles.input}
                        />
                    <TextInput
                        value={this.state.password}
                        onChangeText={(password) => this.setState({ password })}
                        placeholder={'Password'}
                        secureTextEntry={true}
                        style={styles.input}
                        />

                    <View style = {styles.buttonContainerLoginPage}> 
                        {/* <Button
                            icon={{name: 'registered', type: 'font-awesome'}}
                            buttonStyle={styles.registerButtonStyleLoginPage}
                            onPress={this.props.onRegisterPress}
                            title='Register' /> */}
                        <Button
                        icon={{name: 'user-o', type: 'font-awesome'}}
                        buttonStyle={styles.registerButtonStyleLoginPage}
                        onPress={this._onGuestUserPress}
                        title='Guest User' />

                        <Button
                            icon={{name: 'sign-in', type: 'font-awesome'}}
                            buttonStyle={styles.loginButtonStyleLoginPage}
                            // onPress={this.props.onLoginPress}
                            onPress={this._signInAsync} 
                            title='Sign In' />
                    </View>

                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    //   backgroundColor: '#ecf0f1',
    },
    input: {
      width: 340,
      height: 44,
      padding: 10,
      borderWidth: 1,
      borderColor: 'gray',
    //   marginBottom: 10,
      margin: 10,
    },
    welcomeContainer: {
        alignItems: 'flex-start',
        marginTop: 1,
        marginBottom: 5,
        marginLeft: 10,
    },
    welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
    },

    buttonContainerLoginPage:
    {
      marginTop: 45,
      flexDirection: 'row',
      backgroundColor:'white',
      justifyContent: 'center', 
      alignItems: 'center',
    //   position: 'absolute',
      bottom: 10
    },
    loginButtonStyleLoginPage:
    {
      height: 45, 
      width: 120, 
      backgroundColor: 
      '#1bc461', 
      borderRadius: 5 
    },
    registerButtonStyleLoginPage:
    {
      height: 45, 
      width: 120, 
      backgroundColor: 
      'rgba(111, 202, 186, 1)', 
      // alignItems: 'right',
      // position: 'absolute',
      borderRadius: 5 
    }

  });
  