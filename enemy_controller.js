const THREE = await import('https://esm.sh/three@0.175.0');
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

export class EnemyController {
  constructor(scene, renderer, world, model) {
    this.scene = scene;
    this.renderer = renderer;
    this.world = world;
    this.mesh = model;

    this.yaw = 0;
    this.pitch = 0;

    this.moveSpeed = 5;

    this.radius = 0.5;
    this.height = 2;
    const radius = this.radius;
    const height = this.height;
    const shape1 = new CANNON.Sphere(radius);
    const shape2 = new CANNON.Cylinder(radius, radius, height - 2 * radius, 8);

    this.body = new CANNON.Body({
      mass: 3,
      fixedRotation: true,
      linearDamping: 0.99
    });

    this.body.addShape(shape1, new CANNON.Vec3(0, height / 2 - radius, 0));
    this.body.addShape(shape2);
    this.body.addShape(shape1, new CANNON.Vec3(0, -height / 2 + radius, 0));

    this.body.position.set(0, 5, 0);

    this.lastUpdateTime = performance.now();

    this.target = new THREE.Vector3(0, 0, 0);
  }

  update() {
    const now = performance.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    const direction = new THREE.Vector3().subVectors(this.target, this.mesh.position).normalize();
    const velocity = direction.multiplyScalar(this.moveSpeed * 150 * dt);

    this.body.velocity.x = velocity.x;
    this.body.velocity.z = velocity.z;

    this.mesh.position.copy(this.body.position);
    this.mesh.position.y -= this.height / 2;

    const lookAtTarget = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, 1);
    lookAtTarget.setFromUnitVectors(forward, direction.clone().setY(0).normalize());
    this.mesh.quaternion.copy(lookAtTarget);
}

  start() {
    this.scene.add(this.mesh);
    this.world.addBody(this.body);
  }
}