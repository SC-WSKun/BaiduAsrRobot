import React, {Component} from 'react';
import {Button, StyleSheet, View} from 'react-native';
import RobotWakeUp from './RobotWakeUp';
import VoiceRecognization from './VoiceRecognization';
import baiduAsrTTS from '../utils/BaiduAsrTTS';

interface IProps {}

interface IState {}

class HomeScreen extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <View style={styles.container}>
        <RobotWakeUp />
        <VoiceRecognization />
        <Button title="speak" onPress={baiduAsrTTS.speak} />
        <View style={styles.bottomView} />
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
