/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 * 
 * @date 2021-09-28
 */

// Note: THREE.Geometry is only available until version 0.124.0
import * as THREE from "three";
import { facesFromEdges } from "./faces-from-edges";
import { FACE_KEY, FACE_KEYS } from "./constants";
import { Face3, Gmetry } from "three-geometry-hellfix";

type Pair = [number,number];
type FaceNormals = [THREE.Vector3, THREE.Vector3, THREE.Vector3];

export class GeometryBuilder {

    private sourceGeometry: Gmetry;
    private targetGeometry: Gmetry;
    private slicePlane: THREE.Plane;
    private addedVertices: number[];
    private addedIntersections: number[];
    private newEdges: Array<number[]>;

    private sourceFaceIndex: number;
    private sourceFace: Face3;
    private sourceFaceUvs: THREE.Vector2[];

    private faceIndices : number[];
    private faceNormals : THREE.Vector3[];
    private faceUvs : THREE.Vector2[];
    
    constructor(sourceGeometry: Gmetry, targetGeometry: Gmetry, slicePlane:THREE.Plane) {
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

    addVertex(key:FACE_KEY) : void {
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

    addUv(key:FACE_KEY) : void {
        if ( ! this.sourceFaceUvs) {
            return;
        }
        const index : number = this.keyIndex(key);
        const uv : THREE.Vector2 = this.sourceFaceUvs[index];
        this.faceUvs.push(uv);
    };

    addIntersectionUv(keyA:FACE_KEY, keyB:FACE_KEY, t:number) : void {
        if ( ! this.sourceFaceUvs) {
            return;
        }
        const indexA : number = this.keyIndex(keyA);
        const indexB : number = this.keyIndex(keyB);
        const uvA : THREE.Vector2 = this.sourceFaceUvs[indexA];
        const uvB : THREE.Vector2 = this.sourceFaceUvs[indexB];
        const uv : THREE.Vector2 = uvA.clone().lerp(uvB, t);
        this.faceUvs.push(uv);
    };

    addNormal(key:FACE_KEY) {
        if ( ! this.sourceFace.vertexNormals.length) {
            return;
        }
        const index = this.keyIndex(key);
        const normal = this.sourceFace.vertexNormals[index];
        this.faceNormals.push(normal);
    };

    addIntersectionNormal(keyA:FACE_KEY, keyB:FACE_KEY, t:number) {
        if ( ! this.sourceFace.vertexNormals.length) {
            return;
        }
        const indexA : number = this.keyIndex(keyA);
        const indexB : number = this.keyIndex(keyB);
        const normalA : THREE.Vector3 = this.sourceFace.vertexNormals[indexA];
        const normalB : THREE.Vector3 = this.sourceFace.vertexNormals[indexB];
        const normal : THREE.Vector3 = normalA.clone().lerp(normalB, t).normalize();
        this.faceNormals.push(normal);
    };

    addFace(indices:number[]) : void {
        if (indices.length === 3) {
            this.addFacePart(indices[0], indices[1], indices[2]);
            return;
        }

        const pairs : Array<Pair>= [];
        for (var i = 0; i < indices.length; i++) {
            for (var j = i + 1; j < indices.length; j++) {
                var diff = Math.abs(i - j);
                if (diff > 1 && diff < indices.length - 1) {
                    pairs.push([indices[i], indices[j]]);
                }
            }
        }

        pairs.sort(((pairA:Pair, pairB:Pair) => {
            var lengthA = this.faceEdgeLength(pairA[0], pairA[1]);
            var lengthB = this.faceEdgeLength(pairB[0], pairB[1]);
            return lengthA - lengthB;
        }).bind(this));

        const a : number = indices.indexOf(pairs[0][0]);
        indices = indices.slice(a).concat(indices.slice(0, a));

        const b : number = indices.indexOf(pairs[0][1]);
        const indicesA : number[] = indices.slice(0, b + 1);
        const indicesB : number[] = indices.slice(b).concat(indices.slice(0, 1));

        this.addFace(indicesA);
        this.addFace(indicesB);
    };

    addFacePart(a:number, b:number, c:number) : void {
        let normals : FaceNormals | undefined = null;
        if (this.faceNormals.length) {
            normals = [
                this.faceNormals[a],
                this.faceNormals[b],
                this.faceNormals[c],
            ];
        }
        const face : Face3 = new Face3(
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

    faceEdgeLength(a:number, b:number) : number {
        const indexA : number = this.faceIndices[a];
        const indexB : number = this.faceIndices[b];
        const vertexA : THREE.Vector3 = this.targetGeometry.vertices[indexA];
        const vertexB : THREE.Vector3 = this.targetGeometry.vertices[indexB];
        return vertexA.distanceToSquared(vertexB);
    };

    intersectionId(indexA:number, indexB:number) : string {
        return [indexA, indexB].sort().join(',');
    };

    keyIndex(key:FACE_KEY) : number {
        return FACE_KEYS.indexOf(key);
    };

    updateNewEdges(index:number) : void {
        const edgeIndex : number = this.newEdges.length - 1;
        let edge : number[] = this.newEdges[edgeIndex];
        if (edge.length < 2) {
            edge.push(index);
        } else {
            this.newEdges.push([index]);
        }
    };

    faceNormal(faceIndices) {
        const vertices : THREE.Vector3[] = faceIndices.map(((index:number) => {
            return this.targetGeometry.vertices[index];
        }).bind(this));
        const edgeA : THREE.Vector3 = vertices[0].clone().sub(vertices[1]);
        const edgeB : THREE.Vector3 = vertices[0].clone().sub(vertices[2]);
        return edgeA.cross(edgeB).normalize();
    };

}