import {
  BaiduSynthesizer,
  SynthesizerData,
  SynthesizerResultData,
  SynthesizerResultError,
} from 'react-native-baidu-asr';

class BaiduAsrTTS {
  text: string;
  resultListener: any;
  errorListener: any;
  constructor() {
    this.text = '你好';
    this.setUp();
  }

  setUp() {
    BaiduSynthesizer.initialTts();
    this.resultListener = BaiduSynthesizer.addResultListener(
      this.onSynthesizerResult,
    );
    this.errorListener = BaiduSynthesizer.addErrorListener(
      this.onSynthesizerError,
    );
  }

  onSynthesizerResult = (
    data: SynthesizerData<SynthesizerResultData | string | undefined>,
  ) => {
    console.log('onSynthesizerResult', data);
  };

  onSynthesizerError = (data: SynthesizerData<SynthesizerResultError>) => {
    console.log('onSynthesizerError', data);
  };

  speak = () => {
    BaiduSynthesizer.speak(this.text, {PARAM_SPEAKER: '1'}, status => {
      console.log('speak --> ', status);
    });
  };

  unMount = () => {
    this.resultListener?.remove();
    this.errorListener?.remove();
    if (!__DEV__) {
      BaiduSynthesizer.release();
    }
  };
}

const baiduAsrTTS = new BaiduAsrTTS();
export default baiduAsrTTS;
