import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as Geometry from './geometry';
import { degreesToRadians } from './common';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
});

renderer.autoClear = false;

const floor = Geometry.Box(40, 1, 40, 0xffffff);
const box = Geometry.Box(4, 4, 4, 0xff6347);
const longBox = Geometry.Box(2, 4, 18, 0x40ab00);
const sphere = Geometry.Sphere(3, 0xaa00bb);
const tetrahedron = Geometry.Tetrahedron(4, 0x3363ff);
const redPortalFrame = Geometry.PortalFrame(0xff0000);
const bluePortalFrame = Geometry.PortalFrame(0x0000ff);

const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0x777777);

// DEVELOPER CAMERA
const topViewCamera = new THREE.OrthographicCamera(-30, 30, 30, -30, );
topViewCamera.position.set(0, 50, 0);
topViewCamera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);

init();
setupScene();
helpers();

const redPortalGeometry = new THREE.PlaneGeometry(7, 11);
const redPortalMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const redPortal = new THREE.Mesh(redPortalGeometry, redPortalMaterial);
scene.add(redPortal);

redPortal.position.set(redPortalFrame.position.x, redPortalFrame.position.y, redPortalFrame.position.z);
redPortal.rotation.x = redPortalFrame.rotation.x
redPortal.rotation.y = redPortalFrame.rotation.y
redPortal.rotation.z = redPortalFrame.rotation.z

const bluePortalGeometry = new THREE.PlaneGeometry(7, 11);
const bluePortalMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const bluePortal = new THREE.Mesh(bluePortalGeometry, bluePortalMaterial);
scene.add(bluePortal);

bluePortal.position.set(bluePortalFrame.position.x, bluePortalFrame.position.y, bluePortalFrame.position.z);
bluePortal.rotation.x = bluePortalFrame.rotation.x
bluePortal.rotation.y = bluePortalFrame.rotation.y
bluePortal.rotation.z = bluePortalFrame.rotation.z

const redPortalCamera = new THREE.PerspectiveCamera( camera.fov, camera.aspect, camera.near, camera.far );
const redPortalCameraHelper = new THREE.CameraHelper( redPortalCamera );

const bluePortalCamera = new THREE.PerspectiveCamera( camera.fov, camera.aspect, camera.near, camera.far );
const bluePortalCameraHelper = new THREE.CameraHelper( bluePortalCamera );

const cameraHelper = new THREE.CameraHelper( camera );

scene.add( cameraHelper );
scene.add( redPortalCameraHelper );
// scene.add( bluePortalCameraHelper );



function animate() {
  requestAnimationFrame(animate);

  updateRelativeDistanceAndRotation(camera, bluePortal, redPortalCamera, redPortal);
  // updateRelativeDistanceAndRotation(camera, redPortal, bluePortalCamera, bluePortal);

  controls.update();
  redPortalCameraHelper.update();
  bluePortalCameraHelper.update();

  // Render
  renderer.clear()

  renderer.setViewport(0, 0, 2 * window.innerWidth / 3, window.innerHeight);
  renderer.render(scene, camera);

  renderer.setViewport(2 * window.innerWidth / 3, 0, window.innerWidth / 3, window.innerHeight / 2);
  renderer.render(scene, redPortalCamera);
  
  // renderer.setViewport(2 * window.innerWidth / 3, window.innerHeight / 2, window.innerWidth / 3, window.innerHeight / 2);
  // renderer.render(scene, bluePortalCamera);

  renderer.setViewport(2 * window.innerWidth / 3, window.innerHeight / 2, window.innerWidth / 3, window.innerHeight / 2);
  renderer.render(scene, topViewCamera);
}

animate();

function init() {
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  camera.position.set(17, 22, -32);
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  renderer.render( scene, camera );
}

