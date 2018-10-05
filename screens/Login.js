import React, { Component } from 'react';
import {
    ScrollView,
    // Text,
    TextInput,
    View,
    // Button,
    StyleSheet,
    Image,
    AsyncStorage,
    Platform,
} from 'react-native';

import { Button,Icon,FormLabel, FormInput, FormValidationMessage,Text } from 'react-native-elements';

export default class Login extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
          username: '',
          password: '',
          isLoggingIn: false,
          message: '',
          userNameError: null,
          passwordError: null
        };
      }

      _onUserNameChangeText(text)
      {
        // TBD
      }

      _onPasswordChangeText(text)
      {
      // TBD
      }

      _signInAsync = async () => {
        let userNameCheck = false;
        let passwordCheck = false;

        if(this.state.username)
        {
            userNameCheck = true;
        }

        if(this.state.password)
        {
            passwordCheck = true;
        }

        if(userNameCheck & passwordCheck)
        {
            fetch('http://153.149.186.12:9091/api/auth/login',
            {
                method: 'POST',
                headers: 
                        {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        },

                body: JSON.stringify({
                        username: this.state.username,
                        password: this.state.password,
                    }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                             
                console.log(responseJson);
        
                //alert(JSON.stringify(responseJson));
                
                if(responseJson.token)
                {
                    AsyncStorage.setItem('userToken', responseJson.token);
                    
                    // Get error when saving Json object to AsyncStorage
                    //AsyncStorage.setItem('userInfo', responseJson);

                    this.props.navigation.navigate('Main');
                }
                else
                {
                    alert("Error, User Token Not Found!");
                }
            }).catch((error) => {
                console.error(error);
                alert("Error:" + error);
            }); 
        }
        else
        {
            if(!userNameCheck)
            {
                this._userNameErrorHandler('Error001','User Name is required!');
            }

            if(!passwordCheck)
            {
                this._passwordErrorHandler('Error002','Password is required!');
            }
        }
      };

      _onGuestUserPress = async () => {
        this.props.navigation.navigate('Guest');  
      };
      
      _userNameErrorHandler(code, message) {
        this.setState({
            userNameError: !code ? null :
            {
              code,
              message,
            }
        })
      }
      _passwordErrorHandler(code, message) {
        this.setState({
            passwordError: !code ? null :
            {
              code,
              message,
            }
        })
      }

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

                <View style={styles.container}>
                
                    <View>
                        <Text h2>
                            SIGN IN
                        </Text>
                    </View>

                    <View>
                        <FormLabel>Name</FormLabel>
                        <FormInput 
                            inputStyle ={{paddingLeft: (Platform.OS) == 'ios' ? 0 : 5}}
                            onChangeText={(username) => this.setState({ username : username, userNameError:null })}
                            underlineColorAndroid="#808080"
                            placeholder={'Username'}
                            shake={this.state.userNameError}
                            clearButtonMode="always"
                        />
                        <FormValidationMessage>{this.state.userNameError ? "User Name is required": null}</FormValidationMessage>

                        <FormLabel>Password</FormLabel>
                        <FormInput 
                            inputStyle ={{paddingLeft: (Platform.OS) == 'ios' ? 0 : 5}}
                            onChangeText={(password) => this.setState({ password:password,passwordError:null })}
                            underlineColorAndroid="#808080"
                            placeholder={'Password'}
                            secureTextEntry={true}
                            shake={this.state.passwordError}
                            clearButtonMode="always"
                        />
                        <FormValidationMessage>{this.state.passwordError ? "Password is required": null}</FormValidationMessage>

                            {/* <TextInput
                                value={this.state.username}
                                onChangeText={(username) => this.setState({ username })}
                                placeholder={'Username'}
                                style={styles.input}
                                underlineColorAndroid='transparent'
                                />
                            <TextInput
                                value={this.state.password}
                                onChangeText={(password) => this.setState({ password })}
                                placeholder={'Password'}
                                secureTextEntry={true}
                                style={styles.input}
                                underlineColorAndroid='transparent'
                                /> */}
                    </View>
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 10
    //   backgroundColor: '#ecf0f1',
    },
    input: {
      width: 340,
      height: 44,
      padding: 0,
      paddingLeft: 10,
      borderWidth: 1,
      borderColor: 'gray',
    //   marginBottom: 10,
      margin: 0,
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
  