const THREE = await import('https://esm.sh/three@0.175.0');
const CANNON = await import('https://cdn.skypack.dev/cannon-es');
import * as utils from './utils.js';

export class Scene {
    constructor(physics = false, lock_pointer = false, default_mesh_path = null) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222244);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.physics = physics;
        this.default_mesh_path = default_mesh_path;
        this.running = false;
        this.lock_pointer = lock_pointer;
        this.default_mesh = null;
        document.body.appendChild(this.renderer.domElement);

        if (physics) {
            this.world = new CANNON.World({
                gravity: new CANNON.Vec3(0, -9.82, 0)
            });
        }
        else {
            this.world = null;
        }

        this.clock = new THREE.Clock();
        this.to_update = [];
        this.to_start = [];
        this.to_add_to_scene = [];

        utils.loader.load(
            this.default_mesh_path,
            (gltf) => {
                //gltf.scene.position.set(0, -2, 0)
                this.default_mesh = gltf.scene;
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                if (this.physics) {
                    utils.addCollider(this.world, gltf.scene);
                }
                this.to_add_to_scene.push(gltf.scene);
                if (this.running) this.scene.add(gltf.scene);
            },
            undefined,
            (error) => {
                console.error("Failed to load model:", this.default_mesh_path, error);
            }
        );
    }

    start() {
        document.body.appendChild(this.renderer.domElement);
        this.running = true;
        this.renderer.setAnimationLoop(() => {
            if (this.running) {
                this.update();
                this.render();
            }
        });
        this.to_start.forEach((item) => {
            item.start();
        });
        this.to_add_to_scene.forEach((item) => {
            this.scene.add(item);
        });

        function fullScreenAndPointerLock() {
            if (!('ontouchstart' in window)) {
                document.querySelector('canvas').requestPointerLock();
                this.renderer.domElement.requestPointerLock();
            }
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            document.getElementById('pointer').style.visibility = 'visible';
        };

        if (this.lock_pointer) {
            window.addEventListener('click', fullScreenAndPointerLock);
            window.addEventListener('touchstart', fullScreenAndPointerLock);
        }
        
        window.addEventListener('resize', () => {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
        });   
    }

    update() {
        if (this.physics) {
            const delta = this.clock.getDelta();
            this.world.step(1 / 60, delta, 3);
        }
        this.to_update.forEach((item) => {
            item.update();
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    stop() {
        this.running = false;
        this.renderer.setAnimationLoop(null);
        document.body.removeChild(this.renderer.domElement);
        this.scene.clear();
        this.to_start.forEach((item) => {
            item.stop();
        });
    }
}