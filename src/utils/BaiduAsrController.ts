import {addRobotEventListener} from './eventBus';
import {userAsk} from '../hooks/hooks';
import BaiduAsrTTS from './BaiduAsr/BaiduAsrTTS';
import BaiduAsrWakeup from './BaiduAsr/BaiduAsrWakeup';
import BaiduAsrRecognization from './BaiduAsr/BaiduAsrRecognization';
import {decodeRobotAnswer} from './util';

class BaiduAsrController {
  members: any = {};
  actions: any = {};

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

  askRobot = async (question: string) => {
    console.log('askQuestion:', question);
    let {result} = await userAsk(question);
    console.log('robotAnswer:', result);
    const {speech, actionParam} = decodeRobotAnswer('move')(result);
    this.actions.move(actionParam);
    if (result.length >= 60) {
      this.members.BaiduAsrTTS.speakLongText(speech);
    } else {
      this.members.BaiduAsrTTS.speak(speech);
    }
  };

  speakText = (text: string) => {
    this.members.BaiduAsrTTS.speak(text);
  };
}

const baiduAsrController = new BaiduAsrController();

export default baiduAsrController;
