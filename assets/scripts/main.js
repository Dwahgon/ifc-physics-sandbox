var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ambient", "./input", "./rendering", "./simulator", "./vector2", "./document"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ambient_1 = __importDefault(require("./ambient"));
    const input_1 = __importDefault(require("./input"));
    const rendering_1 = require("./rendering");
    const simulator_1 = __importDefault(require("./simulator"));
    const vector2_1 = __importDefault(require("./vector2"));
    const document_1 = require("./document");
    let can = document.createElement('canvas');
    let ctx = can.getContext('2d');
    can.width = 500;
    can.height = 500;
    document.body.querySelector("#mid-menu>div").appendChild(can);
    exports.canvasRenderer = new rendering_1.CanvasRenderer(ctx, vector2_1.default.zero, 100);
    exports.ambient = new ambient_1.default();
    exports.simulator = new simulator_1.default();
    exports.setAmbient = function (a) {
        exports.canvasRenderer.remove(exports.ambient);
        exports.ambient = a;
        exports.canvasRenderer.add(exports.ambient);
        document_1.ObjectSelectionController.selectObject(exports.ambient);
    };
    document_1.ObjectSelectionController.selectObject(exports.ambient);
    new input_1.default(exports.canvasRenderer);
    exports.canvasRenderer.add({ draw() { ctx.clearRect(0, 0, can.width, can.height); } });
    exports.canvasRenderer.add(new rendering_1.Grid(1));
    exports.canvasRenderer.add(exports.ambient);
    exports.canvasRenderer.start();
});
