import {Quaternion} from '../typings/component';

export function decodeRobotAnswer(type: string) {
  return (msg: string) => {
    let actionParam = null;
    let speech = '';
    let msg_split: string | string[] = msg.split('#回答：');
    console.log('msg_split:', msg_split);
    if (msg_split.length > 1) {
      msg_split = msg_split[1].split('#指令：');
      if (msg_split.length > 1) {
        speech = msg_split[0];
      } else {
        throw new Error('找不到#指令');
      }
    } else {
      throw new Error('找不到#回答');
    }
    switch (type) {
      case 'move': {
        try {
          actionParam = JSON.parse(msg_split[1]);
          console.log('move:', actionParam);
        } catch (e) {
          console.log('JSON parse error:', e);
        }
        break;
      }
    }
    return {
      speech,
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
