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
  Dimensions,
  AsyncStorage,
  Picker,
  Animated,
  ListView,
  ScrollView,
} from 'react-native';
import deepDiffer from 'react-native/lib/deepDiffer'
import { Constants, BarCodeScanner,Permissions,WebBrowser,Notifications } from 'expo';
import { Button,Icon, FormLabel, FormInput, ButtonGroup } from 'react-native-elements';
import PopupDialog,
    { DialogTitle,  
      SlideAnimation,
      ScaleAnimation,
      FadeAnimation
    } from 'react-native-popup-dialog';

import ActionButton from 'react-native-action-button';
import RNPickerSelect from 'react-native-picker-select';
import QRCode from 'react-native-qrcode';

const slideAnimation = new SlideAnimation({ slideFrom: 'bottom',animationDuration: 250  });
const scaleAnimation = new ScaleAnimation();
const fadeAnimation = new FadeAnimation({ animationDuration: 150 });

// *******************************************************************************************************
// InputTab-Main
// *******************************************************************************************************
export default class QRScanScreen extends React.Component {
    static navigationOptions = {
      // header: null,
      title: 'Home',
    };

  constructor(props) {

    super(props);

    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.inputRefs = {};

    this.state = ({
      hasCameraPermission: null,
      locationToken:null,
      selectedItem : undefined,
      itemList: [
                  {
                      label: 'New Item',
                      value: 'New Item',
                  },
                  {
                      label: 'Case',
                      value: 'Case',
                  },
                  {
                      label: 'Pallet',
                      value: 'Pallet',
                  },
                  {
                    label: 'Instransit',
                    value: 'Instransit',
                  },
                ],
      listData :[],
      listHeight: 0,
      dataSource :this.ds.cloneWithRows([]),
      scanIconDisabled : true,
      buttonGroupIndex: 0,
      parentPackCode: undefined,
    });
  }

