import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';

import { TabView, SceneMap } from 'react-native-tab-view';
import InputTab from './InputScreen';
import QRScanScreen from './QRScanScreen';

import GeneratorTab from './CodeGeneratorHomeScreen';
import { Constants } from 'expo';

// const FirstRoute = () => (
//   <View style={[styles.container, { backgroundColor: '#ff4081' }]} />
// );
// const SecondRoute = () => (
//   <View style={[styles.container, { backgroundColor: '#673ab7' }]} />
// );

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
      // Below for tabs
      index: 0,
      routes: [
        { key: 'input', title: 'Scan' },
        { key: 'genetator', title: 'Generator' },
      ],
    }); 
  }

  // for tabs
  _handleIndexChange = index => this.setState({ index });

    // for tabs
  _renderTabBar = props => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route, i) => {
          const color = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map(
              inputIndex => (inputIndex === i ? '#D6356C' : '#222')
            ),
          });
          return (
            <TouchableOpacity 
              key={route.title}
              style={styles.tabItem}
              onPress={() => this.setState({ index: i })}>
              <Animated.Text style={{ color }}>{route.title}</Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  //   // for tabs
  // _renderScene = SceneMap({
  //   input: InputTab,
  //   genetator: GeneratorTab,
  // });

  // for tabs
  _renderSceneSwitch = ({ route }) => {
    switch (route.key) {
      case 'input':
        return <QRScanScreen />;
      case 'genetator':
        return <GeneratorTab navigation = {this.props.navigation}/>;
      default:
        return null;
    }
  }

  render() {
    return (
      <TabView
        navigationState={this.state}
        renderScene={this._renderSceneSwitch}
        renderTabBar={this._renderTabBar}
        onIndexChange={this._handleIndexChange}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#fff',

  },
  tabBar: {
    flexDirection: 'row',
    // height : Constants.statusBarHeight * 2,
    //paddingTop: Constants.statusBarHeight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  
});
