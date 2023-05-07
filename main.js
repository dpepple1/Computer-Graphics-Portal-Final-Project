/*****************************/
// Filename: main.js
// Project: Portal
// Group: Eduardo P., Derek P., Steven G.
/*****************************/

import './style.css'

/* LIBRARIES */
import * as THREE from 'three';

// Orbit Camera
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as CameraUtils from 'three/addons/utils/CameraUtils.js';

import * as Geometry from './geometry';
import { degreesToRadians } from './common';
import * as Colors from './Colors'

// Collision Detection Library
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

import Stats from 'three/addons/libs/stats.module.js';

/* CLOCK FOR PHYSICS */
const clock = new THREE.Clock();

/* SCENE SETUP */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccee);
scene.fog = new THREE.Fog(0x88ccee, 0, 200);

/* CONTAINER */
const container = document.getElementById('container');

/* CAMERA */
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

/* LIGHTING */
const hemiLight = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
hemiLight.position.set(2, 1, 1);
scene.add(hemiLight);

/* SHADOWS */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(- 5, 25, - 1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 1000;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = - 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = - 30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = - 0.00006;
scene.add(directionalLight);

/* INITIALIZES RENDERER SETTINGS */
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
renderer.autoClear = false;

/* CONSTANTS */
const STEPS_PER_FRAME = 1;
const GRAVITY = 30;

/* STATS */
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild(stats.domElement);

/* SCENE GEOMETRY */
const floor = Geometry.Box(40, 1, 40, 0x111111);
const box = Geometry.Box(4, 4, 4, 0xff6347);
const longBox = Geometry.Box(2, 4, 18, 0x40ab00);
const sphere = Geometry.Sphere(3, 0xaa00bb);
const tetrahedron = Geometry.Tetrahedron(4, 0x3363ff);
const redPortalFrame = Geometry.PortalFrame(0xff0000);
const bluePortalFrame = Geometry.PortalFrame(0x0000ff);
const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0x777777);

// const controls = new OrbitControls(camera, renderer.domElement);
const bluePortalRenderTarget = new THREE.WebGLRenderTarget( 1080, 1080, {format: THREE.RGBAFormat});
const redPortalRenderTarget = new THREE.WebGLRenderTarget( 1080, 1080, {format: THREE.RGBAFormat});

/* INITIAL SETUP */
init();
setupScene();

/* COLLISION DETECTION LIBRARY */
let worldOctree = new Octree();

/* PLAYER PARAMETERS */
const playerHeight = 5.0;
const playerRadius = 0.4;
const playerXDefault = 0.0;
const playerYDefault = 0.35;
const playerZDefault = 0.0;
const playerFloorSpeed = 25;
const playerAirSpeed = 8;
const playerCollider = new Capsule(new THREE.Vector3(playerXDefault, playerYDefault, playerZDefault), new THREE.Vector3(playerXDefault, playerHeight + playerYDefault, playerZDefault), playerRadius);

// Player Location
let playerX = 0.0;
let playerY = 0.0;
let playerZ = 0.0;

// Player Velocity
const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();
let playerOnFloor = false;

/* KEYBOARD INPUTS */
const keyStates = {};

/* TIMING CODE FOR PORTAL WALKTHROUGH */
let startTime = Date.now();
let activePortal = 0;
let portalInterval = 3000;

/* EVENT LISTENERS */
document.addEventListener('keydown', (event) => {
    keyStates[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    keyStates[event.code] = false;
});
container.addEventListener('mousedown', () => {
    document.body.requestPointerLock();
});
document.body.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
        camera.rotation.y -= event.movementX / 400;
        camera.rotation.x -= event.movementY / 400;
    }
});

