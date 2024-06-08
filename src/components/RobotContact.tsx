import {Button, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HocComponent from './HocComponent';
import {useRobotAction} from '../hooks/useRobotAction';

interface IProps {
  foxgloveClient: any;
  ws: WebSocket;
}
function RobotContact(props: IProps) {
  const {foxgloveClient, ws} = props;
  const {
    startMoving,
    stopMoving,
    subscribeTfTopic,
    publicMoveTopic,
    unmountAction,
  } = useRobotAction(foxgloveClient);

  useEffect(() => {
    // webSocket连接状态检查，刚建立的时候tf的channel还没发布，所以延迟2s再订阅
    if (ws.readyState === 1) {
      publicMoveTopic();
      subscribeTfTopic();
    } else {
      ws.onopen = () => {
        publicMoveTopic();
        setTimeout(() => {
          subscribeTfTopic();
        }, 2000);
      };
    }
    return () => {
      unmountAction();
    };
  }, []);

  return (
    <View>
      <Button
        title="start"
        onPress={() => startMoving({angularSpeed: 0.5, linearSpeed: 0.5})}
      />
    </View>
  );
}

export default HocComponent(RobotContact);
