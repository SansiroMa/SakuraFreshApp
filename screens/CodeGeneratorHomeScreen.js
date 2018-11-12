import React, { Component } from 'react';
 
import { AppRegistry, StyleSheet, Text, View, ListView} from 'react-native';
 
import { createStackNavigator } from 'react-navigation';
 
export default class GeneratorTab extends Component {
 
  constructor(props) {
    
       super(props);
    
       const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
       
       this.state = {
    
         dataSource: ds.cloneWithRows([
               'Generate QR Code for Item',
               'Generate QR Code for Package',
           ]),
       
       };
    
    
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
                  height: 1,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: '#aeb9c1'    
              }}>
        </View>
      );
    }
 
    OpenSecondActivity (rowData)
    {
      
       this.props.navigation.navigate('Second', { ListViewClickItemHolder: rowData });
      //  this.props.navigation.navigate('Auth');
      //  this.props.navigation.navigate('Auth');
       
    }
 
// static navigationOptions =
//   {
//      title: 'FirstActivity',
//   };
 
 
  render()
  {
     return(
        <View style = { styles.MainContainer }>
 
        <ListView
        
            dataSource={this.state.dataSource}
  
            renderSeparator= {this.ListViewItemSeparatorLine}
  
            renderRow={
                        (rowData) => <Text style={styles.rowViewContainer} onPress={this.OpenSecondActivity.bind(this, rowData)}>{rowData}</Text>
                      }
  
          />
          
          </View>
      );
    }
}
 
// class SecondActivity extends Component
// {
//   static navigationOptions =
//   {
//      title: 'SecondActivity',
//   };
 
//   render()
//   {
//      return(
//         <View style = { styles.MainContainer }>
 
//            <Text style = { styles.TextStyle }> { this.props.navigation.state.params.ListViewClickItemHolder } </Text>
 
//         </View>
//      );
//   }
// }
 
// export default BarcodeGeneratorScreenNew = createStackNavigator(
// {
//   First: { screen: FirstActivity },
  
//   Second: { screen: SecondActivity }
// });
 
const styles = StyleSheet.create(
{
  MainContainer:
  {
    //  justifyContent: 'center',
     flex:1,
    //  margin: 10,
     backgroundColor: '#fff',
   
  },
 
  TextStyle:
  {
     fontSize: 23,
     textAlign: 'center',
     color: '#000',
  },
 
  rowViewContainer: 
  {
 
    fontSize: 18,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
 
  }
 
});