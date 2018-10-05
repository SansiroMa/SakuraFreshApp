import React, { Component }  from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
  FlatList,
  ListView,
  Dimensions,
  AsyncStorage,
  Picker,
} from 'react-native';

import { Permissions,WebBrowser,Notifications } from 'expo';
import { Button,Icon  } from 'react-native-elements';
import PopupDialog,
    { DialogTitle,  
      SlideAnimation,
      ScaleAnimation,
      FadeAnimation
    } from 'react-native-popup-dialog';

const slideAnimation = new SlideAnimation({ slideFrom: 'bottom' });
const scaleAnimation = new ScaleAnimation();
const fadeAnimation = new FadeAnimation({ animationDuration: 150 });

//import { registerForPushNotificationsAsync } from '@expo/samples/registerForPushNotificationsAsync';

const window = Dimensions.get('window');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const flatListData =[
  // {key: 'Key0',value: 'barcode00300300030'},
  // {key: 'Key1',value: 'barcode121212121212'},
  // {key: 'Key2',value: 'barcode23232323232'},
  // {key: 'Key3',value: 'barcode33333333333'},
]

// *******************************************************************************************************
// HomeScreen-Main
// *******************************************************************************************************
export default class HomeScreen extends React.Component {
  static navigationOptions = {
    // header: null,
    title: 'Home',
  };

  constructor(props) {

    super(props);

    this.state = ({
      text: '',
      deletedRowKey: null,
      isShowingText: true,
      updateFlag : true,
      listData : flatListData,
      mainCode: null,
      notification: {},
      notificationToken:null,
      notificationTitle:null,
      notificationBody:null,
      barCodeModal:'New Item',
      imageUrl:require('../assets/images/barcodeModal/green_wheat.jpg'),
    });

    this._onPressSendButton = this._onPressSendButton.bind(this);
    this._onPressClearButton = this._onPressClearButton.bind(this);
    this._deleteButtonclick = this._deleteButtonclick.bind(this);  

    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleReport = this.handleReport.bind(this);
    this.onEventPress = this.onEventPress.bind(this)
    this.onValueChange = this.onValueChange.bind(this);
  }

  componentDidMount() {
    //const notificationToken =   this.registerForPushNotificationsAsync();
    
    // this.setState({notificationToken:notificationToken});

    this.registerForPushNotificationsAsync()

    //alert(JSON.stringify(notificationToken));
    
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

   // As of now, we save it to local, and push notifications from device
  // In future, will post the token to our server from where we can retrieve it to send push notifications.
  //const PUSH_ENDPOINT = 'https://your-server.com/users/push-token';

  registerForPushNotificationsAsync= async () => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    AsyncStorage.setItem('notificationToken', token);
    this.setState({notificationToken:token});
    //console.log(token);
    //alert(JSON.stringify(token))
    //return token;

    // As of now, we save it to local, and push notifications from device
    // In future, will post the token to our server from where we can retrieve it to send push notifications.
    /*
    return fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: {
          value: token,
        },
        user: {
          username: 'Brent',
        },
      }),
    });
    */
  }

  _handleNotification = (notification) => {
    this.setState({notification: notification});
    alert("notification:"+ notification);
  };

  refreshFlatList = (deletedKey) => {

    this.InputTextFocusRef.focus();

    this.setState((prevState) => {

        return {
            deletedRowKey: deletedKey
        };
    });
  }

