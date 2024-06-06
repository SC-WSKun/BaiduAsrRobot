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
