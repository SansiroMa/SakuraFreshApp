import React from 'react';
import { StyleSheet, View,  TouchableOpacity, Text } from 'react-native';
// import PDFReader from 'rn-pdf-reader-js';
import { Constants, Print } from 'expo';

export default class PrinterScreen extends React.Component {
  printPdf = async () => {
    const options = {
      uri: 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf',
    };
    const returnValue  = await Print.printAsync(options);
    console.log("Returned value for Print : " + returnValue);
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.printPdf()}>
          <Text>Print</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});
