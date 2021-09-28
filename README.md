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
geom = sliceGeometry(geom, plane);
var material = new THREE.MeshBasicMaterial({ wireframe: true });
var mesh = new THREE.Mesh(geom, material);
scene.add(mesh);
```

Typescript
```typescript
import { sliceGeometry } from "threejs-slice-geometry-typescript"; 

const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const geom = new THREE.BoxGeometry(1, 1, 1);
geom = sliceGeometry(geom, plane);
const material = new THREE.MeshBasicMaterial({ wireframe: true });
const mesh = new THREE.Mesh(geom, material);
scene.add(mesh);
```

## Builds

`CJS` builds from typescript
* https://github.com/IkarosKappler/threejs-slice-geometry-typescript/blob/master/dist/threejs-slice-geometry-main.js
* https://github.com/IkarosKappler/threejs-slice-geometry-typescript/blob/master/dist/threejs-slice-geometry-main.min.js

Original JS builds:
* http://tdhooper.github.io/threejs-slice-geometry/build/slice.js
* http://tdhooper.github.io/threejs-slice-geometry/build/slice.min.js


## Examples

https://tdhooper.github.io/threejs-slice-geometry/examples