  sendPushNotification(token = this.state.notificationToken, title = this.state.notificationTitle, body = this.state.notificationBody) {
    return fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify({
        to: token,
        title: title,
        body: body,
       // data: { message: `${title} - ${body}` },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }

  getMoviesFromApiAsync() {
    fetch('https://facebook.github.io/react-native/movies.json')
      .then((response) => response.json())
      .then((responseJson) => {
        
        console.log(responseJson.movies);
        this.setState({notificationTitle : "Message Reveived!",notificationBody :"GTINs have been sent to server successfully"});

        if(this.state.notificationToken)
        {
          setTimeout(() => {  
            var responseOfPush = this.sendPushNotification();
            console.log(JSON.stringify(responseOfPush));
          }, 5000);
        }
      })
      .catch((error) => {
        console.error(error);
      });    
  }
  
   // When timeline item is clicked
  onEventPress(){    
      this.popupDialog.show();
  }
  
  onValueChange(barCodeModal){

    var url = " ";

    switch(barCodeModal)
    {
      case "New Item": 
        // url = "http://3.bp.blogspot.com/_FQlMKJUv0Co/TP05lU-qLGI/AAAAAAAAAWE/8NwAA_HZYyA/s320/christmas%2Bcard%2Bgreen%2Bwheat%2Bfield.jpg";
        url = require('../assets/images/barcodeModal/green_wheat.jpg');
        break;
      case "Case": 
        // url = "https://cdn7.bigcommerce.com/s-r2jj2zkz7j/images/stencil/1280x1280/products/302/716/Fruits_Vegetables_Package__74794.1510403529.jpg";
        url = require('../assets/images/barcodeModal/Fruits_Vegetables_Package.jpg');
        break;
      case "Pallet": 
        // url = "http://img.agriexpo.online/images_ag/photo-mg/170029-10532357.jpg";
        url = require('../assets/images/barcodeModal/Pallet.jpg');
        break;
      case "Instransit": 
        // url = "http://www.stepintohealth.com.au/wp-content/uploads/2011/12/health-benefits-of-broccoli_page1_image1.jpg";
        url = require('../assets/images/barcodeModal/broccoli.jpg');
        break;
      default:
        break;
    }
    this.setState({ barCodeModal:barCodeModal, imageUrl: url });
  }
  // When confirm button is clicked 
  handleConfirm()
  {
    this.popupDialog.dismiss();
  }

  // when Report button is clicked
  handleReport()
  {
    this.popupDialog.dismiss();
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
          this.setState({listData:listData, mainCode: null});

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
          this.setState({listData:listData, mainCode: null});

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

    // var inputStr = String.prototype.trim.call(this.state.text )

    // this.InputTextFocusRef.clear();

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
    // Dirty workaround to clear text
    if (Platform.OS === 'ios') 
    {
      this.InputTextFocusRef.setNativeProps({ text: ' ' });
    }
    
    setTimeout(() => 
    {
      this.InputTextFocusRef.setNativeProps({ text: '' });
    },5);

    // Check Text and process
    if( InputText != '')
    {
      var inputStr = InputText.replace(/\s+/g,"");

      if(!this.state.mainCode)
      {
        this.setState({
          mainCode: inputStr
        })
      }

      else if(inputStr.toUpperCase() == 'CONFIRMANDSEND')
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
  _onRetainFocus() 
  {
    var InputTextFocusRef = this.InputTextFocusRef;

    InputTextFocusRef.focus();    
    
  }

  _onCreateEmptyView() 
  {

    let emptyView;

    if(this.state.mainCode)
    {
      emptyView = (
        <View>      
            <Text style={{fontSize: 20, alignSelf: 'center'}}>SSCC is there!</Text>

            <Icon                                          
            name='battery-half'
            type='font-awesome'
            size = {80}
            color = 'rgba(111, 202, 186, 1)'
            // onPress={()=> this._deleteButtonclick(item)} 
            />
        </View>

      );

    }
    else
    {
      emptyView = (
        <View>      
          <Text style={{fontSize: 20, alignSelf: 'center'}}>No Data!</Text>

          <Icon                                          
          name='battery-empty'
          type='font-awesome'
          size = {80}
          color = '#ff9797'
          // onPress={()=> this._deleteButtonclick(item)} 
          />
       </View>
      )

    }

    return (
      <View>      
        <Text style={{fontSize: 20, alignSelf: 'center'}}>{this.state.mainCode ? 'SSCC is there!' : 'No Data!'}</Text>

        <Icon                                          
        name={this.state.mainCode ? 'battery-half': 'battery-empty'}
        type='font-awesome'
        size = {80}
        color = {this.state.mainCode ? '#97ff97': '#ff9797'}
        // onPress={()=> this._deleteButtonclick(item)} 
        />
    </View>

    );
  }

  _footer = function () 
  {
    var desc = null
    if(true)
      desc = (
        <Icon                                          
        name='train'
        type='font-awesome'
        size = {14}
        // color = '#ff9797'
        // onPress={()=> this._deleteButtonclick(item)} 
        />
      )
    
    return (
      <View style = {styles.footerContainer}>{desc}</View>
    );
  }

  render() 
  {
    var TouchableElement = TouchableHighlight;

    if (Platform.OS === 'android') 
    {
     TouchableElement = TouchableNativeFeedback;
    }

    let listTitle;

    if(this.state.mainCode)
    {
      listTitle = (
          <Text style={styles.sectionHeaderMainCode}>{'#SSCC: ' + this.state.mainCode }</Text>
      );     
    }
    else
    {
      listTitle = (
          <Text style={styles.sectionHeader}>#GTIN + SNO</Text>

      );
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

  
            <View>
              <TouchableElement
                activeOpacity={0.6}
                underlayColor={'white'}
                onPress={() => this.onEventPress()}>
                {/* <Image source={{uri: this.state.imageUrl}} style={styles.image}/> */}
                <Image source={this.state.imageUrl} style={styles.image}/>
              </TouchableElement>
            </View>

            

            {/* <Button
              icon={{name: 'check-circle', type: 'font-awesome'}}
              buttonStyle={styles.popUpButtonStyle}
              onPress={this.onEventPress}
              title={this.state.barCodeModal} /> */}
          </View>

          <PopupDialog
              dialogAnimation={slideAnimation}
              dialogTitle={<DialogTitle title='Select An Operation' />}
              ref={(popupDialog) => { this.popupDialog = popupDialog; }}
              dialogStyle={{marginTop:-200}}
            >
              {/* <View>
                <Text>{this.state.description} </Text>
              </View> */}
              <View tyle = {styles.popupBodyContainer}>   
                <View style = {styles.pickerStyle}>
                  <Picker
                    selectedValue={this.state.barCodeModal}
                    onValueChange={barCodeModal => this.onValueChange(barCodeModal)}
                    style={{ width: 160 }}
                    mode="dropdown">
                    <Picker.Item label="New Item" value="New Item" />
                    <Picker.Item label="Case" value="Case" />
                    <Picker.Item label="Pallet" value="Pallet" />
                    <Picker.Item label="Instransit" value="Instransit" />
                  </Picker>
                </View>

                {/* <View style = {styles.buttonContainerStyle}> 
                  <Button
                      icon={{name: 'envelope', type: 'font-awesome'}}
                      buttonStyle={styles.cancelButtonStylePopUp}
                      onPress={this.handleReport}
                      title='Report' />
                  <Button
                      icon={{name: 'check-circle', type: 'font-awesome'}}
                      buttonStyle={styles.confirmButtonStylePopUp}
                      onPress={this.handleConfirm}
                      title='Confirm' />
                </View>   */}
              </View>               
            </PopupDialog>



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
          {/* <Text style={styles.sectionHeader}>{this.state.mainCode ? 'SSCC: ' + this.state.mainCode : '#G TIN + SNO'}</Text> */}
          {listTitle}
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
         
          {/* Footer*/ }
          
          {/* <View>
            <TouchableElement
              activeOpacity={0.6}
              underlayColor={'white'}
              onPress={() => this._onPressButton()}>
              <Text style={styles.button}>Tap</Text>
            </TouchableElement>
          </View> */}

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


        {/* <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>
          <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
            <MonoText style={styles.codeHighlightText}>navigation/MainTabNavigator.js</MonoText>
          </View>
        </View> */}

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
    //alignItems: 'stretch',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 1,
    marginBottom: 5,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
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
  sectionHeaderMainCode: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1bc461',
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
    height: 45, 
    width: 120, 
    backgroundColor: 
    '#ff9797', 
    borderRadius: 5 
  },
  sendButtonStyleHomePage:
  {
    height: 45, 
    width: 120, 
    backgroundColor: 
    '#1bc461', 
    // alignItems: 'right',
    // position: 'absolute',
    borderRadius: 5 
  },
  footerContainer:
  {
    height: 20, 
    paddingTop: 5
  },

  image:{
    width: 50,
    height: 50,
    borderRadius: 25
  },

  popUpButtonStyle:
  {
    height: 40, 
    width: 120, 
    backgroundColor: 
    'rgba(111, 202, 186, 1)', 
    borderRadius: 5 
  },

  popupBodyContainer:
  {
    flex: 1,
    flexDirection: 'column',
    backgroundColor:'white',
    justifyContent: 'center',
  },
  pickerStyle:
  {
    flexDirection: 'row',
    backgroundColor:'white',
    justifyContent: 'center',
  },
  buttonContainerStyle:
  {
    flexDirection: 'row',
    backgroundColor:'white',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cancelButtonStylePopUp:
  {
    height: 40, 
    width: 120, 
    backgroundColor: 
    '#ff9797', 
    borderRadius: 5 
  },
  confirmButtonStylePopUp:
  {
    height: 40, 
    width: 120, 
    backgroundColor: 
    'rgba(111, 202, 186, 1)', 
    borderRadius: 5 
  },

});
