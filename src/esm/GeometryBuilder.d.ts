/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 *
 * @date 2021-09-28
 */
import * as THREE from "three";
import { FACE_KEY } from "./constants";
import { Gmetry } from "three-geometry-hellfix";
export declare class GeometryBuilder {
    private sourceGeometry;
    private targetGeometry;
    private slicePlane;
    private addedVertices;
    private addedIntersections;
    private newEdges;
    private sourceFaceIndex;
    private sourceFace;
    private sourceFaceUvs;
    private faceIndices;
    private faceNormals;
    private faceUvs;
    constructor(sourceGeometry: Gmetry, targetGeometry: Gmetry, slicePlane: THREE.Plane);
    startFace(sourceFaceIndex?: number): void;
    endFace(): void;
    closeHoles(): void;
    addVertex(key: FACE_KEY): void;
    addIntersection(keyA: FACE_KEY, keyB: FACE_KEY, distanceA: number, distanceB: number): void;
    addUv(key: FACE_KEY): void;
    addIntersectionUv(keyA: FACE_KEY, keyB: FACE_KEY, t: number): void;
    addNormal(key: FACE_KEY): void;
    addIntersectionNormal(keyA: FACE_KEY, keyB: FACE_KEY, t: number): void;
    addFace(indices: number[]): void;
    addFacePart(a: number, b: number, c: number): void;
    faceEdgeLength(a: number, b: number): number;
    intersectionId(indexA: number, indexB: number): string;
    keyIndex(key: FACE_KEY): number;
    updateNewEdges(index: number): void;
    faceNormal(faceIndices: any): THREE.Vector3;
}
