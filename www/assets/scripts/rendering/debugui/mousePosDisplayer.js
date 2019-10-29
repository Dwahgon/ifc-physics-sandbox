var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./debugUIItem", "../../vector2"], function (require, exports, debugUIItem_1, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    class MousePositionDisplayer extends debugUIItem_1.DebugUIItem {
        constructor(pos, isWorld = false) {
            super(pos);
            this.isWorld = isWorld;
            this.mouseMoved = null;
            this.touchMoved = null;
        }
        onCanvasAdded(cR) {
            this.mouseMoved = (ev) => this.updateString(new vector2_1.default(ev.offsetX, ev.offsetY), cR.camera);
            this.touchMoved = (ev) => this.updateString(cR.camera.getTouchPosition(ev), cR.camera);
            cR.context.canvas.addEventListener("mousemove", this.mouseMoved);
            cR.context.canvas.addEventListener("touchmove", this.touchMoved);
        }
        onCanvasRemoved(cR) {
            if (this.mouseMoved)
                cR.context.canvas.removeEventListener("mousemove", this.mouseMoved);
            if (this.touchMoved)
                cR.context.canvas.removeEventListener("touchmove", this.touchMoved);
            this.mouseMoved = null;
            this.touchMoved = null;
        }
        draw(cR, step) {
            super.draw(cR);
        }
        updateString(pos, cam) {
            this.displayedString = `Mouse Position on ${this.isWorld ? "World" : "Canvas"}: ${this.isWorld ? cam.getWorldPosFromCanvas(pos) : pos}`;
        }
    }
    exports.MousePositionDisplayer = MousePositionDisplayer;
});
