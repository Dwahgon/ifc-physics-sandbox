var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./main", "./vector2", "./document"], function (require, exports, Main, vector2_1, document_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Main = __importStar(Main);
    vector2_1 = __importDefault(vector2_1);
    console.log("loading input");
    const canvas = Main.canvasRenderer.context.canvas;
    const camera = Main.canvasRenderer.camera;
    const onMove = (cursorCoordinates, canvas) => {
        if (!camera.isMouseDown) {
            const obj = Main.ambient.getObjectOnPosition(new vector2_1.default(cursorCoordinates.x, -cursorCoordinates.y), true);
            canvas.style.cursor = (obj) ? "pointer" : "default";
        }
    };
    const onMouseUp = (ev) => {
        if (!camera.mouseMoved) {
            let clickedPos = new vector2_1.default(ev.offsetX, ev.offsetY);
            let obj = Main.ambient.getObjectOnPosition(clickedPos, true);
            document_1.ObjectSelectionController.selectObject((obj) ? obj : Main.ambient);
        }
    };
    canvas.addEventListener("mousemove", ev => { onMove(new vector2_1.default(ev.offsetX, -ev.offsetY), canvas); });
    canvas.addEventListener("touchmove", ev => { onMove(camera.getTouchPosition(ev), canvas); });
    canvas.addEventListener("mouseup", ev => { onMouseUp(ev); });
});
