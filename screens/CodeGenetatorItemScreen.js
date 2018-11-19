import React, { Component ,Dimensions}  from 'react';
import {StyleSheet, 
    TextInput, 
    View,
    TouchableOpacity,
    Text, 
    Platform,
    ListView,
    Keyboard, 
    TouchableWithoutFeedback,
    ScrollView,
    TouchableHighlight,
    Alert,
    AsyncStorage,
    Image
} from 'react-native';
import QRCode from 'react-native-qrcode';
import { Button,
    Icon,
    FormLabel, 
    FormInput, 
    FormValidationMessage } from 'react-native-elements';
import { Constants, Print } from 'expo';
import PopupDialog,
    { DialogTitle,  
      SlideAnimation,
      ScaleAnimation,
      FadeAnimation,
      DialogButton 
    } from 'react-native-popup-dialog';

import RNPickerSelect from 'react-native-picker-select';

// will try to use PDFmake in fufure
// https://github.com/cssivision/react-native-qrcode/issues/27
// generating a PDF (for which we needed the image) and used PDFMake which can internally generate a QR code.

// var width = Dimensions.get('window').width; 
// let deviceWidth = Dimensions.get('window').width


const slideAnimation = new SlideAnimation({ slideFrom: 'bottom', animationDuration: 150  });
const scaleAnimation = new ScaleAnimation();
const fadeAnimation = new FadeAnimation({ animationDuration: 150 });

export default class CodeGenetatorItemScreen extends Component
{
//   static navigationOptions =
//   {
//      title: 'QR Code for Item',
//   };
static navigationOptions = ({ navigation }) => {

    var itemId_tmp = navigation.getParam('ItemId');

    var titleStr = '';
    // alert(itemId_tmp);

    if(itemId_tmp== '0')
    {
        titleStr = 'Item QR Code'
    }
    else
    {
        titleStr = 'Pack QR Code'
    }
    return {
             title: titleStr,
    };
  };

  
  constructor(props) {

    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.inputRefs = {};
    // var {height, width} = Dimensions.get('window');
    // let deviceWidth = Dimensions.get('window').width

    var sampleList = [];

    var itemId = this.props.navigation.getParam('ItemId');

    var qrmodetype = '';
    if(itemId == '0'){
        qrmodetype = 'ITEM';
    }
    else{
        qrmodetype = 'PACK';
    }

    this.state = ({
        text: 'QR Code',
        sampleList:sampleList,
        listData :  ds.cloneWithRows(sampleList),
        QRModel :qrmodetype,
        QRCodeNumber: '',
        QRCodeNumberError: null,

        selectedItem : undefined,
        itemList: [],
        locationToken:'',

        responseQRCodeList:[],
    }); 
  }

  async componentDidMount() {

    const value =  await AsyncStorage.getItem('locationToken');  

    if (value !==  null) {
        // We have data!!
        this.setState({
          locationToken: value,
        });

        this.getProductListApiAsync();
      }


        // // if the component is using the optional `value` prop, the parent
        // // has the abililty to both set the initial value and also update it
        // setTimeout(() => {
        //     this.setState({
        //         favColor: 'red',
        //     });
        // }, 1000);

        // // parent can also update the `items` prop
        // setTimeout(() => {
        //     this.setState({
        //         items: this.state.items.concat([{ value: 'purple', label: 'Purple' }]),
        //     });
        // }, 2000);
    }

    // sample for fetch request
  getProductListApiAsync() {
    fetch('http://153.149.186.12/exp/api/products',{ 
        headers: {
          'Authorization': "Bearer "+ this.state.locationToken,
        },
        method: 'GET',
      })
      .then((response) => response.json())
      .then((responseJson) => {

            console.log(JSON.stringify(responseJson));
  
            var tmpItemList = [];
            responseJson.forEach(element => {
                tmpItemList.push({label: element.product_name,value: element.id,});
            })

            this.setState({
                itemList: tmpItemList,
            });
      })
      .catch((error) => {
        console.error(error);
      });   
  }

     // Fetch the token from storage
  _getUserToken = async () => {

    const value =  await AsyncStorage.getItem('locationToken');    
    
    if (value !==  null) {
      // We have data!!
      this.setState({
        locationToken: value,
      });
    }
  };

