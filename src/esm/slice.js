// Note: THREE.Geometry is only available until version 0.124.0
import * as THREE from "three";
import { GeometryBuilder } from "./GeometryBuilder";
import { BACK, FACE_KEYS, FRONT, ON } from "./constants";
export const sliceGeometry = (geometry, plane, closeHoles) => {
    const sliced = new THREE.Geometry();
    const builder = new GeometryBuilder(geometry, sliced, plane);
    const distances = [];
    const positions = [];
    geometry.vertices.forEach((vertex) => {
        const distance = findDistance(vertex, plane);
        const position = distanceAsPosition(distance);
        distances.push(distance);
        positions.push(position);
    });
    geometry.faces.forEach(function (face, faceIndex) {
        const facePositions = FACE_KEYS.map(function (key) {
            return positions[face[key]];
        });
        if (facePositions.indexOf(FRONT) === -1 &&
            facePositions.indexOf(BACK) !== -1) {
            return;
        }
        builder.startFace(faceIndex);
        let lastKey = FACE_KEYS[FACE_KEYS.length - 1];
        let lastIndex = face[lastKey];
        let lastDistance = distances[lastIndex];
        let lastPosition = positions[lastIndex];
        FACE_KEYS.map((key) => {
            var index = face[key];
            var distance = distances[index];
            var position = positions[index];
            if (position === FRONT) {
                if (lastPosition === BACK) {
                    builder.addIntersection(lastKey, key, lastDistance, distance);
                    builder.addVertex(key);
                }
                else {
                    builder.addVertex(key);
                }
            }
            if (position === ON) {
                builder.addVertex(key);
            }
            if (position === BACK && lastPosition === FRONT) {
                builder.addIntersection(lastKey, key, lastDistance, distance);
            }
            lastKey = key;
            lastIndex = index;
            lastPosition = position;
            lastDistance = distance;
        });
        builder.endFace();
    });
    if (closeHoles) {
        builder.closeHoles();
    }
    return sliced;
};
const distanceAsPosition = (distance) => {
    if (distance < 0) {
        return BACK;
    }
    if (distance > 0) {
        return FRONT;
    }
    return ON;
};
const findDistance = (vertex, plane) => {
    return plane.distanceToPoint(vertex);
};
//# sourceMappingURL=slice.js.map