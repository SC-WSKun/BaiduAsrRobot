import {MessageData} from '@foxglove/ws-protocol';
import type {Move, Position, TargetPosition} from '../typings/component';
import baiduAsrController from '../utils/BaiduAsrController';
import {quaternionToEuler} from '../utils/util';
import {useUserStore} from '../store/userStore';

export function useRobotAction(foxgloveClient: any) {
  const emotion = useUserStore.getState().emotion;
  const updateEmotion = useUserStore.getState().updateEmotion;
  const channels = new Map();
  let odomToBaseFootprint: any = null;
  let msgLimit = [true, true];
  // let emotion: string = 'neutral';
  const carPositionListener = ({
    op,
    subscriptionId,
    timestamp,
    data,
  }: MessageData) => {
    if (subscriptionId === channels.get('/tf')) {
      const parseData = foxgloveClient.readMsgWithSubId(subscriptionId, data);
      // console.log('parseData:', parseData);
      if (
        parseData.transforms.find(
          (transform: any) =>
            transform.child_frame_id === 'base_footprint' &&
            transform.header.frame_id === 'odom',
        )
      ) {
        odomToBaseFootprint =
          parseData.transforms.find(
            (transform: any) =>
              transform.child_frame_id === 'base_footprint' &&
              transform.header.frame_id === 'odom',
          )?.transform || odomToBaseFootprint;
        if (msgLimit[0]) {
          msgLimit[0] = false;
          // console.log('odomToBaseFootprint:', odomToBaseFootprint);
          setTimeout(() => {
            msgLimit[0] = true;
          }, 1000);
        }
        // this.mapToOdom =
        //   parseData.transforms.find(
        //     (transform: any) =>
        //       transform.child_frame_id === 'odom' &&
        //       transform.header.frame_id === 'map',
        //   )?.transform || this.mapToOdom;
        // this.carPose = mapToBaseFootprint(
        //   this.mapToOdom,
        //   this.odomToBaseFootprint,
        // );
        // this.updateCarPose();
      }
    }
  };

  const faceEmotionListener = ({
    op,
    subscriptionId,
    timestamp,
    data,
  }: MessageData) => {
    if (subscriptionId === channels.get('/face_emotion_result')) {
      const parseData = foxgloveClient.readMsgWithSubId(subscriptionId, data);
      const detectEmotion = parseData.data;
      if (msgLimit[1]) {
        msgLimit[1] = false;
        console.log('detectEmotion:', detectEmotion);
        setTimeout(() => {
          msgLimit[1] = true;
        }, 1000);
      }
      if (detectEmotion === 'none') {
        // emotion = 'neutral';
        // updateEmotion('neutral');
      } else {
        // emotion = detectEmotion;
        updateEmotion(detectEmotion);
      }
    }
  };

  const startMoving = ({angularSpeed, linearSpeed}: Move) => {
    foxgloveClient.publishMessage(channels.get('move'), {
      linear: {x: linearSpeed, y: 0.0, z: 0.0},
      angular: {x: 0.0, y: 0.0, z: angularSpeed},
    });
  };

  const stopMoving = () => {
    foxgloveClient.publishMessage(channels.get('move'), {
      linear: {x: 0.0, y: 0.0, z: 0.0},
      angular: {x: 0.0, y: 0.0, z: 0.0},
    });
  };

  const moveToAngular = (angular: number) => {
    if (angular === 0) {
      return Promise.resolve(true);
    }

    let angularSpeed = 0;

    if (angular < 0) {
      angularSpeed = -0.5;
    } else {
      angularSpeed = 0.5;
    }

    // 角度规范化，跨界处理
    function normalizeAngle(angle: number) {
      return Math.atan2(Math.sin(angle), Math.cos(angle));
    }

    // 四元数转欧拉角，计算出起始偏航角
    const startPose = normalizeAngle(
      quaternionToEuler(odomToBaseFootprint.rotation)[2],
    );
    const reg = (2 * Math.PI) / 360;

    function checkPosition() {
      const currentPose = normalizeAngle(
        quaternionToEuler(odomToBaseFootprint.rotation)[2],
      );
      const delta = normalizeAngle(currentPose - startPose);
      const tolerance = 0.2;
      console.log(Math.abs(delta - angular * reg));
      if (Math.abs(delta - angular * reg) > tolerance) {
        console.log('send move message');
        foxgloveClient.publishMessage(channels.get('move'), {
          linear: {x: 0.0, y: 0.0, z: 0.0},
          angular: {x: 0.0, y: 0.0, z: angularSpeed},
        });
        return false;
      } else {
        return true;
      }
    }
    return new Promise((resolve, reject) => {
      function loop() {
        setTimeout(() => {
          if (!checkPosition()) {
            loop();
          } else {
            console.log('到达目标位置');
            stopMoving();
            resolve(true);
          }
        }, 250);
      }
      loop();
    });
  };

  const moveToLinear = (linear: number) => {
    if (linear === 0) {
      return Promise.resolve(true);
    }

    // 计算欧几里得距离
    function calculateDistance(start: Position, current: Position): number {
      const dx = current.x - start.x;
      const dy = current.y - start.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    const startPosition = odomToBaseFootprint.translation;

    function checkPosition() {
      const currentPostion = odomToBaseFootprint.translation;
      const distance = calculateDistance(startPosition, currentPostion);
      const tolerance = 0.1;
      console.log(distance);
      if (linear > 0 && distance < linear) {
        foxgloveClient.publishMessage(channels.get('move'), {
          linear: {x: 0.3, y: 0.0, z: 0.0},
          angular: {x: 0.0, y: 0.0, z: 0.0},
        });
        return false;
      } else if (linear < 0 && distance > -1 * linear) {
        foxgloveClient.publishMessage(channels.get('move'), {
          linear: {x: -0.3, y: 0.0, z: 0.0},
          angular: {x: 0.0, y: 0.0, z: 0.0},
        });
        return false;
      } else {
        return true;
      }
    }

    return new Promise((resolve, reject) => {
      function loop() {
        setTimeout(() => {
          if (!checkPosition()) {
            loop();
          } else {
            console.log('到达目标位置');
            stopMoving();
            resolve(true);
          }
        }, 250);
      }
      loop();
    });
  };

  const moveToPostion = (position: TargetPosition) => {
    return new Promise((resolve, reject) => {
      if (position === null) {
        console.error('position param is null');
        resolve(false);
      }
      const {angular, linear} = position;
      moveToAngular(angular).then(() => {
        setTimeout(() => {
          moveToLinear(linear).then(() => {
            resolve(true);
          });
        }, 1500);
      });
    });
  };

  const multiMove = (targets: TargetPosition[]) => {
    if (targets.length === 0) {
      return;
    }
    function loop() {
      let current_target = targets.shift();
      current_target &&
        moveToPostion(current_target).then(() => {
          if (targets.length > 0) {
            loop();
          }
        });
    }
    loop();
  };

  const subscribeTopic = (topic: string, listener: any) => {
    foxgloveClient
      .subscribeTopic(topic)
      .then((subId: number) => {
        console.log(subId);
        channels.set(topic, subId);
      })
      .catch((err: any) => {
        console.log('err:', err);
      });
    foxgloveClient.listenMessage(listener);
  };

  const subscribeTfTopic = () => {
    return subscribeTopic('/tf', carPositionListener);
  };

  const subscribeEmotionTopic = () => {
    return subscribeTopic('/face_emotion_result', faceEmotionListener);
  };

  const publicMoveTopic = () => {
    const temp_channelId = foxgloveClient.advertiseTopic({
      encoding: 'cdr',
      schema:
        '# This expresses velocity in free space broken into its linear and angular parts.\n\nVector3  linear\nVector3  angular\n\n================================================================================\nMSG: geometry_msgs/Vector3\n# This represents a vector in free space.\n\n# This is semantically different than a point.\n# A vector is always anchored at the origin.\n# When a transform is applied to a vector, only the rotational component is applied.\n\nfloat64 x\nfloat64 y\nfloat64 z\n',
      schemaEncoding: 'ros2msg',
      schemaName: 'geometry_msgs/msg/Twist',
      topic: '/cmd_vel',
    });
    channels.set('move', temp_channelId);
    baiduAsrController.setAction('move', multiMove);
  };

  const publicFaceEmotionTopic = () => {
    const temp_channelId = foxgloveClient.advertiseTopic({
      encoding: 'cdr',
      schema: 'bool  data\n',
      schemaEncoding: 'ros2msg',
      schemaName: 'std_msgs/msg/Bool',
      topic: '/enable_emo_reg',
    });
    channels.set('enable_emo_reg', temp_channelId);
    console.log('enable_emo_reg', channels.get('enable_emo_reg'));
  };

  const publicTaskTypeTopic = () => {
    const temp_channelId = foxgloveClient.advertiseTopic({
      encoding: 'cdr',
      schema: 'int32  data\n\n',
      schemaEncoding: 'ros2msg',
      schemaName: 'std_msgs/msg/Int32',
      topic: '/task_type',
    });
    channels.set('task_type', temp_channelId);
    console.log('task_type', channels.get('task_type'));
    baiduAsrController.setAction('command', publicCommandMessage);
  };

  const unmountAction = () => {
    if (foxgloveClient) foxgloveClient.unAdvertiseTopic(channels.get('move'));
  };

  const startfaceRecognization = (data: boolean) => {
    foxgloveClient.publishMessage(channels.get('enable_emo_reg'), {data: data});
  };

  const publicCommandMessage = (data: number) => {
    console.log('command type:', data);
    foxgloveClient.publishMessage(channels.get('task_type'), {data: data});
  };

  const getEmotion = () => {
    return emotion;
  }

  return {
    startMoving,
    stopMoving,
    moveToPostion,
    multiMove,
    subscribeTfTopic,
    subscribeEmotionTopic,
    publicMoveTopic,
    publicTaskTypeTopic,
    unmountAction,
    publicFaceEmotionTopic,
    startfaceRecognization,
    publicCommandMessage,
    getEmotion,
  };
}
