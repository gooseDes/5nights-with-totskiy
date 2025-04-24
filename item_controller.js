import * as THREE from 'https://esm.sh/three@0.175.0';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

export class ItemController {
  constructor(scene, world, radius = 0.3, position = new THREE.Vector3(0, 5, 0), customMesh = null) {
    this.scene = scene;
    this.world = world;
    this.radius = radius;

    this.mesh = customMesh || new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xff4444 })
    );

    var scale = radius;
    try {
      scale = (radius) / Math.max(this.mesh.geometry.boundingBox?.max.x || 1, 1);
    } catch (e) {}
    this.mesh.scale.set(scale, scale, scale);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.userData = { self: this };
    this.scene.add(this.mesh);

    this.sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      shape: new CANNON.Sphere(radius),
      linearDamping: 0.9,
      angularDamping: 0.9,
    });

    const physicsMaterial = new CANNON.Material('sphereMaterial');
    const contactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
      friction: 0.1,
      restitution: 0,
    });
    this.world.addContactMaterial(contactMaterial);
    this.sphereBody.material = physicsMaterial;

    this.sphereBody.allowSleep = true;
    this.sphereBody.sleepSpeedLimit = 0.1;
    this.sphereBody.sleepTimeLimit = 1;

    this.world.addBody(this.sphereBody);
    this.lastUpdateTime = performance.now();
    this.cameras = [];
    this._frustum = new THREE.Frustum();
    this._projScreenMatrix = new THREE.Matrix4();
  }

  setCameras(cameras) {
    this.cameras = cameras || [];
  }

  isWatchedByAnyCamera() {
    if (!this.cameras.length) return true;
    for (const cam of this.cameras) {
      this._projScreenMatrix.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      this._frustum.setFromProjectionMatrix(this._projScreenMatrix);
      if (this._frustum.intersectsObject(this.mesh)) {
        return true;
      }
    }
    return false;
  }

  update() {
    this.mesh.position.copy(this.sphereBody.position);
    this.mesh.quaternion.copy(this.sphereBody.quaternion);

    if (this.sphereBody.type === CANNON.Body.DYNAMIC) {
      const velocity = this.sphereBody.velocity.length();
      const angular = this.sphereBody.angularVelocity.length();
      const threshold = 0.005;
      if (
        !this.isWatchedByAnyCamera() &&
        velocity < threshold &&
        angular < threshold
      ) {
        this.sphereBody.sleep();
      } else if (this.isWatchedByAnyCamera()) {
        this.sphereBody.wakeUp();
      }
    }

    const now = performance.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;
  }

  remove() {
    this.scene.remove(this.mesh);
    this.world.removeBody(this.sphereBody);
  }

  add() {
    this.scene.add(this.mesh);
    this.world.addBody(this.sphereBody);
  }
}