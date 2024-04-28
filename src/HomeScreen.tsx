import React, {Component, createRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {BaiduAsr} from 'react-native-baidu-asr';
import config from '../app.config.json';
import RobotWakeUp from './RobotWakeUp';
import VoiceRecognization from './VoiceRecognization';

interface IProps {}

interface IState {}

class HomeScreen extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    BaiduAsr.init(config);
  }

  VoiceRecognizationRef: React.RefObject<VoiceRecognization> = createRef();

  componentWillUnmount() {}

  render() {
    return (
      <View style={styles.container}>
        <RobotWakeUp />
        <VoiceRecognization />

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
