// Note: THREE.Geometry is only available until version 0.124.0
import * as THREE from "three";
import { GeometryBuilder } from "./GeometryBuilder";
import { BACK, FACE_KEY, FACE_KEYS, FRONT, ON, POSITION_TYPE } from "./constants";
import { Gmetry } from "three-geometry-hellfix";

export const sliceGeometry = (geometry:Gmetry, plane:THREE.Plane, closeHoles:boolean) => {
    const sliced : Gmetry = new Gmetry();
    const builder = new GeometryBuilder(geometry, sliced, plane);

    const distances : number[] = [];
    const positions : POSITION_TYPE[] = [];

    geometry.vertices.forEach((vertex:THREE.Vector3) => {
        const distance : number = findDistance(vertex, plane);
        const position : POSITION_TYPE= distanceAsPosition(distance);
        distances.push(distance);
        positions.push(position);
    });

    geometry.faces.forEach(function(face, faceIndex) {

        const facePositions : POSITION_TYPE[] = FACE_KEYS.map(function(key) {
            return positions[face[key]];
        });

        if ( facePositions.indexOf(FRONT) === -1 &&
                facePositions.indexOf(BACK) !== -1 ) {
            return;
        }

        builder.startFace(faceIndex);

        let lastKey : FACE_KEY = FACE_KEYS[FACE_KEYS.length - 1];
        let lastIndex : number = face[lastKey];
        let lastDistance : number = distances[lastIndex];
        let lastPosition : POSITION_TYPE = positions[lastIndex];

        FACE_KEYS.map((key:FACE_KEY) => {
            var index = face[key];
            var distance = distances[index];
            var position = positions[index];
            
            if (position === FRONT) {
                if (lastPosition === BACK) {
                    builder.addIntersection(lastKey, key, lastDistance, distance);
                    builder.addVertex(key);
                } else {
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

const distanceAsPosition = (distance:number) : POSITION_TYPE => {
    if (distance < 0) {
        return BACK;
    }
    if (distance > 0) {
        return FRONT;
    }
    return ON;
};

const findDistance = (vertex:THREE.Vector3, plane:THREE.Plane) => {
    return plane.distanceToPoint(vertex);
};
