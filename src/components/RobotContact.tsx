import {Text, View} from 'react-native';
import {useFoxgloveClient} from '../utils/FoxgloveClient';
import {useEffect} from 'react';
export default function RobotContact() {
  const foxgloveClient = useFoxgloveClient('ws://192.168.1.120:8765');
  useEffect(() => {
    foxgloveClient.initClient();
  }, []);

  return (
    <View>
      <Text>11</Text>
    </View>
  );
}
