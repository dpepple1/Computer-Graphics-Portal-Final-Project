/*****************************/
// Filename: main.js
// Project: Portal
// Group: Eduardo P., Derek P., Steven G.
/*****************************/

/* Libraries */
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

/* Variables */
// Note: Using 'let' for strict type-checking
let container, stats; // holds data
let camera, controller; // camera
let scene, renderer;  // rendered scene
let axes, geometry1, cube1, material1, geometry2, cube2, material2;   // testing cube

/* Constant World Values */
const clock = new THREE.Clock();

/* Global Parameters (for easy access) */
let sceneColor = 0x888800;

/********************************************************************/
/* First-Person Camera Parameters */
let activeMouseStats = {
    currentLeftButton: false,
    currentRightButton: false,
    mouseX: 0,
    mouseY: 0
}; 
let previousEvent = null;
let allKeys = {};
let previousKeys = {};
let fpcamera, input, rotation, translation, phi, theta;

document.addEventListener("mousedown", (e) => onMouseDown(e), false);
document.addEventListener("mouseup", (e) => onMouseUp(e), false);
document.addEventListener("mousemove", (e) => onMouseMove(e), false);
document.addEventListener("keydown", (e) => onKeyDown(e), false);
document.addEventListener("keyup", (e) => onKeyUp(e), false);

/********************************************************************/
initialize();
animate();

function initialize() {
    // Container holding canvas
    container = document.getElementById("container");

    // Camera activation
    init_camera();

    // Scene creation
    init_scene(); 

    // Renderer activation
    init_renderer();

    // Controller
    init_controller();

    // Stats (optional)
    init_stats();

    // Create initial scene
    init_geometry();
}

function init_scene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneColor);
}
function init_geometry() {
    axes = new THREE.AxesHelper(10)

    geometry1 = new THREE.BoxGeometry(100, 1, 100, 10, 10, 10);
    material1 = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    cube1 = new THREE.Mesh(geometry1, material1);
    cube1.translateY(-1);

    geometry2 = new THREE.BoxGeometry(5,5,5)
    material2 = new THREE.MeshBasicMaterial({ color: 0x22ee11})
    cube2 = new THREE.Mesh(geometry2, material2);

    scene.add(axes);
    scene.add(cube1);
    scene.add(cube2);
}

function init_stats() {
    stats = new Stats();
    container.appendChild(stats.dom);
}

/* Establishes Renderer */
function init_renderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
}

/* Establishes Controllable Camera Object */
function init_camera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(10,10,10);
    camera.lookAt(0,0,0)
}

/* Creates Camera */
function init_controller() {
    controller = new FirstPersonControls(camera, renderer.domElement);
    controller.lookSpeed = 0.8;
    controller.movementSpeed = 5;
}

/********************************************************************/
/* FIRST PERSON OPTIONS */
function makeFirstPersonCamera(camera) {
    fpcamera = camera;
    input = new InputController();
    rotation = new THREE.Quarternion();
    translation = new THREE.Vector3();
    phi = 0;
    theta = 0;
}

function updateTime(elapsedTime) {
    updateRotation(elapsedTime)
}
function updateRotation(elapsedTime) {
    const xh = input.activeMouseStats.mouseXDelta / window.innerWidth;
    const yh = input.activeMouseStats.mouseYDelta / window.innerHeight;
}
function onMouseDown(e) {
    switch (e.button) {
        case 0: {
            activeMouseStats.currentLeftButton = true;
            break;
        }
        case 2: {
            activeMouseStats.currentRightButton = true;
            break;
        }
    }
}

function onMouseUp(e) {
    switch (e.button) {
        case 0: {
            activeMouseStats.curentLeftButton = false;
            break;
        }
        case 2: {
            activeMouseStats.currentRightButton = false;
            break;
        }
    }
}

function onMouseMove(e) {
    activeMouseStats.mouseX = e.pageX - window.innerWidth / 2;
    activeMouseStats.mouseY = e.pageY - window.innerHeight / 2;

    if (previousEvent == null) {
        previousEvent = {...activeMouseStats}
    }
}

function onKeyDown(e) {
    allKeys[e.keyCode] = true;
}

function onKeyUp(e) {
    allKeys[e.keyCode] = false;
}

function update() {
    // Do nothing for now
}

/********************************************************************/

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controller.handleResize();
}

function animate() {
	requestAnimationFrame( animate );
    render();
    stats.update();
}

function render() {
    controller.update( clock.getDelta() );
   
    renderer.render(scene, camera);
}
