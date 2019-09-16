define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loading fpsCounter");
    class FPSCounter {
        constructor(delay) {
            this.delay = delay;
            this.lastFrameTimestamp = 0;
            this.nextUpdate = 0;
            this.fps = 0;
        }
        draw(canvasRenderer, step) {
            const ctx = canvasRenderer.context;
            if (step > this.nextUpdate) {
                this.fps = 1000 / (step - this.lastFrameTimestamp);
                this.nextUpdate = step + this.delay;
            }
            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(`${this.fps.toFixed(2)} FPS`, 5, ctx.canvas.height - 5);
            this.lastFrameTimestamp = step;
        }
    }
    exports.FPSCounter = FPSCounter;
});
