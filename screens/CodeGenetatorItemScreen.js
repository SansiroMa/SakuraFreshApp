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
    AsyncStorage
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
  static navigationOptions =
  {
     title: 'QR Code for Item',
  };
 
  
  constructor(props) {

    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.inputRefs = {};
    // var {height, width} = Dimensions.get('window');
    // let deviceWidth = Dimensions.get('window').width

    var sampleList = [];

    this.state = ({
        text: 'QR Code',
        sampleList:sampleList,
        listData :  ds.cloneWithRows(sampleList),
        QRCodeNumber: '',
        QRCodeNumberError: null,

        selectedItem : undefined,
        itemList: [],
        locationToken:'',

        responseQRCodeList:[],
        // favColor: undefined,
        //     items: [
        //         {
        //             label: 'Red',
        //             value: 'red',
        //         },
        //         {
        //             label: 'Orange',
        //             value: 'orange',
        //         },
        //         {
        //             label: 'Blue',
        //             value: 'blue',
        //         },
        //     ],
        //     favSport: undefined,
        //     items2: [
        //         {
        //             label: 'Football',
        //             value: 'football',
        //         },
        //         {
        //             label: 'Baseball',
        //             value: 'baseball',
        //         },
        //         {
        //             label: 'Hockey',
        //             value: 'hockey',
        //         },
        //     ],

    }); 
  }

//   async  componentWillMount()
//   {
//     // this._getUserToken();
//     const value =  await AsyncStorage.getItem('locationToken');    
    
//     if (value !==  null) {
//         alert("have data"+ value);
//       // We have data!!
//       this.setState({
//         locationToken: value,
//       });
//     }

