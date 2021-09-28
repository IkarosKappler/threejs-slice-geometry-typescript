/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 * 
 * @date 2021-09-28
 */

// Note: THREE.Geometry is only available until version 0.124.0
import * as THREE from "three";
import { facesFromEdges } from "./faces-from-edges";
import { FACE_KEY, FACE_KEYS } from "./constants";

export class GeometryBuilder {

    private sourceGeometry: THREE.Geometry;
    private targetGeometry: THREE.Geometry;
    private slicePlane: THREE.Plane;
    private addedVertices: number[]; // THREE.Vector3[];
    private addedIntersections: number[];
    private newEdges: number[][];

    private sourceFaceIndex: number;
    private sourceFace: THREE.Face3;
    private sourceFaceUvs: any; // TODO: what type is this?

    private faceIndices : number[];
    private faceNormals : number[];
    private faceUvs : any; // TODO: type?
    
    constructor(sourceGeometry, targetGeometry, slicePlane) {
        this.sourceGeometry = sourceGeometry;
        this.targetGeometry = targetGeometry;
        this.slicePlane = slicePlane;
        this.addedVertices = [];
        this.addedIntersections = [];
        this.newEdges = [[]];
    };

    // TODO: check undfined?
    // This is called without params in line ---67 but param used here as an index??
    startFace(sourceFaceIndex?:number) : void {
        this.sourceFaceIndex = sourceFaceIndex;
        this.sourceFace = this.sourceGeometry.faces[sourceFaceIndex];
        this.sourceFaceUvs = this.sourceGeometry.faceVertexUvs[0][sourceFaceIndex];

        this.faceIndices = [];
        this.faceNormals = [];
        this.faceUvs = [];
    };

    endFace() : void {
        var indices = this.faceIndices.map(function(index, i) {
            return i;
        });
        this.addFace(indices);
    };

    closeHoles() : void {
        if ( !this.newEdges[0].length) {
            return;
        }
        facesFromEdges(this.newEdges)
            .forEach((faceIndices:number[]) => {
                var normal = this.faceNormal(faceIndices);
                if (normal.dot(this.slicePlane.normal) > .5) {
                    faceIndices.reverse();
                }
                this.startFace();
                this.faceIndices = faceIndices;
                this.endFace();
            }, this);
    };

    addVertex(key:FACE_KEY) : void { // TODO: check type?
        this.addUv(key);
        this.addNormal(key);

        const index : number = this.sourceFace[key];
        let newIndex : number;

        if (this.addedVertices.hasOwnProperty(index)) {
            newIndex = this.addedVertices[index];
        } else {
            const vertex : THREE.Vector3 = this.sourceGeometry.vertices[index];
            this.targetGeometry.vertices.push(vertex);
            newIndex = this.targetGeometry.vertices.length - 1;
            this.addedVertices[index] = newIndex;
        }
        this.faceIndices.push(newIndex);
    };

    addIntersection(keyA:FACE_KEY, keyB:FACE_KEY, distanceA:number, distanceB:number) : void {
        const t : number = Math.abs(distanceA) / (Math.abs(distanceA) + Math.abs(distanceB));
        this.addIntersectionUv(keyA, keyB, t);
        this.addIntersectionNormal(keyA, keyB, t);

        const indexA : number = this.sourceFace[keyA];
        const indexB : number = this.sourceFace[keyB];
        const id : string = this.intersectionId(indexA, indexB);
        let index : number;

        if (this.addedIntersections.hasOwnProperty(id)) {
            index = this.addedIntersections[id];
        } else {
            const vertexA : THREE.Vector3 = this.sourceGeometry.vertices[indexA];
            const vertexB : THREE.Vector3 = this.sourceGeometry.vertices[indexB];
            const newVertex : THREE.Vector3 = vertexA.clone().lerp(vertexB, t);
            this.targetGeometry.vertices.push(newVertex);
            index = this.targetGeometry.vertices.length - 1;
            this.addedIntersections[id] = index;
        }
        this.faceIndices.push(index);
        this.updateNewEdges(index);
    };

    addUv = function(key) {
        if ( ! this.sourceFaceUvs) {
            return;
        }
        var index = this.keyIndex(key);
        var uv = this.sourceFaceUvs[index];
        this.faceUvs.push(uv);
    };

    addIntersectionUv = function(keyA, keyB, t) {
        if ( ! this.sourceFaceUvs) {
            return;
        }
        var indexA = this.keyIndex(keyA);
        var indexB = this.keyIndex(keyB);
        var uvA = this.sourceFaceUvs[indexA];
        var uvB = this.sourceFaceUvs[indexB];
        var uv = uvA.clone().lerp(uvB, t);
        this.faceUvs.push(uv);
    };

    addNormal = function(key) {
        if ( ! this.sourceFace.vertexNormals.length) {
            return;
        }
        var index = this.keyIndex(key);
        var normal = this.sourceFace.vertexNormals[index];
        this.faceNormals.push(normal);
    };

    addIntersectionNormal = function(keyA, keyB, t) {
        if ( ! this.sourceFace.vertexNormals.length) {
            return;
        }
        var indexA = this.keyIndex(keyA);
        var indexB = this.keyIndex(keyB);
        var normalA = this.sourceFace.vertexNormals[indexA];
        var normalB = this.sourceFace.vertexNormals[indexB];
        var normal = normalA.clone().lerp(normalB, t).normalize();
        this.faceNormals.push(normal);
    };

    addFace = function(indices) {
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

        pairs.sort(function(pairA, pairB) {
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

    addFacePart = function(a, b, c) {
        var normals = null;
        if (this.faceNormals.length) {
            normals = [
                this.faceNormals[a],
                this.faceNormals[b],
                this.faceNormals[c],
            ];
        }
        var face = new THREE.Face3(
            this.faceIndices[a],
            this.faceIndices[b],
            this.faceIndices[c],
            normals
        );
        this.targetGeometry.faces.push(face);
        if ( ! this.sourceFaceUvs) {
            return;
        }
        this.targetGeometry.faceVertexUvs[0].push([
            this.faceUvs[a],
            this.faceUvs[b],
            this.faceUvs[c]
        ]);
    };

    faceEdgeLength = function(a, b) {
        var indexA = this.faceIndices[a];
        var indexB = this.faceIndices[b];
        var vertexA = this.targetGeometry.vertices[indexA];
        var vertexB = this.targetGeometry.vertices[indexB];
        return vertexA.distanceToSquared(vertexB);
    };

    intersectionId(indexA, indexB) : string {
        return [indexA, indexB].sort().join(',');
    };

    keyIndex = function(key:FACE_KEY) {
        return FACE_KEYS.indexOf(key);
    };

    updateNewEdges = function(index) {
        var edgeIndex = this.newEdges.length - 1;
        var edge = this.newEdges[edgeIndex];
        if (edge.length < 2) {
            edge.push(index);
        } else {
            this.newEdges.push([index]);
        }
    };

    faceNormal = function(faceIndices) {
        var vertices = faceIndices.map(function(index) {
            return this.targetGeometry.vertices[index];
        }.bind(this));
        var edgeA = vertices[0].clone().sub(vertices[1]);
        var edgeB = vertices[0].clone().sub(vertices[2]);
        return edgeA.cross(edgeB).normalize();
    };

}