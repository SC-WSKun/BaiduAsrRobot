import {Text, View} from 'react-native';
import {useFoxgloveClient} from '../utils/FoxgloveClient';
import {FoxgloveClient} from '@foxglove/ws-protocol';
import {useEffect} from 'react';
export default function RobotContact() {
  let ws = new WebSocket('ws://192.168.1.120:8765', [
    FoxgloveClient.SUPPORTED_SUBPROTOCOL,
  ]);
  const foxgloveClient = useFoxgloveClient();
  useEffect(() => {
    foxgloveClient.initClient(ws);
  }, []);

  return (
    <View>
      <Text>11</Text>
    </View>
  );
}
