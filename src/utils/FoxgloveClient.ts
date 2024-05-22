import {useState, useMemo} from 'react';
import _ from 'lodash';
import {
  FoxgloveClient,
  type Channel,
  type ClientChannelWithoutId,
  type Service,
  type ServerInfo,
} from '@foxglove/ws-protocol';
import {MessageWriter, MessageReader} from '@foxglove/rosmsg2-serialization';
import {parse as parseMessageDefinition} from '@foxglove/rosmsg';
import {concatenateUint8Arrays} from './util';

type Sub = {
  subId: number;
  channelId: number;
};

export function useFoxgloveClient() {
  const [client, setClient] = useState<FoxgloveClient | null>(null);
  const [channels, setChannels] = useState<Map<number, Channel>>(new Map());
  const [services, setServices] = useState<Service[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [advertisedChannels, setAdvertisedChannels] = useState<any[]>([]);
  const [msgEncoding, setMsgEncoding] = useState<string>('cdr');
  const [callServiceId, setCallServiceId] = useState<number>(0);
  const [jsonData, setJsonData] = useState<string>('');
  const [binaryData, setBinaryData] = useState<Uint8Array>(new Uint8Array());

  const foxgloveClientConnected = () => {
    return client !== null;
  };
  /**
   * init foxglove client & storage channels and services
   */
  function initClient(socket: WebSocket) {
    if (socket.onmessage) {
      console.log('onmessage exists');
    }
    let newClient = new FoxgloveClient({
      ws: socket,
    });
    newClient.on('advertise', (rx_channels: Channel[]) => {
      setChannels(prevChannels => {
        const newChannels = new Map(prevChannels);
        rx_channels.forEach((channel: Channel) => {
          newChannels.set(channel.id, channel);
        });
        return newChannels;
      });
      console.log('current channels:', channels);
    });
    newClient.on('unadvertise', (channelIds: number[]) => {
      setChannels(prevChannels => {
        const newChannels = new Map(prevChannels);
        channelIds.forEach((id: number) => {
          newChannels.delete(id);
        });
        return newChannels;
      });
      console.log('current', channels);
    });
    newClient.on('advertiseServices', (rx_services: Service[]) => {
      setServices(preServices => {
        return preServices.concat(rx_services);
      });
    });
    newClient.on('open', () => {
      console.log('Connected to Foxglove server!');
    });
    newClient.on('error', e => {
      console.error(e);
    });
    newClient.on('close', () => {
      console.log('Disconnected from Foxglove server!');
    });
    newClient.on('serverInfo', (serverInfo: ServerInfo) => {
      if (serverInfo.supportedEncodings) {
        setMsgEncoding(serverInfo.supportedEncodings[0]);
      }
    });
    setClient(newClient);
  }

  /**
   * close the client
   */
  function closeClient() {
    if (client) {
      // unadvertise all the channel
      advertisedChannels.forEach((channel: any) => {
        client?.unadvertise(channel.id);
      });
      // unsubscribe all the channel from server
      subs.forEach((sub: Sub) => {
        client?.unsubscribe(sub.subId);
      });
      client.close();
      setClient(null);
    }
    console.log('client closed');
  }

  /**
   * subscribe one of the channels
   * @param topic topic's name
   * @returns id of the subscription
   */
  function subscribeTopic(topic: string) {
    if (!client) {
      return Promise.reject('Client not initialized');
    }
    const channel = _.find(Array.from(channels.values()), {topic});
    if (!channel) {
      return Promise.reject('Channel not found');
    }
    const subId = client.subscribe(channel.id);
    setSubs((prevSubs: Sub[]) => {
      return prevSubs.concat({subId, channelId: channel.id});
    });
    return Promise.resolve(subId);
  }

  /**
   * unsubscribe topic
   * @param subId id of the subscription
   * @returns
   */
  function unSubscribeTopic(subId: number) {
    if (!client) {
      console.error('Client not initialized!');
      return;
    }
    // remove from subs list
    setSubs((prevSubs: Sub[]) => {
      return _.reject(prevSubs, {subId});
    });
    client.unsubscribe(subId);
  }

  /**
   * publish message with one of the channel advertised
   * @param channelId id of channels advertised
   * @param message message to publish
   * @returns
   */
  function publishMessage(channelId: number, message: any) {
    if (!client) {
      console.error('Client not initialized!');
      return;
    }
    const channel = _.find(advertisedChannels, {id: channelId});
    if (!channel) {
      console.error('Channel not found!');
      return;
    }
    const parseDefinitions = parseMessageDefinition(channel.schema, {
      ros2: true,
    });
    const writer = new MessageWriter(parseDefinitions);
    const uint8Array = writer.writeMessage(message);
    client.sendMessage(channelId, uint8Array);
  }

  /**
   * call service
   * @param srvName service name
   * @param payload request params
   * @returns a promise wait for the response
   */
  function callService(
    srvName: string,
    payload: {[key: string]: any},
  ): Promise<any> {
    if (!client) {
      console.error('Client not initialized!');
      return Promise.reject('Client not initialized!');
    }
    const srv: Service | undefined = _.find(services, {name: srvName});
    if (!srv) {
      console.error('Service not found!');
      return Promise.reject('Service not found!');
    }
    const parseReqDefinitions = parseMessageDefinition(srv?.requestSchema!, {
      ros2: true,
    });
    const writer = new MessageWriter(parseReqDefinitions);
    const uint8Array = writer.writeMessage(payload);
    client.sendServiceCallRequest({
      serviceId: srv?.id!,
      callId: callServiceId + 1,
      encoding: msgEncoding,
      data: new DataView(uint8Array.buffer),
    });
    setCallServiceId(callServiceId + 1);
    return new Promise(resolve => {
      // 将监听回调函数抽离的目的是避免监听未及时off造成的内存泄漏
      function serviceResponseHandler(response: any) {
        const parseResDefinitions = parseMessageDefinition(
          srv?.responseSchema!,
          {
            ros2: true,
          },
        );
        const reader = new MessageReader(parseResDefinitions);
        console.log('res.data', response.data);
        console.log('reader', reader);

        const res = reader.readMessage(response.data);
        resolve(res);
        client?.off('serviceCallResponse', serviceResponseHandler);
      }
      client!.on('serviceCallResponse', serviceResponseHandler);
    });
  }

  /**
   * advertise topic
   * @param channel channel to be advertised
   * @returns id of the channel
   */
  function advertiseTopic(channel: ClientChannelWithoutId) {
    if (!client) {
      console.error('Client not initialized!');
      return;
    }
    const channelId = client.advertise(channel);
    advertisedChannels.push({
      id: channelId,
      ...channel,
    });
    return channelId;
  }

  /**
   * unadvertise topic
   * @param channelId id of the channel to be unadvertised
   * @returns
   */
  function unAdvertiseTopic(channelId: number) {
    if (!client) {
      console.error('Client not initialized!');
      return;
    }
    // remove from advertised channels list
    setAdvertisedChannels((prevChannels: any[]) => {
      return _.reject(prevChannels, {id: channelId});
    });
    client.unadvertise(channelId);
  }

  /**
   * receive the message from subscribeb channel
   * @param subId id of the subscription
   * @param callback
   * @returns
   */
  function listenMessage(callback: (...args: any) => void) {
    if (!client) {
      console.error('Client not initialized!');
      return;
    }
    client.on('message', callback);
  }

  function stopListenMessage(callback: (...args: any) => void) {
    if (!client) {
      console.error('Client not initialized!');
      return;
    }
    client.off('message', callback);
  }

  function readMsgWithSubId(subId: number, data: DataView) {
    const sub = _.find(subs, {subId});
    if (sub) {
      const channel = channels.get(sub.channelId);
      const parseDefinitions = parseMessageDefinition(channel?.schema!, {
        ros2: true,
      });
      const reader = new MessageReader(parseDefinitions);
      return reader.readMessage(data);
    } else {
      console.log('sub not found');
      console.error('sub not found');
    }
  }

  return {
    client,
    initClient,
    closeClient,
    foxgloveClientConnected,
    subscribeTopic,
    unSubscribeTopic,
    listenMessage,
    stopListenMessage,
    publishMessage,
    callService,
    advertiseTopic,
    unAdvertiseTopic,
    readMsgWithSubId,
  };
}
