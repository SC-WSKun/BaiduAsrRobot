import React, {Component} from 'react';
import {StyleSheet, Text, ToastAndroid} from 'react-native';
import {
  BaiduWakeUp,
  IBaseData,
  WakeUpResultError,
} from 'react-native-baidu-asr';
import config from '../app.config.json';
import TrackPlayer from 'react-native-track-player';
import {setupPlayer, addTracks} from './audioPlayer';
import { doRecognize } from './event';

interface IProps {}

interface IState {
  status: string;
  isStart: boolean;
  isPlayerReady: boolean;
}

class RobotWakeUp extends Component<IProps, IState> {
  resultListener: any;
  errorListener: any;
  startRecognize: any;
  constructor(props: any) {
    super(props);
    this.state = {
      status: '☆唤醒词：旺财旺财☆',
      isStart: false,
      isPlayerReady: false,
    };
  }

  componentDidMount() {
    const that = this;
    BaiduWakeUp.init(config);
    this.resultListener = BaiduWakeUp.addResultListener(this.onWakeUpResult);
    this.errorListener = BaiduWakeUp.addErrorListener(this.onWakeUpError);
    async function setup() {
      let isSetup = await setupPlayer();
      const queue = await TrackPlayer.getQueue();
      if (isSetup && queue.length <= 0) {
        await addTracks();
      }
      that.setState({
        isPlayerReady: isSetup,
      });
    }
    setup();
    setTimeout(() => {
      BaiduWakeUp.start({
        //表示WakeUp.bin文件定义在assets目录下
        WP_WORDS_FILE: 'assets:///WakeUp.bin',
      });
    }, 1000);
  }

  componentWillUnmount() {
    this.resultListener?.remove();
    this.errorListener?.remove();
    BaiduWakeUp.stop();
    BaiduWakeUp.release();
  }

  onWakeUpResult = (data: IBaseData<string | undefined>) => {
    if (this.state.isPlayerReady) {
      TrackPlayer.skip(0);
      TrackPlayer.play();
      doRecognize();
    }
    this.setState({
      status: data.msg,
    });
  };

  onWakeUpError = (data: IBaseData<WakeUpResultError>) => {
    this.setState({status: data.msg});
    ToastAndroid.show(
      `${data.msg}，错误码: 【${data.data.errorCode}】，错误消息：${data.data.errorMessage}，原始返回：${data.data.result}`,
      ToastAndroid.LONG,
    );
    console.log('唤醒错误 ', data);
  };

  render() {
    const {status} = this.state;
    return <Text style={styles.welcome}>{status}</Text>;
  }
}

export default RobotWakeUp;

const styles = StyleSheet.create({
  welcome: {
    fontSize: 14,
    textAlign: 'center',
    margin: 10,
  },
});
