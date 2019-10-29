var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../../vector2", "./fpsCounter", "./mousePosDisplayer"], function (require, exports, vector2_1, fpsCounter_1, mousePosDisplayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    class DebugUI {
        constructor() {
            this.debugUIItems = new Map();
            this.debugUIItems.set("fpscounter", new fpsCounter_1.FPSCounter(vector2_1.default.zero, 0.1));
            this.debugUIItems.set("mousecposdisplay", new mousePosDisplayer_1.MousePositionDisplayer(vector2_1.default.zero));
            this.debugUIItems.set("mousewposdisplay", new mousePosDisplayer_1.MousePositionDisplayer(vector2_1.default.zero, true));
        }
        onCanvasAdded(cR) {
            this.debugUIItems.forEach(v => v.onCanvasAdded(cR));
        }
        onCanvasRemoved(cR) {
            this.debugUIItems.forEach(v => v.onCanvasRemoved(cR));
        }
        draw(canvasRenderer, step) {
            const values = Array.from(this.debugUIItems.values()).reverse();
            for (let i = 0; i < values.length; i++) {
                const debugUIItem = values[i];
                debugUIItem.pos = new vector2_1.default(5, canvasRenderer.context.canvas.height - 5 - i * 16);
                debugUIItem.draw(canvasRenderer, step);
            }
        }
    }
    exports.DebugUI = DebugUI;
});
