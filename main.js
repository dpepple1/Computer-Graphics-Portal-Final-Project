import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as Geometry from './geometry';
import { degreesToRadians } from './common';
import * as Colors from './Colors'

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
redPortalCameraHelper.setColors( Colors.red,  Colors.white,  Colors.white,  Colors.pink,  Colors.white );

const bluePortalCamera = new THREE.PerspectiveCamera( camera.fov, camera.aspect, camera.near, camera.far );
const bluePortalCameraHelper = new THREE.CameraHelper( bluePortalCamera );
bluePortalCameraHelper.setColors( Colors.blue,  Colors.white,  Colors.white,  Colors.skyblue,  Colors.white );


const cameraHelper = new THREE.CameraHelper( camera );

scene.add( cameraHelper );
scene.add( redPortalCameraHelper );
scene.add( bluePortalCameraHelper );

// ----------------------------

const camera1 = camera;
const portal1 = redPortal;
const camera2 = bluePortalCamera;
const portal2 = bluePortal;

const camera1Normal = new THREE.Vector3( 0, 0, -1 );
camera1Normal.applyQuaternion(camera1.quaternion);
camera1Normal.normalize();

const portal1Normal = new THREE.Vector3( 0, 0, 1 );
portal1Normal.applyQuaternion(portal1.quaternion);
portal1Normal.normalize();

const portal2Normal = new THREE.Vector3( 0, 0, 1 );
portal2Normal.applyQuaternion(portal2.quaternion);
portal2Normal.normalize();

const camera1Portal1NormalSum = portal1Normal.clone().add(camera1Normal);

const camera2Portal2NormalSum = camera1Portal1NormalSum.clone().applyQuaternion(portal2.quaternion)
camera2Portal2NormalSum.x = -camera2Portal2NormalSum.x;
camera2Portal2NormalSum.z = -camera2Portal2NormalSum.z;

const camera2Target = camera2Portal2NormalSum.clone().sub(portal2Normal);

camera2.lookAt(camera2.position.clone().add(camera2Target));

// ----------------------------


function animate() {
  requestAnimationFrame(animate);

  // updateRelativePositionAndRotation(camera, bluePortal, redPortalCamera, redPortal);
  updateRelativePositionAndRotation(camera, redPortal, bluePortalCamera, bluePortal);

  controls.update();
  redPortalCameraHelper.update();
  bluePortalCameraHelper.update();

  // Render
  renderer.clear()

  renderer.setViewport(0, 0, 2 * window.innerWidth / 3, window.innerHeight);
  renderer.render(scene, camera);

  // renderer.setViewport(2 * window.innerWidth / 3, 0, window.innerWidth / 3, window.innerHeight / 2);
  // renderer.render(scene, redPortalCamera);
  
  renderer.setViewport(2 * window.innerWidth / 3, window.innerHeight / 2, window.innerWidth / 3, window.innerHeight / 2);
  renderer.render(scene, bluePortalCamera);

  renderer.setViewport(2 * window.innerWidth / 3, 0, window.innerWidth / 3, window.innerHeight / 2);
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
  // scene.add(floor);
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

function updateRelativePositionAndRotation(camera1, portal1, camera2, portal2) {
  // Update Relative Position
  const camera1Position = new THREE.Vector3();
  camera1Position.copy(camera1.position);
  const camera1PositionRelativeToPortal1 = portal1.worldToLocal(camera1Position);
  camera2.position.copy( portal2.localToWorld(camera1PositionRelativeToPortal1) );

  // // Update Relative Position
  // camera2.rotation.x = camera1.rotation.x;
  // camera2.rotation.y = camera1.rotation.y;
  // camera2.rotation.z = camera1.rotation.z;

  // const camera1Normal = new THREE.Vector3( 0, 0, -1 );
  // camera1Normal.applyQuaternion(camera1.quaternion);
  // camera1Normal.normalize();

  // const portal1Normal = new THREE.Vector3( 0, 0, 1 );
  // portal1Normal.applyQuaternion(portal1.quaternion);
  // portal1Normal.normalize();

  // const portal2Normal = new THREE.Vector3( 0, 0, 1 );
  // portal2Normal.applyQuaternion(portal2.quaternion);
  // portal2Normal.normalize();

  // const camera1Portal1NormalSum = portal1Normal.clone().add(camera1Normal);

  // const camera2Portal2NormalSum = camera1Portal1NormalSum.clone().applyQuaternion(portal2.quaternion)
  // camera2Portal2NormalSum.x = -camera2Portal2NormalSum.x;
  // camera2Portal2NormalSum.z = -camera2Portal2NormalSum.z;

  // const camera2Target = camera2Portal2NormalSum.clone().sub(portal2Normal);

  // camera2.lookAt(camera2.position.clone().add(camera2Target));
}