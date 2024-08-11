import {addRobotEventListener} from './eventBus';
import {userAsk, directionAsk, communicateAsk, commandAsk, emotionAsk} from '../hooks/hooks';
import BaiduAsrTTS from './BaiduAsr/BaiduAsrTTS';
import BaiduAsrWakeup from './BaiduAsr/BaiduAsrWakeup';
import BaiduAsrRecognization from './BaiduAsr/BaiduAsrRecognization';
import {decodeRobotAnswer} from './util';
import { useUserStore } from '../store/userStore';

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

  askRobot = async (question: string) => {
    console.log('ask question:', question);
    let result;
    // mode: direction, normal
    switch(this.mode){
      case 'direction':{
        let res = await directionAsk(question);
        result = res.result;
        break;
      }
      case 'normal':{
        let res = await communicateAsk(question);
        result = res.result;
        break;
      }
      case 'command':{
        let res = await commandAsk(question);
        result = res.result;
        break;
      }
      case 'emotion':{
        const currentEmotion = useUserStore.getState().emotion;
        console.log('currentEmotion:', currentEmotion);
        let res = await emotionAsk(question, currentEmotion);
        result = res.result;
        break;

      }
    }
    console.log('robotAnswer:', result);
    const {speech, actionParam} = decodeRobotAnswer(this.mode)(result);
    console.log('speech', speech);
    console.log('actionParam', actionParam);
    switch (this.mode) {
    case 'direction':{
      this.actions.move(actionParam);
      break;
    }
    case 'command':{
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
  };

  speakText = (text: string) => {
    this.members.BaiduAsrTTS.speak(text);
  };
}

const baiduAsrController = new BaiduAsrController();

export default baiduAsrController;
