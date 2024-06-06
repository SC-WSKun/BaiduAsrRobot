import {Button, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HocComponent from './HocComponent';
import baiduAsrController from '../utils/BaiduAsrController';

interface IProps {
  foxgloveClient: any;
  ws: WebSocket;
}
function RobotContact(props: IProps) {
  const {foxgloveClient, ws} = props;
  const [channelId, setChannelId] = useState<number | undefined>(-1);
  useEffect(() => {
    console.log('ws.readyState:', ws.readyState);
    if (ws.readyState === 1) {
      setMoveTopic();
      // subscribeTfTopic();
    } else {
      ws.onopen = () => {
        setMoveTopic();
        // subscribeTfTopic();
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

  // const subscribeTfTopic = async () => {
  //   const temp_channelId = await foxgloveClient.subscribeTopic('tf');
  //   console.log('temp_channelId:', temp_channelId);
  // };

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
