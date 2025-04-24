const THREE = await import('https://esm.sh/three@0.175.0');
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
const { GLTFLoader } = await import('https://esm.sh/three@0.175.0/examples/jsm/loaders/GLTFLoader.js');

export const loader = new GLTFLoader();
export const clock = new THREE.Clock();

export function addCollider(world, mesh) {
  mesh.updateMatrixWorld(true);
  mesh.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const shape = createTrimesh(child.geometry, child);
      if (shape) {
        const body = new CANNON.Body({ mass: 0 });
        body.collisionResponse = true;
        body.addShape(shape);
        body.position.set(0, 0, 0);
        const physicsMaterial = new CANNON.Material('sceneMaterial');
        const contactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
          friction: 0.01,
          restitution: 0,
        });
        world.addContactMaterial(contactMaterial);
        body.material = physicsMaterial;
        world.addBody(body);
      }
    }
  });
}

export function createTrimesh(geometry, mesh) {
  if (!geometry.attributes.position) return null;

  const cloned = geometry.clone();
  cloned.applyMatrix4(mesh.matrixWorld);

  const pos = cloned.attributes.position.array;
  const idx = cloned.index ? cloned.index.array : generateIndex(cloned);

  return new CANNON.Trimesh(pos, idx);
}

export function generateIndex(geometry) {
  const count = geometry.attributes.position.count;
  const index = new Uint16Array(count);
  for (let i = 0; i < count; i++) index[i] = i;
  return index;
}

export function openPopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.classList.remove('popup-hide');
    popup.style.visibility = 'visible';
    popup.classList.add('popup-show');
  }
}

export function closePopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.classList.remove('popup-show');
    popup.classList.add('popup-hide');
    setTimeout(() => {
      popup.style.visibility = 'hidden';
    }, 300);
  }
}

export const global = {
  volume: localStorage.getItem('volume') ?? "1",
  resolution: localStorage.getItem('resolution') ?? "1",
  physics: localStorage.getItem('physics') ?? "1",
}

export function playSound(audio) {
  audio.volume = global.volume;
  audio.play().catch((error) => {
    console.error('Error playing sound:', error);
  });
}