/* WINDOW RESIZE */
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/* LOAD MESHES INTO COLLISION DETECTION LIBRARY */
const loader = new GLTFLoader();
worldOctree.fromGraphNode(floor);
worldOctree.fromGraphNode(longBox);
worldOctree.fromGraphNode(sphere);
worldOctree.fromGraphNode(redPortalFrame);
worldOctree.fromGraphNode(bluePortalFrame);
worldOctree.fromGraphNode(tetrahedron);
worldOctree.fromGraphNode(box);

/* RED PORTAL */
const redPortal = Geometry.BufferPortal(7, 11, redPortalRenderTarget);
scene.add(redPortal);

redPortal.position.set(redPortalFrame.position.x, redPortalFrame.position.y, redPortalFrame.position.z);
redPortal.rotation.x = redPortalFrame.rotation.x;
redPortal.rotation.y = redPortalFrame.rotation.y;
redPortal.rotation.z = redPortalFrame.rotation.z;

/* BLUE PORTAL */
const bluePortal = Geometry.BufferPortal(7, 11, bluePortalRenderTarget);
scene.add(bluePortal);
bluePortal.position.set(bluePortalFrame.position.x, bluePortalFrame.position.y, bluePortalFrame.position.z);
bluePortal.rotation.x = bluePortalFrame.rotation.x;
bluePortal.rotation.y = bluePortalFrame.rotation.y;
bluePortal.rotation.z = bluePortalFrame.rotation.z;

/* CALCULATE BOUNDS OF PORTAL */
let blueBox = new THREE.Box3().setFromObject(bluePortal);
let redBox = new THREE.Box3().setFromObject(redPortal);

/* PORTAL CAMERA SETUP */
const redPortalCamera = new THREE.PerspectiveCamera( camera.fov, camera.aspect, camera.near, camera.far );
const bluePortalCamera = new THREE.PerspectiveCamera( camera.fov, camera.aspect, camera.near, camera.far );

/* SCENE HELPERS */
/*
const redPortalCameraHelper = new THREE.CameraHelper( redPortalCamera );
redPortalCameraHelper.setColors( Colors.red,  Colors.white,  Colors.white,  Colors.pink,  Colors.white );

const bluePortalCameraHelper = new THREE.CameraHelper( bluePortalCamera );
bluePortalCameraHelper.setColors( Colors.blue,  Colors.white,  Colors.white,  Colors.skyblue,  Colors.white );
 
const cameraHelper = new THREE.CameraHelper( camera );
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add( lightHelper, gridHelper);
scene.add( cameraHelper );
scene.add( redPortalCameraHelper );
scene.add( bluePortalCameraHelper );
*/

/* DEVELOPER CAMERA */
const topViewCamera = new THREE.OrthographicCamera(-30, 30, 30, -30, );
topViewCamera.position.set(0, 50, 0);
topViewCamera.lookAt(0, 0, 0);

