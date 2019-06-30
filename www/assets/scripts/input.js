var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./main", "./vector2", "./document"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const main_1 = require("./main");
    const vector2_1 = __importDefault(require("./vector2"));
    const document_1 = require("./document");
    class Input {
        constructor(canvasRenderer) {
            let canvas = canvasRenderer.context.canvas;
            this.isMouseDown = false;
            this.clickedPos = vector2_1.default.zero;
            this.cameraPosOnMouseDown = vector2_1.default.zero;
            this.mouseMoved = false;
            this.camera = canvasRenderer.camera;
            canvas.addEventListener("mousedown", ev => { this.onInputStart(new vector2_1.default(ev.offsetX, -ev.offsetY)); });
            canvas.addEventListener("touchstart", ev => { this.onInputStart(this.getOffsetVector2(ev)); });
            canvas.addEventListener("mousemove", ev => { this.onMove(new vector2_1.default(ev.offsetX, -ev.offsetY), canvas); });
            canvas.addEventListener("touchmove", ev => { this.onMove(this.getOffsetVector2(ev), canvas); });
            document.addEventListener("mouseup", ev => { this.onMouseUp(ev, canvas); });
        }
        getOffsetVector2(ev) {
            const touchTarget = ev.targetTouches[0].target;
            const rect = touchTarget.getBoundingClientRect();
            const x = ev.targetTouches[0].pageX - rect.left;
            const y = ev.targetTouches[0].pageY - rect.top;
            return new vector2_1.default(x, -y);
        }
        onInputStart(cursorCoordinates) {
            this.isMouseDown = true;
            this.mouseMoved = false;
            this.clickedPos = cursorCoordinates;
            this.cameraPosOnMouseDown = this.camera.pos;
        }
        onMove(cursorCoordinates, canvas) {
            if (this.isMouseDown) {
                this.camera.pos = vector2_1.default.sum(this.cameraPosOnMouseDown, vector2_1.default.sub(this.clickedPos, cursorCoordinates));
                canvas.style.cursor = "move";
                if (!vector2_1.default.equals(this.cameraPosOnMouseDown, this.camera.pos)) {
                    this.mouseMoved = true;
                    this.camera.unfollowObject();
                }
            }
            else {
                const obj = main_1.ambient.getObjectOnPosition(new vector2_1.default(cursorCoordinates.x, -cursorCoordinates.y));
                canvas.style.cursor = (obj) ? "pointer" : "default";
            }
        }
        onMouseUp(ev, canvas) {
            if (!this.isMouseDown)
                return;
            this.isMouseDown = false;
            canvas.style.cursor = "default";
            if (!this.mouseMoved) {
                let clickedPos = new vector2_1.default(ev.offsetX, ev.offsetY);
                let obj = main_1.ambient.getObjectOnPosition(clickedPos);
                document_1.ObjectSelectionController.selectObject((obj) ? obj : main_1.ambient);
            }
        }
    }
    exports.default = Input;
});
