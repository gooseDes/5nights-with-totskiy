const THREE = await import('https://esm.sh/three@0.175.0');
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
const { Pathfinding } = await import("https://cdn.jsdelivr.net/npm/three-pathfinding@1.3.0/+esm");
import * as utils from './utils.js';

export class EnemyController {
  constructor(scene, renderer, world, model, navmesh_path) {
    this.scene = scene;
    this.renderer = renderer;
    this.world = world;
    this.mesh = model;
    this.navmesh_path = navmesh_path;

    this.moveSpeed = 10;
    this.radius = 0.5;
    this.height = 2;

    const shape1 = new CANNON.Sphere(this.radius);
    const shape2 = new CANNON.Cylinder(this.radius, this.radius, this.height - 2 * this.radius, 8);

    this.body = new CANNON.Body({
      mass: 3,
      fixedRotation: true,
      linearDamping: 0.1
    });

    this.body.addShape(shape1, new CANNON.Vec3(0, this.height / 2 - this.radius, 0));
    this.body.addShape(shape2);
    this.body.addShape(shape1, new CANNON.Vec3(0, -this.height / 2 + this.radius, 0));
    this.body.position.set(0, 5, 0);

    this.target = new THREE.Vector3(0, 0, 0);
    this.path = [];
    this.currentPathIndex = 0;

    this.pathfinder = new Pathfinding();
    this.ZONE = 'level1';
  }

  async start(navMeshGeometry) {
    this.scene.add(this.mesh);
    this.world.addBody(this.body);

    let geometry = navMeshGeometry;

    if (!geometry || typeof geometry !== 'object' || !geometry.attributes) {
      const loader = utils.loader;
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          this.navmesh_path,
          resolve,
          undefined,
          reject
        );
      });
      let navMesh = null;
      gltf.scene.traverse((child) => {
        if (child.isMesh && !navMesh) {
          navMesh = child;
        };
      });
      if (!navMesh) {
        throw new Error('No mesh found in nav.glb for navmesh');
      }
      geometry = navMesh.geometry;
      //let mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
      //this.scene.add(mesh);
    }

    if (geometry.index) {
      geometry = geometry.toNonIndexed();
    }

    geometry.computeBoundingBox?.();
    geometry.computeBoundingSphere?.();

    const zoneData = Pathfinding.createZone(geometry);
    this.pathfinder.setZoneData(this.ZONE, zoneData);
  }

  setTarget(target) {
    this.target.copy(target);
    this.target.y = 0;
  
    const start = this.body.position.clone();
    start.y = 0;
  
    let groupID = this.pathfinder.getGroup(this.ZONE, start);
  
    this.path = this.pathfinder.findPath(start, this.target, this.ZONE, groupID) || [];
    /*if (this.path.length <= 0) {
      const zone = this.pathfinder.zones[this.ZONE];
      let minDist = Infinity;
      let closestGroup = null;
      let closestNode = null;
  
      for (let groupKey in zone.groups) {
        const group = zone.groups[groupKey];
        for (let node of group) {
          const dist = start.distanceTo(node.centroid);
          if (dist < minDist) {
            minDist = dist;
            closestGroup = parseInt(groupKey);
            closestNode = node;
          }
        }
      }
  
      if (closestNode) {
        this.body.position.set(closestNode.centroid.x, this.body.position.y, closestNode.centroid.z);
        groupID = closestGroup;
        console.warn("Enemy was off-navmesh. Teleported to closest group node.");
      } else {
        console.warn("No closest node found.");
        this.path = [];
        return;
      }
    }*/
    this.currentPathIndex = 0;
  }
  

  update() {
    if (this.path.length > 0) {
      const bodyPos = new THREE.Vector3(this.body.position.x, 0, this.body.position.z);
      const nextWaypoint = new THREE.Vector3();
      nextWaypoint.x = this.path[this.currentPathIndex].x;
      nextWaypoint.y = 0;
      nextWaypoint.z = this.path[this.currentPathIndex].z;
      const direction = new THREE.Vector3().subVectors(nextWaypoint, bodyPos);
      direction.y = 0;

      if (direction.lengthSq() > 0.001 || true) {
        direction.normalize();
        this.body.velocity.x = direction.x * this.moveSpeed;
        this.body.velocity.z = direction.z * this.moveSpeed;

        if (bodyPos.distanceTo(nextWaypoint) < 0.2) {
          this.currentPathIndex++;
          if (this.currentPathIndex >= this.path.length) {
            this.path = [];
            this.body.velocity.set(0, 0, 0);
          }
        }
      }
    } else {
      const bodyPos = new THREE.Vector3(this.body.position.x, 0, this.body.position.z);
      const direction = new THREE.Vector3().subVectors(this.target, bodyPos);
      direction.y = 0;
      if (direction.lengthSq() > 0.001) {
        direction.normalize();
        this.body.velocity.x = direction.x * this.moveSpeed;
        this.body.velocity.z = direction.z * this.moveSpeed;
      } else {
        this.body.velocity.set(0, 0, 0);
      }
    }

    this.mesh.position.copy(this.body.position);
    this.mesh.position.y -= this.height/2;

    const lookAtTarget = new THREE.Quaternion();
    const forward = new THREE.Vector3(0, 0, 1);
    const direction = new THREE.Vector3().subVectors(this.target, this.body.position).setY(0).normalize();
    lookAtTarget.setFromUnitVectors(forward, direction);
    this.mesh.quaternion.copy(lookAtTarget);
  }
}