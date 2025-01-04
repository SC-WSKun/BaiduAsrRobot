import {addRobotEventListener} from './eventBus';
import {
  userAsk,
  directionAsk,
  communicateAsk,
  commandAsk,
  emotionAsk,
} from '../hooks/hooks';
import BaiduAsrTTS from './BaiduAsr/BaiduAsrTTS';
import BaiduAsrWakeup from './BaiduAsr/BaiduAsrWakeup';
import BaiduAsrRecognization from './BaiduAsr/BaiduAsrRecognization';
import {decodeRobotAnswer} from './util';
import {useUserStore} from '../store/userStore';

class BaiduAsrController {
  members: any = {};
  actions: any = {};
  mode: string = 'normal';

  constructor() {
    this.askRobot = this.askRobot.bind(this);
    this.members.BaiduAsrTTS = new BaiduAsrTTS();
    this.members.BaiduAsrWakeup = new BaiduAsrWakeup();
    this.members.BaiduAsrRecognization = new BaiduAsrRecognization();
    addRobotEventListener('askRobot', this.askRobot);
  }

  setUp() {
    Object.values(this.members).forEach((member: any) => {
      member.setUp();
    });
  }

  unMount() {
    Object.values(this.members).forEach((member: any) => {
      member.unMount();
    });
  }

  setAction = (action: string, callback: any) => {
    this.actions[action] = callback;
  };

  changeMode = (mode: string) => {
    console.log('changeMode:', mode);
    this.mode = mode;
  };

  /**
   * 处理机器人问答
   * mode: normal, direction, command, emotion
   * normal: 正常交流模式，最稳定，机器人输出啥说啥
   * direction: 移动到指定位置
   * command: 执行指令，这个模式需要机器人端预设指令然后加到后端的prompt优化去，目前知识库还没搞，所以暂时在prompt加
   * emotion: 这个是酉城之前想加的情绪识别模式，但是那个情绪识别模式效果有点糟糕，所以先不加了
   * @param question 提问机器人的问题，由百度语音识别识别出来的
   */
  askRobot = async (question: string) => {
    console.log('ask question:', question);
    let result;
    // mode: direction, normal
    switch (this.mode) {
      case 'direction': {
        let res = await directionAsk(question);
        result = res.result;
        break;
      }
      case 'normal': {
        let res = await communicateAsk(question);
        result = res.result;
        break;
      }
      case 'command': {
        let res = await commandAsk(question);
        result = res.result;
        break;
      }
      case 'emotion': {
        const currentEmotion = useUserStore.getState().emotion;
        console.log('currentEmotion:', currentEmotion);
        let res = await emotionAsk(question, currentEmotion);
        result = res.result;
        break;
      }
    }
    console.log('robotAnswer:', result);
    if (this.mode === 'normal') {
      if (result.length >= 60) {
        this.members.BaiduAsrTTS.speakLongText(result);
      } else {
        this.members.BaiduAsrTTS.speak(result);
      }
    } else {
      const {speech, actionParam} = decodeRobotAnswer(this.mode)(result);
      console.log('speech', speech);
      console.log('actionParam', actionParam);
      switch (this.mode) {
        case 'direction': {
          this.actions.move(actionParam);
          break;
        }
        case 'command': {
          if (actionParam.command) {
            this.actions.command(actionParam.command);
          }
          break;
        }
      }
      if (result.length >= 60) {
        this.members.BaiduAsrTTS.speakLongText(speech);
      } else {
        this.members.BaiduAsrTTS.speak(speech);
      }
    }
  };

  speakText = (text: string) => {
    this.members.BaiduAsrTTS.speak(text);
  };
}

const baiduAsrController = new BaiduAsrController();

export default baiduAsrController;