/* MAIN ANIMATE FUNCTION LOOP */
function animate() {
    /* CHANGE OVER TIME */
    let deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    
    /* UPDATE MULTIPLE TIMES PER FRAME */
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
        /* UPDATE PORTAL CAMERAS */
        updateRelativePositionAndRotation(camera, bluePortal, redPortalCamera, redPortal);
        updateRelativePositionAndRotation(camera, redPortal, bluePortalCamera, bluePortal);
        
        /* UPDATE PORTAL RENDERERS */
        renderPortal(bluePortal, redPortal, redPortalFrame, redPortalCamera, bluePortalRenderTarget);
        renderPortal(redPortal, bluePortal, bluePortalFrame, bluePortalCamera, redPortalRenderTarget);
        
        /* PORTAL HELPERS */
        /*
         redPortalCameraHelper.update();
         bluePortalCameraHelper.update();
        */
        
        /* UPDATE ORBIT CONTROLS */
        /*
         controls.update();
        */
        
       /* UPDATE PLAYER LOCATION */
        controls(deltaTime);
        updatePlayer(deltaTime);
        teleportPlayerIfOutOfBounds();
        
        /* TIMER CODE FOR PORTAL */
        // If previous portal was a red portal
        if (activePortal == 2) {
            if (startTime + portalInterval < Date.now()) {
                teleportPlayerIfPortalBlue();
                activePortal = 0;
                startTime = Date.now();
            }
        }
        // If previous portal was a blue portal
        if (activePortal == 1) {
            if (startTime + portalInterval < Date.now()) {
                teleportPlayerIfPortalRed();
                activePortal = 0;
                startTime = Date.now();
            }
        }
        // If no portal was walked through
        if (activePortal == 0 && startTime + portalInterval < Date.now()) {
            teleportPlayerIfPortalBlue();
            if (activePortal == 0) {
                teleportPlayerIfPortalRed();
                if (activePortal == 0) {
                    // Do nothing
                } else {
                    startTime = Date.now();
                }
            } else {
                startTime = Date.now()
            }
        }
        
        /* RENDER */
        renderer.render(scene, camera);
        
        /* DEV MODE */
        /*
         renderer.clear();
         renderer.setViewport(0, 0, 2 * window.innerWidth / 3, window.innerHeight);
         renderer.render(scene, camera);
         
         renderer.setViewport(2 * window.innerWidth / 3, 0, window.innerWidth / 3, window.innerHeight / 2);
         renderer.render(scene, redPortalCamera);
         
         renderer.setViewport(2 * window.innerWidth / 3, window.innerHeight / 2, window.innerWidth / 3, window.innerHeight / 2);
         renderer.render(scene, bluePortalCamera);
         */
    }
    
    /* RECALL LOOP */
    stats.update();
    requestAnimationFrame(animate);
}

/* BEGIN ANIMATION */
animate();

////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////
/* SETS UP INITIAL CAMERA */
function init() {
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  camera.position.set(17, 22, -32);
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  renderer.render( scene, camera );
}

/* SETS UP INITIAL SCENE */
function setupScene() {
  // Objects
  scene.add(floor);
  floor.position.set(0, -0.5, 0);

  scene.add(box);
  box.position.set(5, 2, 14);

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
  bluePortalFrame.rotateY(degreesToRadians(210));

  // Light
  pointLight.position.set(10, 20, 10);

  scene.add(pointLight, ambientLight);
}

/* PLAYER COLLISION */
function playerCollisions() {
    const result = worldOctree.capsuleIntersect(playerCollider);
    playerOnFloor = false;
    if (result) {
        playerOnFloor = result.normal.y > 0;
        if (!playerOnFloor) {
            playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));
        }
        playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
}

/* PLAYER UPDATE */
function updatePlayer(deltaTime) {
    let damping = Math.exp(- 4 * deltaTime) - 1;
    if (!playerOnFloor) {
        playerVelocity.y -= GRAVITY * deltaTime;
        damping *= 0.1; // Air Resistance
    }
    playerVelocity.addScaledVector(playerVelocity, damping);
    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);
    playerCollisions();
    camera.position.copy(playerCollider.end);
}

/* FORWARD */
function getForwardVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    return playerDirection;
}
/* SIDE TO SIDE */
function getSideVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);
    return playerDirection;
}

/* CONTROLS */
function controls(deltaTime) {
    const speedDelta = deltaTime * (playerOnFloor ? playerFloorSpeed : playerAirSpeed);
    if (keyStates['KeyW']) {
        playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
    }
    if (keyStates['KeyS']) {
        playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));
    }
    if (keyStates['KeyA']) {
        playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));
    }
    if (keyStates['KeyD']) {
        playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
    }
    if (playerOnFloor) {
        if (keyStates['Space']) {
            playerVelocity.y = 20;
        }
    }
}

