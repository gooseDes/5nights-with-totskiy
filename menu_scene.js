const THREE = await import('https://esm.sh/three@0.175.0');
import { Scene } from './scene.js';
import * as utils from './utils.js';

export class MenuScene extends Scene {
  constructor() {
    super(false, false, 'models/scenes/menu/scene.glb');
    this.scene.background = new THREE.Color(0x111122);
    this.scene.fog = new THREE.Fog(0x111122, 10, 50);
    this.camera.position.set(0, 3, 0);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.to_add_to_scene.push(ambientLight);
    this.light = new THREE.SpotLight(0xffffff, 10, 1000, Math.PI, 0.1, 2);
    this.light.position.set(0, 10, 0);
    this.light.target.position.set(0, 0, 0);
    this.to_add_to_scene.push(this.light);
    this.to_add_to_scene.push(this.light.target);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
  }

  update() {
    super.update();
    this.camera.rotation.y = Math.sin(performance.now()*0.000001)*360;
    this.light.intensity = Math.cos(performance.now()*0.001)*40+50;
  }
}