import { ThreeGeometryHellfix as TGH } from "three-geometry-hellfix";
export const SliceThreeFactory = Object.assign(Object.assign({}, TGH.DefaultFactory), { newPlane: () => { return new window["THREE"].Plane(); } });
//# sourceMappingURL=SliceThreeFactory.js.map