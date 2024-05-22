import {MessageWriter as Ros2MessageWriter} from '@foxglove/rosmsg2-serialization';
import {
  FoxgloveClient,
  type Channel,
  type IWebSocket,
  type ClientChannelWithoutId,
  type Service,
  type ServerInfo,
} from '@foxglove/ws-protocol';
import {useState} from 'react';

export function useFoxgloveClient(url: string) {
  const address = url.startsWith('ws://' || 'wss://') ? url : `ws://${url}`;
  const [client, setClient] = useState<FoxgloveClient | null>(null);
  const [channels, setChannels] = useState<Map<number, Channel>>(new Map());
  const [services, setServices] = useState<Service[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [advertisedChannels, setAdvertisedChannels] = useState<any[]>([]);
  const [msgEncoding, setMsgEncoding] = useState<string>('cdr');
  const [callServiceId, setCallServiceId] = useState<number>(0);
  const [jsonData, setJsonData] = useState<string>('');
  const [binaryData, setBinaryData] = useState<Uint8Array>(new Uint8Array());

  function initClient() {
    // init foxglove client
    let newClient = new FoxgloveClient({
      ws: new WebSocket(address, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
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

  return {
    client,
    initClient,
  };
}
