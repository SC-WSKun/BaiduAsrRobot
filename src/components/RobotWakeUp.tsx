import React, {Component} from 'react';
import {StyleSheet, Text, ToastAndroid} from 'react-native';
import {
  BaiduWakeUp,
  IBaseData,
  WakeUpResultError,
} from 'react-native-baidu-asr';
import config from '../../app.config.json';
import TrackPlayer from 'react-native-track-player';
import {setupPlayer, addTracks} from '../utils/audioPlayer';
import {doRecognize} from '../utils/event';

interface IProps {}

interface IState {
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
      isStart: false,
      isPlayerReady: false,
    };
  }

  componentDidMount() {
    const that = this;
    //初始化百度语音唤醒
    BaiduWakeUp.init(config);
    this.resultListener = BaiduWakeUp.addResultListener(this.onWakeUpResult);
    this.errorListener = BaiduWakeUp.addErrorListener(this.onWakeUpError);
    //初始化播放器
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
    //启动唤醒服务
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

  onWakeUpResult = () => {
    if (this.state.isPlayerReady) {
      TrackPlayer.skip(0);
      TrackPlayer.play();
      doRecognize();
    }
  };

  onWakeUpError = (data: IBaseData<WakeUpResultError>) => {
    ToastAndroid.show(
      `${data.msg}，错误码: 【${data.data.errorCode}】，错误消息：${data.data.errorMessage}，原始返回：${data.data.result}`,
      ToastAndroid.LONG,
    );
    console.log('唤醒错误 ', data);
  };

  render() {
    return <Text style={styles.welcome}>这里放旺财的图片</Text>;
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
