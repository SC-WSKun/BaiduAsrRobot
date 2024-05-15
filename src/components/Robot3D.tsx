import React, {Suspense, useEffect} from 'react';
import {View} from 'react-native';
import {useFrame, Canvas} from '@react-three/fiber/native';
import {Environment, useGLTF, useAnimations} from '@react-three/drei/native';
import useControls from 'r3f-native-orbitcontrols';
import modelPath from '../assets/dragon_stitch.glb';
import * as THREE from 'three';

function Model({url, ...rest}) {
  const {scene, animations} = useGLTF(url);
  let mixer = new THREE.AnimationMixer(scene);
  const action = mixer.clipAction(animations[0]);
  action.play();
  // animations.forEach((clip: any) => {
  //   const action = mixer.clipAction(clip);
  //   action.play();
  // });
  useFrame((state, delta) => {
    mixer.update(delta);
  });
  // modelAnimations.actions[modelAnimations.names[0]].play();
  return <primitive {...rest} object={scene} position={[0, -1, 0]} scale={1} />;
}

export default function Robot3D() {
  const [OrbitControls, events] = useControls();
  return (
    <View style={{flex: 1}} {...events}>
      <Canvas
        gl={{physicallyCorrectLights: true}}
        camera={{position: [-6, 0, 16], fov: 10}}
        onCreated={state => {
          const _gl = state.gl.getContext();
          const pixelStorei = _gl.pixelStorei.bind(_gl);
          _gl.pixelStorei = function (...args) {
            const [parameter] = args;
            switch (parameter) {
              case _gl.UNPACK_FLIP_Y_WEBGL:
                return pixelStorei(...args);
            }
          };
        }}>
        <color attach={'background'} args={['#f0f0f0']} />
        <ambientLight />
        <OrbitControls />
        <Suspense>
          <Model url={modelPath} />
        </Suspense>
      </Canvas>
    </View>
  );
}
