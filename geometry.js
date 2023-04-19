import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils';

export function Box(width, height, depth, color) {
  const boxGeometry = new THREE.BoxGeometry(width, height, depth);
  const boxMaterial = new THREE.MeshStandardMaterial({ color: color });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  
  return box;
}

export function Sphere(radius, color) {
  const sphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: color });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  
  return sphere;
}

export function Tetrahedron(radius, color) {
  const tetrahedronGeometry = new THREE.TetrahedronGeometry(radius);
  const tetrahedronMaterial = new THREE.MeshStandardMaterial({ color: color });
  const tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
  
  return tetrahedron;
}

export function PortalFrame(color) {
  const geometry1 = new THREE.BoxGeometry(1, 12, 1);
  const geometry2 = new THREE.BoxGeometry(7, 1, 1);
  const geometry3 = new THREE.BoxGeometry(1, 12, 1);

  geometry1.translate(4, 6, 0);
  geometry2.translate(0, 11.5, 0);
  geometry3.translate(-4, 6, 0);


  const mergedGeometry = BufferGeometryUtils.mergeGeometries([geometry1, geometry2, geometry3]);

  const material = new THREE.MeshStandardMaterial({ color: color });
  const mesh = new THREE.Mesh(mergedGeometry, material);

  return mesh;
}