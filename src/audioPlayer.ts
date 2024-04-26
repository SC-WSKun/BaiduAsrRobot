import TrackPlayer, {
  AddTrack,
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
} from 'react-native-track-player';

export async function setupPlayer() {
  let isSetup = false;
  try {
    await TrackPlayer.getActiveTrackIndex();
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      progressUpdateEventInterval: 2,
    });

    isSetup = true;
  } finally {
    return isSetup;
  }
}

export async function addTracks() {
  var tracks = [
    {
      id: '1',
      url: require('./assets/IAmHere.mp3'),
      title: 'I Am Here',
      artist: 'WangCai',
      duration: 2,
    },
  ];
  await TrackPlayer.add(tracks);
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
}

export async function playbackService() {
  //TODO: Attach remote even handlers
}
