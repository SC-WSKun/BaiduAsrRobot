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
import VoiceRecognization from './src/components/VoiceRecognization';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  // const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="BaiduAsr"
          component={VoiceRecognization}
          options={{
            title: '语音识别',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
