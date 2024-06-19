import {addRobotEventListener} from './eventBus';
import {userAsk, directionAsk, communicateAsk} from '../hooks/hooks';
import BaiduAsrTTS from './BaiduAsr/BaiduAsrTTS';
import BaiduAsrWakeup from './BaiduAsr/BaiduAsrWakeup';
import BaiduAsrRecognization from './BaiduAsr/BaiduAsrRecognization';
import {decodeRobotAnswer} from './util';

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
    console.log('changeMode:', mode)
    this.mode = mode;
  };

  askRobot = async (question: string) => {
    console.log('askQuestion:', question);
    let result;
    if (this.mode === 'direction') {
      let res = await directionAsk(question);
      result = res.result;
    } else if (this.mode === 'normal') {
      let res = await communicateAsk(question);
      result = res.result;
    }
    console.log('robotAnswer:', result);
    const {speech, actionParam} = decodeRobotAnswer('move')(result);
    console.log('speech', speech);
    console.log('actionParam', actionParam);
    if (this.mode === 'direction') {
      this.actions.move(actionParam);
    }
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