  _genetateQRCodes = async () => {

    this.input.blur();

    let QRCodeNumberCheck = false;

    if(this.state.QRCodeNumber)
    {
        QRCodeNumberCheck = true;

        var totalNumber = parseInt(this.state.QRCodeNumber);

        // var itemId = this.props.navigation.getParam('ItemId');
        var qrModel = this.state.QRModel;

        // alert(qrModel);
        if(qrModel == 'ITEM')
        {
            await this._sendQRCodeRequestForItem();
        }
        else if(qrModel == 'PACK')
        {
            await this._sendQRCodeRequestForPack();
        }

        this.popupDialog.show();
    }
    else
    {
        this._codeNumberErrorHandler('Error001','Number is required!');
    }
  }

  _sendQRCodeRequestForItem=  () => {

      var selectedItemCode = this.state.selectedItem;
      var totalNumber = this.state.QRCodeNumber;

      var postBody = {
            "data": {
            "md": "20181107",
            "exp": "20191008",
            "ttddd": "282828228"
            }
        }

    fetch('http://153.149.186.12/exp/api/qrCode/item/' + selectedItemCode + '/' + totalNumber, {
      body: JSON.stringify(postBody),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization' : 'Bearer '+ this.state.locationToken,
      },
      method: 'POST',
    })
    .then((response) => response.json())
    .then((responseJson) => {
          console.log('ITEM: ' + JSON.stringify(responseJson));

          const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
          var sampleList = responseJson;

          this.setState({
            sampleList:sampleList,
              listData : ds.cloneWithRows(sampleList)});
    })
    .catch((error) => {
      console.error(error);
    }); 

  }

  _sendQRCodeRequestForPack=  () => {

        var totalNumber = this.state.QRCodeNumber;

        fetch('http://153.149.186.12/exp/api/qrCode/pack/' + totalNumber, {
            headers: {
            'Authorization' : 'Bearer '+ this.state.locationToken,
            },
            method: 'GET',
        })
        .then((response) => response.json())
        .then((responseJson) => {
            //   alert(JSON.stringify(responseJson))
                console.log('PACK: ' + JSON.stringify(responseJson));

                const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

                var sampleList = responseJson;

                this.setState({
                sampleList:sampleList,
                    listData : ds.cloneWithRows(sampleList)});
        })
        .catch((error) => {
            console.error(error);
        });
    }

  printPdf = async () => {

    try
    {
        var qrModel = this.state.QRModel;
        var imgHtmlStr = '';
        var dataList = this.state.sampleList

        dataList.forEach(element => {
            var elementStr = JSON.stringify(element);

            // elementStr = elementStr.replace(/\"/g,"'");

            // var htmlcode = "https://api.qrserver.com/v1/create-qr-code/?data="+ elementStr + "&amp;size=100x100";
            var qrCodeStr = '';

            if(qrModel == 'ITEM')
            {
                qrCodeStr = element.code;
            }
            else
            {
                qrCodeStr = elementStr;
            }
            imgHtmlStr +=  "<p>"+qrCodeStr+"</p><img src=\""+ element.qrcode +"\"/>";
        });
    
        var htmlStr = '<style>html, body { width: 5cm; height: 5cm; }</style>' + imgHtmlStr;
        const options = {
        html : htmlStr,
        //orientation: Print.Orientation.landscape,
        };
        const returnValue  = await Print.printAsync(options);
        console.log("Returned value for Print : " + returnValue);
    }
    catch(ex)
    {
        console.log("Error for Print : " + ex);
    }
  };

  _codeNumberErrorHandler(code, message) {
    this.setState({
        QRCodeNumberError: !code ? null :
        {
          code,
          message,
        }
    })
  }

  _renderRow(rowData){
    
    var qrModel = this.state.QRModel;
    let codeView;

    if(qrModel == 'ITEM')
    {
      codeView = (<Text>{rowData.code}</Text>);
    }
    else
    {
        codeView = (<Text>{rowData}</Text>);
    }
    return(
        <View style={styles.codeListContainer}>
            {codeView}
            {/* <Text>{rowData.code}</Text> */}
            <Image source={{uri:rowData.qrcode}}  style={styles.image} />
            {/* <QRCode
            value={JSON.stringify(rowData)}
            size={200}
            bgColor='purple'
            fgColor='white'/> */}
        </View>
      )
  }

  render() {
    
    var itemId = this.props.navigation.getParam('ItemId');

    let selectPickerView;
    // If itemId== '0' (Item QR Code), then the show the selectPicker
    // Else hide the selectPicker
    if(itemId== '0')
    {
        selectPickerView = (
            <View>
                <FormLabel>Select an Item?</FormLabel>

                <View style = {styles.pickerContainer}>
                    <RNPickerSelect
                            placeholder={{
                                label: 'Select an item...',
                                value: null,
                            }}
                            items={this.state.itemList}
                            onValueChange={(value) => {
                                this.setState({
                                    selectedItem: value,
                                });
                            }}
                            onUpArrow={() => {
                                // this.inputRefs.picker.togglePicker();
                                this.input.focus();
                            }}
                            onDownArrow={() => {
                                    this.input.focus();
                            }}
                            style={{ ...pickerSelectStyles }}
                            value={this.state.selectedItem}
                            ref={(el) => {
                                this.inputRefs.picker = el;
                            }}
                        />
                </View>
                <View style={{ paddingVertical: 5 }} />
            </View>
          );  
    }

    return (
        <View style={styles.container}>
           
           {selectPickerView}

            <View>
                <FormLabel>How Many QR Codes You Need?</FormLabel>
                <TouchableWithoutFeedback style={{flex: 1}} onPress={Keyboard.dismiss} accessible={false}>
                    <FormInput 
                        inputStyle ={{paddingLeft: (Platform.OS) == 'ios' ? 0 : 5}}
                        keyboardType='number-pad'
                        onChangeText={(QRCodeNumber) => this.setState({ QRCodeNumber : QRCodeNumber, QRCodeNumberError:null })}
                        ref={input => this.input = input}
                        underlineColorAndroid="#808080"
                        placeholder={'Input a Number'}
                        shake={this.state.QRCodeNumberError}
                        maxLength={2}
                        clearButtonMode="always"
                        returnKeyType="go"
                        onSubmitEditing={() => {
                            Alert.alert('Success', 'Form submitted', [{ text: 'Okay', onPress: null }]);
                        }}
                    />
                </TouchableWithoutFeedback>
                <FormValidationMessage>{this.state.QRCodeNumberError ? "QR Code Number is required": null}</FormValidationMessage>
            </View>
                
            <View style = {styles.buttonViewStyle}>                
                <Button
                    icon={{name: 'qrcode', type: 'font-awesome'}}
                    buttonStyle={styles.sendButtonStyle}
                    onPress={this._genetateQRCodes}
                    title='Generate' />
            </View>  
            <PopupDialog
                dialogAnimation={slideAnimation}
                dialogTitle={<DialogTitle title='Preview QR Codes'/>}
                ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                //   dialogStyle={{marginTop:-200}}
                height ={500}
                // actions={[
                //     <Text>
                //       <ScrollView>
                //         <DialogButton
                //           text="ACCEPT"
                //           onPress={() => {}}
                //           key="button-1"
                //         />,
                //       </ScrollView>
                //     </Text>
                //   ]}              
            >
                
                <TouchableHighlight onPress={this.printPdf}  underlayColor="white">
                    <View style={styles.printerContainerStyle} >
                        <Icon
                            name='print'
                            type='font-awesome'
                            color='#00aced' />
                        <DialogButton text="PRINT" align="center" onPress={this.printPdf}/>
                    </View>
                </TouchableHighlight>

                <View style = {styles.listViewStyle}> 
                    <ListView
                        enableEmptySections={true}
                        dataSource={this.state.listData}
                        // renderRow={this._renderRow}
                        renderRow={data => this._renderRow(data)}
                    />
                </View> 
            </PopupDialog>
        </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: 'white',
        // alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'column',
        // alignItems: 'flex-start',
        // justifyContent: 'flex-start',
        // paddingLeft: 10
    },

    codeListContainer: {
        flex: 1,
        marginTop: 20,
      },

    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        margin: 10,
        borderRadius: 5,
        padding: 5,
    },


    sendButtonStyle:
    {
        height: 45, 
        width: 120, 
        backgroundColor: 
        '#1bc461', 
        borderRadius: 5,
        alignItems: 'flex-end', 
    },

    listViewStyle: 
    {
        alignItems: 'center',
        justifyContent: 'center'
    },
    
    printerContainerStyle:
    {
        flexDirection: 'row',
        justifyContent: 'flex-end',
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
        alignItems: 'flex-end',
    },
    image:{
        width: 150,
        height: 150,
        borderRadius: 25
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