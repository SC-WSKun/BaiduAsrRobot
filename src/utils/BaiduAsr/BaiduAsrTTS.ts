import {
  BaiduSynthesizer,
  SynthesizerData,
  SynthesizerResultData,
  SynthesizerResultError,
} from 'react-native-baidu-asr';

class BaiduAsrTTS {
  resultListener: any;
  errorListener: any;
  constructor() {}

  setUp() {
    BaiduSynthesizer.initialTts();
    this.resultListener = BaiduSynthesizer.addResultListener(
      this.onSynthesizerResult,
    );
    this.errorListener = BaiduSynthesizer.addErrorListener(
      this.onSynthesizerError,
    );
  }

  unMount() {
    this.resultListener?.remove();
    this.errorListener?.remove();
    if (!__DEV__) {
      BaiduSynthesizer.release();
    }
  }

  /**
   * 处理结果
   * @param data
   */
  onSynthesizerResult = (
    data: SynthesizerData<SynthesizerResultData | string | undefined>,
  ) => {
    console.log('onSynthesizerResult', data);
  };

  /**
   * 处理错误
   * @param data
   */
  onSynthesizerError = (data: SynthesizerData<SynthesizerResultError>) => {
    console.log('onSynthesizerError', data);
  };

  /**
   * 短文本播放
   * @param text
   */
  speak = (text: string) => {
    console.log('speak --> ', text);
    BaiduSynthesizer.speak(text, {PARAM_SPEAKER: '4'}, status => {
      console.log('speak --> ', status);
    });
  };

  /**
   * 长文本播放, 以句号分割
   * @param text
   */
  speakLongText = (text: string) => {
    let textArray = text.split('。');
    BaiduSynthesizer.batchSpeak(textArray, {PARAM_SPEAKER: '4'}, status => {
      console.log('speakLongText --> ', status);
    });
  };

  /**
   * 停止播放
   */
  stopSpeak = () => {
    BaiduSynthesizer.resume(status => {
      console.log('stopSpeak --> ', status);
    });
  };
}

export default BaiduAsrTTS;
