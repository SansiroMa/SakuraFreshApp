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
  Animated,
} from 'react-native';

import { Permissions,WebBrowser,Notifications } from 'expo';
import { Button,Icon  } from 'react-native-elements';
import PopupDialog,
    { DialogTitle,  
      SlideAnimation,
      ScaleAnimation,
      FadeAnimation
    } from 'react-native-popup-dialog';

import ActionButton from 'react-native-action-button';

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
      locationToken:null,
      text: '',
      deletedRowKey: null,
      isShowingText: true,
      updateFlag : true,
      listData : [],
      packCode: null,
      notification: {},
      notificationToken:null,
      notificationTitle:null,
      notificationBody:null,
      barCodeModal:'New Item',
      showingBarCodeModal:'New Item',
      imageUrl:require('../assets/images/barcodeModal/green_wheat.jpg'),
      anim: new Animated.Value(0)
    });

     // #Button Events
    this._onPressSendButton = this._onPressSendButton.bind(this);
    this._onPressClearButton = this._onPressClearButton.bind(this);
    this._deleteButtonclick = this._deleteButtonclick.bind(this);  

    // #popupDialog
    this.onIconPress = this.onIconPress.bind(this)
    this.handleConfirmChangeModal = this.handleConfirmChangeModal.bind(this);
    this.handleCancelChangeModal = this.handleCancelChangeModal.bind(this);    
  }

  componentDidMount() {
    //const notificationToken =   this.registerForPushNotificationsAsync();
    // this.setState({notificationToken:notificationToken});

    this.registerForPushNotificationsAsync()

    // get user location token
    this._getUserToken();
    
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

   // Fetch the token from storage
   _getUserToken = async () => {

    const value =  await AsyncStorage.getItem('locationToken');    
    
    this.setState({
      locationToken: value,
    });
  };

  _handleNotification = (notification) => {
    this.setState({notification: notification});
    alert("notification:"+ JSON.stringify(notification));
  };

  refreshFlatList = (deletedKey) => {

    this.InputTextFocusRef.focus();

    this.setState((prevState) => {

        return {
            deletedRowKey: deletedKey
        };
    });
  }

  // Push notification to app
  sendPushNotification(token = this.state.notificationToken, title = this.state.notificationTitle, body = this.state.notificationBody) {
    return fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify({
        to: token,
        title: title,
        body: body,
        data: { message: `${title} - ${body}` },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }

  // Send barcode list to our server
  sendBarcodeList(dataList = this.state.listData,
                  token = this.state.locationToken,
                  showingBarCodeModal = this.state.showingBarCodeModal,
                  packCode = this.state.packCode) {

    var body = {};
    //body.locationToken = token;

    // 1. Get Data List 
    var valueList = [];

    dataList.forEach(element => {
      valueList.push(element.value);
    });

    token = "9a42cd67-5b9f-4003-9b06-d2719d35cf6c";
    
    // 2. Get Body
    switch(showingBarCodeModal){
      case "New Item": 
        body = {  
          locationToken: token,       
          item: valueList[0]
        };
        break;
      case "Case": 
        body = {
          locationToken: token,
          pack: packCode,
          items: valueList
        };
        break;
      case "Pallet": 
        body = {
          locationToken: token,
          pack: packCode,
          packs: valueList
        };
        break;
      case "Instransit": 
        body = {
          locationToken: token,
          pack: valueList[0]
        };
        break;
      default:
        break;
    }

    fetch('http://153.149.186.12/exp/api/trace', {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    .then((response) => response.json())
    .then((responseJson) => {
          //alert(JSON.stringify(responseJson))
          console.log(JSON.stringify(responseJson));

          this.setState({notificationTitle : "Message Reveived!",notificationBody :"Items have been sent to server successfully"});

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
    ;
  }

  // sample for fetch request
  getMoviesFromApiAsync() {
    fetch('https://facebook.github.io/react-native/movies.json')
      .then((response) => response.json())
      .then((responseJson) => {
        
        console.log(responseJson.movies);
        this.setState({notificationTitle : "Message Reveived!",notificationBody :"Items have been sent to server successfully"});

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
   onActionButtonItemPress(newBarCodeModal)
   {
    console.log('button events - ActionButton.Item is pressed: '+ newBarCodeModal);
    // alert(newBarCodeModal);

    var url = " ";
    if(this.state.showingBarCodeModal != newBarCodeModal )
    {
      switch(newBarCodeModal)
      {
        case "New Item": 
          url = require('../assets/images/barcodeModal/green_wheat.jpg');
          break;
        case "Case": 
          url = require('../assets/images/barcodeModal/Fruits_Vegetables_Package.jpg');
          break;
        case "Pallet": 
          url = require('../assets/images/barcodeModal/Pallet.jpg');
          break;
        case "Instransit": 
          url = require('../assets/images/barcodeModal/broccoli.jpg');
          break;
        default:
          break;
      }

      if(this.state.listData.length >0){
      
        Alert.alert(
          'Confirm',
          'Changing the barcode modal will clear all the data, continue?',
          [                              
            {text: 'No', onPress: () =>
              {
                console.log('cancel - ChangeBarCodeModal '); 
              } 
            },
    
            {
              text: 'Yes', onPress: () => {        
              console.log('confirm - ChangeBarCodeModal');  
    
              this.setState({ 
                listData:[],
                showingBarCodeModal:newBarCodeModal, 
                imageUrl: url,
                packCode:null
                });
            }},
          ],
          { cancelable: true }
        ); 
      }
      else{
        this.setState({ 
          showingBarCodeModal:newBarCodeModal, 
          imageUrl: url,
          packCode:null
        });
      }
    }
   }

   onIconPress(){    
    this.popupDialog.show(() => {
      console.log('callback - will show popupDialog immediately');
      if(this.state.barCodeModal != this.state.showingBarCodeModal){
        this.setState({barCodeModal : this.state.showingBarCodeModal});
      }
    });
  }
   
  // When cancel button is clicked 
  handleCancelChangeModal()
  {
    this.popupDialog.dismiss(() => {
      console.log('callback - handleCancelChangeModal is pressed');
      
    });
  }

  // when confirm button is clicked
  handleConfirmChangeModal()
  {
    this.popupDialog.dismiss(() => {
      console.log('callback - handleConfirmChangeModal is pressed');

      var url = " ";
      var newBarCodeModal = this.state.barCodeModal;

      if(this.state.showingBarCodeModal != newBarCodeModal )
      {
        switch(newBarCodeModal)
        {
          case "New Item": 
            url = require('../assets/images/barcodeModal/green_wheat.jpg');
            break;
          case "Case": 
            url = require('../assets/images/barcodeModal/Fruits_Vegetables_Package.jpg');
            break;
          case "Pallet": 
            url = require('../assets/images/barcodeModal/Pallet.jpg');
            break;
          case "Instransit": 
            url = require('../assets/images/barcodeModal/broccoli.jpg');
            break;
          default:
            break;
        }

        if(this.state.listData.length >0){
        
          Alert.alert(
            'Confirm',
            'Changing the barcode modal will clear all the data, continue?',
            [                              
              {text: 'No', onPress: () =>
                {
                  console.log('cancel - ChangeBarCodeModal '); 
                } 
              },
      
              {
                text: 'Yes', onPress: () => {        
                console.log('confirm - ChangeBarCodeModal');  
      
                this.setState({ 
                  listData:[],
                  showingBarCodeModal:newBarCodeModal, 
                  imageUrl: url,
                  packCode:null
                  });
              }},
            ],
            { cancelable: true }
          ); 
        }
        else{
          this.setState({ 
            showingBarCodeModal:newBarCodeModal, 
            imageUrl: url,
            packCode:null
          });
        }
      }
    });
  }
  
  _onSendWithoutConfirm() {

    console.log('_onSendWithoutConfirm ');

    var dataList = this.state.listData
    if(dataList.length <= 0 )
    {
      alert("No Item!");
    }
    else{
      this.sendBarcodeList();
      this.setState({listData:[]});

    }
    
    this._onRetainFocus();
  }

  // Click send button
  _onPressSendButton() {
    var dataList = this.state.listData
    if(dataList.length <= 0 )
    {
      alert("No Item!");
    }
    else{
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
            this.sendBarcodeList();
            
            this.setState({listData:[], packCode: null});
            this.setState(previousState => {
              return { isShowingText: !previousState.isShowingText, text:'' };
            });
          }},
        ],
        { cancelable: true }
      ); 
    }
    
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
          this.setState({listData:listData, packCode: null});

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
      else  if(this.state.showingBarCodeModal!= "New Item" && 
               this.state.showingBarCodeModal!= "Instransit" && 
              !this.state.packCode)
      {
        this.setState({packCode: inputStr})
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

        this._handleLishLenChange();
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
    return (
      <View>      
        <Text style={{fontSize: 20, alignSelf: 'center'}}>{this.state.packCode? 'Please input items!' : 'No Data!'}</Text>

        <Icon                                          
        name={this.state.packCode? 'battery-half': 'battery-empty'}
        type='font-awesome'
        size = {80}
        color = {this.state.packCode ? '#97ff97': '#ff9797'}
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
        />
      )
    
    return (
      <View style = {styles.footerContainer}>{desc}</View>
    );
  }

  _handleLishLenChange = function() {

    Animated.timing(this.state.anim, {toValue: 1}).start(() => this._backToOrigin());
    // Animated.delay(400),
    // Animated.timing(this.state.anim, {toValue: 0}).start();
  }

  _backToOrigin = function() {
    Animated.timing(this.state.anim, {toValue: 0}).start();
    // Animated.delay(400),
    // Animated.timing(this.state.anim, {toValue: 0}).start();
  }


  render() 
  {
    const width = Dimensions.get('window').width;
    const height = Dimensions.get('window').height;

    var TouchableElement = TouchableHighlight;

    if (Platform.OS === 'android') 
    {
     TouchableElement = TouchableNativeFeedback;
    }

    let listTitleView;

    if(this.state.showingBarCodeModal == "New Item" ||this.state.showingBarCodeModal == "Instransit" )
    {
      listTitleView = (
        <Text style={styles.sectionHeader}>{ this.state.showingBarCodeModal }</Text>
      );     
    }
    else if(this.state.packCode){
      listTitleView = (
        // <Text style={styles.sectionHeaderListTitle}>{this.state.showingBarCodeModal + ' #Pack: ' + this.state.packCode }</Text>
        <View style = {{flexDirection: 'row',backgroundColor: 'rgba(247,247,247,1.0)'}}>
          <Text style={styles.sectionHeader}>{this.state.showingBarCodeModal + ' #Pack: '}</Text>
          <Text style={styles.sectionHeaderListTitle}>{this.state.packCode }</Text>
        </View>
      );     
    }
    else
    {
      listTitleView = (
        // <Text style={styles.sectionHeader}>{this.state.showingBarCodeModal + ' #Pack: ---'}</Text>
        <View style = {{flexDirection: 'row',backgroundColor: 'rgba(247,247,247,1.0)'}}>
          <Text style={styles.sectionHeader}>{this.state.showingBarCodeModal + ' #Pack: '}</Text>
          <Text style={styles.sectionHeaderListTitle}>---</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}  >
            <View style={styles.actionButtoncontainer}>
              <Text style={styles.actionButtonTextContainer}>{this.state.showingBarCodeModal}</Text>
              {this.state.listData.length>0 ? <Text> {"+" + this.state.listData.length}</Text> : null}

              <Animated.View style={{
                              bottom: this.state.anim.interpolate({
                                inputRange: [0,1],
                                outputRange: [0, 50]
                              }),
                              opacity: this.state.anim.interpolate({
                                inputRange: [0,1],
                                outputRange: [0, 1]
                              }),
                              // transform: [{
                              //     rotateZ: this.state.anim.interpolate({
                              //         inputRange: [0,1],
                              //         outputRange: ['0deg', '360deg']
                              //     })
                              // }]
                            }}
                  // onPress={() => this.handleClick()}
                  >
                    {this.state.listData.length>0 
                      ? 
                      <Animated.Text 
                      style={{
                            fontSize: this.state.anim.interpolate({
                                inputRange: [0,1],
                                outputRange: [12,26]
                            }),
                            color:"#1abc9c",
                            fontWeight: 'bold',
                        }}
                      > {"+" + this.state.listData.length}</Animated.Text> 
                      :
                      null
                    }
                  {/* <Image source={this.state.imageUrl}/> */}
              </Animated.View>            


              <ActionButton 
                buttonColor="rgba(231,76,60,1)" 
                // buttonText = "+" 
                verticalOrientation = "down" 
                // renderIcon={active => active ? (<Icon name="ban" type='font-awesome' /> ) : (<Icon name="check-circle" type='font-awesome' />)}
                renderIcon={() => {return(<Image source={this.state.imageUrl} style={styles.image}/>)}}
              >
                <ActionButton.Item
                  buttonColor="#9b59b6"
                  title="New Item"
                  onPress={() => this.onActionButtonItemPress("New Item")}
                  >
                   <Image source={ require('../assets/images/barcodeModal/green_wheat.jpg')} style={styles.image}/>
                  {/* <Icon name='check-circle' type='font-awesome' /> */}
                </ActionButton.Item>
                <ActionButton.Item
                  buttonColor="#3498db"
                  title="Case"
                  onPress={(title) => this.onActionButtonItemPress("Case")}>
                    <Image source={require('../assets/images/barcodeModal/Fruits_Vegetables_Package.jpg')} style={styles.image}/>
                </ActionButton.Item>
                <ActionButton.Item
                  buttonColor="#1abc9c"
                  title="Pallet"
                  onPress={(title) => this.onActionButtonItemPress("Pallet")}>
                    <Image source={require('../assets/images/barcodeModal/Pallet.jpg')} style={styles.image}/>
                </ActionButton.Item>
                <ActionButton.Item
                  buttonColor="#194bd6"
                  title="Instransit"
                  onPress={(title) => this.onActionButtonItemPress("Instransit")}>
                  <Image source={require('../assets/images/barcodeModal/broccoli.jpg')} style={styles.image}/>
                </ActionButton.Item>
              </ActionButton>
            </View>

          {/* Header*/ }
          {/* <View style={styles.welcomeContainer}>
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
                onPress={() => this.onIconPress()}>
                <Image source={this.state.imageUrl} style={styles.image}/>
              </TouchableElement>
            </View>            
          </View> */}

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
                    onValueChange={barCodeModal => this.setState({ barCodeModal:barCodeModal })}
                    style={{ width: 160 }}
                    mode="dropdown">
                    <Picker.Item label="New Item" value="New Item" />
                    <Picker.Item label="Case" value="Case" />
                    <Picker.Item label="Pallet" value="Pallet" />
                    <Picker.Item label="Instransit" value="Instransit" />
                  </Picker>
                </View>

                <View style = {styles.buttonContainerStyle}> 
                  <Button
                      icon={{name: 'ban', type: 'font-awesome'}}
                      buttonStyle={styles.cancelButtonStylePopUp}
                      onPress={this.handleCancelChangeModal}
                      title='Cancel' />
                  <Button
                      icon={{name: 'check-circle', type: 'font-awesome'}}
                      buttonStyle={styles.confirmButtonStylePopUp}
                      onPress={this.handleConfirmChangeModal}
                      title='Confirm' />
                </View>  
              </View>               
          </PopupDialog>

          <View style = {{flex:1}}>
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
          <View>    
            {listTitleView}
          </View>   
          <View style={{flex: 4, marginTop: 1,marginRight: 2,marginLeft: 2}} >
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
  actionButtoncontainer: {
    zIndex:9000,
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
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
  sectionHeaderListTitle: {
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
    flex:1,
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
    width: 60,
    height: 60,
    borderRadius: 30
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
    //bottom: 10
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
    bottom: 10
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

  actionButtonTextContainer: {
    // position: "absolute",
    // paddingVertical: isAndroid ? 2 : 3,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        paddingVertical: 3
      },
      android: {
        paddingVertical: 2,
      },
    }),
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    backgroundColor: "white",
    height: 40,
    fontSize: 30,
  },

});
