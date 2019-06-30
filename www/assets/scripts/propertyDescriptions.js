(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const types_1 = require("./types");
    exports.propertyDescriptions = new Map();
    exports.propertyDescriptions.set(types_1.PhysicsPropertyType.ObjectPosition, `
    <h1>
        Posição
    </h1>
    <p>
        Em física, a posição de um corpo é a especificação de seu lugar no espaço. A identificação da posição é feita a partir de um vetor, denominado vetor posição, que pode ser escrito em função de um sistema de coordenadas de um certo referencial. A unidade de medida da posição no Sistema Internacional de Unidades é o metro.
    </p>
    `);
});
