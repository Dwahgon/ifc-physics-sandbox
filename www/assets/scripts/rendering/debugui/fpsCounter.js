define(["require", "exports", "./debugUIItem"], function (require, exports, debugUIItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loading fpsCounter");
    class FPSCounter extends debugUIItem_1.DebugUIItem {
        constructor(pos, delay) {
            super(pos);
            this.delay = delay;
            this.lastFrameTimestamp = 0;
            this.nextUpdate = 0;
            this.fps = 0;
        }
        draw(cR, step) {
            if (step > this.nextUpdate) {
                this.fps = 1000 / (step - this.lastFrameTimestamp);
                this.nextUpdate = step + this.delay;
            }
            this.lastFrameTimestamp = step;
            this.displayedString = `${this.fps.toFixed(2)} FPS`;
            super.draw(cR);
        }
    }
    exports.FPSCounter = FPSCounter;
});
