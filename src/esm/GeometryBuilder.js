/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 *
 * @date 2021-09-28
 */
// Note: THREE.Geometry is only available until version 0.124.0
import * as THREE from "three";
import { facesFromEdges } from "./faces-from-edges";
import { FACE_KEYS } from "./constants";
export class GeometryBuilder {
    constructor(sourceGeometry, targetGeometry, slicePlane) {
        this.addUv = function (key) {
            if (!this.sourceFaceUvs) {
                return;
            }
            var index = this.keyIndex(key);
            var uv = this.sourceFaceUvs[index];
            this.faceUvs.push(uv);
        };
        this.addIntersectionUv = function (keyA, keyB, t) {
            if (!this.sourceFaceUvs) {
                return;
            }
            var indexA = this.keyIndex(keyA);
            var indexB = this.keyIndex(keyB);
            var uvA = this.sourceFaceUvs[indexA];
            var uvB = this.sourceFaceUvs[indexB];
            var uv = uvA.clone().lerp(uvB, t);
            this.faceUvs.push(uv);
        };
        this.addNormal = function (key) {
            if (!this.sourceFace.vertexNormals.length) {
                return;
            }
            var index = this.keyIndex(key);
            var normal = this.sourceFace.vertexNormals[index];
            this.faceNormals.push(normal);
        };
        this.addIntersectionNormal = function (keyA, keyB, t) {
            if (!this.sourceFace.vertexNormals.length) {
                return;
            }
            var indexA = this.keyIndex(keyA);
            var indexB = this.keyIndex(keyB);
            var normalA = this.sourceFace.vertexNormals[indexA];
            var normalB = this.sourceFace.vertexNormals[indexB];
            var normal = normalA.clone().lerp(normalB, t).normalize();
            this.faceNormals.push(normal);
        };
        this.addFace = function (indices) {
            if (indices.length === 3) {
                this.addFacePart(indices[0], indices[1], indices[2]);
                return;
            }
            var pairs = [];
            for (var i = 0; i < indices.length; i++) {
                for (var j = i + 1; j < indices.length; j++) {
                    var diff = Math.abs(i - j);
                    if (diff > 1 && diff < indices.length - 1) {
                        pairs.push([indices[i], indices[j]]);
                    }
                }
            }
            pairs.sort(function (pairA, pairB) {
                var lengthA = this.faceEdgeLength(pairA[0], pairA[1]);
                var lengthB = this.faceEdgeLength(pairB[0], pairB[1]);
                return lengthA - lengthB;
            }.bind(this));
            var a = indices.indexOf(pairs[0][0]);
            indices = indices.slice(a).concat(indices.slice(0, a));
            var b = indices.indexOf(pairs[0][1]);
            var indicesA = indices.slice(0, b + 1);
            var indicesB = indices.slice(b).concat(indices.slice(0, 1));
            this.addFace(indicesA);
            this.addFace(indicesB);
        };
        this.addFacePart = function (a, b, c) {
            var normals = null;
            if (this.faceNormals.length) {
                normals = [
                    this.faceNormals[a],
                    this.faceNormals[b],
                    this.faceNormals[c],
                ];
            }
            var face = new THREE.Face3(this.faceIndices[a], this.faceIndices[b], this.faceIndices[c], normals);
            this.targetGeometry.faces.push(face);
            if (!this.sourceFaceUvs) {
                return;
            }
            this.targetGeometry.faceVertexUvs[0].push([
                this.faceUvs[a],
                this.faceUvs[b],
                this.faceUvs[c]
            ]);
        };
        this.faceEdgeLength = function (a, b) {
            var indexA = this.faceIndices[a];
            var indexB = this.faceIndices[b];
            var vertexA = this.targetGeometry.vertices[indexA];
            var vertexB = this.targetGeometry.vertices[indexB];
            return vertexA.distanceToSquared(vertexB);
        };
        this.keyIndex = function (key) {
            return FACE_KEYS.indexOf(key);
        };
        this.updateNewEdges = function (index) {
            var edgeIndex = this.newEdges.length - 1;
            var edge = this.newEdges[edgeIndex];
            if (edge.length < 2) {
                edge.push(index);
            }
            else {
                this.newEdges.push([index]);
            }
        };
        this.faceNormal = function (faceIndices) {
            var vertices = faceIndices.map(function (index) {
                return this.targetGeometry.vertices[index];
            }.bind(this));
            var edgeA = vertices[0].clone().sub(vertices[1]);
            var edgeB = vertices[0].clone().sub(vertices[2]);
            return edgeA.cross(edgeB).normalize();
        };
        this.sourceGeometry = sourceGeometry;
        this.targetGeometry = targetGeometry;
        this.slicePlane = slicePlane;
        this.addedVertices = [];
        this.addedIntersections = [];
        this.newEdges = [[]];
    }
    ;
    // TODO: check undfined?
    // This is called without params in line ---67 but param used here as an index??
    startFace(sourceFaceIndex) {
        this.sourceFaceIndex = sourceFaceIndex;
        this.sourceFace = this.sourceGeometry.faces[sourceFaceIndex];
        this.sourceFaceUvs = this.sourceGeometry.faceVertexUvs[0][sourceFaceIndex];
        this.faceIndices = [];
        this.faceNormals = [];
        this.faceUvs = [];
    }
    ;
    endFace() {
        var indices = this.faceIndices.map(function (index, i) {
            return i;
        });
        this.addFace(indices);
    }
    ;
    closeHoles() {
        if (!this.newEdges[0].length) {
            return;
        }
        facesFromEdges(this.newEdges)
            .forEach((faceIndices) => {
            var normal = this.faceNormal(faceIndices);
            if (normal.dot(this.slicePlane.normal) > .5) {
                faceIndices.reverse();
            }
            this.startFace();
            this.faceIndices = faceIndices;
            this.endFace();
        }, this);
    }
    ;
    addVertex(key) {
        this.addUv(key);
        this.addNormal(key);
        const index = this.sourceFace[key];
        let newIndex;
        if (this.addedVertices.hasOwnProperty(index)) {
            newIndex = this.addedVertices[index];
        }
        else {
            const vertex = this.sourceGeometry.vertices[index];
            this.targetGeometry.vertices.push(vertex);
            newIndex = this.targetGeometry.vertices.length - 1;
            this.addedVertices[index] = newIndex;
        }
        this.faceIndices.push(newIndex);
    }
    ;
    addIntersection(keyA, keyB, distanceA, distanceB) {
        const t = Math.abs(distanceA) / (Math.abs(distanceA) + Math.abs(distanceB));
        this.addIntersectionUv(keyA, keyB, t);
        this.addIntersectionNormal(keyA, keyB, t);
        const indexA = this.sourceFace[keyA];
        const indexB = this.sourceFace[keyB];
        const id = this.intersectionId(indexA, indexB);
        let index;
        if (this.addedIntersections.hasOwnProperty(id)) {
            index = this.addedIntersections[id];
        }
        else {
            const vertexA = this.sourceGeometry.vertices[indexA];
            const vertexB = this.sourceGeometry.vertices[indexB];
            const newVertex = vertexA.clone().lerp(vertexB, t);
            this.targetGeometry.vertices.push(newVertex);
            index = this.targetGeometry.vertices.length - 1;
            this.addedIntersections[id] = index;
        }
        this.faceIndices.push(index);
        this.updateNewEdges(index);
    }
    ;
    intersectionId(indexA, indexB) {
        return [indexA, indexB].sort().join(',');
    }
    ;
}
//# sourceMappingURL=GeometryBuilder.js.map