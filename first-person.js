/*****************************/
// Filename: main.js
// Project: Portal
// Group: Eduardo P., Derek P., Steven G.
/*****************************/

/* Libraries */
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

////////////////////////////////////////////
import * as Geometry from './geometry.js';
import { degreesToRadians } from './common.js';
////////////////////////////////////////////

/* CLOCK */
const clock = new THREE.Clock();

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccee);
scene.fog = new THREE.Fog(0x88ccee, 0, 50);

/* CONTAINER */
const container = document.getElementById('container');

/* CAMERA */
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

/* LIGHTING */
const fillLight1 = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
fillLight1.position.set(2, 1, 1);
scene.add(fillLight1);

/* SHADOWS */
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(- 5, 25, - 1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = - 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = - 30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = - 0.00006;
scene.add(directionalLight);

/* RENDER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);
 
/* STATS */
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild(stats.domElement);

/* CONSTANTS */
const STEPS_PER_FRAME = 5;
const GRAVITY = 30;

////////////////////////////////////////////////////////////
const floor = Geometry.Box(40, 1, 40, 0xffffff);
const box = Geometry.Box(4, 4, 4, 0xff6347);
const longBox = Geometry.Box(2, 4, 18, 0x40ab00);
const sphere = Geometry.Sphere(3, 0xaa00bb);
const tetrahedron = Geometry.Tetrahedron(4, 0x3363ff);
const redPortalFrame = Geometry.PortalFrame(0xff0000);
const bluePortalFrame = Geometry.PortalFrame(0x0000ff);
const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0x777777);

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
	redPortalFrame.position.set(-8, 0, -4);
	redPortalFrame.rotateY(degreesToRadians(-45));
	bluePortalFrame.position.set(10, 0, 4);

	// Light
	pointLight.position.set(10, 20, 10);

	scene.add(pointLight, ambientLight);
}

setupScene();
////////////////////////////////////////////////////////////

/* PLAYER */
let worldOctree = new Octree();


const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;

const keyStates = {};


/* EVENTS LISTENERS */
document.addEventListener('keydown', (event) => {
	keyStates[event.code] = true;
});

document.addEventListener('keyup', (event) => {
	keyStates[event.code] = false;
});

container.addEventListener('mousedown', () => {
	document.body.requestPointerLock();
	mouseTime = performance.now();
});

document.body.addEventListener('mousemove', (event) => {
	if (document.pointerLockElement === document.body) {
		camera.rotation.y -= event.movementX / 500;
		camera.rotation.x -= event.movementY / 500;

	}
});

/* WINDOW RESIZE */ 
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
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
	// gives a bit of air control
	const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);
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
			playerVelocity.y = 15;
		}
	}
}


const loader = new GLTFLoader();
worldOctree.fromGraphNode(floor);
worldOctree.fromGraphNode(longBox);
worldOctree.fromGraphNode(sphere);
worldOctree.fromGraphNode(redPortalFrame);
worldOctree.fromGraphNode(bluePortalFrame);
worldOctree.fromGraphNode(tetrahedron);
worldOctree.fromGraphNode(box);


animate();

function teleportPlayerIfOob() {
	if (camera.position.y <= - 25) {
		playerCollider.start.set(0, 0.35, 0);
		playerCollider.end.set(0, 1, 0);
		playerCollider.radius = 0.35;
		camera.position.copy(playerCollider.end);
		camera.rotation.set(0, 0, 0);
	}
}

/* ANIMATE */
function animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
	for (let i = 0; i < STEPS_PER_FRAME; i++) {
		controls(deltaTime);
		updatePlayer(deltaTime);
		teleportPlayerIfOob();
	}

	// reset the opacity at the beginning of the loop

    renderer.render(scene, camera);
    stats.update();
    requestAnimationFrame(animate);
}