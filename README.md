## threejs-slice-geometry TypeScript port

This is a TypeScript port of the library [threejs-slice-geometry](https://github.com/tdhooper/threejs-slice-geometry).

Thanks to [tdhooper](https://github.com/tdhooper) for the awesome JavaScript implementation!

[TypeScript port](https://github.com/IkarosKappler/threejs-slice-geometry-typescript) by [Ikaros Kappler](https://github.com/IkarosKappler/).

# Three.js Slice Geometry

Slice three.js geometry with a plane.

## Usage

Javascript

```javascript
var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var geom = new THREE.BoxGeometry(1, 1, 1);
// The result will be a Gmetry instance and cannot be added to a three scene
geom = sliceGeometry(Gmetry.fromBufferGeometry(geom), plane); // This is new
var material = new THREE.MeshBasicMaterial({ wireframe: true });
// Call .toBufferGeometry here to go back to threejs
var mesh = new THREE.Mesh(geom.toBufferGeometry(), material);
scene.add(mesh);
```

Typescript

```typescript
import { sliceGeometry } from "threejs-slice-geometry-typescript";

const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const geomBufferGeometry = new THREE.BoxGeometry(1, 1, 1);
// The result will be a Gmetry instance and cannot be added to a three scene
const geom = sliceGeometry(Gmetry.fromBufferGeometry(geomBufferGeometry), plane); // This is new
const material = new THREE.MeshBasicMaterial({ wireframe: true });
// Call .toBufferGeometry here to go back to threejs
const mesh = new THREE.Mesh(geom.toBufferGeometry(), material);
scene.add(mesh);
```

## Compatibility with old THREEJS versions

Since threejs r125 the `THREE.Geometry` class no longer exist (deprecated, will be removed
in the future). See https://discourse.threejs.org/t/three-geometry-will-be-removed-from-core-with-r125/22401

I used a replacement class here from the `ThreeGreometryHellfix.Gmetry` repository. It is acually
based on the code of the old `Geometry` class and still works, but you should think about using
`THREE.BufferGeometry` in the future. Read about the pros and cons here
https://github.com/IkarosKappler/three-geometry-hellfix

Typescript (with threesjs <= r124)

```typescript
import { sliceGeometry } from "threejs-slice-geometry-typescript";

const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const geom = new THREE.BoxGeometry(1, 1, 1);
geom = sliceGeometry(geom, plane);
const material = new THREE.MeshBasicMaterial({ wireframe: true });
const mesh = new THREE.Mesh(geom, material);
scene.add(mesh);
```

Javascript (with threesjs <= r124)

```javascript
var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var geom = new THREE.BoxGeometry(1, 1, 1);
geom = sliceGeometry(geom, plane);
var material = new THREE.MeshBasicMaterial({ wireframe: true });
var mesh = new THREE.Mesh(geom, material);
scene.add(mesh);
```

## Builds

`CJS` builds from typescript

- https://github.com/IkarosKappler/threejs-slice-geometry-typescript/blob/master/dist/threejs-slice-geometry-main.js
- https://github.com/IkarosKappler/threejs-slice-geometry-typescript/blob/master/dist/threejs-slice-geometry-main.min.js

Original JS builds:

- http://tdhooper.github.io/threejs-slice-geometry/build/slice.js
- http://tdhooper.github.io/threejs-slice-geometry/build/slice.min.js

## Examples

https://tdhooper.github.io/threejs-slice-geometry/examples