//   }
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
            // alert(JSON.stringify(responseJson));
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

        await this._sendQRCodeRequest();

        // var sampleList = [];
        // var tmpResponseQRCodeList = this.state.responseQRCodeList;
        // if(tmpResponseQRCodeList > 0)
        // {
        //     tmpResponseQRCodeList.forEach(element => {
        //         sampleList.push(element);
        //         });
        // }
        // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        // this.setState({ 
        //     sampleList:sampleList,
        //     listData:ds.cloneWithRows(sampleList),
        //     });

        this.popupDialog.show();
    }
    else
    {
        this._codeNumberErrorHandler('Error001','Number is required!');
    }
  }

  _sendQRCodeRequest=  () => {
      var selectedItemCode = this.state.selectedItem;
      var totalNumber = this.state.QRCodeNumber;

      var postBody = {
            "data": {
            "md": "20181107",
            "exp": "20191008",
            "ttddd": "282828228"
            }
        }
    //   var totalNumber = parseInt(this.state.QRCodeNumber);

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
        //   alert(JSON.stringify(responseJson))
          console.log(JSON.stringify(responseJson));

          const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

          var sampleList = responseJson;
          
        // for (var i=1; i <= totalNumber; i++){
        //     var qrCode = "qrcodeforitem" + i;
        //     var qrTitle = "qrcodeforitem" + i;

        //     var item = {qrCode,qrTitle}
        //     sampleList.push(item);
        // }

        //   this.setState({listData : ds.cloneWithRows(responseJson)});

        //   var sampleList = [
        //     {
        //       image:'啤酒',
        //       title:'啤酒',
        //     },
        //     {
        //       image:'面包',
        //       title:'面包',
        //     },
        //     {
        //       image:'蛋糕',
        //       title:'蛋糕',
        //     },
        //   ];

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
        var imgHtmlStr = '';

        var dataList = this.state.sampleList
        dataList.forEach(element => {
            var elementStr = JSON.stringify(element);

            elementStr = elementStr.replace(/\"/g,"'");
            // alert(elementStr);
          var htmlcode = "https://api.qrserver.com/v1/create-qr-code/?data="+ elementStr + "&amp;size=100x100";

        // alert(elementStr);

        //   valueList.push(element.value);
        // imgHtmlStr +=  "<p>"+element+"</p> <img src=\"https://api.qrserver.com/v1/create-qr-code/?data="+ element +"&amp;size=90x90\"";
        // imgHtmlStr +=  "<p>"+element+"</p><img src=\"https://api.qrserver.com/v1/create-qr-code/?data="+ element +"&amp;size=100x100&bgcolor=800080&fgcolor=fff\"/>";
        // imgHtmlStr +=  "<p>"+element.code+"</p><img src=\"https://api.qrserver.com/v1/create-qr-code/?data="+ elementStr +"&amp;size=100x100\"/>";
        imgHtmlStr +=  "<p>"+element.code+"</p><img src=\""+ htmlcode +"\"/>";
        });
    
        // alert(imgHtmlStr);
        var htmlStr = '<style>html, body { width: 5cm; height: 5cm; }</style>' + imgHtmlStr;
        const options = {
        //   uri: 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf',
        // uri : 'https://api.qrserver.com/v1/create-qr-code/?data=HelloWorld&amp;size=100x100',
        // html : '<style>html, body { width: 5cm; height: 5cm; }</style><h3>TestforQRCod</h3> <img  src="https://api.qrserver.com/v1/create-qr-code/?data=TestforQRCode&amp;size=100x100" alt="" width="50"  height="50" /><br/> <h3>HelloWorld</h3><img src="https://api.qrserver.com/v1/create-qr-code/?data=HelloWorld&amp;size=100x100"  alt="" width="50" height="50" />',
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
    return(
        <View style={styles.codeListContainer}>
            <Text>{rowData.code}</Text>
            <QRCode
            value={JSON.stringify(rowData)}
            size={200}
            bgColor='purple'
            fgColor='white'/>

            {/* <View style={{
                            height: 1,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: 'skyblue'    
                        }}>
            </View> */}

        </View>
      )
  }

  render() {

    // var  codeListTitleView = [];

    // var dataList = this.state.listData
    // dataList.forEach(element => {

    //     codeListTitleView.push(
    //         <View style={styles.view} key={i} >
    //         <ProductTile onPressAction={this._pdpPage} prod={prod} index={i} />
    //         <ProductTile onPressAction={this._pdpPage} prod={prod2} index={i + 1} />
    //         </View>
    //     );

    // });

    // let printButtonView;
    // if(this.state.sampleList.length >0)
    // {
    //     printButtonView = (                
    //         <Button
    //         icon={{name: 'print', type: 'font-awesome'}}
    //         buttonStyle={styles.sendButtonStyle}
    //         onPress={this.printPdf}
    //         title='Print' />
    //     )
    // }
    

    return (
        <View style={styles.container}>
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
                            value={this.state.favSport}
                            ref={(el) => {
                                this.inputRefs.picker = el;
                            }}
                        />
                </View>

                <View style={{ paddingVertical: 5 }} />

                <FormLabel>How Many QR Codes You Need?</FormLabel>
                <View>
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
                </View>
                <FormValidationMessage>{this.state.QRCodeNumberError ? "QR Code Number is required": null}</FormValidationMessage>
            </View>


            <Button
                icon={{name: 'qrcode', type: 'font-awesome'}}
                buttonStyle={styles.sendButtonStyle}
                onPress={this._genetateQRCodes}
                title='Generate' />

            {/* <View style={styles.pickerContainer}>
                <Text>Name?</Text>
                <TextInput
                    ref={(el) => {
                        this.inputRefs.name = el;
                    }}
                    returnKeyType="next"
                    enablesReturnKeyAutomatically
                    onSubmitEditing={() => {
                        this.inputRefs.picker.togglePicker();
                    }}
                    style={pickerSelectStyles.inputIOS}
                    blurOnSubmit={false}
                />

                <View style={{ paddingVertical: 5 }} />

                <Text>What&rsquo;s your favorite color?</Text>
                <RNPickerSelect
                    placeholder={{
                        label: 'Select a color...',
                        value: null,
                    }}
                    items={this.state.items}
                    onValueChange={(value) => {
                        this.setState({
                            favColor: value,
                        });
                    }}
                    onUpArrow={() => {
                        this.inputRefs.name.focus();
                    }}
                    onDownArrow={() => {
                        this.inputRefs.picker2.togglePicker();
                    }}
                    style={{ ...pickerSelectStyles }}
                    value={this.state.favColor}
                    ref={(el) => {
                        this.inputRefs.picker = el;
                    }}
                />

                <View style={{ paddingVertical: 5 }} />

                <Text>What&rsquo;s your favorite sport?</Text>
                <RNPickerSelect
                    placeholder={{
                        label: 'Select a sport...',
                        value: null,
                    }}
                    items={this.state.items2}
                    onValueChange={(value) => {
                        this.setState({
                            favSport: value,
                        });
                    }}
                    onUpArrow={() => {
                        this.inputRefs.picker.togglePicker();
                    }}
                    onDownArrow={() => {
                        this.inputRefs.company.focus();
                    }}
                    style={{ ...pickerSelectStyles }}
                    value={this.state.favSport}
                    ref={(el) => {
                        this.inputRefs.picker2 = el;
                    }}
                />

                <View style={{ paddingVertical: 5 }} />

                <Text>Company?</Text>
                <TextInput
                    ref={(el) => {
                        this.inputRefs.company = el;
                    }}
                    returnKeyType="go"
                    enablesReturnKeyAutomatically
                    style={pickerSelectStyles.inputIOS}
                    onSubmitEditing={() => {
                        Alert.alert('Success', 'Form submitted', [{ text: 'Okay', onPress: null }]);
                    }}
                />
            </View> */}
           
                <PopupDialog
                    dialogAnimation={slideAnimation}
                    //   dialogTitle={<DialogTitle title={this.state.title} />}
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
                    {/* <Button
                        icon={{name: 'print', type: 'font-awesome'}}
                        buttonStyle={styles.sendButtonStyle}
                        onPress={this.printPdf}
                        title='Print' />     */}

                    <View style = {styles.listViewStyle}> 
                        <ListView
                            enableEmptySections={true}
                            dataSource={this.state.listData}
                            renderRow={this._renderRow}
                        />
                    </View> 
                </PopupDialog>

        </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
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
        borderRadius: 5 
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
        backgroundColor: '#fff',
        // justifyContent: 'center',
        paddingHorizontal: 20,
        // alignItems: 'center',
        // justifyContent: 'flex-end',
        // flex:0.6
    },

});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingTop: 13,
        // width: deviceWidth,
        // paddingHorizontal: 10,
        paddingBottom: 12,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        backgroundColor: 'white',
        color: 'gray',
    },
});