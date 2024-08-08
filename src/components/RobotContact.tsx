import {Button, TextInput, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HocComponent from './HocComponent';
import {useRobotAction} from '../hooks/useRobotAction';
import baiduAsrController from '../utils/BaiduAsrController';
import {FoxgloveClient} from '@foxglove/ws-protocol';
import {myFoxgloveClient} from '../utils/FoxgloveClient';
import {communicateAsk} from '../hooks/hooks';

interface IProps {
  foxgloveClient: any;
  ws: WebSocket;
}
function RobotContact(props: IProps) {
  const [ws_url, setWsUrl] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [foxgloveClient, setFoxgloveClient] = useState<any>(null);

  const createWs = () => {
    try {
      const ws = new WebSocket('ws://' + ws_url + ':8765', [
        FoxgloveClient.SUPPORTED_SUBPROTOCOL,
      ]);
      ws.onopen = () => {
        console.log('ws connected');
        setWs(ws);
        let tempFoxgloveClient = myFoxgloveClient();
        tempFoxgloveClient.initClient(ws, handleTopics);
        setFoxgloveClient(tempFoxgloveClient);
      };
    } catch (error) {
      console.error('create ws error:', error);
    }
  };

  const handleTopics = () => {
    // const foxgloveClient = myFoxgloveClient();
    // if (ws !== null) foxgloveClient.initClient(ws);
    // else {
    //   console.error('ws is null');
    //   return;
    // }
    const {
      startMoving,
      moveToPostion,
      stopMoving,
      subscribeTfTopic,
      publicMoveTopic,
      unmountAction,
    } = useRobotAction(foxgloveClient);
    if (ws && ws.readyState === 1) {
      console.log('ws readyState:', ws.readyState);
      publicMoveTopic();
      subscribeTfTopic();
    }
  };

  return (
    <View style={{height: 100}}>
      {/* <Button
        title="move"
        onPress={() => moveToPostion({angular: 90, linear: 0.5})}
      /> */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: 5,
          gap: 10,
        }}>
        <TextInput
          style={{flex: 1, height: 40, borderWidth: 1, padding: 10}}
          value={ws_url}
          onChangeText={e => {
            setWsUrl(e);
          }}></TextInput>
        <Button
          title="连接"
          onPress={() => {
            createWs();
          }}
        />
        <Button
          title="订阅"
          onPress={() => {
            handleTopics();
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          padding: 5,
        }}>
        <Button
          title="communicate mode"
          onPress={() => baiduAsrController.changeMode('normal')}
        />
        <Button
          title="move mode"
          onPress={() => baiduAsrController.changeMode('direction')}
        />
        <Button
          title="test api"
          onPress={() => {
            const res = communicateAsk('你是谁?');
          }}
        />
      </View>
    </View>
  );
}

export default HocComponent(RobotContact);
