import React, {Component} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {
  BaiduWakeUp,
  IBaseData,
  WakeUpResultError,
} from 'react-native-baidu-asr';
import config from '../app.config.json';

interface IProps {}

interface IState {
  status: string;
  results: string[];
  isStart: boolean;
}

class HomeScreen extends Component<IProps, IState> {
  resultListener: any;
  errorListener: any;
  constructor(props: any) {
    super(props);
    this.state = {
      status: '☆唤醒词：旺财旺财☆',
      results: [],
      isStart: false,
    };
  }

  componentDidMount() {
    BaiduWakeUp.init(config);
    this.resultListener = BaiduWakeUp.addResultListener(this.onWakeUpResult);
    this.errorListener = BaiduWakeUp.addErrorListener(this.onWakeUpError);
  }

  componentWillUnmount() {
    this.resultListener?.remove();
    this.errorListener?.remove();
    BaiduWakeUp.release();
  }

  onWakeUpResult = (data: IBaseData<string | undefined>) => {
    this.setState(preState => {
      const newResults = preState.results;
      if (data.data) {
        newResults.push(data.data);
      }
      return {
        results: newResults,
        status: data.msg,
      };
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

  handleAction = () => {
    if (this.state.isStart) {
      BaiduWakeUp.stop();
      this.setState({isStart: false});
    } else {
      BaiduWakeUp.start({
        //表示WakeUp.bin文件定义在assets目录下
        WP_WORDS_FILE: 'assets:///WakeUp.bin',
      });
      this.setState({isStart: true});
    }
  };

  render() {
    const {status, results, isStart} = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>{status}</Text>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {results.map(result => (
            <Text key={result + Math.random()} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </ScrollView>

        <View style={styles.bottomView}>
          <Button
            title={isStart ? '停止' : '开始'}
            onPress={this.handleAction}
          />
        </View>
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
  welcome: {
    fontSize: 14,
    textAlign: 'center',
    margin: 10,
  },
  scrollViewContent: {
    flex: 1,
  },
  bottomView: {
    marginBottom: 5,
  },
  resultText: {
    marginVertical: 3,
    marginLeft: 5,
  },
});