/* TELEPORT OUT-OF-BOUNDS PLAYER */
function teleportPlayerIfOutOfBounds() {
    if (camera.position.y <= - 25) {
        playerCollider.start.set(playerXDefault, playerYDefault, playerZDefault);
        playerCollider.end.set(playerXDefault, playerYDefault + playerHeight, playerZDefault);
        playerCollider.radius = playerRadius;
        camera.position.copy(playerCollider.end);
        camera.rotation.set(0, 0, 0); // Look forward
    }
}

/* TELEPORTS PLAYER WALKING THROUGH BLUE PORTAL */
function teleportPlayerIfPortalBlue() {
    // let bbox = new THREE.Box3().setFromObject(bluePortalFrame);
    if (camera.position.x < blueBox.max.x && camera.position.x > blueBox.min.x) {
        if (camera.position.z < blueBox.max.z && camera.position.z > blueBox.min.z) {
            let ratioX = (camera.position.x - blueBox.min.x) / (blueBox.max.x - blueBox.min.x);
            
            // Calculate new relative position
            playerX = redBox.max.x - (ratioX * (Math.abs(redBox.max.x - redBox.min.x)));
            playerY = camera.position.y;
            playerZ = redBox.max.z + (ratioX * (Math.abs(redBox.max.x - redBox.min.x))) / Math.cos((5*Math.PI / 6));
            
            // Places player in new location
            playerCollider.start.set(playerX, playerY - playerHeight, playerZ);
            playerCollider.end.set(playerX, playerY, playerZ);
            playerCollider.radius = playerRadius;
            camera.position.copy(playerCollider.end);
            camera.rotation.set(camera.rotation.x, camera.rotation.y- (5*Math.PI/12),camera.rotation.z);
            playerVelocity.set(-Math.cos(Math.PI/12) * playerVelocity.x, playerVelocity.y, -Math.cos(5*Math.PI/12) * playerVelocity.z);
            activePortal = 1;
        }
    }
}



/* TELEPORTS PLAYER WALKING THROUGH RED PORTAL */
function teleportPlayerIfPortalRed() {
    if (camera.position.x < redBox.max.x && camera.position.x > redBox.min.x) {
        if (camera.position.z < redBox.max.z && camera.position.z > redBox.min.z) {
            let ratioX = (camera.position.x - redBox.min.x) / (redBox.max.x - redBox.min.x);

            // Calculate new relative position
            playerX = blueBox.max.x - (ratioX * (Math.abs(blueBox.max.x - blueBox.min.x)));
            playerY = camera.position.y;
            playerZ = blueBox.max.z -  (ratioX * (Math.abs(blueBox.max.x - blueBox.min.x))) / Math.cos((5*Math.PI / 6));
            
            // Places player into new location
            playerCollider.start.set(playerX, playerY - playerHeight, playerZ);
            playerCollider.end.set(playerX, playerY, playerZ);
            playerCollider.radius = playerRadius;
            camera.position.copy(playerCollider.end);
            camera.rotation.set(camera.rotation.x, camera.rotation.y+ (5*Math.PI/12),camera.rotation.z);
            playerVelocity.set(-Math.cos(Math.PI/12) * playerVelocity.x, playerVelocity.y, -Math.cos(5*Math.PI/12) * playerVelocity.z);
            activePortal = 2;
        }
    }
}

