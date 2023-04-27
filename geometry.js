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

  geometry1.translate(4, 0.5, 0);
  geometry2.translate(0, 6, 0);
  geometry3.translate(-4, 0.5, 0);


  const mergedGeometry = BufferGeometryUtils.mergeGeometries([geometry1, geometry2, geometry3]);

  const material = new THREE.MeshStandardMaterial({ color: color });
  const mesh = new THREE.Mesh(mergedGeometry, material);

  return mesh;
}

export function BufferPortal(width, height, renderTarget){
  const geometry = new THREE.BufferGeometry();
  //const material = new THREE.MeshBasicMaterial( { map: renderTarget.texture} );
  const material = new THREE.MeshBasicMaterial({map: renderTarget.texture});
  let x = width / 2;
  let y = height / 2;

  //top left > top right > bottom right > bottom left
  const vertices  = new Float32Array([
    -x, y, 0,
    x, y, 0,
    x, -y, 0,
    -x, -y, 0,
  ]);

  const indices =[
    0, 1, 2,
    2, 3, 0,
  ];

  const uvs = new Float32Array([
    0, 1, 
    1, 1, 
    1, 0, 
    0, 0,
  ]);

  geometry.setIndex(indices);
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  geometry.setAttribute( 'uv', new THREE.BufferAttribute(uvs, 2));

  const mesh = new THREE.Mesh( geometry, material );
  return mesh;


  //const bluePortalGeometry = new THREE.PlaneGeometry(7, 11);
  //const bluePortalMaterial = new THREE.MeshBasicMaterial({ map: renderTarget.texture });
  //const bluePortal = new THREE.Mesh(bluePortalGeometry, bluePortalMaterial);
  //return bluePortal;
}