"use strict";
/**
 * Ported to TypeScript from vanilla-js by Ikaros Kappler.
 *
 * @date 2021-09-28
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.facesFromEdges = void 0;
var facesFromEdges = function (edges) {
    var chains = joinEdges(edges).filter(validFace);
    var faces = chains.map(function (chain) {
        return chain.map(function (edge) {
            return edge[0];
        });
    });
    return faces;
};
exports.facesFromEdges = facesFromEdges;
var joinEdges = function (edges) {
    var changes = true;
    var chains = edges.map(function (edge) {
        return [edge];
    });
    while (changes) {
        changes = connectChains(chains);
    }
    chains = chains.filter(function (chain) {
        return chain.length;
    });
    return chains;
};
var connectChains = function (chains) {
    chains.forEach(function (chainA, i) {
        chains.forEach(function (chainB, j) {
            var merged = mergeChains(chainA, chainB);
            if (merged) {
                delete chains[j];
                return true;
            }
        });
    });
    return false;
};
var mergeChains = function (chainA, chainB) {
    if (chainA === chainB) {
        return false;
    }
    if (chainStart(chainA) === chainEnd(chainB)) {
        chainA.unshift.apply(chainA, chainB);
        return true;
    }
    if (chainStart(chainA) === chainStart(chainB)) {
        reverseChain(chainB);
        chainA.unshift.apply(chainA, chainB);
        return true;
    }
    if (chainEnd(chainA) === chainStart(chainB)) {
        chainA.push.apply(chainA, chainB);
        return true;
    }
    if (chainEnd(chainA) === chainEnd(chainB)) {
        reverseChain(chainB);
        chainA.push.apply(chainA, chainB);
        return true;
    }
    return false;
};
var chainStart = function (chain) {
    return chain[0][0];
};
var chainEnd = function (chain) {
    return chain[chain.length - 1][1];
};
var reverseChain = function (chain) {
    chain.reverse();
    chain.forEach(function (edge) {
        edge.reverse();
    });
};
var validFace = function (chain) {
    return chainStart(chain) === chainEnd(chain) ? 1 : 0;
};
//# sourceMappingURL=faces-from-edges.js.map