var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "./ambient", "./rendering", "./simulator", "./vector2", "./document"], function (require, exports, ambient_1, rendering_1, simulator_1, vector2_1, document_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ambient_1 = __importDefault(ambient_1);
    simulator_1 = __importDefault(simulator_1);
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading main");
    let can = document.createElement('canvas');
    let ctx = can.getContext('2d');
    can.width = 500;
    can.height = 500;
    document.body.querySelector("#mid-menu>div").appendChild(can);
    exports.canvasRenderer = new rendering_1.CanvasRenderer(ctx, vector2_1.default.zero, 100, 5, 500);
    exports.ambient = new ambient_1.default();
    exports.simulator = new simulator_1.default();
    new Promise((resolve_1, reject_1) => { require(["./input"], resolve_1, reject_1); }).then(__importStar);
    exports.setAmbient = function (a) {
        exports.canvasRenderer.remove(exports.ambient);
        exports.simulator.remove(exports.ambient);
        exports.ambient = a;
        exports.canvasRenderer.add(exports.ambient);
        exports.simulator.add(exports.ambient);
        document_1.ObjectSelectionController.selectObject(exports.ambient);
    };
    document_1.ObjectSelectionController.selectObject(exports.ambient);
    exports.simulator.add(exports.ambient);
    exports.canvasRenderer.add({ draw() { ctx.clearRect(0, 0, can.width, can.height); } });
    exports.canvasRenderer.add(new rendering_1.CartesianPlane(1));
    exports.canvasRenderer.add(exports.ambient);
    exports.canvasRenderer.start();
});
