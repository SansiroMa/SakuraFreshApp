import React, { Component }  from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
  FlatList,
  SectionList,
  AppRegistry,
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  ListView,
  AppState,
  Dimensions,
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';
import Swipeout from 'react-native-swipeout';
import { Button,Icon  } from 'react-native-elements';
import RNTextInput from 'react-native-text-input-enhance';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const flatListData =[
  {key: 'Key0',value: 'barcode00300300030'},
  {key: 'Key1',value: 'barcode121212121212'},
  {key: 'Key2',value: 'barcode23232323232'},
  {key: 'Key3',value: 'barcode33333333333'},
]

// *******************************************************************************************************
// SSCCScreen-Main
// *******************************************************************************************************
export default class SSCCScreen extends React.Component {
  static navigationOptions = {
    // header: null,
    title: 'SSCC-SSCC',
  };

  constructor(props) {

    super(props);

    this.state = ({
      text: '',
      deletedRowKey: null,
      isShowingText: true,
      updateFlag : true,
      listData : flatListData
    });

    this._onPressSendButton = this._onPressSendButton.bind(this);
    this._onPressClearButton = this._onPressClearButton.bind(this);
    this._deleteButtonclick = this._deleteButtonclick.bind(this);  
  }

  // componentDidMount= ()=>{}

  refreshFlatList = (deletedKey) => {

    this.InputTextFocusRef.focus();

    this.setState((prevState) => {

        return {
            deletedRowKey: deletedKey
        };
    });
  }

  getMoviesFromApiAsync() {
    fetch('https://facebook.github.io/react-native/movies.json')
      .then((response) => response.json())
      .then((responseJson) => {
             
        setTimeout(() => {

          console.log(responseJson.movies);

          // alert('Response', responseJson.movies);
        }, 5000);


      })
      .catch((error) => {
        console.error(error);
      });    
  }
  
  _onSendWithoutConfirm() {

    console.log('_onSendWithoutConfirm ');
    this.getMoviesFromApiAsync();
    
    var listData = this.state.listData
    listData = [];
    this.setState({listData});

    this._onRetainFocus();
  }

  // Click send button
  _onPressSendButton() {
    Alert.alert(
      'Confirm',
      'Are you sure you want to send ?',
      [                              
        {
          text: 'No', onPress: () =>
          {
            console.log('CancelSend'); 
          }  
        },
        {text: 'Yes', onPress: () => {        
          console.log('ConfirmSend ');
          this.getMoviesFromApiAsync();
          
          var listData = this.state.listData
          listData = [];
          this.setState({listData});

          this.setState(previousState => {
            return { isShowingText: !previousState.isShowingText, text:'' };
          });
        }},
      ],
      { cancelable: true }
    ); 

    this._onRetainFocus();
  }

  // Click clear button
  _onPressClearButton() {
    Alert.alert(
      'Confirm',
      'Are you sure you want to clear all the data ?',
      [                              
        {text: 'No', onPress: () =>
          {
            console.log('CancelClear '); 
          } 
        },

        {
          text: 'Yes', onPress: () => {        
          console.log('ConfirmClear');  

          var listData = this.state.listData
          listData = [];
          this.setState({listData});

          this.setState(previousState => {
            return { isShowingText: !previousState.isShowingText, text:'' };
          });
        }},
      ],
      { cancelable: true }
    ); 

    this._onRetainFocus();
  }

  _deleteButtonclick(item)
  {
    var listData = this.state.listData
    
    let index = listData.indexOf(item);
    listData.splice(index, 1);
    this.setState({listData});

  }
  _onChangeText() {

    var inputStr = this.state.text.replace(/\s+/g,"");

    if( inputStr != '')
    {
      if(inputStr.toUpperCase() == 'CONFIRMANDSEND')
      {
        this._onPressSendButton();
      }
      else if(inputStr.toUpperCase() == 'SEND')
      {
        this._onSendWithoutConfirm();
      }
      else if(inputStr.toUpperCase() == 'CLEAR')
      {
        var listData = this.state.listData
        listData = [];
        this.setState({listData});   
      }
      else
      {
        let newItem = {key: inputStr,value: inputStr};

        var listData = this.state.listData
        
        // let index = listData.indexOf(newItem);

        let index = listData.map(obj => obj.key).indexOf(inputStr);


        if(index >= 0) // If duplicate key
        {
          listData.splice(index, 1);
          this.setState({listData});
        }
        else // Not dupliate key
        {
          listData.push(newItem);
          this.setState({listData});

          // Scroll to last item
          this.refs.flatlistRef.scrollToEnd();
        }
        //flatListData = [];
        this.setState({updateFlag : !this.state.updateFlag});
      }

      this.setState({text : ''});

      setTimeout(function() {
        // this.refs.InputTextFocusRef.focus();
        this.InputTextFocusRef.focus();
      }.bind(this), 50);

    }
  }

  _onSubmitEditing(InputText)
  