/* UPDATE CAMERA POSITIONS */
function updateRelativePositionAndRotation(camera1, portal1, camera2, portal2) {
  // Update Relative Position
  const camera1Position = new THREE.Vector3();
  camera1Position.copy(camera1.position);
  const camera1PositionRelativeToPortal1 = portal1.worldToLocal(camera1Position);
  camera2.position.copy( portal2.localToWorld(camera1PositionRelativeToPortal1) );

  // Update Relative rotation
  camera2.rotation.x = camera1.rotation.x;
  camera2.rotation.y = camera1.rotation.y;
  camera2.rotation.z = camera1.rotation.z;

  const camera1Normal = new THREE.Vector3( 0, 0, -1 );
  camera1Normal.applyQuaternion(camera1.quaternion);
  camera1Normal.normalize();
  // portal normals do not need to be calculated each frame if the portals do not move
  const portal1Normal = new THREE.Vector3( 0, 0, 1 );
  portal1Normal.applyQuaternion(portal1.quaternion);
  portal1Normal.normalize();

  const portal2Normal = new THREE.Vector3( 0, 0, 1 );
  portal2Normal.applyQuaternion(portal2.quaternion);
  portal2Normal.normalize();

  const camera1Portal1NormalSum = portal1Normal.clone().add(camera1Normal);

  const rotationFactor = portal2.quaternion.clone().multiply(portal1.quaternion.clone().conjugate());
  const camera2Portal2NormalSum = camera1Portal1NormalSum.clone().applyQuaternion(rotationFactor);

  const camera2Target = camera2Portal2NormalSum.clone().sub(portal2Normal);
  
  camera2.lookAt(camera2.position.clone().add(camera2Target));
}

/* GETS SCREEN SPACE OF CAMERA */
function getScreenSpace(coordinate, camera)
{
  //Returns coordinates position in NORMALIZED screen space of camera
  let pos = coordinate.clone();
  pos.project(camera);
  pos.x = (pos.x + 1) / 2
  pos.y = (pos.y + 1) / 2

  return pos
}

/* RENDERS PORTAL LOOKTHROUGH */
function renderPortal(lookatPortal, otherPortal, otherPortalFrame, otherCamera, renderTarget)
{

  //Get Four Corners of the other portal
  const buffer = otherPortal.geometry.attributes.position.array;
  let v1 = new THREE.Vector3(buffer[0], buffer[1], buffer[2]);
  let v2 = new THREE.Vector3(buffer[3], buffer[4], buffer[5]);
  let v3 = new THREE.Vector3(buffer[6], buffer[7], buffer[8]);
  let v4 = new THREE.Vector3(buffer[9], buffer[10], buffer[11]);

  otherPortal.localToWorld(v1);
  otherPortal.localToWorld(v2);
  otherPortal.localToWorld(v3);
  otherPortal.localToWorld(v4);

  otherCamera.updateMatrixWorld();


  //get screen space coordinates
  let screenV1 = getScreenSpace(v1, otherCamera);
  let screenV2 = getScreenSpace(v2, otherCamera);
  let screenV3 = getScreenSpace(v3, otherCamera);
  let screenV4 = getScreenSpace(v4, otherCamera);


  //Create Clipping Plane
  const otherNormal = new THREE.Vector3( 0, 0, 1 );
  otherNormal.applyQuaternion(otherPortal.quaternion);
  otherNormal.normalize();

  const clippingPlane = new THREE.Plane(otherNormal);
  clippingPlane.translate(otherPortal.position);
  renderer.clippingPlanes = [clippingPlane];

  renderTarget.texture.encoding = renderer.outputEncoding;

  //Make portal not visible to camera
  otherPortal.visible = false;
  otherPortalFrame.visible = false;

  //temporarily replace material
  lookatPortal.material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});

  //render to texture
  renderer.setRenderTarget(renderTarget);
  renderer.clear();
  renderer.render(scene, otherCamera);
  renderer.setRenderTarget(null);

  lookatPortal.material = new THREE.MeshBasicMaterial({map: renderTarget.texture});

  //Make portal visible again
  otherPortalFrame.visible = true;
  otherPortal.visible = true;
  renderer.clippingPlanes = [];

  const newuvs = new Float32Array([
    screenV1.x, screenV1.y,
    screenV2.x, screenV2.y,
    screenV3.x, screenV3.y,
    screenV4.x, screenV4.y,
  ]);

  //console.log(newuvs);
  //Information on uv-mapping
  //https://discourse.threejs.org/t/custom-uv-mapping/38677
  lookatPortal.geometry.setAttribute( 'uv', new THREE.BufferAttribute(newuvs, 2));
  
}