function setupScene() {
  // Objects
  scene.add(floor);
  floor.position.set(0, -0.5, 0);

  scene.add(box);
  box.position.set(5, 2, 9);

  scene.add(longBox);
  longBox.position.set(6, 2, -12);
  longBox.rotation.y = degreesToRadians(60);

  
  scene.add(sphere);
  sphere.position.set(4, 3, -2);
  sphere.rotation.y = degreesToRadians(30);

  scene.add(tetrahedron);
  tetrahedron.rotation.y = degreesToRadians(-45);
  tetrahedron.rotation.x = degreesToRadians(55);
  tetrahedron.position.set(-8, Math.sqrt(2), 3);

  scene.add(redPortalFrame, bluePortalFrame);
  redPortalFrame.position.set(-8, 5.5, -4);
  redPortalFrame.rotateY(degreesToRadians(135));
  bluePortalFrame.position.set(10, 5.5, 4);
  bluePortalFrame.rotateY(degreesToRadians(180));

  // Light
  pointLight.position.set(10, 20, 10);

  scene.add(pointLight, ambientLight);
}

function helpers() {
  // Helpers
  const lightHelper = new THREE.PointLightHelper(pointLight);
  const gridHelper = new THREE.GridHelper(200, 50);
  scene.add(lightHelper, gridHelper);
}

// function updateRelativeDistanceAndRotation(camera1, portal1, camera2, portal2) {
//   const portal2matrix = new THREE.Matrix4();
//   const portal1matrix = new THREE.Matrix4();
//   const camera1matrix = new THREE.Matrix4();
//   portal2matrix.copy(portal2.matrixWorld);
//   portal1matrix.copy(portal1.matrixWorld);
//   camera1matrix.copy(camera1.matrixWorld);
//   const matrix = portal2matrix.multiply( portal1matrix.multiply(camera1matrix) );

//   // const matrix = portal2.matrixWorld.multiply( portal1.matrixWorld.multiply(camera1.matrixWorld) );
//   camera2.position.setFromMatrixPosition(matrix);
//   camera2.quaternion.setFromRotationMatrix(matrix);
// }

function updateRelativeDistanceAndRotation(camera1, portal1, camera2, portal2) {
  const camera1Position = new THREE.Vector3();
  camera1Position.copy(camera1.position);
  const camera1PositionRelativeToPortal1 = portal1.worldToLocal(camera1Position);
  // console.log(camera1PositionRelativeToPortal1);
  camera2.position.copy( portal2.localToWorld(camera1PositionRelativeToPortal1) );

  // console.log(portal1.rotation);

  const camera1RotationRelativeToPortal1 = getLocalEuler(camera1, portal1);
  camera2.rotation.copy( getGlobalEuler(portal2, camera1RotationRelativeToPortal1));
  // console.log(camera2.rotation);
}

function getLocalEuler(object1, object2) {
  // Get the world quaternion of object1
  const object1WorldQuaternion = new THREE.Quaternion();
  object1.getWorldQuaternion(object1WorldQuaternion);

  // Invert the world quaternion of object1
  const object1WorldQuaternionInverse = object1WorldQuaternion.clone().invert();

  // Get the local quaternion of object2 in the local space of object1
  const object2LocalQuaternion = object1WorldQuaternionInverse.multiply(object2.quaternion.clone());

  // Extract Euler angles from the local quaternion
  const object2LocalEuler = new THREE.Euler().setFromQuaternion(object2LocalQuaternion);
  return object2LocalEuler;
}

function getGlobalEuler(object1, object2LocalEuler) {
  // Get the world quaternion of object1
  const object1WorldQuaternion = new THREE.Quaternion();
  object1.getWorldQuaternion(object1WorldQuaternion);

  // Convert the local Euler angles to quaternion
  const object2LocalQuaternion = new THREE.Quaternion().setFromEuler(object2LocalEuler);

  // Multiply the object2's local quaternion with the object1's world quaternion
  const object2GlobalQuaternion = object1WorldQuaternion.clone().multiply(object2LocalQuaternion);

  // Convert the resulting quaternion to Euler angles
  const object2GlobalEuler = new THREE.Euler().setFromQuaternion(object2GlobalQuaternion);

  // object2GlobalEuler.order = 'ZYX';
  console.log(object2GlobalEuler);

  return object2GlobalEuler;
}