import {Button, View} from 'react-native';
import {useFoxgloveClient} from '../utils/FoxgloveClient';
import React, {useEffect, useMemo, useState} from 'react';
import HocComponent from './HocComponent';

interface IProps {
  ws: WebSocket;
}
function RobotContact(props: IProps) {
  const {ws} = props;
  const foxgloveClient = useFoxgloveClient();
  const [channelId, setChannelId] = useState<number | undefined>(-1);
  useEffect(() => {
    return () => {
      foxgloveClient.unAdvertiseTopic(channelId!);
    };
  }, []);

  const initClient = () => {
    console.log('init client');
    foxgloveClient.initClient(ws);
  };

  const setChannel = () => {
    console.log('set channel');
    setChannelId(
      foxgloveClient.advertiseTopic({
        encoding: 'cdr',
        schema:
          '# This expresses velocity in free space broken into its linear and angular parts.\n\nVector3  linear\nVector3  angular\n\n================================================================================\nMSG: geometry_msgs/Vector3\n# This represents a vector in free space.\n\n# This is semantically different than a point.\n# A vector is always anchored at the origin.\n# When a transform is applied to a vector, only the rotational component is applied.\n\nfloat64 x\nfloat64 y\nfloat64 z\n',
        schemaEncoding: 'ros2msg',
        schemaName: 'geometry_msgs/msg/Twist',
        topic: '/cmd_vel_teleop',
      }),
    );
  };

  const handleMove = (linearSpeed: number, angularSpeed: number) => {
    console.log('handleMove:');
    foxgloveClient.publishMessage(channelId!, {
      linear: {x: linearSpeed, y: 0.0, z: 0.0},
      angular: {x: 0.0, y: 0.0, z: angularSpeed},
    });
  };

  return (
    <View>
      <Button
        onPress={() => {
          initClient();
        }}
        title="init Client"
      />
      <Button onPress={setChannel} title="设置Channel" />
      <Button
        onPress={() => {
          handleMove(1, 0);
        }}
        title="移动"
      />
    </View>
  );
}

export default HocComponent(RobotContact);
