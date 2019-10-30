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
define(["require", "exports", "./ambient", "./document/buttons", "./document/documentUtilities", "./rendering/canvasRenderer", "./rendering/cartesianPlane", "./simulator", "./vector2", "./rendering/debugui/debugUI"], function (require, exports, ambient_1, Buttons, documentUtilities_1, canvasRenderer_1, cartesianPlane_1, simulator_1, vector2_1, debugUI_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ambient_1 = __importDefault(ambient_1);
    Buttons = __importStar(Buttons);
    simulator_1 = __importDefault(simulator_1);
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading main");
    let can = document.createElement('canvas');
    let ctx = can.getContext('2d');
    document.body.querySelector("#canvas-holder").appendChild(can);
    exports.canvasRenderer = new canvasRenderer_1.CanvasRenderer(ctx, vector2_1.default.zero, 100, 5, 500);
    exports.ambient = new ambient_1.default();
    exports.simulator = new simulator_1.default(Buttons.getButtonById("play-button"), Buttons.getButtonById("reset-button"), Buttons.getButtonById("destroy-button"), Buttons.getButtonById("step-button"));
    new Promise((resolve_1, reject_1) => { require(["./document/buttonClickFunctions"], resolve_1, reject_1); }).then(__importStar);
    new Promise((resolve_2, reject_2) => { require(["./rendering/graph"], resolve_2, reject_2); }).then(__importStar);
    exports.setAmbient = function (a) {
        exports.canvasRenderer.remove(exports.ambient);
        exports.simulator.remove(exports.ambient);
        exports.ambient = a;
        exports.canvasRenderer.add(exports.ambient);
        exports.simulator.add(exports.ambient);
        documentUtilities_1.ObjectSelectionController.selectObject(exports.ambient);
    };
    documentUtilities_1.ObjectSelectionController.selectObject(exports.ambient);
    exports.simulator.add(exports.ambient);
    exports.canvasRenderer.add(new cartesianPlane_1.CartesianPlane(1, cartesianPlane_1.CartesianPlane.ENVIRONMENT_STYLE));
    exports.canvasRenderer.add(exports.ambient);
    exports.canvasRenderer.add(new debugUI_1.DebugUI());
    // canvasRenderer.add({ draw(cR: CanvasRenderer){
    //     cR.context.beginPath();
    //     cR.drawingTools.worldRectWithOffset(new Vector2(1, 1), new Vector2(1, 1), 20, false, 0.2*Math.PI); 
    //     cR.context.fill();
    //     cR.context.closePath();
    // } });
    exports.canvasRenderer.start();
    //If it's firefox, show a alert message warning about svg image scaling
    //@ts-ignore
    if (typeof InstallTrigger !== 'undefined')
        documentUtilities_1.Alert.throwAlert("Atenção: o dimensionamento da imagens pode não funcionar corretamente", documentUtilities_1.Alert.WARNING);
});