  componentDidMount() {
    //const notificationToken =   this.registerForPushNotificationsAsync();
    // this.setState({notificationToken:notificationToken});

    // setTimeout(() => {
    //   this.listView.scrollToEnd();
    // }, 50);

    // this.scrollToBottom();

    this.registerForPushNotificationsAsync();
    this._requestCameraPermission();
    // get user location token
    this._getUserToken();
    
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  // scrollToBottom() {

  //   if("listHeight" in this.state && 
  //       "footerY" in this.state && 
  //       this.state.footerY > this.state.listHeight)
  //       {
  //         var scrollDistance = this.state.listHeight - this.state.footerY;
  //         this.listView.getScrollResponder().scrollTo(-scrollDistance);
  //       }


  //   // alert('listHeight : ' + this.listHeight + ' footerY : ' + this.footerY);

  //   // if (this.listHeight && this.footerY && this.footerY > this.listHeight) {
  //   //     let delta = this.footerY - this.listHeight
        

  //   //     let scrollResponder = this.listView.getScrollResponder();

  //   //     scrollResponder.scrollTo({y: delta, animated: true});
  //   // }
  // }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };
  _handleBarCodeRead = QRObj => {

    // Alert.alert(
    //   'Scan successful!',
    //   // JSON.stringify(QRObj.data)
    //   QRObj.data
    // );

    var elementStr = QRObj.data;
    var obj = JSON.parse(elementStr);

    if(this.state.buttonGroupIndex == 0)
    {
      const tmpListData = this.state.listData;
  
      // Check if duplicate
      let index = tmpListData.map(obj => obj.code).indexOf(obj.code);

      if(index < 0) // Not duplicate
      {
        tmpListData.push(obj);

        this.setState({
          listData : tmpListData,
          dataSource: this.ds.cloneWithRows(tmpListData)
        });
      }

      // if(elementStr.includes("'"))
      // {
      //   var elementStr = elementStr.replace(/"/g, '');
      //   var elementStr = elementStr.replace(/'/g, '"');
      //   var elementStr = elementStr.replace(/\s/g, '');
      //   var obj = JSON.parse(elementStr);
  
      //   // Check if duplicate
      //   let index = tmpListData.map(obj => obj.code).indexOf(obj.code);
  
      //   if(index < 0)
      //   {
      //     tmpListData.push(obj);
  
      //     // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    
      //     this.setState({
      //       listData : tmpListData,
      //       dataSource: this.ds.cloneWithRows(tmpListData)
      //     });
      //   }
      // }
      // else{
  
      //   // Check if duplicate
      //   let index = tmpListData.indexOf(data.data);
  
      //   if(index < 0)
      //   {
      //     tmpListData.push(data.data);
  
      //     // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      
      //     this.setState({
      //       listData : tmpListData,
      //       dataSource: this.ds.cloneWithRows(tmpListData)
      //     });
      //   }
      // }
    }
    else{
      const tmpPackCode = this.state.parentPackCode;

      if(elementStr.includes("'"))
      {
        var elementStr = elementStr.replace(/"/g, '');
        var elementStr = elementStr.replace(/'/g, '"');
        var elementStr = elementStr.replace(/\s/g, '');
        var obj = JSON.parse(elementStr);
  
        const differ = deepDiffer(tmpPackCode, obj);
  
        if(differ)
        {
          this.setState({
            parentPackCode:obj
          });
        }
      }
      else{
        const differ = deepDiffer(tmpPackCode, data.data);

        if(differ)
        {
          this.setState({
            parentPackCode:data.data
          });
        }
      }
      

    }
    
  };

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

  _updateIndex = (buttonGroupIndex) => {
    this.setState({buttonGroupIndex})
  }

  _scanQRCodes=  () => {
    this.popupDialog.show(() => {
      console.log('callback - show popupDialog');
    });
  };

  _clearQRCodes=  () => {
    this.setState({
      listData : [],
      parentPackCode: undefined,
      dataSource: this.ds.cloneWithRows([])
    });
  };

  _sendQRCodes=  () => {
    this.popupDialog.show(() => {
      console.log('callback - show popupDialog');
    });
  };
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
  
  ListViewItemSeparatorLine = () => {
    return (
      // <View
      //   style={{
      //     height: .5,
      //     width: "100%",
      //     backgroundColor: "#000",
      //   }}
      // />

      <View style={{
                height:  .5,
                width: "100%",
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: '#aeb9c1',
                paddingTop: Constants.statusBarHeight,    
            }}>
      </View>
    );
  }

  _renderRow(rowData, sectionID, rowID, highlightRow){
    
    // alert( JSON.stringify(rowData));
    // alert(rowData);
    // var qrModel = this.state.QRModel;
    let codeView , gtinView;

    // var elementStr = JSON.stringify(rowData);
    // var obj = JSON.parse(elementStr)

    // alert("rowData :" + rowData);

    // var obj = JSON.parse(elementStr);

    // codeView = (<Text>{obj.code}</Text>);
    codeView = (<Text>{rowData.code}</Text>);

    // if(rowData.code)
    // {
    //   codeView = (<Text>{rowData.code}</Text>);
    // }
    // else
    // {
    //   codeView = (<Text>{rowData}</Text>);
    // }

    if(rowData.gtin)
    {
      gtinView = (<Text>{rowData.gtin}</Text>);
    }

    return(
          <View style={styles.codeListContainer}>
              <Text>{rowID}</Text>
              {gtinView}
              {codeView}
              <QRCode
              value={JSON.stringify(rowData)}
              size={100}
              bgColor='purple'
              fgColor='white'/>
          </View>
      )
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

    let parentBoxcodeView;

    if(this.state.parentPackCode)
    {
      if(this.state.parentPackCode.code)
      {
        parentBoxcodeView = (
          <View>
            <View style={{ paddingVertical: 5 }}>
              <FormLabel>Pack Code:</FormLabel>
              <FormLabel>{this.state.parentPackCode.code}</FormLabel>
            </View>
            <View style={{ paddingLeft: 20 }}>
              <QRCode
                value={JSON.stringify(this.state.parentPackCode)}
                size={100}
                bgColor='purple'
                fgColor='white'/>
            </View>
            <View style={{
                height:  .5,
                width: "100%",
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: '#aeb9c1',
                paddingTop: Constants.statusBarHeight,    
            }}>
            </View>
          </View>
        )
      }
      else
      {
        parentBoxcodeView = (
          <View>
            <View style={{ paddingVertical: 5 }}>
              <FormLabel>Can't find QR Code from below PackCode</FormLabel>
              <FormLabel>{this.state.parentPackCode}</FormLabel>
            </View>
            <View style={{
                height:  .5,
                width: "100%",
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: '#aeb9c1',
                paddingTop: Constants.statusBarHeight,    
            }}>
            </View>
          </View>
        );
      }
      
    }
  

    let trashButtonView, sendButtonView;

    if(this.state.listData.length > 0)
    {
      trashButtonView = (
        <View>
        <Icon
              raised
              name='trash'
              type='font-awesome'
              color=  {'#ff9797' }
              onPress={() => this._clearQRCodes()} />  
      </View>   
      );

      sendButtonView = (
        <View>
          <Icon
                raised
                name='check'
                type='font-awesome'
                color=  {'#1bc461' }
                // onPress={() => this._scanQRCodes()} 
                />  
      </View>   
      );
    }
    
    return (
      <View style={styles.container}>
          {parentBoxcodeView}
            {/* <FormLabel>Select a model?</FormLabel>

            <View style = {styles.pickerContainer}>
                <RNPickerSelect
                        placeholder={{
                            label: 'Select a model...',
                            value: null,
                        }}
                        items={this.state.itemList}
                        onValueChange={(value) => {
                            this.setState({
                                selectedItem: value,
                            });
                        }}
                        onUpArrow={() => {
                        }}
                        onDownArrow={() => {
                        }}
                        style={{ ...pickerSelectStyles }}
                        value={this.state.selectedItem}
                        ref={(el) => {
                            this.inputRefs.picker = el;
                        }}
                    />
            </View> */}
           
           
            {/* <View style = {styles.buttonViewStyle}>    
              <Icon
                raised
                name='retweet'
                type='font-awesome'
                color=  {'#f50' }
                // disabled = {this.state.selectedItem ? false:true}
                // color=  {this.state.selectedItem ? '#f50':'#D1D5D8' }
                // disabledStyle = {{ backgroundColor: '#D1D5D8' }}
                onPress={() => this._scanQRCodes()} />  
            </View>  */}

        <View style = { styles.listViewStyle }>
          <ListView
                ref={ ( ref ) => this.listView = ref }
                onContentSizeChange={ () => {        
                    this.listView.scrollToEnd()
                } }

                // onLayout={
                //   e => {
                //       console.log("----------------ListView onLayout:" + e.nativeEvent.layout.height)
                //       alert("----------------ListView onLayout listHeight:" + e.nativeEvent.layout.height)
                //       this.listHeight = e.nativeEvent.layout.height
                //   }
                // }

                // onLayout={(event) => {
                //   var layout = event.nativeEvent.layout;
                //   this.setState({
                //       listHeight : layout.height
                //   });
                // }}

                enableEmptySections={true}
                dataSource={this.state.dataSource}
                renderSeparator= {this.ListViewItemSeparatorLine}
                // renderRow={this._renderRow}
                renderRow={(rowData, sectionID, rowID, highlightRow) => this._renderRow(rowData, sectionID, rowID, highlightRow)}
                // renderFooter = {() => {
                //   return (
                //       <View onLayout={ (e) => {
                //           console.log("--------------------render footer: " + e.nativeEvent.layout.y)
                //           alert("--------------------render footer: " + e.nativeEvent.layout.y)
                //           this.footerY = e.nativeEvent.layout.y}
                //       }></View>
                //   )
                // }}

                // renderFooter={() => {

                //   return <View onLayout={(event)=>{
                //       var layout = event.nativeEvent.layout;
                //       this.setState({
                //           footerY : layout.y
                //       });
                //   }}></View>
                // }}
            /> 
        </View>

        <PopupDialog
            dialogAnimation={slideAnimation}
            dialogTitle={
            // <DialogTitle title= {'Scan ' + this.state.selectedItem} />
            <ButtonGroup
              selectedBackgroundColor="pink"
              onPress={this._updateIndex}
              selectedIndex={this.state.buttonGroupIndex}
              buttons={['Item/Box', 'Box of Box']}
              containerStyle={{height: 30}} 
              selectedTextStyle={styles.selectedTextStyle}
              />
              
          }
            ref={(popupDialog) => { this.popupDialog = popupDialog; }}
            dialogStyle={{marginTop:-200}}
            // height ={500}
          >
          <View style={styles.scannerContainer}>
            {this.state.hasCameraPermission === null ?
              <Text>Requesting for camera permission</Text> :
              this.state.hasCameraPermission === false ?
                <Text>Camera permission is not granted</Text> :
                
                <View>
                  <BarCodeScanner
                    onBarCodeRead={this._handleBarCodeRead}
                    style={{ height: 260, width: 400}}
                  />
              </View>
            }
          </View>               

        </PopupDialog>

        {/* <View style = {styles.buttonContainerHomePage}> 

          <Button
              icon={{name: 'trash', type: 'font-awesome'}}
              buttonStyle={styles.clearButtonStyleHomePage}
              // onPress={this._onPressClearButton}
              title='Clear' />
          <Button
              icon={{name: 'check-circle', type: 'font-awesome'}}
              buttonStyle={styles.sendButtonStyleHomePage}
              // onPress={this._onPressSendButton}
              title='Send' />
        </View> */}

        <View style={styles.tabBarInfoContainer}>
          <View style = {styles.buttonViewStyle}> 

            {trashButtonView}

            <View>
              <Icon
                    raised
                    name='qrcode'
                    type='font-awesome'
                    color=  {'#22b8cf' }
                    // disabled = {this.state.selectedItem ? false:true}
                    // color=  {this.state.selectedItem ? '#f50':'#D1D5D8' }
                    // disabledStyle = {{ backgroundColor: '#D1D5D8' }}
                    onPress={() => this._scanQRCodes()} />  
            </View>

            {sendButtonView}

          </View>      
        </View>

      </View>
  
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    // alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    flexDirection: 'column',
  },
  scannerContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    // paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },


  buttonContainerHomePage:
  {
    flex:1,
    // marginLeft: 45,
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
 
  pickerContainer: {
    // paddingTop: 30,
    // paddingLeft: 30,
    backgroundColor: '#fff',
    width: '100%',
    // justifyContent: 'center',
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    // justifyContent: 'flex-end',
    // flex:0.6
  },

  buttonViewStyle:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // backgroundColor: '#ecf0f1',
    height: 49, 
    // paddingBottom : 10
  },

  sendButtonStyle:
  {
    // height: 49, 
    // width: 49, 
    backgroundColor: 
    'rgba(111, 202, 186, 1)', 
    // borderRadius: 25 

    width: 49,
    height: 49,
    borderRadius: 50,
  },
  listViewStyle: 
  {
    flex: 1,
    // alignItems: 'flex-start',
    // justifyContent: 'center'
  },

  codeListContainer: {
    flex: 1,
    marginTop: 20,
    paddingLeft: 20 
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
    // alignItems: 'center',
    // backgroundColor: '#fbfbfb',
    paddingVertical: 10,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  selectedTextStyle: {
      color: 'rgba(214,53,108, 1)',
      // backgroundColor:'#2ECC40'
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
      fontSize: 16,
      paddingTop: 13,
      // paddingLeft: 100,
      // width: deviceWidth,
      // paddingHorizontal: 10,
      // width: '100%',
      paddingBottom: 12,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      backgroundColor: 'white',
      color: 'gray',
  },
});
