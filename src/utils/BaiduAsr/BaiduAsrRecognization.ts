import {
  BaiduAsr,
  IBaseData,
  RecognizerResultData,
  RecognizerResultError,
  StatusCode,
  //   VolumeData,
} from 'react-native-baidu-asr';
import config from '../../../app.config.json';
import {addRobotEventListener, doRobotEvent} from '../event';
import {ToastAndroid} from 'react-native';

class BaiduAsrRecognization {
  speechRecognizerVolume = 0;
  resultListener: any;
  errorListener: any;
  volumeListener: any;

  constructor() {}

  setUp() {
    BaiduAsr.init(config);
    this.resultListener = BaiduAsr.addResultListener(this.onRecognizerResult);
    this.errorListener = BaiduAsr.addErrorListener(this.onRecognizerError);
    // this.volumeListener = BaiduAsr.addAsrVolumeListener(this.onAsrVolume);
    addRobotEventListener('startRecognize', this.startRecognize);
  }

  unMount() {
    this.resultListener?.remove();
    this.errorListener?.remove();
    this.volumeListener?.remove();
    BaiduAsr.release();
  }

  startRecognize = () => {
    console.log('start recognize');
    BaiduAsr.start({
      VAD_ENDPOINT_TIMEOUT: 800,
      // 禁用标点符号
      DISABLE_PUNCTUATION: false,
      PID: 15373,
    });
  };

  onRecognizerResult = async (
    data: IBaseData<RecognizerResultData | undefined>,
  ) => {
    if (
      data.code === StatusCode.STATUS_FINISHED ||
      data.code === StatusCode.STATUS_LONG_SPEECH_FINISHED
    ) {
      if (data.data?.results_recognition?.length) {
        const result = data.data.results_recognition[0];
        if (__DEV__) {
          console.log('onRecognizerResult ', result);
        }
        doRobotEvent('askRobot', result);
        BaiduAsr.cancel();
        return result;
      }
    }
  };

  onRecognizerError = (data: IBaseData<RecognizerResultError>) => {
    ToastAndroid.show(
      `${data.msg}，错误码: 【${data.data.errorCode}, ${data.data.subErrorCode}】，${data.data.descMessage}`,
      ToastAndroid.LONG,
    );
    console.log('onRecognizerError ', JSON.stringify(data));
    BaiduAsr.cancel();
  };

  /**
   * 处理音量变化
   * @param volume
   */
  //   onAsrVolume = (volume: VolumeData) => {
  //     // 一共7格音量 inputRange: [0, 100] outputRange:[0, 7]
  //     this.speechRecognizerVolume = Math.floor((7 / 100) * volume.volumePercent);
  //   };
}

export default BaiduAsrRecognization;
