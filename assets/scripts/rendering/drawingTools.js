define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DrawingTools {
        constructor(ctx, camera) {
            this.ctx = ctx;
            this.camera = camera;
        }
        worldLineTo(pos) {
            //@ts-ignore
            this.ctx.lineTo(...this.camera.getCanvasPosFromWorld(pos).toArray());
        }
        worldRect(pos, size) {
            const func = this.camera.getCanvasPosFromWorld;
            //@ts-ignore
            this.ctx.rect(...func(pos).toArray(), ...func(size).toArray());
        }
        worldArc(pos, radius, startAngle, endAngle, anticlockwise) {
            const func = this.camera.getCanvasPosFromWorld;
            //@ts-ignore
            this.ctx.arc(...func(pos).toArray(), radius, startAngle, endAngle, anticlockwise);
        }
    }
    exports.DrawingTools = DrawingTools;
});
