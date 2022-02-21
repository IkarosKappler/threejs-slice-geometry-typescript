"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SliceThreeFactory = void 0;
var three_geometry_hellfix_1 = require("three-geometry-hellfix");
exports.SliceThreeFactory = __assign(__assign({}, three_geometry_hellfix_1.ThreeGeometryHellfix.DefaultFactory), { newPlane: function () { return new window["THREE"].Plane(); } });
//# sourceMappingURL=SliceThreeFactory.js.map