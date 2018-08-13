import React, { Component } from 'react';
import {
    ScrollView,
    Text,
    TextInput,
    View,
    // Button,
    StyleSheet,
    Image
} from 'react-native';

import { Button,Icon  } from 'react-native-elements';
import t from 'tcomb-form-native';

const Form = t.form.Form;
// t.form.Form.stylesheet = formStyles;

const User = t.struct({
  email: t.String,
  username: t.maybe(t.String),
  password: t.String,
  terms: t.Boolean
});


const options = {
    fields: {
      email: {
        error: 'Without an email address how are you going to reset your password when you forget it?'
      },
      password: {
        error: 'Choose something you use on a dozen other sites or something you won\'t remember'
      },
      terms: {
        label: 'Agree to Terms',
      },
    },
  };

  const formStyles = {
    ...Form.stylesheet,
    controlLabel: {
      normal: {
        color: 'blue',
        fontSize: 18,
        marginBottom: 7,
        fontWeight: '600'
      },
      error: {
        color: 'red',
        fontSize: 18,
        marginBottom: 7,
        fontWeight: '600'
      }
    }
  }

export default class Register extends Component {

    handleSubmit = () => {
        const value = this._form.getValue(); // use that ref to get the form value
        console.log('value: ', value);
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

                <Text 
                    style={{fontSize: 27}}>
                    Register
                </Text>

                <View style={styles.container}>
                    <Form 
                        ref={c => this._form = c} // assign a ref
                        type={User}
                        options={options} // pass the options via props 
                    /> 

                    <Button
                        title="Sign Up!"
                        onPress={this.props.onRegisterPress}
                    />
                </View>

            </ScrollView>

        );
      }
  }
  
  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
    //   marginTop: 50,
      padding: 20,
      backgroundColor: '#ffffff',
    },
    paragraph: {
      margin: 24,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#34495e',
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
  });
  