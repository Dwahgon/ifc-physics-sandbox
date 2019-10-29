define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DebugUIItem {
        constructor(pos) {
            this.pos = pos;
            this.active = true;
            this.displayedString = "";
        }
        onCanvasAdded(cR) { }
        onCanvasRemoved(cR) { }
        draw(cR, step) {
            if (!this.active)
                return;
            const ctx = cR.context;
            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            //@ts-ignore
            ctx.fillText(this.displayedString, ...this.pos.toArray());
        }
    }
    exports.DebugUIItem = DebugUIItem;
});
