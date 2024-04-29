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

  onSynthesizerResult = (
    data: SynthesizerData<SynthesizerResultData | string | undefined>,
  ) => {
    console.log('onSynthesizerResult', data);
  };

  onSynthesizerError = (data: SynthesizerData<SynthesizerResultError>) => {
    console.log('onSynthesizerError', data);
  };

  speak = (text: string) => {
    console.log('speak --> ', text);
    BaiduSynthesizer.speak(text, {PARAM_SPEAKER: '4'}, status => {
      console.log('speak --> ', status);
    });
  };

  speakLongText = (text: string) => {
    let textArray = text.split('。');
    BaiduSynthesizer.batchSpeak(textArray, {PARAM_SPEAKER: '4'}, status => {
      console.log('speakLongText --> ', status);
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

export default BaiduAsrTTS;
