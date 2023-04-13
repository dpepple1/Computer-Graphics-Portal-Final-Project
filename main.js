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
let geometry, cube, material;   // testing cube

/* Constant World Values */
const clock = new THREE.Clock();

/* Global Parameters (for easy access) */
let sceneColor = 0xefd1b5;

initialize();
animate();

function initialize() {
    // Container holding canvas
    container = document.getElementById("container");

    // Scene creation
    init_scene(); 

    // Renderer activation
    init_renderer();

    // Camera activation
    init_camera();

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
    geometry = new THREE.BoxGeometry(100, 100, 10);
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1,10000);
    controller = new FirstPersonControls(camera, renderer.domElement);
    controller.lookSpeed = 0.8;
    controller.movementSpeed = 5;
}

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
    controller.update();
    renderer.render(scene, camera);
}
