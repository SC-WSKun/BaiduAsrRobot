import {Button, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HocComponent from './HocComponent';
import baiduAsrController from '../utils/BaiduAsrController';
import type {MessageData} from '@foxglove/ws-protocol';

interface IProps {
  foxgloveClient: any;
  ws: WebSocket;
}
function RobotContact(props: IProps) {
  const {foxgloveClient, ws} = props;
  const [channelId, setChannelId] = useState<number | undefined>(-1);
  const [tfSubId, setTfSubId] = useState<number | undefined>(-1);
  const carPositionListener = ({
    op,
    subscriptionId,
    timestamp,
    data,
  }: MessageData) => {
    if (subscriptionId === tfSubId) {
      const parseData = foxgloveClient.readMsgWithSubId(subscriptionId, data);
      // if (
      //   parseData.transforms.find(
      //     (transform: any) =>
      //       (transform.child_frame_id === 'base_footprint' &&
      //         transform.header.frame_id === 'odom') ||
      //       (transform.child_frame_id === 'odom' &&
      //         transform.header.frame_id === 'map'),
      //   )
      // ) {
      //   this.odomToBaseFootprint =
      //     parseData.transforms.find(
      //       (transform: any) =>
      //         transform.child_frame_id === 'base_footprint' &&
      //         transform.header.frame_id === 'odom',
      //     )?.transform || this.odomToBaseFootprint;
      //   this.mapToOdom =
      //     parseData.transforms.find(
      //       (transform: any) =>
      //         transform.child_frame_id === 'odom' &&
      //         transform.header.frame_id === 'map',
      //     )?.transform || this.mapToOdom;
      //   this.carPose = mapToBaseFootprint(
      //     this.mapToOdom,
      //     this.odomToBaseFootprint,
      //   );
      //   this.updateCarPose();
      // }
    }
  };

  useEffect(() => {
    console.log('ws.readyState:', ws.readyState);
    if (ws.readyState === 1) {
      setMoveTopic();
      subscribeTfTopic();
    } else {
      ws.onopen = () => {
        setMoveTopic();
        setTimeout(() => {
          subscribeTfTopic();
        }, 2000);
      };
    }
    return () => {
      foxgloveClient.unAdvertiseTopic(channelId!);
    };
  }, []);

  const setMoveTopic = () => {
    const temp_channelId = foxgloveClient.advertiseTopic({
      encoding: 'cdr',
      schema:
        '# This expresses velocity in free space broken into its linear and angular parts.\n\nVector3  linear\nVector3  angular\n\n================================================================================\nMSG: geometry_msgs/Vector3\n# This represents a vector in free space.\n\n# This is semantically different than a point.\n# A vector is always anchored at the origin.\n# When a transform is applied to a vector, only the rotational component is applied.\n\nfloat64 x\nfloat64 y\nfloat64 z\n',
      schemaEncoding: 'ros2msg',
      schemaName: 'geometry_msgs/msg/Twist',
      topic: '/cmd_vel',
    });
    setChannelId(temp_channelId);
    baiduAsrController.setAction('move', handleMove(temp_channelId));
  };

  const subscribeTfTopic = () => {
    console.log('subscribeTfTopic');
    foxgloveClient
      .subscribeTopic('/tf')
      .then((subId: number) => {
        setTfSubId(subId);
      })
      .catch((err: any) => {
        console.log('err:', err);
      });
    foxgloveClient.listenMessage(carPositionListener);
  };

  const handleMove = (channel: number | undefined) => {
    return ({
      linearSpeed,
      angularSpeed,
    }: {
      linearSpeed: number;
      angularSpeed: number;
    }) => {
      console.log('move', linearSpeed, angularSpeed);
      foxgloveClient.publishMessage(channel, {
        linear: {x: linearSpeed, y: 0.0, z: 0.0},
        angular: {x: 0.0, y: 0.0, z: angularSpeed},
      });
    };
  };

  return <View />;
}

export default HocComponent(RobotContact);
