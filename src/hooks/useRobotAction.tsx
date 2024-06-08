import {MessageData} from '@foxglove/ws-protocol';
import type {Move, Position} from '../typings/component';
import baiduAsrController from '../utils/BaiduAsrController';
import {quaternionToEuler} from '../utils/util';

export function useRobotAction(foxgloveClient: any) {
  const channels = new Map();
  let odomToBaseFootprint: any = null;
  let msgLimit = true;
  const carPositionListener = ({
    op,
    subscriptionId,
    timestamp,
    data,
  }: MessageData) => {
    if (subscriptionId === channels.get('tf')) {
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
        if (msgLimit) {
          msgLimit = false;
          console.log(
            'odomToBaseFootprint:',
            // odomToBaseFootprint,
            quaternionToEuler(odomToBaseFootprint.rotation),
          );
          setTimeout(() => {
            msgLimit = true;
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

  const moveToPostion = (position: Position) => {
    const {angular, linear} = position;
    function normalizeAngle(angle: number) {
      return Math.atan2(Math.sin(angle), Math.cos(angle));
    }
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
          angular: {x: 0.0, y: 0.0, z: 0.5},
        });
        return false;
      } else {
        return true;
      }
    }
    function loop() {
      setTimeout(() => {
        if (!checkPosition()) {
          loop();
        } else {
          console.log('到达目标位置');
        }
      }, 250);
    }
    loop();
  };

  const subscribeTfTopic = () => {
    foxgloveClient
      .subscribeTopic('/tf')
      .then((subId: number) => {
        console.log(subId);
        channels.set('tf', subId);
      })
      .catch((err: any) => {
        console.log('err:', err);
      });
    foxgloveClient.listenMessage(carPositionListener);
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
    baiduAsrController.setAction('move', startMoving);
  };

  const unmountAction = () => {
    foxgloveClient.unAdvertiseTopic(channels.get('move'));
  };
  return {
    startMoving,
    stopMoving,
    moveToPostion,
    subscribeTfTopic,
    publicMoveTopic,
    unmountAction,
  };
}
