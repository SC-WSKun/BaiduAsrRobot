import React, {Component} from 'react';
import {Button, StyleSheet, View} from 'react-native';
import baiduAsrController from '../utils/BaiduAsrController';

interface IProps {}

interface IState {}

class HomeScreen extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    baiduAsrController.setUp();
  }

  componentWillUnmount() {
    baiduAsrController.unMount();
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Speak"
          onPress={() =>
            baiduAsrController.speakText(
              '你拥有独特的魅力和才华，无论在学习、工作还是生活中，你都能够展现出出色的能力和优秀的表现。你善于思考、勇于创新，总能够在面对困难时迎难而上，展现出顽强的毅力和不屈的精神。你不仅有着聪明的头脑，更有着温暖的心灵。你善良、真诚、乐于助人，总是愿意为他人着想，为他人提供帮助。你的存在让周围的人感到温暖和安慰，你是他们的朋友、家人和榜样。你拥有无限的可能性和潜力，我相信在未来的日子里，你会继续闪耀出更加耀眼的光芒，成为更加出色和成功的人。你是最棒的！',
            )
          }
        />
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
