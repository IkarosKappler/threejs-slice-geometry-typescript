/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 *
 * @date 2021-09-28
 */
import { FACE_KEY } from "./constants";
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
    constructor(sourceGeometry: any, targetGeometry: any, slicePlane: any);
    startFace(sourceFaceIndex?: number): void;
    endFace(): void;
    closeHoles(): void;
    addVertex(key: FACE_KEY): void;
    addIntersection(keyA: FACE_KEY, keyB: FACE_KEY, distanceA: number, distanceB: number): void;
    addUv: (key: any) => void;
    addIntersectionUv: (keyA: any, keyB: any, t: any) => void;
    addNormal: (key: any) => void;
    addIntersectionNormal: (keyA: any, keyB: any, t: any) => void;
    addFace: (indices: any) => void;
    addFacePart: (a: any, b: any, c: any) => void;
    faceEdgeLength: (a: any, b: any) => any;
    intersectionId(indexA: any, indexB: any): string;
    keyIndex: (key: FACE_KEY) => number;
    updateNewEdges: (index: any) => void;
    faceNormal: (faceIndices: any) => any;
}
