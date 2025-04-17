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

    this.moveSpeed = 8;

    this.radius = 0.5;
    this.height = 2;
    const radius = this.radius;
    const height = this.height;
    const shape1 = new CANNON.Sphere(radius);
    const shape2 = new CANNON.Cylinder(radius, radius, height - 2 * radius, 8);

    this.body = new CANNON.Body({
      mass: 3,
      fixedRotation: true,
      linearDamping: 0.1
    });

    this.body.addShape(shape1, new CANNON.Vec3(0, height / 2 - radius, 0));
    this.body.addShape(shape2);
    this.body.addShape(shape1, new CANNON.Vec3(0, -height / 2 + radius, 0));

    this.body.position.set(0, 5, 0);

    this.lastUpdateTime = performance.now();

    this.target = new THREE.Vector3(0, 0, 0);
  }

  update() {
    const direction = new THREE.Vector3().subVectors(this.target, this.body.position);
    direction.y = 0;
    if (direction.lengthSq() > 0.001) {
        direction.normalize();
        this.body.velocity.x = direction.x * this.moveSpeed;
        this.body.velocity.z = direction.z * this.moveSpeed;
    } else {
        this.body.velocity.x = 0;
        this.body.velocity.z = 0;
    }

    this.mesh.position.copy(this.body.position);
    this.mesh.position.y -= this.height / 2;

    const lookAtTarget = new THREE.Quaternion();
    const forward = new THREE.Vector3(0, 0, 1);
    lookAtTarget.setFromUnitVectors(forward, direction.clone().setY(0).normalize());
    this.mesh.quaternion.copy(lookAtTarget);
  }

  start() {
    this.scene.add(this.mesh);
    this.world.addBody(this.body);
  }
}