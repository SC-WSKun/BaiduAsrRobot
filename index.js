/**
 * @format
 */
// import {TextDecoder, TextEncoder} from 'text-encoding';

// if (typeof global.TextDecoder === 'undefined') {
//   global.TextDecoder = TextDecoder;
// }

// if (typeof global.TextEncoder === 'undefined') {
//   global.TextEncoder = TextEncoder;
// }
import 'react-native-polyfill-globals/auto';
// import applyGlobalPolyfills from './src/polifills';

// applyGlobalPolyfills();
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import {playbackService} from './src/utils/audioPlayer';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => playbackService);
