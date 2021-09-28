"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sliceGeometry = void 0;
// Note: THREE.Geometry is only available until version 0.124.0
var THREE = require("three");
var GeometryBuilder_1 = require("./GeometryBuilder");
var constants_1 = require("./constants");
var sliceGeometry = function (geometry, plane, closeHoles) {
    var sliced = new THREE.Geometry();
    var builder = new GeometryBuilder_1.GeometryBuilder(geometry, sliced, plane);
    var distances = [];
    var positions = [];
    geometry.vertices.forEach(function (vertex) {
        var distance = findDistance(vertex, plane);
        var position = distanceAsPosition(distance);
        distances.push(distance);
        positions.push(position);
    });
    geometry.faces.forEach(function (face, faceIndex) {
        var facePositions = constants_1.FACE_KEYS.map(function (key) {
            return positions[face[key]];
        });
        if (facePositions.indexOf(constants_1.FRONT) === -1 &&
            facePositions.indexOf(constants_1.BACK) !== -1) {
            return;
        }
        builder.startFace(faceIndex);
        var lastKey = constants_1.FACE_KEYS[constants_1.FACE_KEYS.length - 1];
        var lastIndex = face[lastKey];
        var lastDistance = distances[lastIndex];
        var lastPosition = positions[lastIndex];
        constants_1.FACE_KEYS.map(function (key) {
            var index = face[key];
            var distance = distances[index];
            var position = positions[index];
            if (position === constants_1.FRONT) {
                if (lastPosition === constants_1.BACK) {
                    builder.addIntersection(lastKey, key, lastDistance, distance);
                    builder.addVertex(key);
                }
                else {
                    builder.addVertex(key);
                }
            }
            if (position === constants_1.ON) {
                builder.addVertex(key);
            }
            if (position === constants_1.BACK && lastPosition === constants_1.FRONT) {
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
exports.sliceGeometry = sliceGeometry;
var distanceAsPosition = function (distance) {
    if (distance < 0) {
        return constants_1.BACK;
    }
    if (distance > 0) {
        return constants_1.FRONT;
    }
    return constants_1.ON;
};
var findDistance = function (vertex, plane) {
    return plane.distanceToPoint(vertex);
};
//# sourceMappingURL=slice.js.map