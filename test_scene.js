const THREE = await import('https://esm.sh/three@0.175.0');
import * as utils from './utils.js';

import { Scene } from "./scene.js";
import { PlayerController } from "./player_controller.js";
import { ItemController } from "./item_controller.js";
import { EnemyController } from './enemy_controller.js';

export class TestScene extends Scene {
  constructor() {
    super(true, true, 'models/scenes/test/scene.glb');
    this.scene.background = new THREE.Color(0x111122);
    this.scene.fog = new THREE.Fog(0x111122, 10, 50);
    
    this.camera.position.set(0, 2, 0);
        
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.to_add_to_scene.push(this.ambientLight);
    
    this.flashlight = new THREE.SpotLight(0xffffff, 10, 100, Math.PI / 6, 0.2, 1.5);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.flashlight.shadow.bias = -0.002;
    this.flashlight.target.position.set(0, 0, -1);
    this.to_add_to_scene.push(this.flashlight);
    this.to_add_to_scene.push(this.flashlight.target);
        
    utils.loader.load('models/totskiy.glb', (gltf) => {
      this.totskiy = gltf.scene;
      this.totskiy.position.set(116, -1.5, 0);
      this.totskiy.rotation.set(0, -Math.PI / 2, 0);
      this.to_add_to_scene.push(this.totskiy);
      const mixer = new THREE.AnimationMixer(this.totskiy);
    
      const clip = THREE.AnimationClip.findByName(gltf.animations, 'test_anim');
    
      if (clip) {
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat);
          action.play();
      } else {
          console.warn('Animation clip not found in the loaded model.');
      }

      this.enemy = new EnemyController(this.scene, this.renderer, this.world, this.totskiy, "models/scenes/test/navmesh.glb");
      this.enemy.mesh.castShadow = true;
      this.enemy.mesh.receiveShadow = true;
      this.enemy.body.position.set(100, 2, 0);
      this.enemy.start();
      this.to_update.push(this.enemy);
      this.player.addEnemy(this.enemy);
    
      const animate = () => {
          requestAnimationFrame(animate);
          const delta = utils.clock.getDelta();
          mixer.update(delta);
          this.renderer.render(this.scene, this.camera);
      }
    
      animate();
    });
    
    this.player = new PlayerController(this.camera, this.flashlight, this.scene, this.renderer, this.world);

    this.to_start.push(this.player);
    this.to_update.push(this.player);
    
    this.test_item = new ItemController(this.scene, this.world);
    this.to_update.push(this.test_item);
    this.test_items = [];

    utils.loader.load('models/monkey.glb', (gltf) => {
      for (let i = 0; i < 50; i++) {
        const obj = new ItemController(this.scene, this.world, Math.random()/3 + 0.2, new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 + 5, Math.random() * 10 - 5), gltf.scene.children[0].clone());
        this.to_update.push(obj);
        this.test_items.push(obj);
      }
    });
    
    utils.loader.load('models/ball.glb', (gltf) => {
      for (let i = 0; i < 50; i++) {
        const obj = new ItemController(this.scene, this.world, Math.random()/3 + 0.2, new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 + 5, Math.random() * 10 - 5), gltf.scene.children[0].clone());
        this.to_update.push(obj);
        this.test_items.push(obj);
      }
    });
  }

  update() {
    super.update();
    this.enemy.setTarget(this.player.playerBody.position);
    if (this.player.keyState.space) {
      this.enemy.setTarget(new THREE.Vector3(0, 0, 0));
      console.log(this.enemy.body.position);
    }
  }
}
