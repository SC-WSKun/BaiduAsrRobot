import {Quaternion} from '../typings/component';

const markdownRE = /```json([\s\S]*?)```/;
function decodeFormat(msg: string) {
  let speech = '';
  let action = '';
  // 这里的写法有点蠢，但是想着后面换成json格式的返回，就懒得优化了
  let msg_split: string | string[] = msg.split('#回答：');
  if (msg_split.length > 1) {
    msg_split = msg_split[1].split('#指令：');
    if (msg_split.length > 1) {
      speech = msg_split[0];
    } else {
      throw new Error('找不到#指令');
    }
    if (msg_split[1]) {
      // 文心一言返回的json经常搞个markdown的代码块包起来，这里只好做个特殊处理
      action = filterMardownFormat(msg_split[1]);
    }
  } else {
    throw new Error('找不到#回答');
  }
  return {
    speech,
    action,
  };
}

/**
 * 处理```json```包裹的代码
 * @param msg 待过滤文本
 */
function filterMardownFormat(msg: string) {
  if (markdownRE.test(msg)) {
    const matchResult = msg.match(markdownRE);
    if (matchResult && matchResult[1]) {
      return matchResult[1];
    }
  }
  return msg;
}

export function decodeRobotAnswer(type: string) {
  return (msg: string) => {
    let defaultSpeech = '';
    let actionParam = null;
    switch (type) {
      case 'direction': {
        try {
          const filter_msg = filterMardownFormat(msg);
          actionParam = JSON.parse(filter_msg);
          console.log('move:', actionParam);
        } catch (e) {
          console.log('JSON parse error:', e);
        }
        break;
      }
      case 'command': {
        try {
          const {speech, action} = decodeFormat(msg);
          actionParam = JSON.parse(action);
          console.log('command:', actionParam);
          return {
            speech,
            actionParam,
          };
        } catch (e) {
          console.log('JSON parse error:', e);
        }
        break;
      }
    }
    return {
      speech: defaultSpeech,
      actionParam,
    };
  };
}

export function quaternionToEuler(q: Quaternion): number[] {
  const x = q.x;
  const y = q.y;
  const z = q.z;
  const w = q.w;

  const sinr_cosp = 2 * (w * x + y * z);
  const cosr_cosp = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinr_cosp, cosr_cosp);

  const sinp = 2 * (w * y - z * x);
  let pitch: number;
  if (Math.abs(sinp) >= 1) {
    pitch = (Math.sign(sinp) * Math.PI) / 2;
  } else {
    pitch = Math.asin(sinp);
  }

  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);

  return [roll, pitch, yaw];
}
