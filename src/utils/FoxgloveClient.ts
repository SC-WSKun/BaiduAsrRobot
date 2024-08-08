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

type Sub = {
  subId: number;
  channelId: number;
};

export function myFoxgloveClient() {
  let client: FoxgloveClient | null = null;
  let channels: Map<number, Channel> = new Map();
  let services: Service[] = [];
  let subs: Sub[] = [];
  let advertisedChannels: any[] = [];
  let msgEncoding = 'cdr';
  let callServiceId = 0;

  const foxgloveClientConnected = () => {
    return client !== null;
  };
  /**
   * init foxglove client & storage channels and services
   */
  function initClient(socket: WebSocket, fn: any) {
    if (socket.onmessage) {
      console.log('onmessage exists');
    }
    client = new FoxgloveClient({
      ws: socket,
    });
    client.on('advertise', (rx_channels: Channel[]) => {
      rx_channels.forEach((channel: Channel) => {
        channels.set(channel.id, channel);
      });
      console.log('current channels:', channels);
    });
    client.on('unadvertise', (channelIds: number[]) => {
      channelIds.forEach((id: number) => {
        channels.delete(id);
      });
      console.log('current', channels);
    });
    client.on('advertiseServices', (rx_services: Service[]) => {
      services = services.concat(rx_services);
    });
    client.on('open', () => {
      console.log('Connected to Foxglove server!');
      fn();
    });
    client.on('error', e => {
      console.error('foxgloveClient error:',e);
    });
    client.on('close', () => {
      console.log('Disconnected from Foxglove server!');
    });
    client.on('serverInfo', (serverInfo: ServerInfo) => {
      if (serverInfo.supportedEncodings) {
        msgEncoding = serverInfo.supportedEncodings[0];
      }
    });
    console.log('client initialized');
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
      client = null;
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
    console.log(channels.values())
    const channel = _.find(Array.from(channels.values()), {topic});
    if (!channel) {
      return Promise.reject('Channel not found');
    }
    const subId = client.subscribe(channel.id);
    subs.push({subId, channelId: channel.id});
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
    subs = _.reject(subs, {subId});
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
    callServiceId = callServiceId + 1;
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
    advertisedChannels = _.reject(advertisedChannels, {id: channelId});
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