  {
    if (Platform.OS === 'ios') {
      this.InputTextFocusRef.setNativeProps({ text: ' ' });
    }
    
    setTimeout(() => {
      this.InputTextFocusRef.setNativeProps({ text: '' });
    },5);
   

    if( InputText != '')
    {
      var inputStr = InputText.replace(/\s+/g,"");

      if(inputStr.toUpperCase() == 'CONFIRMANDSEND')
      {
        this._onPressSendButton();
      }
      else if(inputStr.toUpperCase() == 'SEND')
      {
        this._onSendWithoutConfirm();
      }
      else if(inputStr.toUpperCase() == 'CLEAR')
      {
        var listData = this.state.listData
        listData = [];
        this.setState({listData});   
      }
      else
      {
        let newItem = {key: inputStr,value: inputStr};

        var listData = this.state.listData
        
        let index = listData.map(obj => obj.key).indexOf(inputStr);

        if(index >= 0) // If duplicate key
        {
          listData.splice(index, 1);
          this.setState({listData});
        }
        else // Not dupliate key
        {
          listData.push(newItem);
          this.setState({listData});

          // Scroll to last item
          this.refs.flatlistRef.scrollToEnd();
        }
        //flatListData = [];
        this.setState({updateFlag : !this.state.updateFlag});
      }

      this.setState({text : ''});

      setTimeout(function() {
        // this.refs.InputTextFocusRef.focus();
        this.InputTextFocusRef.focus();
      }.bind(this), 50);

    }
  }

  // retain focus for InputText
  _onRetainFocus() {
  
    var InputTextFocusRef = this.InputTextFocusRef;

    InputTextFocusRef.focus();    
    
  }

  _onCreateEmptyView() {

    return (
     
     <View>      
        <Text style={{fontSize: 20, alignSelf: 'center'}}>No Data!</Text>

        <Icon                                          
        name='battery-empty'
        type='font-awesome'
        size = {80}
        color = '#ff9797'
        />
     </View>
    );
  }

  _footer = function () {
    var desc = null
    if(true)
      desc = (
        <Icon                                          
        name='train'
        type='font-awesome'
        size = {14}
        />
      )
    
    return (
      <View style = {styles.footerContainer}>{desc}</View>
    );
  }


  render() {

    var TouchableElement = TouchableHighlight;

    if (Platform.OS === 'android') 
    {
     TouchableElement = TouchableNativeFeedback;
    }

    return (
      <View style={styles.container}  >

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
                 
          <View>
            <Text style={styles.sectionHeader}>Type a Barcode</Text>
            <TextInput
              autoCorrect={false} 
              ref={component  => { this.InputTextFocusRef = component  }} 
              autoFocus = {true}
              style={{height: 40}}
              placeholder="Type a Barcode here!"
              onSubmitEditing={(event) => this._onSubmitEditing( event.nativeEvent.text)}
              clearButtonMode="always"
            />
          </View>

          {/* Body*/ }         
          <Text style={styles.sectionHeader}>#SSCC</Text>
          <View style={{flex: 1, marginTop: 1,marginRight: 2,marginLeft: 2}} >
              <FlatList
                ref = 'flatlistRef'
                data = {this.state.listData}
                extraData={this.state}
                getItemLayout={(data, index) => ( {length: 50, offset: (50 + 1) * index + 20, index} )}
                ListEmptyComponent={this._onCreateEmptyView()}
                ListFooterComponent={this._footer} 

                renderItem={({item,index}) =>{
                    return(
                        <View> 
                            <View style={styles.navBar} > 
                                    <View style={styles.leftContainer}>    
                                    <Text style={styles.flatListItem}>{index + 1}</Text>  
                                    <Text style={styles.flatListItem}>{item.value}</Text> 
                                    </View>  

                                    <View>  
                                    <Icon                                          
                                        name='minus-circle'
                                        type='font-awesome'
                                        color = '#ff9797'
                                        onPress={()=> this._deleteButtonclick(item)} />
                                    </View>                                                                                                               
                            </View>  
        
                            <View style={{
                                height: 1,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: 'skyblue'    
                            }}>
                            </View>

                        </View>  

                    );
                }}


              >
              </FlatList>
          </View>
         
          <View style = {styles.buttonContainerHomePage}> 
            <Button
                icon={{name: 'trash', type: 'font-awesome'}}
                buttonStyle={styles.clearButtonStyleHomePage}
                onPress={this._onPressClearButton}
                title='Clear' />
            <Button
                icon={{name: 'check-circle', type: 'font-awesome'}}
                buttonStyle={styles.sendButtonStyleHomePage}
                onPress={this._onPressSendButton}
                title='Send' />
          </View>
      </View>
  
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };

  search  = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
  bodycontainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 0.5,
    marginTop: 1,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'black',
  },
  buttonContainer: {
    margin: 20
  },
  button: {
    color: 'blue'
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 10,
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
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  flatListItem: {
    // color: 'balck',
    color: 'rgba(0,0,0,1.0)',
    padding: 10,
    fontSize: 16,  
  },

  navBar: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttonContainerHomePage:
  {
    marginLeft: 45,
    flexDirection: 'row',
    backgroundColor:'white',
    justifyContent: 'center', 
    alignItems: 'center',
    // position: 'absolute',
    bottom: 10
  },
  clearButtonStyleHomePage:
  {
    height: 40, 
    width: 120, 
    backgroundColor: 
    '#ff9797', 
    borderRadius: 5 
  },
  sendButtonStyleHomePage:
  {
    height: 40, 
    width: 120, 
    backgroundColor: 
    'rgba(111, 202, 186, 1)', 
    // alignItems: 'right',
    // position: 'absolute',
    borderRadius: 5 
  },
  footerContainer:
  {
    height: 20, 
    paddingTop: 5
  },

});
