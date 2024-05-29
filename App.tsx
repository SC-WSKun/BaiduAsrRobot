/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/components/HomeScreen';
import {FoxgloveClient} from '@foxglove/ws-protocol';
import {WsContext} from './src/context';

const Stack = createNativeStackNavigator();

const ws = new WebSocket('ws://192.168.1.120:8765', [
  FoxgloveClient.SUPPORTED_SUBPROTOCOL,
]);

function App(): React.JSX.Element {
  // const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  return (
    <WsContext.Provider value={{ws}}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </WsContext.Provider>
  );
}

export default App;
