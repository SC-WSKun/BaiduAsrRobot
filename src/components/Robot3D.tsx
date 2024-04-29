import React from 'react';
import {View} from 'react-native';
import {GLView} from 'expo-gl';
import {
  Scene,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  BoxGeometry,
} from 'three';
import {Renderer} from 'expo-three';

export default function Robot3D() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <GLView
        style={{width: 400, height: 400}}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

const onContextCreate = async (gl: any) => {
  //three.js implementation.
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    75,
    gl.drawingBufferWidth / gl.drawingBufferHeight,
    0.1,
    1000,
  );
  gl.canvas = {
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
  };

  // set camera position away from cube
  camera.position.z = 2;

  const renderer = new Renderer({gl});
  // set size of buffer to be equal to drawing buffer width
  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

  // create cube
  // define geometry
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({
    color: 'cyan',
  });

  const cube = new Mesh(geometry, material);

  // add cube to scene
  scene.add(cube);

  // create render function
  const render = () => {
    requestAnimationFrame(render);
    // create rotate function
    // rotate around x axis
    cube.rotation.x += 0.01;

    // rotate around y axis
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
    gl.endFrameEXP();
  };

  // call render
  render();
};
