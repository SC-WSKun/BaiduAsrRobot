import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import baiduAsrController from '../utils/BaiduAsrController';
import Robot3D from './Robot3D';
import RobotContact from './RobotContact';

interface IProps {}

interface IState {}

class HomeScreen extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    baiduAsrController.setUp();
  }

  componentWillUnmount() {
    baiduAsrController.unMount();
  }

  render() {
    return (
      <View style={styles.container}>
        {/* <Robot3D /> */}
        <RobotContact />
      </View>
    );
  }
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  bottomView: {
    marginBottom: 5,
  },
});
