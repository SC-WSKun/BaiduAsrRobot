import {addRobotEventListener} from './event';
import {userAsk} from '../hooks/hooks';
import BaiduAsrTTS from './BaiduAsr/BaiduAsrTTS';
import BaiduAsrWakeup from './BaiduAsr/BaiduAsrWakeup';
import BaiduAsrRecognization from './BaiduAsr/BaiduAsrRecognization';

class BaiduAsrController {
  members: any = {};

  constructor() {
    this.askRobot = this.askRobot.bind(this);
    addRobotEventListener('askRobot', this.askRobot);
    this.members.BaiduAsrTTS = new BaiduAsrTTS();
    this.members.BaiduAsrWakeup = new BaiduAsrWakeup();
    this.members.BaiduAsrRecognization = new BaiduAsrRecognization();
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

  async askRobot(question: string) {
    let {result} = await userAsk(question);
    try {
      this.members.BaiduAsrTTS.speak(result);
    } catch (e) {
      console.log(e);
    }
  }
}

const baiduAsrController = new BaiduAsrController();

export default baiduAsrController;