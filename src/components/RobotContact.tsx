import {Button, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HocComponent from './HocComponent';
import {useRobotAction} from '../hooks/useRobotAction';
import baiduAsrController from '../utils/BaiduAsrController';

interface IProps {
  foxgloveClient: any;
  ws: WebSocket;
}
function RobotContact(props: IProps) {
  const {foxgloveClient, ws} = props;
  const {
    startMoving,
    moveToPostion,
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
      {/* <Button
        title="move"
        onPress={() => moveToPostion({angular: 90, linear: 0.5})}
      /> */}
      <Button
        title="communicate mode"
        onPress={() => baiduAsrController.changeMode("normal")}
      />
      <Button
        title="move mode"
        onPress={() => baiduAsrController.changeMode("direction")}
      />
    </View>
  );
}

export default HocComponent(RobotContact);
