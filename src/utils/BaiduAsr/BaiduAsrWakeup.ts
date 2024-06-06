import {
  BaiduWakeUp,
  IBaseData,
  WakeUpResultError,
} from 'react-native-baidu-asr';
import config from '../../../app.config.json';
import {addTracks, setupPlayer} from '../audioPlayer';
import TrackPlayer from 'react-native-track-player';
import {doRobotEvent} from '../eventBus';
import {ToastAndroid} from 'react-native';

class BaiduAsrWakeup {
  isPlayerReady: boolean = false;
  resultListener: any;
  errorListener: any;
  constructor() {}

  setUp() {
    BaiduWakeUp.init(config);
    this.resultListener = BaiduWakeUp.addResultListener(this.onWakeUpResult);
    this.errorListener = BaiduWakeUp.addErrorListener(this.onWakeUpError);
    this.setUpPlayer();
    setTimeout(() => {
      BaiduWakeUp.start({
        WP_WORDS_FILE: 'assets:///WakeUp.bin',
      });
    }, 1000);
  }

  unMount() {
    this.resultListener?.remove();
    this.errorListener?.remove();
  }

  async setUpPlayer() {
    let isSetup = await setupPlayer();
    const queue = await TrackPlayer.getQueue();
    if (isSetup && queue.length <= 0) {
      await addTracks();
    }
    this.isPlayerReady = isSetup;
  }

  onWakeUpResult = () => {
    if (this.isPlayerReady) {
      TrackPlayer.skip(0);
      TrackPlayer.play();
      setTimeout(() => {
        doRobotEvent('startRecognize', undefined);
      }, 1000);
    }
  };

  onWakeUpError = (data: IBaseData<WakeUpResultError>) => {
    ToastAndroid.show(
      `${data.msg}，错误码: 【${data.data.errorCode}】，错误消息：${data.data.errorMessage}，原始返回：${data.data.result}`,
      ToastAndroid.LONG,
    );
    console.log('唤醒错误 ', data);
  };
}

export default BaiduAsrWakeup;
